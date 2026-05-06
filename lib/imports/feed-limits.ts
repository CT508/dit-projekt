export const maxFeedBytes = 100 * 1024 * 1024;
export const maxGoogleMerchantItemBytes = 512 * 1024;
export const defaultImportBatchSize = 500;
export const defaultImportCheckpointRows = 1000;

export function formatBytes(bytes: number): string {
  const megabytes = bytes / 1024 / 1024;
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

export function parseContentLength(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

