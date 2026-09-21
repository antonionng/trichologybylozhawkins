/**
 * Minimal A4 PDF writer. No extra dependencies.
 * Helvetica + WinAnsi for chair-side one-pagers.
 */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 44;
const LINE_HEIGHT = 12;
const TITLE_SIZE = 15;
const BODY_SIZE = 10;
const FOOTER_SIZE = 8;

export const ESSENTIALS_PDF_FOOTER =
  "Salon Trichology Essentials  ·  trichologyacademy.co.uk";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function toWinAnsi(value: string) {
  return value
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x09\x0a\x0d\x20-\x7e\xa0-\xff]/g, "?");
}

function stripInlineMarkdown(value: string) {
  return value.replace(/\*\*/g, "").replace(/`/g, "");
}

function wrapLine(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export type SimplePdfBlock =
  | { type: "title"; text: string }
  | { type: "heading"; text: string }
  | { type: "body"; text: string }
  | { type: "bullet"; text: string }
  | { type: "spacer" };

export function markdownToPdfBlocks(markdown: string): SimplePdfBlock[] {
  const blocks: SimplePdfBlock[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      blocks.push({ type: "spacer" });
      continue;
    }
    if (trimmed === "---") continue;
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "title", text: stripInlineMarkdown(trimmed.slice(2)) });
      continue;
    }
    if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      blocks.push({ type: "heading", text: stripInlineMarkdown(trimmed.replace(/^#+\s+/, "")) });
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      blocks.push({ type: "bullet", text: stripInlineMarkdown(trimmed.replace(/^[-*]\s+/, "")) });
      continue;
    }
    blocks.push({ type: "body", text: stripInlineMarkdown(trimmed) });
  }

  return blocks;
}

function layoutBlocks(blocks: SimplePdfBlock[]) {
  const pages: string[][] = [[]];
  let y = PAGE_HEIGHT - MARGIN;

  const pushLine = (text: string, size: number, indent = 0) => {
    const maxChars = size >= TITLE_SIZE ? 64 : 92;
    const wrapped = wrapLine(toWinAnsi(text), maxChars);
    for (const line of wrapped) {
      if (y < MARGIN + 32) {
        pages.push([]);
        y = PAGE_HEIGHT - MARGIN;
      }
      const escaped = escapePdfText(line);
      pages[pages.length - 1].push(
        `BT /F1 ${size} Tf ${MARGIN + indent} ${y.toFixed(2)} Td (${escaped}) Tj ET`,
      );
      y -= size + 3;
    }
  };

  for (const block of blocks) {
    if (block.type === "spacer") {
      y -= LINE_HEIGHT * 0.45;
      continue;
    }
    if (block.type === "title") {
      pushLine(block.text, TITLE_SIZE);
      y -= 4;
      continue;
    }
    if (block.type === "heading") {
      y -= 6;
      pushLine(block.text, 11);
      continue;
    }
    if (block.type === "bullet") {
      pushLine(`• ${block.text}`, BODY_SIZE, 10);
      continue;
    }
    pushLine(block.text, BODY_SIZE);
  }

  return pages;
}

function buildPageContent(ops: string[], pageIndex: number, pageCount: number, footer: string) {
  const label = `${footer}  ·  ${pageIndex + 1}/${pageCount}`;
  const line = `BT /F1 ${FOOTER_SIZE} Tf ${MARGIN} 26 Td (${escapePdfText(toWinAnsi(label))}) Tj ET`;
  return [...ops, line].join("\n");
}

export function buildSimplePdf(
  blocks: SimplePdfBlock[],
  options?: { footer?: string },
): Buffer {
  const footer = options?.footer ?? ESSENTIALS_PDF_FOOTER;
  const pages = layoutBlocks(blocks);
  const objects: string[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const pageIds = pages.map((_, i) => 3 + i);
  const fontId = 3 + pages.length;
  const contentStart = fontId + 1;

  objects.push(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  );

  pages.forEach((_, i) => {
    const contentId = contentStart + i;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    );
  });

  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");

  pages.forEach((ops, i) => {
    const stream = buildPageContent(ops, i, pages.length, footer);
    objects.push(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "utf8");
}

export function markdownToSimplePdf(
  markdown: string,
  options?: { footer?: string },
): Buffer {
  return buildSimplePdf(markdownToPdfBlocks(markdown), options);
}
