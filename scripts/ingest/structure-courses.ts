/**
 * Structure Courses Script
 * Parses extracted content and structures it into courses, modules, lessons, 
 * condition references, and exam questions.
 * Outputs to data/structured/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_PATH = path.resolve(__dirname, "../../data/source-materials");
const OUTPUT_PATH = path.resolve(__dirname, "../../data/structured");

interface ExtractedDocument {
  id: string;
  filename: string;
  filetype: string;
  title: string;
  content: string;
  metadata: {
    extractedAt: string;
    sourcePath: string;
    wordCount: number;
  };
}

interface CourseModule {
  title: string;
  description: string;
  position: number;
  lessons: Array<{
    title: string;
    description: string;
    content: string;
    position: number;
  }>;
}

interface StructuredCourse {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  enrollmentType: string;
  durationMinutes: number;
  modules: CourseModule[];
}

interface ConditionReference {
  slug: string;
  name: string;
  category: string;
  description: string;
  whatIsIt: string;
  causedBy: string[];
  symptoms: string[];
  treatments: string[];
  keyFacts: string[];
}

interface ExamQuestion {
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[];
  correctAnswer: string | number;
  explanation: string;
  dayNumber: number;
}

interface StructuredExam {
  courseSlug: string;
  title: string;
  description: string;
  passingScore: number;
  questions: ExamQuestion[];
}

// Helper to slugify text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Parse Quick 6 condition documents
function parseQuickSixDocument(doc: ExtractedDocument): ConditionReference | null {
  const content = doc.content;
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  
  // Determine condition name from title
  let name = doc.title
    .replace(/quick\s*6?\s*/gi, "")
    .replace(/\s*\(\d+\)\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  
  // Clean up common abbreviations
  if (name.toLowerCase().includes("icd")) {
    name = "Irritant Contact Dermatitis";
  }
  if (name.toLowerCase().includes("hl")) {
    name = name.replace(/HL/i, "Hair Loss");
  }
  
  const condition: ConditionReference = {
    slug: slugify(name),
    name,
    category: "Scalp & Hair Condition",
    description: "",
    whatIsIt: "",
    causedBy: [],
    symptoms: [],
    treatments: [],
    keyFacts: [],
  };
  
  let currentSection = "";
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Detect section headers
    if (lowerLine.includes("what is it") || lowerLine.includes("what it is")) {
      currentSection = "whatIsIt";
      continue;
    }
    if (lowerLine.includes("caused by") || lowerLine.includes("causes") || lowerLine.includes("aetiology")) {
      currentSection = "causedBy";
      continue;
    }
    if (lowerLine.includes("symptoms") || lowerLine.includes("signs") || lowerLine.includes("presentation")) {
      currentSection = "symptoms";
      continue;
    }
    if (lowerLine.includes("treatment") || lowerLine.includes("management") || lowerLine.includes("therapy")) {
      currentSection = "treatments";
      continue;
    }
    if (lowerLine.includes("key fact") || lowerLine.includes("important") || lowerLine.includes("note")) {
      currentSection = "keyFacts";
      continue;
    }
    
    // Clean up bullet points
    const cleanLine = line.replace(/^[-•*]\s*/, "").trim();
    if (!cleanLine) continue;
    
    // Add to appropriate section
    switch (currentSection) {
      case "whatIsIt":
        condition.whatIsIt += (condition.whatIsIt ? " " : "") + cleanLine;
        break;
      case "causedBy":
        condition.causedBy.push(cleanLine);
        break;
      case "symptoms":
        condition.symptoms.push(cleanLine);
        break;
      case "treatments":
        condition.treatments.push(cleanLine);
        break;
      case "keyFacts":
        condition.keyFacts.push(cleanLine);
        break;
      default:
        // If no section detected yet, add to description
        if (!condition.description) {
          condition.description = cleanLine;
        }
    }
  }
  
  // Generate description if empty
  if (!condition.description && condition.whatIsIt) {
    condition.description = condition.whatIsIt.substring(0, 200) + "...";
  }
  
  // Set category based on condition type
  if (name.toLowerCase().includes("alopecia") || name.toLowerCase().includes("hair loss")) {
    condition.category = "Hair Loss";
  } else if (name.toLowerCase().includes("dermatitis")) {
    condition.category = "Scalp Dermatitis";
  } else if (name.toLowerCase().includes("folliculitis")) {
    condition.category = "Scalp Infection";
  }
  
  return condition;
}

