# Migrate Plain Text Files To Encrypted Text Files via KMS

This is based on a simple migration script I wrote to migrate plain text files located in AWS S3 to encrypted files via AWS KMS.

## Getting Started

This assumes you use NVM.

### Setting Proper Node Version

The node version that this is supposed to work with can be seen in the file `./.nvmrc`.

#### Linux/MacOS

Run the following command:

```shell
$> nvm use
```

It should pick up the Node version and use it, if not, install the required version.

#### Windows

Run the following command in powershell:

```shell
PS> .\nvmrc-windows.ps1
```

This will select the proper Node version and if you don't have it, install it for you.

### Installing Dependencies

In case it is not abumdantly obvios, this project uses `yarn` as the package manager.

If you are using the Node version specified in `./.nvmrc` and cannot use `yarn`, run the following command:

```shell
corepack enable
```

With that out of the way, install dependencies by running the following command:

```shell
yarn install
```

### Running Locally

Create a .env file that looks something like below:

```
TARGET_S3_BUCKET=<the S3 bcuket you wanna migrate>
TARGET_S3_BUCKET_FILES=<comma delimited list of files to download>
AWSS3_ACCESS_KEY=<s3 access key>
AWSS3_SECRET_KEY=<s3 secret key>
AWSS3_REGION=<s3 region>
AWSKMS_REGION=<kms region>
AWSKMS_ACCESS_KEY=<kms access key>
AWSKMS_SECRET_KEY=<kms secret key>
TARGET_ENCRYPT_KMS_ARN=<kms arn used to encrypt>
```

One thing to note is that there can be no leading `/` in the comma list in `TARGET_S3_BUCKET_FILES`. If the file name is `test.txt` and is located in the root and `test2.txt` is located in a folder named `testDir`, the comma list will look like:

```
test.txt,testDir/test2.txt
```

To run this with the config specified in the `.env` file. Run the following command:

```shell
yarn start:devl
```

### Running As Job

In my use case, I ran it as a one off K8S CRON. The command to use for this screnario will be as follows:

```
yarn start
```

Remember to specify the environment variables properly. If you don't, the code will crash.
