export const FILE_PROVIDERS = ["local", "s3"] as const;
export type FileProvider = (typeof FILE_PROVIDERS)[number];
