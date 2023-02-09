const path = require('path');
const fs = require('fs-extra');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const stream = require('stream');
const {
  buildClient,
  CommitmentPolicy,
  getClient,
  KMS,
  KmsKeyringNode,
  AlgorithmSuiteIdentifier,
} = require('@aws-crypto/client-node');

const config = require('./config');

console.log('Configs Used', config);

const downloadPath = path.join(__dirname, 'download');
const outputPath = path.join(__dirname, 'output');

async function downloadFromS3Bucket({
  fileNames: filePaths = [],
  bucketName,
  region,
  accessKeyId,
  secretAccessKey,
}) {
  console.log(`Downloading files to ${downloadFromS3Bucket}`);
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  for (let i = 0; i < filePaths.length; i += 1) {
    const filePath = filePaths[i];
    const fileName = path.basename(filePath);
    const downloadedFilePath = path.join(downloadPath, fileName);
    console.log('Downloading', {
      bucketName,
      bucketPath: filePath,
      fileName,
      downloadedFilePath,
    });

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });
    const response = await s3Client.send(command);

    await stream.promises.finished(
      response.Body.pipe(fs.createWriteStream(downloadedFilePath)),
    );

    console.log('Downloaded', {
      bucketName,
      bucketPath: filePath,
      fileName,
      downloadedFilePath,
    });
  }
}

async function encryptFiles(
  region,
  accessKeyId,
  secretAccessKey,
  targetEncryptKmsArn,
) {
  const fileNames = await fs.promises.readdir(downloadPath);
  const filePaths = fileNames.map((x) => path.join(downloadPath, x));

  console.log(`Files to be encrypted: ${JSON.stringify(filePaths)}.`);

  const keyRing = new KmsKeyringNode({
    generatorKeyId: targetEncryptKmsArn,
    clientProvider: getClient(KMS, {
      region,
      accessKeyId,
      secretAccessKey,
    }),
  });

  const { encryptStream } = buildClient(
    CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT,
  );

  for (let i = 0; i < filePaths.length; i += 1) {
    const filePath = filePaths[i];
    const fileName = path.basename(filePath);
    const outputFilePath = path.join(outputPath, fileName);

    console.log('Encrypting', { filePath, fileName, outputFilePath });

    await stream.promises.pipeline(
      fs.createReadStream(filePath),
      encryptStream(keyRing, {
        suiteId:
          AlgorithmSuiteIdentifier.ALG_AES256_GCM_IV12_TAG16_HKDF_SHA512_COMMIT_KEY,
        encryptionContext: {
          state: 'encrypting file',
          purpose: `encrypting ${fileName} for consumption.`,
          origin: 'Migration Script',
        },
      }),
      fs.createWriteStream(outputFilePath),
    );

    console.log('Encrypted', { filePath, fileName, outputFilePath });
  }

  console.log('Files encrypted and ready for upload.');
}

async function main() {
  console.log('Starting conversion process.');

  console.log('Ensuring empty directory for file downloads.');
  await fs.ensureDir(downloadPath);
  await fs.emptyDir(downloadPath);
  console.log('Ensured empty directory for file downloads.');

  console.log('Ensuring empty directory for file output.');
  await fs.ensureDir(outputPath);
  await fs.emptyDir(outputPath);
  console.log('Ensured empty directory for file output.');

  const {
    aws: {
      s3: { accessKeyId, secretAccessKey, region },
      kms: {
        accessKeyId: kmsAccessKeyId,
        region: kmsRegion,
        secretAccessKey: kmsSecretAccessKey,
      },
    },
    targetFilePaths,
    targetS3Bucket,
    targetEncryptKmsArn,
  } = config;

  await downloadFromS3Bucket({
    accessKeyId,
    bucketName: targetS3Bucket,
    region,
    secretAccessKey,
    fileNames: targetFilePaths,
  });

  await encryptFiles(
    kmsRegion,
    kmsAccessKeyId,
    kmsSecretAccessKey,
    targetEncryptKmsArn,
  );
}

main()
  .then(() => console.log('done'))
  .catch((error) => console.error('Error encountered', error));
