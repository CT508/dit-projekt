import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";

const feedPath = process.argv[2] ?? "live-feed.xml";
const targetEan = process.argv[3] ?? "";
const maxFeedBytes = 100 * 1024 * 1024;
const maxItemBytes = 512 * 1024;

let buffer = "";
let totalItems = 0;
let gtinItems = 0;
let validTargetRows = 0;
let invalidChecksumRows = 0;

const fileStats = await stat(feedPath);
if (fileStats.size > maxFeedBytes) {
  throw new Error(`Feed is ${(fileStats.size / 1024 / 1024).toFixed(1)} MB. Maximum supported test size is 100 MB.`);
}

for await (const chunk of createReadStream(feedPath, { encoding: "utf8", highWaterMark: 64 * 1024 })) {
  buffer += chunk;
  let itemEnd = buffer.indexOf("</item>");

  while (itemEnd !== -1) {
    const itemStart = buffer.lastIndexOf("<item>", itemEnd);
    if (itemStart === -1) {
      buffer = buffer.slice(itemEnd + "</item>".length);
      itemEnd = buffer.indexOf("</item>");
      continue;
    }

    const itemXml = buffer.slice(itemStart, itemEnd + "</item>".length);
    if (Buffer.byteLength(itemXml, "utf8") > maxItemBytes) {
      throw new Error(`Item exceeded ${maxItemBytes} bytes.`);
    }

    totalItems += 1;
    const gtin = normalizeEan(readTag(itemXml, "g:gtin"));
    if (gtin) {
      gtinItems += 1;
      if (gtin.length === 13 && !validateEan13Checksum(gtin)) {
        invalidChecksumRows += 1;
      }
    }

    if (targetEan && gtin === targetEan) {
      validTargetRows += 1;
      console.log(JSON.stringify({
        title: readTag(itemXml, "title"),
        gtin,
        mpn: readTag(itemXml, "g:mpn"),
        price: readTag(itemXml, "g:price"),
        shipping: readNestedTag(itemXml, "g:shipping", "g:price"),
        availability: readTag(itemXml, "g:availability"),
        link: readTag(itemXml, "link")
      }, null, 2));
    }

    buffer = buffer.slice(itemEnd + "</item>".length);
    itemEnd = buffer.indexOf("</item>");
  }

  if (Buffer.byteLength(buffer, "utf8") > maxItemBytes) {
    const earliestItemStart = buffer.indexOf("<item>");
    buffer = earliestItemStart === -1 ? "" : buffer.slice(earliestItemStart);
    if (Buffer.byteLength(buffer, "utf8") > maxItemBytes) {
      throw new Error(`Parser buffer exceeded ${maxItemBytes} bytes.`);
    }
  }
}

console.log(JSON.stringify({
  feedPath,
  feedSizeMb: Number((fileStats.size / 1024 / 1024).toFixed(2)),
  maxFeedSizeMb: 100,
  totalItems,
  gtinItems,
  invalidChecksumRows,
  targetEan,
  validTargetRows
}, null, 2));

function readTag(content, tagName) {
  const escapedTag = tagName.replace(":", "\\:");
  const cdataPattern = new RegExp(`<${escapedTag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${escapedTag}>`, "i");
  const plainPattern = new RegExp(`<${escapedTag}>\\s*([\\s\\S]*?)\\s*<\\/${escapedTag}>`, "i");
  const match = content.match(cdataPattern) ?? content.match(plainPattern);
  return decodeXml(match?.[1]?.trim() ?? "");
}

function readNestedTag(content, parentTag, childTag) {
  const escapedParent = parentTag.replace(":", "\\:");
  const parentMatch = content.match(new RegExp(`<${escapedParent}>\\s*([\\s\\S]*?)\\s*<\\/${escapedParent}>`, "i"));
  return parentMatch ? readTag(parentMatch[1], childTag) : "";
}

function normalizeEan(input) {
  return String(input ?? "")
    .trim()
    .replace(/[\s-]+/g, "")
    .replace(/[^\d]/g, "");
}

function validateEan13Checksum(ean) {
  if (!/^\d{13}$/.test(ean)) {
    return false;
  }

  const digits = ean.split("").map(Number);
  const sum = digits.slice(0, 12).reduce((total, digit, index) => {
    return total + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  const expected = (10 - (sum % 10)) % 10;
  return digits[12] === expected;
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
