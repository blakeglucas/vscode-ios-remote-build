export type BuildPayload = {
  files: Buffer;
  developmentTeamId: string;
  exportOptionsPlist?: Buffer;
  provisioningProfile?: Buffer;
  provisioningSpecifier?: string;
  release?: boolean;
};
