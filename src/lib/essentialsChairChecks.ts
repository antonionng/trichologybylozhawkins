import {
  ESSENTIALS_COURSE_SLUG,
  ESSENTIALS_MODULES,
} from "./essentialsDeepen";

export type EssentialsChairCheckQuestion = {
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type EssentialsChairCheckQuiz = {
  moduleTitleIncludes: string;
  slug: string;
  title: string;
  description: string;
  questions: EssentialsChairCheckQuestion[];
};

export type EssentialsChairCheckFile = {
  courseSlug: string;
  status: "DRAFT";
  passingScore: number;
  isRequired: boolean;
  isPublic: boolean;
  modules: EssentialsChairCheckQuiz[];
};

const LETTER_INDEX: Record<string, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
};

function stripMarkdown(value: string) {
  return value.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

function moduleMetaFromHeading(heading: string) {
  const title = heading.replace(/^#+\s+/, "").replace(/^Module\s+\d+:\s*/i, "").trim();
  const spec = ESSENTIALS_MODULES.find((mod) =>
    title.toLowerCase().includes(mod.titleIncludes.toLowerCase()),
  );
  if (!spec) {
    throw new Error(`Unknown chair-check module heading: ${heading}`);
  }
  return {
    moduleTitleIncludes: spec.titleIncludes,
    slug: spec.quiz.slug,
    title: spec.quiz.title,
    description: spec.quiz.description,
  };
}

function parseOptions(block: string) {
  const options: string[] = [];
  const optionRe = /^[A-E]\.\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = optionRe.exec(block))) {
    options.push(stripMarkdown(match[1]));
  }
  return options;
}

function parseCorrectIndex(raw: string, options: string[]) {
  const letter = raw.trim().match(/^([A-E])\b/i)?.[1]?.toUpperCase();
  if (!letter || letterIndex(letter) === undefined) {
    throw new Error(`Could not parse correct answer: ${raw}`);
  }
  const index = letterIndex(letter)!;
  if (index >= options.length) {
    throw new Error(`Correct answer ${letter} is out of range for ${options.length} options`);
  }
  return index;
}

function letterIndex(letter: string) {
  return LETTER_INDEX[letter];
}

function parseQuestion(block: string): EssentialsChairCheckQuestion {
  const typeMatch = block.match(/^###\s+Q[\d.]+:\s*(MULTIPLE_CHOICE|TRUE_FALSE)/);
  if (!typeMatch) {
    throw new Error(`Missing question type in block:\n${block.slice(0, 120)}`);
  }
  const questionType = typeMatch[1] as EssentialsChairCheckQuestion["questionType"];

  const stemMatch = block.match(/\*\*Stem:\*\*\s*([\s\S]*?)\n\s*\*\*Options:\*\*/);
  const optionsMatch = block.match(/\*\*Options:\*\*\s*([\s\S]*?)\n\s*\*\*Correct:\*\*/);
  const correctMatch = block.match(/\*\*Correct:\*\*\s*(.+)/);
  const explanationMatch = block.match(/\*\*Explanation:\*\*\s*([\s\S]+)/);

  if (!stemMatch || !optionsMatch || !correctMatch || !explanationMatch) {
    throw new Error(`Incomplete chair-check question:\n${block.slice(0, 160)}`);
  }

  const options = parseOptions(optionsMatch[1]);
  if (options.length < 2) {
    throw new Error(`Question needs at least two options:\n${block.slice(0, 160)}`);
  }

  return {
    questionText: stripMarkdown(stemMatch[1]),
    questionType,
    options,
    correctAnswer: parseCorrectIndex(correctMatch[1], options),
    explanation: stripMarkdown(explanationMatch[1]),
  };
}

export function parseEssentialsChairChecks(markdown: string): EssentialsChairCheckFile {
  const sections = markdown.split(/^##\s+(?=Module\s+\d+:)/m).slice(1);
  if (sections.length !== 3) {
    throw new Error(`Expected 3 module chair-checks, found ${sections.length}`);
  }

  const modules = sections.map((section) => {
    const heading = section.match(/^Module\s+\d+:[^\n]+/)?.[0];
    if (!heading) {
      throw new Error("Chair-check section is missing a Module heading");
    }
    const meta = moduleMetaFromHeading(heading);
    const questionBlocks = section.split(/^###\s+(?=Q[\d.]+:)/m).slice(1);
    if (questionBlocks.length < 3) {
      throw new Error(`${heading} needs at least 3 questions`);
    }
    return {
      ...meta,
      questions: questionBlocks.map((block) => parseQuestion(`### ${block}`)),
    };
  });

  return {
    courseSlug: ESSENTIALS_COURSE_SLUG,
    status: "DRAFT",
    passingScore: 70,
    isRequired: true,
    isPublic: false,
    modules,
  };
}
