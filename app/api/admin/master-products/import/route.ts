import { NextRequest, NextResponse } from "next/server";
import { validateEan } from "@/lib/ean/validate-ean";
import { products } from "@/lib/data/mock-data";
import { hasDatabaseUrl, prisma } from "@/lib/db/prisma";

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\u00e6/g, "ae")
    .replace(/\u00f8/g, "oe")
    .replace(/\u00e5/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const importMode = String(formData.get("importMode") ?? "validate");
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
  const readyProducts: Array<Record<string, string>> = [];
  let acceptedRows = 0;
  let createRows = 0;
  let updateRows = 0;

  for (const [index, record] of records.entries()) {
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
      continue;
    }

    if (!productName) {
      errors.push({
        rowNumber,
        rawEan,
        errorCode: "MISSING_PRODUCT_NAME",
        errorMessage: "Product name is required for master product imports."
      });
      continue;
    }

    acceptedRows += 1;
    const normalizedEan = eanResult.normalizedEan;
    const existingProduct = hasDatabaseUrl()
      ? Boolean(await prisma.masterProduct.findUnique({ where: { ean: normalizedEan }, select: { id: true } }))
      : products.some((product) => product.ean === normalizedEan);
    const masterProduct = {
      ean: normalizedEan,
      productName,
      slug: slugify(productName),
      brand: mappedValue(record, mapping, "brand"),
      category: mappedValue(record, mapping, "category"),
      imageUrl: mappedValue(record, mapping, "imageUrl"),
      description: mappedValue(record, mapping, "description"),
      seoTitle: mappedValue(record, mapping, "seoTitle"),
      seoDescription: mappedValue(record, mapping, "seoDescription"),
      gallery: mappedValue(record, mapping, "gallery"),
      specifications: mappedValue(record, mapping, "specifications"),
      action: existingProduct ? "update" : "create"
    };

    readyProducts.push(masterProduct);
    if (existingProduct) {
      updateRows += 1;
    } else {
      createRows += 1;
    }
  }

  const canImport = missingRequiredMappings.length === 0 && acceptedRows > 0;
  let persistedRows = 0;

  if (importMode === "create" && canImport && hasDatabaseUrl()) {
    for (const product of readyProducts) {
      const categoryName = product.category;
      const category = categoryName
        ? await prisma.category.upsert({
          where: { slug: slugify(categoryName) },
          update: { name: categoryName },
          create: { name: categoryName, slug: slugify(categoryName) }
        })
        : null;

      await prisma.masterProduct.upsert({
        where: { ean: product.ean },
        update: {
          slug: product.slug,
          productName: product.productName,
          brand: product.brand || null,
          categoryId: category?.id ?? null,
          imageUrl: product.imageUrl || null,
          gallery: product.gallery ? product.gallery.split("|").map((item) => item.trim()).filter(Boolean) : [],
          description: product.description || null,
          seoTitle: product.seoTitle || null,
          seoDescription: product.seoDescription || null,
          specifications: parseSpecifications(product.specifications),
          status: "APPROVED",
          approvedAt: new Date()
        },
        create: {
          ean: product.ean,
          slug: product.slug,
          productName: product.productName,
          brand: product.brand || null,
          categoryId: category?.id ?? null,
          imageUrl: product.imageUrl || null,
          gallery: product.gallery ? product.gallery.split("|").map((item) => item.trim()).filter(Boolean) : [],
          description: product.description || null,
          seoTitle: product.seoTitle || null,
          seoDescription: product.seoDescription || null,
          specifications: parseSpecifications(product.specifications),
          status: "APPROVED",
          approvedAt: new Date()
        }
      });
      persistedRows += 1;
    }
  }

  return NextResponse.json({
    status: missingRequiredMappings.length > 0
      ? "MAPPING_REQUIRED"
      : importMode === "create" && canImport
      ? "IMPORTED"
      : errors.length > 0
      ? "PARTIAL"
      : "READY_TO_IMPORT",
    importMode,
    delimiter: delimiterValue,
    headers,
    mapping,
    missingRequiredMappings,
    totalRows: records.length,
    acceptedRows,
    createRows,
    updateRows,
    persistedRows,
    rejectedRows: errors.length,
    readyProducts,
    errors,
    note: importMode === "create" && hasDatabaseUrl()
      ? `${persistedRows} master products were saved to PostgreSQL.`
      : importMode === "create"
      ? "Master product import completed in mock mode because DATABASE_URL is not configured."
      : "Review the rows below, then create or update the ready master products."
  });
}

function parseSpecifications(value: string) {
  if (!value) {
    return {};
  }

  return value.split("|").reduce<Record<string, string>>((result, part) => {
    const [key, ...rest] = part.split("=");
    if (key && rest.length > 0) {
      result[key.trim()] = rest.join("=").trim();
    }
    return result;
  }, {});
}
