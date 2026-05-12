"use client";

import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
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

type ImportResult = {
  status: string;
  importMode: string;
  totalRows: number;
  acceptedRows: number;
  createRows: number;
  updateRows: number;
  persistedRows: number;
  rejectedRows: number;
  missingRequiredMappings: string[];
  readyProducts: Array<{
    ean: string;
    productName: string;
    slug: string;
    action: string;
  }>;
  errors: Array<{
    rowNumber: number;
    rawEan: string;
    errorCode: string;
    errorMessage: string;
  }>;
  note: string;
};

export default function AdminMasterProductImportPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [csvText, setCsvText] = useState(exampleCsv);
  const [delimiter, setDelimiter] = useState(";");
  const [detectedColumns, setDetectedColumns] = useState<DetectedColumn[]>(detectColumns(exampleCsv, ";"));
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>(() => {
    return autoMapColumns(detectColumns(exampleCsv, ";").map((column) => column.name));
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const reverseMapping = useMemo(() => {
    return Object.entries(fieldMapping).reduce<Record<string, string>>((result, [sourceColumn, targetField]) => {
      if (targetField) {
        result[targetField] = sourceColumn;
      }
      return result;
    }, {});
  }, [fieldMapping]);
  const hasRequiredMappings = Boolean(reverseMapping.ean && reverseMapping.productName);

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

  async function validateImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitImport("validate");
  }

  async function submitImport(importMode: "validate" | "create") {
    if (!formRef.current) {
      return;
    }

    setIsValidating(true);
    setSubmitError("");

    try {
      const formData = new FormData(formRef.current);
      formData.set("importMode", importMode);
      const response = await fetch("/api/admin/master-products/import", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Import request failed with status ${response.status}.`);
      }

      setImportResult(await response.json());
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Import request failed.");
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <h1>Import master products from CSV</h1>
        <p className="muted">
          Upload a supplier master product file. The importer reads the header row first, then asks how those fields should map to master product data.
        </p>
        <form ref={formRef} className="admin-form" onSubmit={validateImport}>
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
            <button className="button" type="submit" disabled={isValidating}>
              {isValidating ? "Validating..." : "Validate import"}
            </button>
            <button
              className="secondary-button"
              type="button"
              disabled={isValidating}
              onClick={() => void submitImport("create")}
            >
              Create valid master products
            </button>
            <button className="secondary-button" type="button">Save mapping template</button>
          </div>
          {!hasRequiredMappings ? (
            <p className="muted">Map one field to EAN and one field to Product name before creating master products.</p>
          ) : null}
        </form>
      </section>

      {submitError ? (
        <section className="panel import-result-panel import-result-error" style={{ marginTop: 16 }}>
          <h2>Import validation failed</h2>
          <p>{submitError}</p>
        </section>
      ) : null}

      {importResult ? (
        <section className="panel import-result-panel" style={{ marginTop: 16 }}>
          <div>
            <h2>Import validation result</h2>
            <p className="muted">{importResult.note}</p>
          </div>
          <div className="stat-grid">
            <div className="stat"><strong>{importResult.totalRows}</strong><span>Total rows</span></div>
            <div className="stat"><strong>{importResult.acceptedRows}</strong><span>Ready products</span></div>
            <div className="stat"><strong>{importResult.createRows}</strong><span>New products</span></div>
            <div className="stat"><strong>{importResult.updateRows}</strong><span>Updates</span></div>
            <div className="stat"><strong>{importResult.rejectedRows}</strong><span>Rejected rows</span></div>
          </div>
          {importResult.status === "IMPORTED" ? (
            <div className="success-box">
              {importResult.persistedRows} master products saved. {importResult.createRows} are new and {importResult.updateRows} are updates.
            </div>
          ) : null}
          {importResult.missingRequiredMappings.length > 0 ? (
            <div className="error-item">
              Missing required mappings: {importResult.missingRequiredMappings.join(", ")}
            </div>
          ) : null}
          {importResult.errors.length > 0 ? (
            <div className="error-list">
              {importResult.errors.slice(0, 20).map((error) => (
                <div className="error-item" key={`${error.rowNumber}-${error.errorCode}`}>
                  <strong>Row {error.rowNumber}: {error.errorCode}</strong>
                  <span>{error.rawEan ? `EAN value: ${error.rawEan}. ` : ""}{error.errorMessage}</span>
                </div>
              ))}
              {importResult.errors.length > 20 ? (
                <p className="muted">Showing the first 20 errors of {importResult.errors.length}.</p>
              ) : null}
            </div>
          ) : (
            <div className="success-box">
              {importResult.acceptedRows} master products are ready to create or update.
            </div>
          )}
          {importResult.readyProducts.length > 0 ? (
            <div className="import-preview-table">
              <h3>Ready master products</h3>
              <table className="offer-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Product name</th>
                    <th>EAN</th>
                  </tr>
                </thead>
                <tbody>
                  {importResult.readyProducts.slice(0, 20).map((product) => (
                    <tr key={product.ean}>
                      <td>{product.action === "create" ? "Create" : "Update"}</td>
                      <td>{product.productName}</td>
                      <td>{product.ean}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importResult.readyProducts.length > 20 ? (
                <p className="muted">Showing the first 20 ready products of {importResult.readyProducts.length}.</p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

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
