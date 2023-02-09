const {
  EnvironmentVariables: {
    getEnvVariableAsString,
    getEnvironmentVariableAsStringArray,
  },
} = require('@benjamin-wss/cornerstone-js-utilities');

const config = {
  targetS3Bucket: getEnvVariableAsString({
    fieldName: 'TARGET_S3_BUCKET',
  }),
  targetFilePaths: getEnvironmentVariableAsStringArray({
    fieldName: 'TARGET_S3_BUCKET_FILES',
  }),
  targetEncryptKmsArn: getEnvVariableAsString({
    fieldName: 'TARGET_ENCRYPT_KMS_ARN',
  }),
  aws: {
    s3: {
      accessKeyId: getEnvVariableAsString({
        fieldName: 'AWSS3_ACCESS_KEY',
      }),
      secretAccessKey: getEnvVariableAsString({
        fieldName: 'AWSS3_SECRET_KEY',
      }),
      region: getEnvVariableAsString({
        fieldName: 'AWSS3_REGION',
      }),
    },
    kms: {
      region: getEnvVariableAsString({
        fieldName: 'AWSKMS_REGION',
      }),
      accessKeyId: getEnvVariableAsString({
        fieldName: 'AWSKMS_ACCESS_KEY',
      }),
      secretAccessKey: getEnvVariableAsString({
        fieldName: 'AWSKMS_SECRET_KEY',
      }),
    },
  },
};

Object.freeze(config);

module.exports = config;
