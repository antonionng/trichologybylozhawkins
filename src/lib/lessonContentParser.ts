export type ParsedLesson = {
  body: string;
  takeaways: string[];
  reflection: string | null;
  tips: string[];
  headings: Array<{ id: string; label: string }>;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Parses raw lesson markdown and extracts structured sections:
 * - Key Takeaways (bullet list)
 * - Reflection (prompt text)
 * - Blockquote tips (Lorraine's conversational tips)
 * - H2 headings (for table of contents)
 * - Cleaned body (everything minus takeaways & reflection sections)
 */
export function parseLessonContent(raw: string): ParsedLesson {
  const lines = raw.split("\n");

  const tips: string[] = [];
  const headings: Array<{ id: string; label: string }> = [];

  let takeawaysStart = -1;
  let takeawaysEnd = -1;
  let reflectionStart = -1;
  let reflectionEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## Key Takeaways")) {
      takeawaysStart = i;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith("## ")) {
          takeawaysEnd = j;
          break;
        }
      }
      if (takeawaysEnd === -1) takeawaysEnd = lines.length;
      continue;
    }

    if (line.startsWith("## Reflection")) {
      reflectionStart = i;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith("## ")) {
          reflectionEnd = j;
          break;
        }
      }
      if (reflectionEnd === -1) reflectionEnd = lines.length;
      continue;
    }

    if (line.startsWith("> ")) {
      const tipText = line.replace(/^>\s*/, "").trim();
      if (tipText) tips.push(tipText);
    }

    if (line.startsWith("## ") && !line.startsWith("## Key Takeaways") && !line.startsWith("## Reflection")) {
      const label = line.replace(/^##\s+/, "").trim();
      headings.push({ id: slugify(label), label });
    }
  }

  const takeaways: string[] = [];
  if (takeawaysStart !== -1) {
    for (let i = takeawaysStart + 1; i < takeawaysEnd; i++) {
      const match = lines[i].match(/^-\s+(.+)/);
      if (match) takeaways.push(match[1].trim());
    }
  }

  let reflection: string | null = null;
  if (reflectionStart !== -1) {
    const reflectionLines = lines
      .slice(reflectionStart + 1, reflectionEnd)
      .filter((l) => l.trim() !== "");
    if (reflectionLines.length > 0) {
      reflection = reflectionLines.join("\n");
    }
  }

  const excludeRanges: Array<[number, number]> = [];
  if (takeawaysStart !== -1) excludeRanges.push([takeawaysStart, takeawaysEnd]);
  if (reflectionStart !== -1) excludeRanges.push([reflectionStart, reflectionEnd]);

  const bodyLines = lines.filter((_, i) => {
    return !excludeRanges.some(([start, end]) => i >= start && i < end);
  });

  const body = bodyLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return { body, takeaways, reflection, tips, headings };
}