// Parse Trichocare PH1 PDF content into course structure
function parseTrichocarePhase1(doc: ExtractedDocument): StructuredCourse {
  const content = doc.content;
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  
  const course: StructuredCourse = {
    slug: "trichocare-phase-1",
    title: "Hair & Scalp Foundation Phase 1",
    subtitle: "8-Day Professional Trichology Certification",
    description: "Comprehensive 8-day professional trichology training covering hair science, scalp conditions, diagnosis techniques, and client consultation skills. Designed for hairstylists and beauty professionals looking to expand their expertise.",
    category: "Professional Certification",
    level: "PROFESSIONAL",
    enrollmentType: "COHORT",
    durationMinutes: 2880, // 8 days x 6 hours = 48 hours
    modules: [],
  };
  
  let currentDay = 0;
  let currentModule: CourseModule | null = null;
  let currentLesson: { title: string; description: string; content: string; position: number } | null = null;
  let lessonContent: string[] = [];
  
  for (const line of lines) {
    // Detect day headers
    const dayMatch = line.match(/Day\s*(\d+)/i);
    if (dayMatch) {
      const newDay = parseInt(dayMatch[1]);
      if (newDay !== currentDay) {
        // Save previous module
        if (currentModule && currentLesson) {
          currentLesson.content = lessonContent.join("\n");
          currentModule.lessons.push(currentLesson);
        }
        if (currentModule) {
          course.modules.push(currentModule);
        }
        
        currentDay = newDay;
        currentModule = {
          title: `Day ${newDay}: ${getModuleTitle(newDay, content)}`,
          description: `Training content for Day ${newDay} of the Hair & Scalp Foundation Phase 1 program.`,
          position: newDay - 1,
          lessons: [],
        };
        currentLesson = null;
        lessonContent = [];
      }
      continue;
    }
    
    // Detect part/topic headers
    const partMatch = line.match(/Part\s*(\d+)/i);
    if (partMatch && currentModule) {
      if (currentLesson) {
        currentLesson.content = lessonContent.join("\n");
        currentModule.lessons.push(currentLesson);
      }
      
      const partNum = parseInt(partMatch[1]);
      currentLesson = {
        title: extractLessonTitle(line, content, currentModule.lessons.length),
        description: "",
        content: "",
        position: currentModule.lessons.length,
      };
      lessonContent = [];
      continue;
    }
    
    // Add content to current lesson
    if (currentLesson && line) {
      lessonContent.push(line);
    } else if (currentModule && !currentLesson && line.length > 20) {
      // Create first lesson if we have content but no lesson yet
      currentLesson = {
        title: line.substring(0, 60) + (line.length > 60 ? "..." : ""),
        description: "",
        content: "",
        position: 0,
      };
      lessonContent = [line];
    }
  }
  
  // Save final module/lesson
  if (currentModule && currentLesson) {
    currentLesson.content = lessonContent.join("\n");
    currentModule.lessons.push(currentLesson);
  }
  if (currentModule) {
    course.modules.push(currentModule);
  }
  
  return course;
}

function getModuleTitle(day: number, content: string): string {
  const titles: Record<number, string> = {
    1: "Introduction to Trichology",
    2: "Hair Biology & Growth Cycle",
    3: "Scalp Anatomy & Conditions",
    4: "Diagnosis & Assessment",
    5: "Common Hair Loss Conditions",
    6: "Scalp Disorders & Treatments",
    7: "Client Consultation Skills",
    8: "Business & Practice Development",
  };
  return titles[day] || `Training Day ${day}`;
}

function extractLessonTitle(line: string, content: string, index: number): string {
  const cleanLine = line.replace(/Part\s*\d+:?/i, "").trim();
  if (cleanLine.length > 10) {
    return cleanLine.substring(0, 60) + (cleanLine.length > 60 ? "..." : "");
  }
  return `Lesson ${index + 1}`;
}

