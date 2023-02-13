
export const S3Config = (dirName) => {
  return {
    keyPrefix: dirName ? `${dirName}/` : 'images/' /* optional */,
    bucket: "beahero-storage",
    region: "us-east-2",
    accessKey: "AKIAJB5O45SAGV2MCHHA",
    secretKey: "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",
    successActionStatus: 201
  };
}