"use client";

import { useMemo, useState } from "react";
import { AdminNav } from "../../AdminNav";

const exampleCsv = `PROD_NUM;LANGUAGE_ID;PROD_NAME;VENDOR_NUM;PROD_BARCODE_NUMBER
92416;26;Epson Cyan T44J2 - 700 ml ink cartridge;C13T44J240;8715946668031`;

const targetFields = [
  { name: "", label: "Do not import", required: false },
  { name: "ean", label: "EAN", required: true },
  { name: "productName", label: "Product name", required: true },
  { name: "brand", label: "Brand", required: false },
  { name: "category", label: "Category", required: false },
  { name: "imageUrl", label: "Main image URL", required: false },
  { name: "description", label: "Description", required: false },
  { name: "seoTitle", label: "SEO title", required: false },
  { name: "seoDescription", label: "SEO description", required: false },
  { name: "gallery", label: "Gallery URLs", required: false },
  { name: "specifications", label: "Specifications", required: false }
];

type DetectedColumn = {
  name: string;
  sample: string;
};

export default function AdminMasterProductImportPage() {
  const [csvText, setCsvText] = useState(exampleCsv);
  const [delimiter, setDelimiter] = useState(";");
  const [detectedColumns, setDetectedColumns] = useState<DetectedColumn[]>(detectColumns(exampleCsv, ";"));
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>(() => {
    return autoMapColumns(detectColumns(exampleCsv, ";").map((column) => column.name));
  });

  const reverseMapping = useMemo(() => {
    return Object.entries(fieldMapping).reduce<Record<string, string>>((result, [sourceColumn, targetField]) => {
      if (targetField) {
        result[targetField] = sourceColumn;
      }
      return result;
    }, {});
  }, [fieldMapping]);

  function updateDetectedColumns(nextCsvText: string, nextDelimiter = delimiter) {
    const columns = detectColumns(nextCsvText, normalizeDelimiter(nextDelimiter));
    setDetectedColumns(columns);
    setFieldMapping(autoMapColumns(columns.map((column) => column.name)));
  }

  async function readCsvFile(file: File) {
    const text = await file.text();
    setCsvText(text);
    updateDetectedColumns(text);
  }

  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <h1>Import master products from CSV</h1>
        <p className="muted">
          Upload a supplier master product file. The importer reads the header row first, then asks how those fields should map to master product data.
        </p>
        <form className="admin-form" action="/api/admin/master-products/import" method="post" encType="multipart/form-data">
          <div className="field-grid">
            <label>
              <span>CSV file</span>
              <input
                name="file"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void readCsvFile(file);
                  }
                }}
              />
            </label>
            <label>
              <span>Delimiter</span>
              <select
                name="delimiter"
                value={delimiter}
                onChange={(event) => {
                  setDelimiter(event.target.value);
                  updateDetectedColumns(csvText, event.target.value);
                }}
              >
                <option value=";">Semicolon (;)</option>
                <option value=",">Comma (,)</option>
                <option value="tab">Tab</option>
              </select>
            </label>
          </div>
          <label>
            <span>Or paste CSV content for testing</span>
            <textarea
              name="csv"
              value={csvText}
              onChange={(event) => {
                setCsvText(event.target.value);
                updateDetectedColumns(event.target.value);
              }}
            />
          </label>

          <input type="hidden" name="map_ean" value={reverseMapping.ean ?? ""} />
          <input type="hidden" name="map_productName" value={reverseMapping.productName ?? ""} />
          <input type="hidden" name="map_brand" value={reverseMapping.brand ?? ""} />
          <input type="hidden" name="map_category" value={reverseMapping.category ?? ""} />
          <input type="hidden" name="map_imageUrl" value={reverseMapping.imageUrl ?? ""} />
          <input type="hidden" name="map_description" value={reverseMapping.description ?? ""} />
          <input type="hidden" name="map_seoTitle" value={reverseMapping.seoTitle ?? ""} />
          <input type="hidden" name="map_seoDescription" value={reverseMapping.seoDescription ?? ""} />
          <input type="hidden" name="map_gallery" value={reverseMapping.gallery ?? ""} />
          <input type="hidden" name="map_specifications" value={reverseMapping.specifications ?? ""} />

          <section className="detected-columns" aria-label="Detected CSV fields">
            <div>
              <h2>I found these fields in the file</h2>
              <p className="muted">Now choose how each supplier field should be mapped.</p>
            </div>
            <div className="column-chip-list">
              {detectedColumns.map((column) => (
                <span className="column-chip" key={column.name}>{column.name}</span>
              ))}
            </div>
          </section>

          <section className="mapping-grid mapping-grid-wide" aria-label="CSV field mapping">
            <div className="mapping-heading">Field found in file</div>
            <div className="mapping-heading">Sample value</div>
            <div className="mapping-heading">Map to</div>
            {detectedColumns.map((column) => (
              <div className="mapping-row" key={column.name}>
                <strong>{column.name}</strong>
                <span className="muted">{column.sample || "No sample"}</span>
                <select
                  value={fieldMapping[column.name] ?? ""}
                  onChange={(event) => {
                    setFieldMapping((current) => ({
                      ...current,
                      [column.name]: event.target.value
                    }));
                  }}
                >
                  {targetFields.map((field) => (
                    <option key={field.name || "ignore"} value={field.name}>
                      {field.label}{field.required ? " (required)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </section>

          <div className="admin-actions">
            <button className="button" type="submit">Validate CSV mapping</button>
            <button className="secondary-button" type="button">Save mapping template</button>
          </div>
        </form>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Import rules</h2>
        <ul className="check-list">
          <li>EAN is required and must pass normalization and checksum validation.</li>
          <li>Product name is required for new master products.</li>
          <li>Existing EANs are updated with mapped SEO, text, category, brand and image data.</li>
          <li>Gallery URLs can be separated with a pipe character.</li>
          <li>Specifications can be imported as key=value pairs separated with a pipe character.</li>
        </ul>
      </section>
    </main>
  );
}

function normalizeDelimiter(delimiter: string) {
  return delimiter === "tab" ? "\t" : delimiter;
}

function detectColumns(csvText: string, delimiter: string): DetectedColumn[] {
  const rows = csvText.split(/\r?\n/).filter(Boolean);
  const headers = splitCsvLine(rows[0] ?? "", delimiter);
  const firstDataRow = splitCsvLine(rows[1] ?? "", delimiter);

  return headers
    .filter(Boolean)
    .map((header, index) => ({
      name: header,
      sample: firstDataRow[index] ?? ""
    }));
}

function splitCsvLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
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

function autoMapColumns(columns: string[]) {
  return columns.reduce<Record<string, string>>((mapping, column) => {
    const normalized = column.toLowerCase();

    if (["prod_barcode_number", "barcode", "ean", "gtin"].includes(normalized)) {
      mapping[column] = "ean";
    } else if (["prod_name", "product_name", "name", "title"].includes(normalized)) {
      mapping[column] = "productName";
    } else if (["brand", "maker", "manufacturer"].includes(normalized)) {
      mapping[column] = "brand";
    } else if (["category", "group", "prod_group"].includes(normalized)) {
      mapping[column] = "category";
    } else {
      mapping[column] = "";
    }

    return mapping;
  }, {});
}