// Parse Hair Science Fundamentals
function parseHairScienceFundamentals(doc: ExtractedDocument): StructuredCourse {
  const content = doc.content;
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  
  const course: StructuredCourse = {
    slug: "hair-science-fundamentals",
    title: "Hair Science & Tricho Care Fundamentals",
    subtitle: "Foundation Course in Hair & Scalp Science",
    description: "Learn the essential science of hair biology, scalp health, and basic trichology concepts. Perfect for stylists wanting to understand the science behind hair care.",
    category: "Foundation",
    level: "BEGINNER",
    enrollmentType: "ON_DEMAND",
    durationMinutes: 180,
    modules: [],
  };
  
  let currentModule: CourseModule | null = null;
  const moduleTopics = [
    "Hair Structure",
    "Growth Cycle",
    "Scalp Health",
    "Common Issues",
    "Assessment Basics",
  ];
  
  let topicIndex = 0;
  let contentBuffer: string[] = [];
  
  for (const line of lines) {
    // Detect major topic changes
    const isNewTopic = moduleTopics.some(topic => 
      line.toLowerCase().includes(topic.toLowerCase())
    );
    
    if (isNewTopic && topicIndex < moduleTopics.length) {
      if (currentModule && contentBuffer.length > 0) {
        currentModule.lessons.push({
          title: moduleTopics[topicIndex - 1] || `Topic ${topicIndex}`,
          description: "",
          content: contentBuffer.join("\n"),
          position: 0,
        });
        course.modules.push(currentModule);
      }
      
      currentModule = {
        title: moduleTopics[topicIndex],
        description: `Understanding ${moduleTopics[topicIndex].toLowerCase()}.`,
        position: topicIndex,
        lessons: [],
      };
      topicIndex++;
      contentBuffer = [];
    } else {
      contentBuffer.push(line);
    }
  }
  
  // Add final module
  if (currentModule) {
    if (contentBuffer.length > 0) {
      currentModule.lessons.push({
        title: "Core Concepts",
        description: "",
        content: contentBuffer.join("\n"),
        position: 0,
      });
    }
    course.modules.push(currentModule);
  }
  
  // Ensure at least one module
  if (course.modules.length === 0) {
    course.modules.push({
      title: "Hair Science Fundamentals",
      description: "Complete overview of hair science.",
      position: 0,
      lessons: [{
        title: "Introduction to Hair Science",
        description: "",
        content: doc.content,
        position: 0,
      }],
    });
  }
  
  return course;
}

// Parse exam documents
function parseExamDocument(doc: ExtractedDocument, dayRange: string): StructuredExam {
  const content = doc.content;
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  
  const exam: StructuredExam = {
    courseSlug: "trichocare-phase-1",
    title: `Hair & Scalp Foundation Phase 1 Exam - ${dayRange}`,
    description: `Assessment covering Days ${dayRange} of the Hair & Scalp Foundation Phase 1 program.`,
    passingScore: 70,
    questions: [],
  };
  
  let currentQuestion: Partial<ExamQuestion> | null = null;
  let questionNumber = 0;
  
  for (const line of lines) {
    // Detect question numbers
    const questionMatch = line.match(/^(\d+)[.)]\s*(.+)/);
    if (questionMatch) {
      // Save previous question
      if (currentQuestion && currentQuestion.questionText) {
        exam.questions.push(currentQuestion as ExamQuestion);
      }
      
      questionNumber++;
      currentQuestion = {
        questionText: questionMatch[2],
        questionType: "SHORT_ANSWER",
        options: [],
        correctAnswer: "",
        explanation: "",
        dayNumber: Math.ceil(questionNumber / 5), // Approximate day based on question order
      };
      continue;
    }
    
    // Detect multiple choice options
    const optionMatch = line.match(/^[a-d][.)]\s*(.+)/i);
    if (optionMatch && currentQuestion) {
      currentQuestion.options = currentQuestion.options || [];
      currentQuestion.options.push(optionMatch[1]);
      currentQuestion.questionType = "MULTIPLE_CHOICE";
      continue;
    }
    
    // Detect True/False
    if (currentQuestion && (line.toLowerCase().includes("true or false") || line.toLowerCase().includes("t/f"))) {
      currentQuestion.questionType = "TRUE_FALSE";
      currentQuestion.options = ["True", "False"];
    }
    
    // Add to question text if continuing
    if (currentQuestion && !questionMatch && !optionMatch && line) {
      currentQuestion.questionText += " " + line;
    }
  }
  
  // Save final question
  if (currentQuestion && currentQuestion.questionText) {
    exam.questions.push(currentQuestion as ExamQuestion);
  }
  
  return exam;
}

