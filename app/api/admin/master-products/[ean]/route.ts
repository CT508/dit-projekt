import { NextRequest, NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { hasDatabaseUrl, prisma } from "@/lib/db/prisma";

const allowedStatuses = Object.values(ProductStatus);

export async function PUT(request: NextRequest, { params }: { params: { ean: string } }) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      error: "DATABASE_REQUIRED",
      errorMessage: "PostgreSQL DATABASE_URL is required to save master product changes."
    }, { status: 503 });
  }

  const formData = await request.formData();
  const productName = textValue(formData, "productName");
  const slug = textValue(formData, "slug");

  if (!productName || !slug) {
    return NextResponse.json({
      error: "MISSING_REQUIRED_FIELDS",
      errorMessage: "Product name and slug are required."
    }, { status: 400 });
  }

  let specifications: Record<string, string>;
  try {
    specifications = parseSpecifications(textValue(formData, "specifications"));
  } catch (error) {
    return NextResponse.json({
      error: "INVALID_SPECIFICATIONS_JSON",
      errorMessage: error instanceof Error ? error.message : "Specifications must be valid JSON."
    }, { status: 400 });
  }

  const rawStatus = textValue(formData, "status");
  const status = allowedStatuses.includes(rawStatus as ProductStatus) ? rawStatus as ProductStatus : ProductStatus.APPROVED;

  try {
    const categoryName = textValue(formData, "category");
    const category = categoryName
      ? await prisma.category.upsert({
        where: { slug: slugify(categoryName) },
        update: { name: categoryName },
        create: { name: categoryName, slug: slugify(categoryName) }
      })
      : null;

    const uploadedMainImage = await imageFileToDataUrl(formData.get("mainImageFile"));
    const uploadedGalleryImages = await Promise.all(formData.getAll("galleryImageFiles").map(imageFileToDataUrl));
    const galleryUrls = textValue(formData, "galleryUrls")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
    const gallery = [...galleryUrls, ...uploadedGalleryImages.filter(Boolean)];
    const imageUrl = uploadedMainImage || textValue(formData, "imageUrl") || gallery[0] || null;

    const product = await prisma.masterProduct.update({
      where: { ean: params.ean },
      data: {
        productName,
        slug,
        manufacturerSku: textValue(formData, "manufacturerSku") || null,
        brand: textValue(formData, "brand") || null,
        categoryId: category?.id ?? null,
        imageUrl,
        gallery,
        description: textValue(formData, "description") || null,
        seoTitle: textValue(formData, "seoTitle") || null,
        seoDescription: textValue(formData, "seoDescription") || null,
        canonicalUrl: textValue(formData, "canonicalUrl") || null,
        specifications,
        status,
        approvedAt: status === ProductStatus.APPROVED ? new Date() : null
      },
      include: { category: { select: { name: true } } }
    });

    return NextResponse.json({
      status: "SAVED",
      product: {
        ean: product.ean,
        slug: product.slug,
        productName: product.productName,
        manufacturerSku: product.manufacturerSku,
        brand: product.brand,
        category: product.category?.name ?? "",
        imageUrl: product.imageUrl,
        gallery: Array.isArray(product.gallery) ? product.gallery : []
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "MASTER_PRODUCT_UPDATE_FAILED",
      errorMessage: error instanceof Error ? error.message : "Master product update failed."
    }, { status: 500 });
  }
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseSpecifications(value: string) {
  if (!value) {
    return {};
  }

  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Specifications must be a JSON object.");
  }

  return Object.entries(parsed).reduce<Record<string, string>>((result, [key, item]) => {
    result[key] = String(item);
    return result;
  }, {});
}

async function imageFileToDataUrl(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return "";
  }

  if (!value.type.startsWith("image/")) {
    throw new Error("Uploaded files must be images.");
  }

  const buffer = Buffer.from(await value.arrayBuffer());
  return `data:${value.type};base64,${buffer.toString("base64")}`;
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
