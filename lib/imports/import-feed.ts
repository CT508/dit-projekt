import { validateFeedRow } from "./validate-feed-row";
import type { FeedRow } from "./types";

export type ApprovedMasterProduct = {
  id: string;
  ean: string;
  status: "APPROVED" | "PENDING" | "DISABLED" | "DELETED";
};

export type ImportAcceptedRow = {
  rowNumber: number;
  masterProductId: string;
  normalizedEan: string;
  row: FeedRow;
};

export type ImportRejectedRow = {
  rowNumber: number;
  rawEan: unknown;
  normalizedEan: string;
  productTitle: unknown;
  errorCode: string;
  errorMessage: string;
  rawPayload: FeedRow;
};

export type ImportValidationReport = {
  totalRows: number;
  acceptedRows: ImportAcceptedRow[];
  rejectedRows: ImportRejectedRow[];
};

export async function validateImportRows(
  rows: FeedRow[],
  findMasterProductByEan: (ean: string) => Promise<ApprovedMasterProduct | null>
): Promise<ImportValidationReport> {
  const seenEans = new Set<string>();
  const acceptedRows: ImportAcceptedRow[] = [];
  const rejectedRows: ImportRejectedRow[] = [];

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 1;
    const rowValidation = validateFeedRow(row, seenEans);

    if (!rowValidation.accepted) {
      rejectedRows.push({
        rowNumber,
        rawEan: row.ean,
        normalizedEan: rowValidation.normalizedEan,
        productTitle: row.product_title,
        errorCode: rowValidation.error.code,
        errorMessage: rowValidation.error.message,
        rawPayload: row
      });
      continue;
    }

    const masterProduct = await findMasterProductByEan(rowValidation.normalizedEan);
    if (!masterProduct || masterProduct.status !== "APPROVED") {
      rejectedRows.push({
        rowNumber,
        rawEan: row.ean,
        normalizedEan: rowValidation.normalizedEan,
        productTitle: row.product_title,
        errorCode: "EAN_NOT_APPROVED",
        errorMessage: "EAN does not exist as an approved active master product.",
        rawPayload: row
      });
      continue;
    }

    acceptedRows.push({
      rowNumber,
      masterProductId: masterProduct.id,
      normalizedEan: rowValidation.normalizedEan,
      row: rowValidation.normalizedRow
    });
  }

  return {
    totalRows: rows.length,
    acceptedRows,
    rejectedRows
  };
}

export async function validateImportStream(
  rows: AsyncIterable<FeedRow>,
  findMasterProductByEan: (ean: string) => Promise<ApprovedMasterProduct | null>,
  options: { maxRows?: number } = {}
): Promise<ImportValidationReport> {
  const seenEans = new Set<string>();
  const acceptedRows: ImportAcceptedRow[] = [];
  const rejectedRows: ImportRejectedRow[] = [];
  let totalRows = 0;

  for await (const row of rows) {
    totalRows += 1;

    if (options.maxRows && totalRows > options.maxRows) {
      rejectedRows.push({
        rowNumber: totalRows,
        rawEan: row.ean,
        normalizedEan: "",
        productTitle: row.product_title,
        errorCode: "IMPORT_ROW_LIMIT_EXCEEDED",
        errorMessage: `Import exceeded the configured row limit of ${options.maxRows}.`,
        rawPayload: row
      });
      break;
    }

    const rowValidation = validateFeedRow(row, seenEans);

    if (!rowValidation.accepted) {
      rejectedRows.push({
        rowNumber: totalRows,
        rawEan: row.ean,
        normalizedEan: rowValidation.normalizedEan,
        productTitle: row.product_title,
        errorCode: rowValidation.error.code,
        errorMessage: rowValidation.error.message,
        rawPayload: row
      });
      continue;
    }

    const masterProduct = await findMasterProductByEan(rowValidation.normalizedEan);
    if (!masterProduct || masterProduct.status !== "APPROVED") {
      rejectedRows.push({
        rowNumber: totalRows,
        rawEan: row.ean,
        normalizedEan: rowValidation.normalizedEan,
        productTitle: row.product_title,
        errorCode: "EAN_NOT_APPROVED",
        errorMessage: "EAN does not exist as an approved active master product.",
        rawPayload: row
      });
      continue;
    }

    acceptedRows.push({
      rowNumber: totalRows,
      masterProductId: masterProduct.id,
      normalizedEan: rowValidation.normalizedEan,
      row: rowValidation.normalizedRow
    });
  }

  return {
    totalRows,
    acceptedRows,
    rejectedRows
  };
}
