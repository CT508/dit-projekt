import { NextRequest, NextResponse } from "next/server";
import { validateEan } from "@/lib/ean/validate-ean";

const targetFields = [
  "ean",
  "productName",
  "brand",
  "category",
  "imageUrl",
  "description",
  "seoTitle",
  "seoDescription",
  "gallery",
  "specifications"
];

function splitCsvLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(csv: string, delimiter: string) {
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    return { headers: [], records: [] as Record<string, string>[] };
  }

  const headers = splitCsvLine(rows[0], delimiter);
  const records = rows.slice(1).map((line) => {
    const cells = splitCsvLine(line, delimiter);
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = cells[index] ?? "";
      return record;
    }, {});
  });

  return { headers, records };
}

function mappedValue(record: Record<string, string>, mapping: Record<string, string>, targetField: string) {
  const sourceColumn = mapping[targetField];
  return sourceColumn ? (record[sourceColumn] ?? "").trim() : "";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const delimiterValue = String(formData.get("delimiter") ?? ";");
  const delimiter = delimiterValue === "tab" ? "\t" : delimiterValue;
  const uploadedFile = formData.get("file");
  const pastedCsv = String(formData.get("csv") ?? "");
  const csv = uploadedFile instanceof File && uploadedFile.size > 0 ? await uploadedFile.text() : pastedCsv;

  const mapping = targetFields.reduce<Record<string, string>>((result, field) => {
    result[field] = String(formData.get(`map_${field}`) ?? "");
    return result;
  }, {});

  const { headers, records } = parseCsv(csv, delimiter);
  const missingRequiredMappings = ["ean", "productName"].filter((field) => !mapping[field]);
  const errors: Array<Record<string, string | number>> = [];
  let acceptedRows = 0;
  let updateRows = 0;

  records.forEach((record, index) => {
    const rowNumber = index + 2;
    const rawEan = mappedValue(record, mapping, "ean");
    const productName = mappedValue(record, mapping, "productName");
    const eanResult = validateEan(rawEan);

    if (!eanResult.valid) {
      errors.push({
        rowNumber,
        rawEan,
        errorCode: eanResult.code,
        errorMessage: eanResult.message
      });
      return;
    }

    if (!productName) {
      errors.push({
        rowNumber,
        rawEan,
        errorCode: "MISSING_PRODUCT_NAME",
        errorMessage: "Product name is required for master product imports."
      });
      return;
    }

    acceptedRows += 1;
    updateRows += 1;
  });

  return NextResponse.json({
    status: errors.length > 0 ? "PARTIAL" : "READY_TO_IMPORT",
    delimiter: delimiterValue,
    headers,
    mapping,
    missingRequiredMappings,
    totalRows: records.length,
    acceptedRows,
    updateRows,
    rejectedRows: errors.length,
    errors,
    note: "This mock validates the mapped CSV. The next step is persisting approved master products to PostgreSQL."
  });
}
