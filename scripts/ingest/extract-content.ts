/**
 * Content Extraction Script
 * Extracts text content from DOCX, PPTX, and PDF files in ContentData/
 * Outputs structured JSON to data/source-materials/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DATA_PATH = path.resolve(__dirname, "../../ContentData");
const OUTPUT_PATH = path.resolve(__dirname, "../../data/source-materials");

interface ExtractedDocument {
  id: string;
  filename: string;
  filetype: "docx" | "pptx" | "pdf";
  title: string;
  content: string;
  metadata: {
    extractedAt: string;
    sourcePath: string;
    wordCount: number;
  };
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_PATH)) {
  fs.mkdirSync(OUTPUT_PATH, { recursive: true });
}

function generateId(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractTitle(filename: string): string {
  return filename
    .replace(/\.(docx|pptx|pdf)$/i, "")
    .replace(/\s*\(\d+\)\s*/g, "")
    .replace(/quick\s*six?\s*/gi, "")
    .trim();
}

async function extractDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function extractPdf(filePath: string): Promise<string> {
  // Dynamic import for pdf-parse v2+
  const pdfModule = await import("pdf-parse");
  const { PDFParse } = pdfModule;
  const buffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
  const parser = new PDFParse(uint8Array);
  await parser.load();
  const result = await parser.getText();
  // getText returns { pages: [...], text: string, total: number }
  if (typeof result === "string") {
    return result;
  }
  if (result && result.pages && Array.isArray(result.pages)) {
    return result.pages.map((p: { text: string }) => p.text).join("\n\n");
  }
  if (result && typeof result.text === "string") {
    return result.text;
  }
  return "";
}

function extractTextFromPptxObject(data: any): string {
  const textParts: string[] = [];
  
  const extractRecursive = (obj: any): void => {
    if (!obj) return;
    if (typeof obj === "string") {
      textParts.push(obj);
      return;
    }
    if (obj.text && typeof obj.text === "string") {
      textParts.push(obj.text);
    }
    if (obj.children && Array.isArray(obj.children)) {
      for (const child of obj.children) {
        extractRecursive(child);
      }
    }
  };
  
  if (typeof data === "string") {
    return data;
  }
  
  if (data && typeof data.toText === "function") {
    return data.toText();
  }
  
  if (data && data.content && Array.isArray(data.content)) {
    for (const slide of data.content) {
      extractRecursive(slide);
    }
  }
  
  return textParts.join("\n\n");
}

async function extractPptx(filePath: string): Promise<string> {
  // Dynamic import for officeparser
  const officeparserModule = await import("officeparser");
  const officeparser = officeparserModule.default || officeparserModule;
  
  // Use parseOfficeAsync if available (v6+)
  if (typeof officeparser.parseOfficeAsync === "function") {
    const result = await officeparser.parseOfficeAsync(filePath);
    return extractTextFromPptxObject(result);
  }
  
  // Fallback to callback style
  return new Promise((resolve, reject) => {
    officeparser.parseOffice(filePath, (dataOrErr: any, maybeData?: any) => {
      // officeparser v6 sometimes passes data as first arg (no error)
      const data = maybeData !== undefined ? maybeData : dataOrErr;
      if (data instanceof Error) {
        reject(data);
      } else {
        resolve(extractTextFromPptxObject(data));
      }
    });
  });
}

async function processFile(filename: string): Promise<ExtractedDocument | null> {
  const filePath = path.join(CONTENT_DATA_PATH, filename);
  const ext = path.extname(filename).toLowerCase();

  let content = "";
  let filetype: "docx" | "pptx" | "pdf";

  try {
    switch (ext) {
      case ".docx":
        content = await extractDocx(filePath);
        filetype = "docx";
        break;
      case ".pptx":
        content = await extractPptx(filePath);
        filetype = "pptx";
        break;
      case ".pdf":
        content = await extractPdf(filePath);
        filetype = "pdf";
        break;
      default:
        console.log(`Skipping unsupported file: ${filename}`);
        return null;
    }

    const doc: ExtractedDocument = {
      id: generateId(filename),
      filename,
      filetype,
      title: extractTitle(filename),
      content: content.trim(),
      metadata: {
        extractedAt: new Date().toISOString(),
        sourcePath: filePath,
        wordCount: content.split(/\s+/).filter(Boolean).length,
      },
    };

    console.log(`✓ Extracted: ${filename} (${doc.metadata.wordCount} words)`);
    return doc;
  } catch (error) {
    console.error(`✗ Failed to extract ${filename}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function main() {
  console.log("Starting content extraction...\n");
  console.log(`Source: ${CONTENT_DATA_PATH}`);
  console.log(`Output: ${OUTPUT_PATH}\n`);

  if (!fs.existsSync(CONTENT_DATA_PATH)) {
    console.error("ContentData directory not found!");
    process.exit(1);
  }

  const files = fs.readdirSync(CONTENT_DATA_PATH).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".docx", ".pptx", ".pdf"].includes(ext);
  });

  console.log(`Found ${files.length} files to process\n`);

  const documents: ExtractedDocument[] = [];
  const quickSixDocs: ExtractedDocument[] = [];
  const courseDocs: ExtractedDocument[] = [];
  const examDocs: ExtractedDocument[] = [];
  const otherDocs: ExtractedDocument[] = [];

  for (const file of files) {
    const doc = await processFile(file);
    if (doc) {
      documents.push(doc);

      // Categorize documents
      const lowerFilename = file.toLowerCase();
      if (lowerFilename.includes("quick") || lowerFilename.includes("six")) {
        quickSixDocs.push(doc);
      } else if (
        lowerFilename.includes("exam") ||
        lowerFilename.includes("ph1 exam")
      ) {
        examDocs.push(doc);
      } else if (
        lowerFilename.includes("trichocare") ||
        lowerFilename.includes("trichology") ||
        lowerFilename.includes("fundamentals") ||
        lowerFilename.includes("training") ||
        lowerFilename.includes("course")
      ) {
        courseDocs.push(doc);
      } else {
        otherDocs.push(doc);
      }
    }
  }

  // Write all documents
  fs.writeFileSync(
    path.join(OUTPUT_PATH, "all-documents.json"),
    JSON.stringify(documents, null, 2)
  );

  // Write categorized documents
  fs.writeFileSync(
    path.join(OUTPUT_PATH, "quick-six-conditions.json"),
    JSON.stringify(quickSixDocs, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_PATH, "course-materials.json"),
    JSON.stringify(courseDocs, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_PATH, "exam-materials.json"),
    JSON.stringify(examDocs, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_PATH, "other-materials.json"),
    JSON.stringify(otherDocs, null, 2)
  );

  console.log("\n=== Extraction Summary ===");
  console.log(`Total documents: ${documents.length}`);
  console.log(`Quick Six conditions: ${quickSixDocs.length}`);
  console.log(`Course materials: ${courseDocs.length}`);
  console.log(`Exam materials: ${examDocs.length}`);
  console.log(`Other materials: ${otherDocs.length}`);
  console.log(`\nOutput written to: ${OUTPUT_PATH}`);
}

main().catch(console.error);