// Main structure function
async function main() {
  console.log("Structuring extracted content...\n");
  
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error("Source materials not found! Run extract-content.ts first.");
    process.exit(1);
  }
  
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }
  
  // Load extracted documents
  const allDocs: ExtractedDocument[] = JSON.parse(
    fs.readFileSync(path.join(SOURCE_PATH, "all-documents.json"), "utf-8")
  );
  
  console.log(`Processing ${allDocs.length} extracted documents...\n`);
  
  // Structure courses
  const courses: StructuredCourse[] = [];
  const conditions: ConditionReference[] = [];
  const exams: StructuredExam[] = [];
  
  for (const doc of allDocs) {
    const lowerFilename = doc.filename.toLowerCase();
    
    // Parse Quick 6 condition documents
    if (lowerFilename.includes("quick") || (lowerFilename.includes("six") && !lowerFilename.includes("exam"))) {
      const condition = parseQuickSixDocument(doc);
      if (condition) {
        conditions.push(condition);
        console.log(`✓ Parsed condition: ${condition.name}`);
      }
    }
    // Parse Trichocare PH1 PDF
    else if (lowerFilename.includes("trichocare") && lowerFilename.includes("day 1-8")) {
      const course = parseTrichocarePhase1(doc);
      courses.push(course);
      console.log(`✓ Parsed course: ${course.title} (${course.modules.length} modules)`);
    }
    // Parse Hair Science Fundamentals
    else if (lowerFilename.includes("fundamentals")) {
      const course = parseHairScienceFundamentals(doc);
      courses.push(course);
      console.log(`✓ Parsed course: ${course.title}`);
    }
    // Parse exam documents
    else if (lowerFilename.includes("exam") && lowerFilename.includes("day")) {
      const dayRange = lowerFilename.includes("1-4") ? "Days 1-4" : "Days 5-8";
      const exam = parseExamDocument(doc, dayRange);
      exams.push(exam);
      console.log(`✓ Parsed exam: ${exam.title} (${exam.questions.length} questions)`);
    }
  }
  
  // Create Common Skin Conditions course from parsed content
  const skinConditionDocs = allDocs.filter(d => 
    d.filename.toLowerCase().includes("common skin conditions")
  );
  if (skinConditionDocs.length > 0) {
    const skinCourse: StructuredCourse = {
      slug: "common-skin-conditions",
      title: "Common Skin Conditions",
      subtitle: "Understanding Scalp & Skin Disorders",
      description: "Learn to identify and understand common skin conditions affecting the scalp and hair. Essential knowledge for trichology practitioners.",
      category: "Specialist",
      level: "INTERMEDIATE",
      enrollmentType: "ON_DEMAND",
      durationMinutes: 120,
      modules: [{
        title: "Skin Condition Overview",
        description: "Introduction to common skin conditions.",
        position: 0,
        lessons: [{
          title: "Common Scalp & Skin Conditions",
          description: "Overview of conditions affecting the scalp.",
          content: skinConditionDocs[0].content,
          position: 0,
        }],
      }],
    };
    courses.push(skinCourse);
    console.log(`✓ Created course: ${skinCourse.title}`);
  }
  
  // Write structured data
  fs.writeFileSync(
    path.join(OUTPUT_PATH, "courses.json"),
    JSON.stringify(courses, null, 2)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_PATH, "conditions.json"),
    JSON.stringify(conditions, null, 2)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_PATH, "exams.json"),
    JSON.stringify(exams, null, 2)
  );
  
  // Update corpus.json with all content for AI
  const corpus = allDocs.map(doc => ({
    id: doc.id,
    title: doc.title,
    slug: slugify(doc.title),
    category: categorizeDocument(doc.filename),
    topics: extractTopics(doc.content),
    format: doc.filetype,
    source_path: doc.metadata.sourcePath,
    content: doc.content,
  }));
  
  fs.writeFileSync(
    path.join(OUTPUT_PATH, "corpus.json"),
    JSON.stringify(corpus, null, 2)
  );
  
  console.log("\n=== Structuring Summary ===");
  console.log(`Courses: ${courses.length}`);
  console.log(`Conditions: ${conditions.length}`);
  console.log(`Exams: ${exams.length}`);
  console.log(`\nOutput written to: ${OUTPUT_PATH}`);
}

function categorizeDocument(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("quick") || lower.includes("six")) return "condition-reference";
  if (lower.includes("exam")) return "assessment";
  if (lower.includes("fundamentals")) return "foundation";
  if (lower.includes("trichocare")) return "professional-certification";
  if (lower.includes("training")) return "training";
  return "general";
}

function extractTopics(content: string): string[] {
  const topics: string[] = [];
  const keywords = [
    "alopecia", "hair loss", "scalp", "dermatitis", "folliculitis",
    "telogen", "traction", "pattern", "seborrheic", "trichotillomania",
    "consultation", "diagnosis", "treatment", "client", "hair growth",
  ];
  
  const lowerContent = content.toLowerCase();
  for (const keyword of keywords) {
    if (lowerContent.includes(keyword)) {
      topics.push(keyword);
    }
  }
  
  return [...new Set(topics)].slice(0, 10);
}

main().catch(console.error);

