import {
  PrismaClient,
  LifecycleStage,
  ActivityType,
  TaskStatus,
  TaskPriority,
  CourseLevel,
  CourseStatus,
  EnrollmentType,
  EnrollmentStatus,
  OrderStatus,
  PaymentProvider,
  AudienceType,
  AudienceMemberStatus,
  CampaignStatus,
  EmailSendStatus,
  ContentChannel,
  ContentSlotStatus,
  ContentAssetType,
  AssetVariantStatus,
  QuizStatus,
  QuestionType,
  ConditionStatus,
  VideoSourceType,
  CollectionType,
  EntryStatus,
} from "@prisma/client";
import fs from "fs";
import path from "path";
import {
  quizCardImages,
  QUIZ_CARD_IMAGE_POOL,
  resolveQuizCardImage,
} from "../src/lib/quizCardImagePool";

const prisma = new PrismaClient();

// Load structured data
const DATA_PATH = path.resolve(__dirname, "../data/structured");

interface StructuredCourse {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  enrollmentType: string;
  durationMinutes: number;
  modules: Array<{
    title: string;
    description: string;
    position: number;
    quiz?: {
      title: string;
      passingScore: number;
      questions: Array<{
        questionText: string;
        questionType: string;
        options: string[];
        correctAnswer: number;
        explanation?: string;
      }>;
    };
    lessons: Array<{
      title: string;
      description: string;
      content: string;
      resources?: Array<{
        title: string;
        type: string;
        content: string;
      }>;
      knowledgeCheck?: Array<{
        question: string;
        type: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }>;
      position: number;
    }>;
  }>;
}

interface StructuredCondition {
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

interface StructuredExam {
  courseSlug: string;
  title: string;
  description: string;
  passingScore: number;
  questions: Array<{
    questionText: string;
    questionType: string;
    options: string[];
    correctAnswer: string | number;
    explanation: string;
    dayNumber: number;
  }>;
}

function loadJsonFile<T>(filename: string): T | null {
  const filePath = path.join(DATA_PATH, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function mapLevel(level: string): CourseLevel {
  const mapping: Record<string, CourseLevel> = {
    BEGINNER: CourseLevel.BEGINNER,
    INTERMEDIATE: CourseLevel.INTERMEDIATE,
    ADVANCED: CourseLevel.ADVANCED,
    PROFESSIONAL: CourseLevel.PROFESSIONAL,
  };
  return mapping[level] || CourseLevel.GENERAL;
}

function mapEnrollmentType(type: string): EnrollmentType {
  const mapping: Record<string, EnrollmentType> = {
    ON_DEMAND: EnrollmentType.ON_DEMAND,
    COHORT: EnrollmentType.COHORT,
    LIVE: EnrollmentType.LIVE,
    HYBRID: EnrollmentType.HYBRID,
  };
  return mapping[type] || EnrollmentType.ON_DEMAND;
}

async function main() {
  console.log("🌱 Starting seed...\n");

  // CLEANUP
  console.log("Cleaning up existing data...");

  // Chat
  await prisma.chatMessage.deleteMany();
  await prisma.chatAction.deleteMany();
  await prisma.chatConversation.deleteMany();

  // Content Factory
  await prisma.assetVariant.deleteMany();
  await prisma.contentAsset.deleteMany();
  await prisma.contentSlot.deleteMany();
  await prisma.contentPlan.deleteMany();
  await prisma.generationFeedback.deleteMany();
  await prisma.generatedContent.deleteMany();
  await prisma.promptTemplate.deleteMany();

  // Email
  await prisma.emailSend.deleteMany();
  await prisma.emailCampaign.deleteMany();
  await prisma.automationEvent.deleteMany();
  await prisma.automationRun.deleteMany();
  await prisma.automationStep.deleteMany();
  await prisma.automation.deleteMany();
  await prisma.audienceMember.deleteMany();
  await prisma.audience.deleteMany();

  // Progress & Quiz & Conditions
  await prisma.lessonProgress.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.courseCondition.deleteMany();
  await prisma.conditionReference.deleteMany();

  // Video Products (preserve heroMediaId set via admin uploads)
  await prisma.videoAccess.deleteMany();
  await prisma.videoProductPrice.deleteMany();

  // Education & Commerce
  await prisma.entitlement.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.shopOrderEvent.deleteMany();
  await prisma.shopOrderItem.deleteMany();
  await prisma.shopOrder.deleteMany();
  await prisma.shopProductImage.deleteMany();
  await prisma.shopProduct.deleteMany();
  await prisma.shopCategory.deleteMany();
  await prisma.courseEnquiry.deleteMany();
  await prisma.coursePrice.deleteMany();
  await prisma.courseLesson.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.downloadableAsset.deleteMany();
  await prisma.courseSession.deleteMany();
  await prisma.course.deleteMany();

  // CRM
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.dealStage.deleteMany();
  await prisma.dealPipeline.deleteMany();
  await prisma.authToken.deleteMany();
  // Preserve existing user accounts (e.g. admin login created via seed:user).
  // Only remove users that were NOT seeded with a password (i.e. test/placeholder rows).
  await prisma.user.deleteMany({ where: { passwordHash: null } });
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();

  console.log("Cleanup finished. Starting creation...\n");

  // --- CRM SEEDING ---
  console.log("Creating CRM data...");

  // Companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Glow Trichology Clinic",
        domain: "glowtrichology.com",
        industry: "Healthcare",
        size: "1-10",
        notes: "Premium clinic in London",
      },
    }),
    prisma.company.create({
      data: {
        name: "Roots & Scalp Therapy",
        domain: "rootsandscalp.co.uk",
        industry: "Wellness",
        size: "11-50",
        notes: "Chain of clinics across UK",
      },
    }),
    prisma.company.create({
      data: {
        name: "Elite Hair Systems",
        domain: "elitehairsystems.com",
        industry: "Beauty",
        size: "51-200",
        notes: "Specializes in hair replacement",
      },
    }),
  ]);

  // Contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "sarah.j@glowtrichology.com",
        phone: "+44 7700 900001",
        jobTitle: "Lead Trichologist",
        lifecycleStage: LifecycleStage.CUSTOMER,
        companyId: companies[0].id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Dr. Emily",
        lastName: "Chen",
        email: "emily.chen@rootsandscalp.co.uk",
        phone: "+44 7700 900002",
        jobTitle: "Medical Director",
        lifecycleStage: LifecycleStage.SALES_QUALIFIED_LEAD,
        companyId: companies[1].id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Marcus",
        lastName: "Thorne",
        email: "marcus@elitehairsystems.com",
        phone: "+44 7700 900003",
        jobTitle: "Owner",
        lifecycleStage: LifecycleStage.LEAD,
        companyId: companies[2].id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Jessica",
        lastName: "Alba",
        email: "jessica.demo@gmail.com",
        phone: "+44 7700 900004",
        jobTitle: "Freelance Stylist",
        lifecycleStage: LifecycleStage.MARKETING_QUALIFIED_LEAD,
      },
    }),
  ]);

  // Deal Pipeline
  const pipeline = await prisma.dealPipeline.create({
    data: {
      name: "Standard Sales Pipeline",
      isDefault: true,
      stages: {
        create: [
          { name: "Lead", order: 0, probability: 10 },
          { name: "Contacted", order: 1, probability: 30 },
          { name: "Meeting Scheduled", order: 2, probability: 50 },
          { name: "Proposal Sent", order: 3, probability: 70 },
          { name: "Negotiation", order: 4, probability: 90 },
          { name: "Closed Won", order: 5, probability: 100 },
          { name: "Closed Lost", order: 6, probability: 0 },
        ],
      },
    },
    include: { stages: true },
  });

  const stages = pipeline.stages;

  // Deals
  await Promise.all([
    prisma.deal.create({
      data: {
        name: "Clinic Software Upgrade",
        amount: 5000,
        stageId: stages.find((s) => s.name === "Proposal Sent")!.id,
        pipelineId: pipeline.id,
        contactId: contacts[1].id,
        companyId: companies[1].id,
        expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      },
    }),
    prisma.deal.create({
      data: {
        name: "New Branch Setup",
        amount: 12000,
        stageId: stages.find((s) => s.name === "Negotiation")!.id,
        pipelineId: pipeline.id,
        contactId: contacts[0].id,
        companyId: companies[0].id,
        expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    }),
  ]);

  // Tasks
  await prisma.task.create({
    data: {
      title: "Follow up on proposal",
      description: "Check in with Dr. Chen about the software upgrade proposal.",
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      contactId: contacts[1].id,
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  // Activities
  await prisma.activity.create({
    data: {
      type: ActivityType.CALL,
      subject: "Introductory Call",
      body: "Discussed initial requirements for the clinic.",
      contactId: contacts[2].id,
      activityAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      outcome: "COMPLETED",
    },
  });

  // --- EDUCATION SEEDING FROM STRUCTURED DATA ---
  console.log("\nCreating Education data from structured content...");

  const coursesData = loadJsonFile<StructuredCourse[]>("courses.json");
  const courseMap: Record<string, string> = {}; // slug -> id

  const courseHeroImages: Record<string, string> = {
    "trichology-clinical-practice": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    "hair-loss-assessment-communication": "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80",
    "salon-trichology-essentials": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    "advanced-scalp-analysis": "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80",
    "trichocare-phase-1": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  };

  const courseTaglines: Record<string, string> = {
    "trichology-clinical-practice": "Master advanced clinical trichology techniques with hands-on case studies and diagnostic frameworks used by leading practitioners.",
    "hair-loss-assessment-communication": "Learn the consultation skills that build client confidence. Structured frameworks for assessment, communication, and care planning.",
    "salon-trichology-essentials": "Give your salon team the scalp knowledge that sets you apart. Practical training your stylists can use from day one.",
    "advanced-scalp-analysis": "Sharpen your diagnostic eye with advanced trichoscopy techniques, pattern recognition, and evidence-based assessment protocols.",
    "trichocare-phase-1": "The gold-standard professional certification. 8 days of intensive training covering everything from hair biology to complex case management.",
  };

  // Single source of truth: who each course is for, requirements, prerequisites, pricing (Lorraine's spec)
  const courseMarketing: Record<
    string,
    {
      targetAudience: string[];
      requirements: string[];
      requiredCourseSlugs: string[];
      price: number;
      launchOffer?: { amount: number; standardAmount: number };
    }
  > = {
    "trichology-clinical-practice": {
      targetAudience: [
        "Newly qualified trichologists",
        "Anyone who has completed Hair & Scalp Foundation Phase 1",
      ],
      requirements: [],
      requiredCourseSlugs: [],
      price: 295,
    },
    "hair-loss-assessment-communication": {
      targetAudience: [
        "Salon Scalp Specialists looking to study further",
        "Newly qualified Trichologists",
      ],
      requirements: [],
      requiredCourseSlugs: [],
      price: 250,
    },
    "salon-trichology-essentials": {
      targetAudience: [
        "Stylists in salon looking to further their hair and scalp knowledge",
      ],
      requirements: [],
      requiredCourseSlugs: [],
      price: 99,
      launchOffer: { amount: 99, standardAmount: 150 },
    },
    "advanced-scalp-analysis": {
      targetAudience: [
        "All hair & scalp specialists who have completed Hair & Scalp Foundation Phase 1 and Trichology in Clinical Practice",
      ],
      requirements: [],
      requiredCourseSlugs: ["trichocare-phase-1", "trichology-clinical-practice"],
      price: 295,
    },
    "trichocare-phase-1": {
      targetAudience: [
        "Anyone wanting to become a Hair and scalp specialist",
      ],
      requirements: [],
      requiredCourseSlugs: [],
      price: 495,
    },
  };

  if (coursesData && coursesData.length > 0) {
    for (const courseData of coursesData) {
      const marketing = courseMarketing[courseData.slug];
      const price = marketing?.price ?? 35;
      const meta: Record<string, unknown> = {
        heroImage: courseHeroImages[courseData.slug] ?? null,
        tagline: courseTaglines[courseData.slug] ?? null,
      };
      if (marketing?.launchOffer) {
        meta.launchOffer = marketing.launchOffer;
      }

      const course = await prisma.course.create({
        data: {
          slug: courseData.slug,
          title: courseData.title,
          subtitle: courseData.subtitle,
          description: courseData.description,
          category: courseData.category,
          level: mapLevel(courseData.level),
          enrollmentType: EnrollmentType.ON_DEMAND,
          durationMinutes: courseData.durationMinutes,
          status: CourseStatus.PUBLISHED,
          meta,
          targetAudience: marketing?.targetAudience ?? [],
          requirements: marketing?.requirements ?? [],
          learningOutcomes:
            courseData.slug === "hair-loss-assessment-communication"
              ? ["Structured consultation framework", "Client communication techniques", "Evidence-based assessment", "Care plan development", "Emotional intelligence in practice", "Professional referral protocols"]
              : courseData.slug === "salon-trichology-essentials"
              ? ["Scalp anatomy fundamentals", "Common condition recognition", "Client consultation basics", "Product recommendation skills", "When to refer to specialists"]
              : courseData.slug === "trichology-clinical-practice"
              ? ["Advanced diagnostic techniques", "Complex case management", "Trichoscopy interpretation", "Evidence-based treatment protocols", "Professional documentation", "Multi-disciplinary collaboration"]
              : courseData.slug === "advanced-scalp-analysis"
              ? ["Trichoscopy techniques", "Pattern recognition", "Differential diagnosis", "Clinical documentation", "Treatment monitoring"]
              : courseData.slug === "trichocare-phase-1"
              ? ["Hair biology & growth cycle", "Scalp conditions & diagnosis", "Trichoscopy fundamentals", "Consultation & care planning", "Professional standards & ethics", "Client management systems", "Case study analysis", "Certification preparation"]
              : [],
          pricing: {
            create: {
              amount: price,
              currency: "GBP",
              isPrimary: true,
            },
          },
        },
      });

      courseMap[courseData.slug] = course.id;

      // Create modules and lessons
      for (const moduleData of courseData.modules) {
        const courseModule = await prisma.courseModule.create({
          data: {
            courseId: course.id,
            title: moduleData.title,
            description: moduleData.description,
            position: moduleData.position,
          },
        });

        for (const lessonData of moduleData.lessons) {
          await prisma.courseLesson.create({
            data: {
              moduleId: courseModule.id,
              title: lessonData.title.substring(0, 100),
              description: lessonData.description || undefined,
              content: {
                text: lessonData.content,
                ...(lessonData.resources?.length ? { resources: lessonData.resources } : {}),
                ...(lessonData.knowledgeCheck?.length ? { knowledgeCheck: lessonData.knowledgeCheck } : {}),
              },
              position: lessonData.position,
            },
          });
        }

        // Create module quiz if present
        if (moduleData.quiz && moduleData.quiz.questions.length > 0) {
          const moduleQuizCardImageUrl = resolveQuizCardImage({
            title: moduleData.quiz.title,
            description: moduleData.description,
          });
          const moduleQuiz = await prisma.quiz.create({
            data: {
              courseId: course.id,
              moduleId: courseModule.id,
              title: moduleData.quiz.title,
              passingScore: moduleData.quiz.passingScore,
              isRequired: true,
              status: QuizStatus.PUBLISHED,
              cardImageUrl: moduleQuizCardImageUrl ?? undefined,
            },
          });
          for (let qi = 0; qi < moduleData.quiz.questions.length; qi++) {
            const q = moduleData.quiz.questions[qi];
            await prisma.quizQuestion.create({
              data: {
                quizId: moduleQuiz.id,
                position: qi,
                questionText: q.questionText,
                questionType: q.questionType === "TRUE_FALSE" ? QuestionType.TRUE_FALSE : QuestionType.MULTIPLE_CHOICE,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || undefined,
              },
            });
          }
          console.log(`  ✓ Module quiz: ${moduleData.quiz.title} (${moduleData.quiz.questions.length} questions)`);
        }
      }

      console.log(`✓ Created course: ${course.title} (${courseData.modules.length} modules)`);
    }

    // Create prerequisite links (Course B requires Course A)
    for (const courseData of coursesData) {
      const marketing = courseMarketing[courseData.slug];
      const requiredSlugs = marketing?.requiredCourseSlugs ?? [];
      const courseId = courseMap[courseData.slug];
      if (!courseId) continue;
      for (let order = 0; order < requiredSlugs.length; order++) {
        const requiredId = courseMap[requiredSlugs[order]];
        if (requiredId && requiredId !== courseId) {
          await prisma.coursePrerequisite.create({
            data: {
              courseId,
              requiredCourseId: requiredId,
              order,
            },
          });
        }
      }
    }
    console.log("✓ Course prerequisites linked");
  } else {
    console.log("⚠️  No courses data found, creating placeholder courses...");
    // Fallback to original seed data
    const courses = await Promise.all([
      prisma.course.create({
        data: {
          title: "Fundamentals of Trichology",
          slug: "fundamentals-of-trichology",
          subtitle: "The essential guide to hair and scalp science",
          description:
            "A comprehensive introduction to the biology of hair, common scalp conditions, and diagnostic techniques.",
          level: CourseLevel.BEGINNER,
          status: CourseStatus.PUBLISHED,
          durationMinutes: 480,
          pricing: {
            create: {
              amount: 499,
              currency: "GBP",
              isPrimary: true,
            },
          },
          modules: {
            create: [
              {
                title: "Module 1: Hair Biology",
                position: 0,
                lessons: {
                  create: [
                    { title: "Structure of the Hair Shaft", position: 0 },
                    { title: "The Hair Growth Cycle", position: 1 },
                  ],
                },
              },
              {
                title: "Module 2: Common Conditions",
                position: 1,
                lessons: {
                  create: [
                    { title: "Dandruff vs. Dry Scalp", position: 0 },
                    { title: "Types of Alopecia", position: 1 },
                  ],
                },
              },
            ],
          },
        },
      }),
    ]);
    courseMap["fundamentals-of-trichology"] = courses[0].id;
  }

  // --- CONDITION REFERENCE SEEDING ---
  console.log("\nCreating Condition References...");

  const conditionsData = loadJsonFile<StructuredCondition[]>("conditions.json");

  if (conditionsData && conditionsData.length > 0) {
    // Remove legacy slugs that were renamed
    const legacySlugs = ["frontal-fibrosing-alopecia-uick-six", "sebhorric-dermatits"];
    await prisma.conditionReference.deleteMany({
      where: { slug: { in: legacySlugs } },
    });

    for (const conditionData of conditionsData) {
      await prisma.conditionReference.upsert({
        where: { slug: conditionData.slug },
        update: {
          name: conditionData.name,
          category: conditionData.category,
          description: conditionData.description,
          whatIsIt: conditionData.whatIsIt || null,
          symptoms: conditionData.symptoms.length > 0 ? conditionData.symptoms : undefined,
          causes: conditionData.causedBy.length > 0 ? conditionData.causedBy : undefined,
          treatments: conditionData.treatments.length > 0 ? conditionData.treatments : undefined,
          keyFacts: conditionData.keyFacts.length > 0 ? conditionData.keyFacts : undefined,
          status: ConditionStatus.PUBLISHED,
        },
        create: {
          slug: conditionData.slug,
          name: conditionData.name,
          category: conditionData.category,
          description: conditionData.description,
          whatIsIt: conditionData.whatIsIt || null,
          symptoms: conditionData.symptoms.length > 0 ? conditionData.symptoms : undefined,
          causes: conditionData.causedBy.length > 0 ? conditionData.causedBy : undefined,
          treatments: conditionData.treatments.length > 0 ? conditionData.treatments : undefined,
          keyFacts: conditionData.keyFacts.length > 0 ? conditionData.keyFacts : undefined,
          status: ConditionStatus.PUBLISHED,
        },
      });
      console.log(`✓ Upserted condition: ${conditionData.name}`);
    }
  } else {
    console.log("⚠️  No conditions data found");
  }

  // --- QUIZ SEEDING ---
  console.log("\nCreating Quizzes...");

  const examsData = loadJsonFile<StructuredExam[]>("exams.json");

  if (examsData && examsData.length > 0) {
    for (const examData of examsData) {
      const courseId = courseMap[examData.courseSlug];
      if (!courseId) {
        console.log(`⚠️  Course not found for quiz: ${examData.courseSlug}`);
        continue;
      }

      if (examData.questions.length === 0) {
        console.log(`⚠️  No questions for: ${examData.title}`);
        continue;
      }

      const quiz = await prisma.quiz.create({
        data: {
          courseId,
          title: examData.title,
          description: examData.description,
          passingScore: examData.passingScore,
          status: QuizStatus.PUBLISHED,
          cardImageUrl:
            resolveQuizCardImage({
              title: examData.title,
              description: examData.description,
            }) ?? undefined,
        },
      });

      for (let i = 0; i < examData.questions.length; i++) {
        const q = examData.questions[i];
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            position: i,
            questionText: q.questionText,
            questionType:
              q.questionType === "TRUE_FALSE"
                ? QuestionType.TRUE_FALSE
                : q.questionType === "SHORT_ANSWER"
                ? QuestionType.SHORT_ANSWER
                : QuestionType.MULTIPLE_CHOICE,
            options: q.options.length > 0 ? q.options : undefined,
            correctAnswer: q.correctAnswer || (q.options.length > 0 ? 2 : ""), // Default to option C
            explanation: q.explanation || undefined,
          },
        });
      }

      console.log(`✓ Created quiz: ${quiz.title} (${examData.questions.length} questions)`);
    }
  } else {
    console.log("⚠️  No exams data found");
  }

  // --- STANDALONE QUIZZES (ACADEMY LEAD MAGNET) ---
  console.log("\nCreating standalone Academy quizzes...");

  const quizContainerCourse = await prisma.course.create({
    data: {
      slug: "academy-quizzes",
      title: "Academy Quizzes",
      subtitle: "Quick knowledge checks to keep you sharp",
      description:
        "A library of standalone trichology quizzes. These are free for logged-in learners and designed to reinforce clinical fundamentals.",
      level: CourseLevel.GENERAL,
      enrollmentType: EnrollmentType.ON_DEMAND,
      status: CourseStatus.PUBLISHED,
      category: "Quizzes",
      durationMinutes: 0,
      learningOutcomes: [
        "Spot common patterns in hair loss presentations",
        "Understand key scalp conditions and first-line approaches",
        "Improve consultation structure and clinical reasoning",
      ],
      requirements: ["A curious mind", "Willingness to learn and apply"],
      targetAudience: ["Hair professionals", "Trichology learners", "Clinicians in scalp health"],
      faqs: [
        {
          question: "Are these quizzes paid?",
          answer:
            "No — these standalone quizzes are free for logged-in learners and are designed as practice and revision.",
        },
        {
          question: "Do quizzes replace the video courses?",
          answer:
            "No — video courses are deeper learning programs. Quizzes are quick knowledge checks to reinforce key concepts.",
        },
      ] as any,
    },
  });

  const createQuizWithQuestions = async (input: {
    title: string;
    description: string;
    isPublic?: boolean;
    slug?: string;
    resultsCopy?: any;
    recommendedCourseId?: string | null;
    cardImageUrl?: string | null;
    questions: Array<{
      questionText: string;
      questionType: QuestionType;
      options?: string[];
      correctAnswer: string | number;
      explanation?: string;
      points?: number;
    }>;
  }) => {
    const resolvedCardImageUrl =
      input.cardImageUrl ??
      resolveQuizCardImage({
        slug: input.slug,
        title: input.title,
        description: input.description,
      });
    const quiz = await prisma.quiz.create({
      data: {
        courseId: quizContainerCourse.id,
        title: input.title,
        description: input.description,
        passingScore: 70,
        status: QuizStatus.PUBLISHED,
        isPublic: input.isPublic ?? false,
        slug: input.slug ?? undefined,
        resultsCopy: input.resultsCopy ?? undefined,
        recommendedCourseId: input.recommendedCourseId ?? undefined,
        cardImageUrl: resolvedCardImageUrl ?? undefined,
      },
    });

    for (let i = 0; i < input.questions.length; i += 1) {
      const q = input.questions[i];
      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          position: i,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options && q.options.length ? q.options : undefined,
          correctAnswer: q.correctAnswer as any,
          explanation: q.explanation ?? undefined,
          points: q.points ?? 1,
        },
      });
    }
    return quiz;
  };

  const tf = (questionText: string, correct: 0 | 1, explanation?: string) => ({
    questionText,
    questionType: QuestionType.TRUE_FALSE,
    options: ["True", "False"],
    correctAnswer: correct,
    explanation,
    points: 1,
  });

  const mc = (
    questionText: string,
    options: string[],
    correctIndex: 0 | 1 | 2 | 3,
    explanation?: string,
    points = 1
  ) => ({
    questionText,
    questionType: QuestionType.MULTIPLE_CHOICE,
    options,
    correctAnswer: correctIndex,
    explanation,
    points,
  });

  const sa = (questionText: string, correctAnswer: string, explanation?: string) => ({
    questionText,
    questionType: QuestionType.SHORT_ANSWER,
    options: [],
    correctAnswer,
    explanation,
    points: 1,
  });

  // Try to recommend a real course if one exists
  const recommendedCourse =
    (await prisma.course.findFirst({
      where: { status: "PUBLISHED", slug: { not: "academy-quizzes" } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    })) ?? null;

  // Featured public quiz (gated results)
  await createQuizWithQuestions({
    title: "Trichology Knowledge Check",
    description:
      "A quick assessment to benchmark your trichology knowledge and highlight the next best steps for your learning.",
    isPublic: true,
    slug: "trichology-knowledge-check",
    cardImageUrl: quizCardImages.knowledgeCheck,
    recommendedCourseId: recommendedCourse?.id ?? null,
    resultsCopy: {
      low: {
        headline: "You’ve got a solid starting point — let’s build foundations.",
        body:
          "Your results suggest you’re early in your trichology journey. The fastest path forward is nailing the hair growth cycle, core scalp conditions, and a structured consultation workflow.",
      },
      medium: {
        headline: "Strong core knowledge — you’re ready to sharpen clinical reasoning.",
        body:
          "You’ve got good fundamentals. The next upgrade is tightening differential diagnosis, triggers, and evidence-based care planning to improve outcomes and confidence.",
      },
      high: {
        headline: "Excellent — you’re thinking like a clinician.",
        body:
          "Your score suggests strong understanding of trichology fundamentals. The next level is consistency: documentation, referral thresholds, and refining protocols for complex cases.",
      },
    },
    questions: [
      mc(
        "Which phase of the hair cycle involves active growth?",
        ["Telogen", "Catagen", "Anagen", "Exogen"],
        2,
        "Anagen is the active growth phase; catagen is transition; telogen is resting; exogen is shedding."
      ),
      mc(
        "A widened midline part with preserved frontal hairline in a woman most strongly suggests:",
        ["Alopecia areata", "Female pattern hair loss", "Trichotillomania", "Tinea capitis"],
        1
      ),
      mc(
        "Which is a common trigger window for telogen effluvium after a stressor?",
        ["1–7 days", "2–3 months", "9–12 months", "Immediately during the event"],
        1
      ),
      mc(
        "A scalp that is greasy with adherent scale and itch is most consistent with:",
        ["Seborrhoeic dermatitis", "Vitiligo", "Androgenetic alopecia", "Lichen planopilaris"],
        0
      ),
      tf(
        "Traction alopecia is always irreversible.",
        1,
        "Early traction alopecia can be reversible; chronic traction may lead to permanent scarring."
      ),
      mc(
        "Which pattern is most typical of alopecia areata?",
        ["Diffuse thinning", "Patchy, well-demarcated hair loss", "Frontal band recession only", "Vertex-only thinning"],
        1
      ),
      mc(
        "When a client reports shedding, the MOST useful first step is to:",
        ["Prescribe supplements immediately", "Take a structured history and timeline", "Advise daily washing only", "Recommend scalp microneedling"],
        1
      ),
      tf(
        "Ferritin is sometimes assessed in hair loss workups because iron status can affect hair cycling.",
        0
      ),
      mc(
        "A key red flag that warrants medical referral is:",
        ["Mild dandruff", "Sudden patchy loss with scalp pain/inflammation", "Slow hair growth", "Dry ends"],
        1
      ),
      sa("Name the transition phase between anagen and telogen.", "catagen"),
      mc(
        "Which statement best describes scarring alopecia?",
        ["Follicles remain intact and regrow fully", "Follicles are destroyed and may not regrow", "It only affects eyebrows", "It is always caused by shampoo"],
        1
      ),
      mc(
        "Which is the best general principle for scalp care plans?",
        ["One product fits all", "Treat the scalp condition + address triggers + review progress", "Never reassess", "Only use oils for inflammation"],
        1
      ),
    ],
  });

  // 8 standalone quizzes — ALL public with lead-gate
  await createQuizWithQuestions({
    title: "Hair Growth Cycle & Anatomy Essentials",
    description: "Core fundamentals: structure, cycle phases, and what shedding really means.",
    isPublic: true,
    slug: "hair-growth-anatomy",
    cardImageUrl: quizCardImages.hairAnatomy,
    recommendedCourseId: recommendedCourse?.id ?? null,
    resultsCopy: {
      low: {
        headline: "Time to revisit the basics — that's a great place to start.",
        body: "The hair cycle is the foundation of everything in trichology. Understanding anagen, catagen, telogen, and exogen will unlock how you think about shedding, regrowth, and diagnosis.",
      },
      medium: {
        headline: "Good grounding — a few gaps to tighten up.",
        body: "You know the core phases and structures. Sharpen your understanding of follicle biology and normal shedding ranges to feel more confident in clinical discussions.",
      },
      high: {
        headline: "Rock solid — you know your hair biology.",
        body: "Excellent recall of cycle phases, anatomy, and normal shedding. You're well placed to build on this with diagnostic and clinical reasoning skills.",
      },
    },
    questions: [
      mc("The resting phase of the hair cycle is:", ["Anagen", "Catagen", "Telogen", "Exogen"], 2),
      mc("Exogen refers to:", ["Growth", "Shedding", "Transition", "Pigmentation"], 1),
      mc("Hair shaft is primarily composed of:", ["Keratin", "Collagen", "Elastin", "Melanin only"], 0),
      tf("Catagen is typically the longest hair cycle phase.", 1),
      mc("The part of hair visible above the scalp is:", ["Bulb", "Papilla", "Shaft", "Follicle"], 2),
      mc(
        "A normal daily shed range is often cited as roughly:",
        ["0–5 hairs", "20–40 hairs", "50–100 hairs", "300–500 hairs"],
        2
      ),
      mc("The dermal papilla is important because it:", ["Stores pigment only", "Supplies growth signals and nutrients", "Creates dandruff", "Causes greying"], 1),
      tf("Anagen duration helps explain why scalp hair can grow long.", 0),
      sa("What is the medical term for hair loss?", "alopecia"),
      mc("The hair follicle is primarily located in the:", ["Epidermis only", "Dermis (and sometimes subcutis)", "Nail plate", "Stratum corneum only"], 1),
    ],
  });

  await createQuizWithQuestions({
    title: "Female Pattern Hair Loss (FPHL) Quick Check",
    description: "Pattern recognition, common contributors, and supportive management principles.",
    isPublic: true,
    slug: "female-pattern-hair-loss",
    cardImageUrl: quizCardImages.femalePattern,
    recommendedCourseId: recommendedCourse?.id ?? null,
    resultsCopy: {
      low: {
        headline: "FPHL has specific patterns — let's make sure you can spot them.",
        body: "Female pattern hair loss is one of the most common presentations you'll see. Understanding the gradual thinning pattern, hormonal co-factors, and realistic timelines is essential.",
      },
      medium: {
        headline: "You're recognising FPHL — now refine your consultation approach.",
        body: "You can identify the pattern. The next step is strengthening your history-taking around hormonal changes, family history, and setting realistic expectations with clients.",
      },
      high: {
        headline: "Strong FPHL knowledge — you're ready for complex cases.",
        body: "You understand the pattern, contributors, and management principles. Focus on nuanced presentations where FPHL overlaps with other conditions.",
      },
    },
    questions: [
      mc("Typical FPHL pattern often includes:", ["Widened parting", "Patchy bald spots", "Scalp pustules", "Single scar"], 0),
      mc("FPHL is also known as:", ["Trichotillomania", "Androgenetic alopecia", "Tinea capitis", "Psoriasis"], 1),
      tf("FPHL can present with miniaturisation of hair follicles.", 0),
      mc("A helpful supportive step is:", ["Ignore triggers", "Address iron/thyroid where appropriate", "Use harsh detergents daily", "Stop all protein"], 1),
      mc("Which is most consistent with FPHL vs TE?", ["Sudden diffuse shedding", "Gradual thinning over time", "Acute scalp pain", "Fever"], 1),
      mc("A key consultation component is:", ["Timeline + family history", "Only shampoo preference", "Only hair colour history", "Ignore menopause status"], 0),
      tf("FPHL always results in complete baldness.", 1),
      mc("A common co-factor to consider is:", ["Hydration only", "Hormonal changes", "Tight hats only", "Swimming"], 1),
      sa("What’s the term for reduced shaft diameter over time in patterned loss?", "miniaturisation"),
      mc("First-line education should include:", ["Realistic timelines + consistency", "Overnight cure claims", "No follow-up needed", "Avoid scalp examination"], 0),
    ],
  });

  await createQuizWithQuestions({
    title: "Telogen Effluvium (TE) & Trigger Mapping",
    description: "Identify typical triggers, timeline, and reassurance principles.",
    isPublic: true,
    slug: "telogen-effluvium",
    cardImageUrl: quizCardImages.telogen,
    recommendedCourseId: recommendedCourse?.id ?? null,
    resultsCopy: {
      low: {
        headline: "TE is one of the most common causes of shedding — worth mastering.",
        body: "Understanding the 2-3 month trigger window and how to take a proper timeline history is the single most valuable skill for managing worried clients.",
      },
      medium: {
        headline: "Good awareness — now focus on trigger timelines and red flags.",
        body: "You understand the basics of TE. Work on mapping triggers to timelines more precisely, and knowing when shedding might not be simple TE.",
      },
      high: {
        headline: "Excellent TE knowledge — you can reassure clients with confidence.",
        body: "You understand triggers, timelines, and reassurance principles. You're well equipped to manage the most common shedding presentations.",
      },
    },
    questions: [
      mc("A classic TE trigger window is:", ["1–7 days", "2–3 months", "2 years", "Immediately"], 1),
      tf("TE commonly presents with diffuse shedding.", 0),
      mc("Common triggers include:", ["Major illness", "Surgery", "Rapid weight loss", "All of the above"], 3),
      mc("A key reassurance point is:", ["Hair never regrows", "TE is often self-limited once triggers resolve", "Always scarring", "Always infectious"], 1),
      tf("Checking medications and life events is part of TE assessment.", 0),
      mc("A pull test may be:", ["Always diagnostic", "One data point, interpreted in context", "Useless", "Only for children"], 1),
      mc("A red flag suggesting NOT simple TE is:", ["Scalp pain and inflammation", "Diffuse shedding after stress", "Increased shedding after birth", "Mild seasonal shed"], 0),
      mc("For TE, the MOST important first step is:", ["Topical steroids for all", "Trigger timeline and history", "Immediate microneedling", "Avoid all washing"], 1),
      tf("TE can overlap with patterned hair loss.", 0),
      sa("Name one common postpartum hair shedding type.", "telogen effluvium"),
    ],
  });

  await createQuizWithQuestions({
    title: "Scalp Dermatitis & Inflammation Basics",
    description: "Scale, itch, and inflammation: differentiate common presentations.",
    isPublic: true,
    slug: "scalp-dermatitis-inflammation",
    cardImageUrl: quizCardImages.scalpInflammation,
    recommendedCourseId: recommendedCourse?.id ?? null,
    resultsCopy: {
      low: {
        headline: "Scalp inflammation is everywhere — let's build your recognition skills.",
        body: "Differentiating between seborrhoeic dermatitis, psoriasis, and contact dermatitis is essential. Start with the visual and symptomatic differences.",
      },
      medium: {
        headline: "You can spot inflammation — now sharpen your differential diagnosis.",
        body: "Good awareness of scalp conditions. Focus on distinguishing overlapping presentations and knowing when to refer vs. when to manage conservatively.",
      },
      high: {
        headline: "Strong scalp condition knowledge — ready for clinical application.",
        body: "You can differentiate common inflammatory conditions confidently. Focus on treatment protocols and monitoring progress over time.",
      },
    },
    questions: [
      mc("Greasy scale + itch commonly suggests:", ["Seborrhoeic dermatitis", "Vitiligo", "FPHL", "Traction alopecia"], 0),
      mc("Psoriasis scale is often:", ["Thick and silvery", "Always oily only", "Never itchy", "Only on eyebrows"], 0),
      tf("Inflammation can contribute to increased shedding.", 0),
      mc("A sensible first step is:", ["Assess triggers + scalp exam", "Ignore symptoms", "Only supplements", "Hot oils only"], 0),
      mc("Contact dermatitis is often linked to:", ["Hair dye/fragrance", "Sun exposure only", "Genetics only", "Hair length"], 0),
      tf("Scalp pain/burning can be a red flag that needs referral depending on context.", 0),
      mc("Which is NOT a typical sign of inflammation?", ["Erythema", "Scaling", "Pustules", "Perfectly normal scalp"], 3),
      mc("A key education point is:", ["Over-washing always causes dandruff", "Consistency + appropriate actives matter", "Never reassess", "Only use one shampoo forever"], 1),
      sa("What is the common clinical term for dandruff?", "seborrhoeic dermatitis"),
      mc("If treatment fails, next step is often:", ["Stop caring", "Reassess diagnosis and refer if needed", "Use stronger perfume", "Avoid examination"], 1),
    ],
  });

  await createQuizWithQuestions({
    title: "Traction Alopecia & Hair Practices",
    description: "Patterns, early warning signs, and prevention principles.",
    isPublic: true,
    slug: "traction-alopecia",
    cardImageUrl: quizCardImages.traction,
    recommendedCourseId: recommendedCourse?.id ?? null,
    resultsCopy: {
      low: {
        headline: "Traction alopecia is preventable — learn to spot it early.",
        body: "Understanding which styles cause tension, recognising early signs like perifollicular inflammation, and knowing when damage becomes permanent are critical skills.",
      },
      medium: {
        headline: "Good awareness — tighten up on prevention and referral thresholds.",
        body: "You understand the basics of traction damage. Focus on early warning signs and how to have supportive conversations with clients about protective styling.",
      },
      high: {
        headline: "Excellent — you understand traction, prevention, and reversal windows.",
        body: "You can identify traction patterns, advise on prevention, and know when scarring may have occurred. Strong foundation for client education.",
      },
    },
    questions: [
      mc("Traction alopecia is most associated with:", ["Tight styling", "Fungal infection", "Autoimmune attack", "Chemotherapy"], 0),
      tf("Early traction alopecia can be reversible.", 0),
      mc("A common early sign is:", ["Complete bald patch overnight", "Perifollicular inflammation at hairline + thinning", "Perfectly normal scalp", "Only grey hair"], 1),
      mc("Best preventative advice includes:", ["Looser styles + breaks", "More tension", "Ignore pain", "Daily bleaching"], 0),
      mc("The “fringe sign” can be seen in:", ["FPHL", "Traction alopecia", "TE only", "Tinea capitis only"], 1),
      tf("Scarring traction alopecia may lead to permanent loss.", 0),
      mc("A key consultation question is:", ["Favourite colour", "Hairstyle history", "Pet type", "Shoe size"], 1),
      mc("Which is higher risk?", ["Loose bun", "Tight braids/ponytails", "Air drying", "Wide-tooth comb"], 1),
      sa("Name one protective strategy for traction risk.", "reduce tension"),
      mc("When referral is needed, it’s often due to:", ["Persistent inflammation/scarring signs", "Short hair length", "Dry ends", "Mild itch only"], 0),
    ],
  });

  await createQuizWithQuestions({
    title: "Consultation Workflow & Trichoscopy Thinking",
    description: "Structure your consult, capture the timeline, and interpret what you see.",
    isPublic: true,
    slug: "consultation-workflow",
    cardImageUrl: quizCardImages.consultation,
    recommendedCourseId: recommendedCourse?.id ?? null,
    resultsCopy: {
      low: {
        headline: "A structured consultation is your most powerful clinical tool.",
        body: "Building a clear workflow — history, examination, plan, follow-up — transforms your confidence and outcomes. Start here.",
      },
      medium: {
        headline: "Good consulting instincts — now make your workflow repeatable.",
        body: "You understand the key elements. Focus on consistent documentation, trichoscopy interpretation, and knowing your referral thresholds.",
      },
      high: {
        headline: "Excellent clinical thinking — your consultations are well structured.",
        body: "You approach consultations systematically. The next level is refining trichoscopy skills and managing complex, multi-factor presentations.",
      },
    },
    questions: [
      mc("The most valuable early data is:", ["Timeline + pattern + triggers", "Only shampoo brand", "Only styling tools", "Only photos"], 0),
      tf("A clear timeline helps differentiate TE from patterned loss.", 0),
      mc("A consult should typically include:", ["History, exam, plan, follow-up", "Plan only", "Exam only", "Ignore consent"], 0),
      mc("Trichoscopy can help identify:", ["Miniaturisation", "Inflammation", "Broken hairs", "All of the above"], 3),
      mc("When documenting, it’s best to:", ["Be vague", "Use consistent photos and notes", "Avoid follow-ups", "Skip consent"], 1),
      tf("Referral thresholds should be discussed when red flags appear.", 0),
      mc("A scalp exam should consider:", ["Scale", "Erythema", "Follicular openings", "All of the above"], 3),
      mc("In suspected scarring alopecia, you should:", ["Delay for months", "Consider urgent medical referral", "Only change shampoo", "Ignore pain"], 1),
      sa("Name one core consultation element besides history.", "scalp examination"),
      mc("Follow-up is important because:", ["Hair changes are slow", "Results are instant", "Plans never change", "No need to reassess"], 0),
    ],
  });

  await createQuizWithQuestions({
    title: "Nutrition & Deficiencies for Hair Health",
    description: "Key nutrients, red flags, and how to discuss tests appropriately.",
    isPublic: true,
    slug: "nutrition-hair-health",
    cardImageUrl: quizCardImages.nutrition,
    recommendedCourseId: recommendedCourse?.id ?? null,
    resultsCopy: {
      low: {
        headline: "Nutrition is a key piece of the hair puzzle — let's build your confidence.",
        body: "Knowing which nutrients matter (iron, vitamin D, B12, protein) and how to discuss testing appropriately will make your consultations more thorough.",
      },
      medium: {
        headline: "Solid nutritional awareness — refine how you discuss it with clients.",
        body: "You understand the core nutrients. Focus on framing dietary conversations within your scope and knowing when to encourage GP involvement.",
      },
      high: {
        headline: "Strong nutritional knowledge — you can integrate this into consultations.",
        body: "You understand the role of nutrition in hair health and can discuss it appropriately. Focus on personalised approaches based on client history.",
      },
    },
    questions: [
      mc("Ferritin is related to:", ["Iron stores", "Vitamin C", "Hydration", "Hair dye"], 0),
      tf("Sudden weight loss can be a trigger for TE.", 0),
      mc("A nutrient often discussed in hair is:", ["Iron", "Vitamin D", "B12", "All of the above"], 3),
      mc("In consults, it’s best to:", ["Make medical claims", "Encourage appropriate testing with a clinician", "Ignore diet", "Recommend extreme diets"], 1),
      tf("Protein is important for keratin production.", 0),
      mc("A red flag dietary pattern might be:", ["Balanced meals", "Highly restrictive intake", "Adequate protein", "Regular meals"], 1),
      mc("When discussing supplements, you should:", ["Promise regrowth", "Set realistic expectations", "Avoid follow-up", "Never check interactions"], 1),
      mc("Which is a sensible first step?", ["Basic diet history + referral if needed", "High-dose supplements for all", "No questions", "Stop washing hair"], 0),
      sa("Name one vitamin commonly checked in hair loss workups.", "vitamin d"),
      mc("A common principle is:", ["One-size-fits-all", "Personalise based on history and risks", "Ignore symptoms", "No reassessment"], 1),
    ],
  });

  await createQuizWithQuestions({
    title: "Product & Ingredient Literacy (Scalp Care Plans)",
    description: "Make evidence-based recommendations and avoid common pitfalls.",
    isPublic: true,
    slug: "product-ingredient-literacy",
    cardImageUrl: quizCardImages.productCare,
    recommendedCourseId: recommendedCourse?.id ?? null,
    resultsCopy: {
      low: {
        headline: "Knowing ingredients means better recommendations — let's sharpen this.",
        body: "Understanding actives like ketoconazole, salicylic acid, and niacinamide — and when to use or avoid them — is what separates confident practitioners from guesswork.",
      },
      medium: {
        headline: "Good product knowledge — now connect it to scalp conditions.",
        body: "You recognise key ingredients. Focus on matching actives to specific conditions and building review-based care plans rather than one-off recommendations.",
      },
      high: {
        headline: "Excellent — you can build evidence-based scalp care plans.",
        body: "Strong ingredient literacy and care planning instincts. You're ready to manage complex scalps with confidence and track progress systematically.",
      },
    },
    questions: [
      mc("An anti-dandruff active commonly used is:", ["Ketoconazole", "Fragrance", "Silicone only", "Alcohol only"], 0),
      tf("Fragrance can be a trigger for contact dermatitis in sensitive individuals.", 0),
      mc("A good care plan should be:", ["Random", "Condition-targeted + reviewed", "Never adjusted", "Only oils"], 1),
      mc("If irritation occurs, you should:", ["Increase frequency", "Stop and reassess triggers", "Ignore it", "Add more products"], 1),
      mc("For scalp inflammation, you might consider:", ["Gentle cleansing + appropriate anti-inflammatory strategy", "Bleach", "Harsh scrubs daily", "No cleansing"], 0),
      tf("Over-treating the scalp can worsen barrier irritation.", 0),
      mc("A good recommendation statement is:", ["This will cure you", "This may help; we’ll review response", "No need to review", "Everyone needs the same"], 1),
      mc("Which is a safe principle?", ["Patch test when appropriate", "Always skip patch testing", "Never check allergens", "Always add fragrance"], 0),
      sa("Name one common scalp symptom you track during review.", "itch"),
      mc("A follow-up timeframe is often:", ["2–4 weeks", "Same day", "Never", "5 years"], 0),
    ],
  });

  console.log("✓ Created Academy quizzes container course + 9 quizzes (8 standalone + 1 featured)");

  const quizzesMissingCard = await prisma.quiz.findMany({
    where: {
      status: QuizStatus.PUBLISHED,
      cardImageUrl: null,
      heroMediaId: null,
    },
    select: { id: true, title: true, slug: true, description: true },
    orderBy: { createdAt: "asc" },
  });
  for (let i = 0; i < quizzesMissingCard.length; i++) {
    const quiz = quizzesMissingCard[i]!;
    const resolvedCardImageUrl =
      resolveQuizCardImage({
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description,
      }) ?? QUIZ_CARD_IMAGE_POOL[i % QUIZ_CARD_IMAGE_POOL.length];
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { cardImageUrl: resolvedCardImageUrl },
    });
  }
  if (quizzesMissingCard.length > 0) {
    console.log(
      `✓ Assigned default card images to ${quizzesMissingCard.length} quiz(es) still missing artwork`,
    );
  }

  // --- VIDEO PRODUCT SEEDING ---
  console.log("\nCreating Video Products...");

  const videoProducts = [
    {
      slug: "menopause-hair-loss",
      title: "Menopause & Hair Loss: What's Normal and What Helps",
      subtitle: "Clinical framework for assessing and advising clients on hormonal hair changes",
      description:
        "A clinical training module for practitioners working with clients experiencing hair thinning, shedding, or texture changes during perimenopause or menopause. Lorraine explains the pathophysiology, evidence-based interventions, and when to refer for further support.",
      category: "Hormonal Health",
      durationMinutes: 30,
      status: CourseStatus.PUBLISHED,
      videoSourceType: VideoSourceType.LINK,
      publicContent: {
        headline: "Menopausal hair changes — the clinical picture, assessment, and client guidance",
        intro:
          "Hormonal shifts during menopause are one of the most common presentations you'll see in practice. This module gives you the clinical framework to assess, explain, and advise your clients with confidence.",
        whoItsFor: [
          "Practitioners working with clients experiencing menopausal hair thinning or shedding",
          "Trichologists and stylists wanting a structured clinical framework for hormonal hair changes",
          "Professionals seeking evidence-based guidance to share with concerned clients",
        ],
        learningOutcomes: [
          "Why hormonal changes affect hair growth and scalp health",
          "The difference between menopausal shedding and pattern hair loss",
          "Common scalp changes during menopause",
          "What genuinely supports hair and scalp health",
          "Realistic timelines for improvement",
        ],
        whatItsNot: [
          "A medical diagnosis",
          "A promise of instant regrowth",
          "A replacement for medical care if symptoms are severe or persistent",
        ],
        benefits: [
          "Confidently assess menopausal hair presentations",
          "Explain the clinical picture to clients in clear, reassuring language",
          "Recommend evidence-based approaches and set realistic expectations",
          "Know when to refer for further medical investigation",
        ],
        faqs: [
          {
            question: "Is this suitable for stylists without a trichology background?",
            answer:
              "Yes. Lorraine explains the clinical concepts clearly, building from fundamentals so any hair professional can follow and apply the knowledge.",
          },
          {
            question: "Will this cover specific product recommendations?",
            answer:
              "The module covers evidence-based approaches and active ingredients. You'll be able to make informed recommendations relevant to your practice and product range.",
          },
        ],
      },
    },
    {
      slug: "postpartum-hair-loss",
      title: "Postpartum Hair Loss: Why You're Shedding and When It Stops",
      subtitle: "Clinical training on postpartum shedding patterns and recovery timelines",
      description:
        "A clinical training module for practitioners advising new mothers experiencing hair shedding after pregnancy. Lorraine explains the underlying physiology, typical recovery timelines, and when to recommend further investigation.",
      category: "Hormonal Health",
      durationMinutes: 25,
      status: CourseStatus.PUBLISHED,
      videoSourceType: VideoSourceType.LINK,
      publicContent: {
        headline: "Postpartum shedding — clinical assessment, recovery timelines, and when to investigate further",
        intro:
          "Postpartum hair loss is one of the most common concerns clients bring to practitioners. This module equips you with the clinical knowledge to assess, reassure, and advise with authority.",
        whoItsFor: [
          "Practitioners advising clients experiencing postpartum hair shedding",
          "Trichologists wanting structured assessment and recovery frameworks",
          "Hair professionals who want to confidently support new mothers",
        ],
        learningOutcomes: [
          "Why postpartum hair loss happens",
          "When shedding typically starts and stops",
          "Common postpartum shedding patterns",
          "Factors that affect recovery",
          "When postpartum hair loss may need further investigation",
        ],
        whatItsNot: [
          "A medical diagnosis",
          "A guarantee of immediate regrowth",
          "A substitute for medical advice if hair loss is prolonged or worsening",
        ],
        benefits: [
          "Explain the mechanism clearly and reassure anxious clients",
          "Distinguish normal shedding from cases requiring referral",
          "Provide evidence-based aftercare guidance",
          "Build trust as the go-to professional for postpartum hair concerns",
        ],
        faqs: [
          {
            question: "Is this relevant for stylists as well as trichologists?",
            answer:
              "Absolutely. Any hair professional who sees new mothers in their chair will benefit from understanding this presentation and knowing how to advise confidently.",
          },
          {
            question: "Does the module cover when to refer?",
            answer:
              "Yes. Clear referral criteria are included so you know when postpartum shedding may need medical investigation.",
          },
        ],
      },
    },
    {
      slug: "stress-hair-loss",
      title: "Stress & Hair Loss: Understanding Shedding, Inflammation & Recovery",
      subtitle: "Clinical framework for assessing stress-related shedding and advising recovery",
      description:
        "A clinical training module for practitioners supporting clients with increased hair shedding during or after stressful periods. Lorraine explains the stress–hair connection, common scalp presentations, and how to advise recovery without over-treating.",
      category: "Stress & Recovery",
      durationMinutes: 25,
      status: CourseStatus.PUBLISHED,
      videoSourceType: VideoSourceType.LINK,
      publicContent: {
        headline: "Stress-related hair loss — the cortisol pathway, clinical assessment, and recovery guidance",
        intro:
          "Telogen effluvium triggered by stress is a frequent presentation. This module covers the biological mechanism, how to assess and explain it to clients, and evidence-based recovery support.",
        whoItsFor: [
          "Practitioners assessing clients with increased shedding during or after stress",
          "Trichologists wanting a structured TE assessment framework",
          "Hair professionals advising clients on stress-related scalp and hair symptoms",
        ],
        learningOutcomes: [
          "How stress hormones affect the hair growth cycle",
          "Why hair loss often starts after stress ends",
          "Common stress-related scalp symptoms",
          "How to support recovery without over-treating",
          "Expected regrowth timelines",
        ],
        whatItsNot: [
          "A medical diagnosis",
          "A mental health treatment",
          "A quick-fix solution for hair loss",
        ],
        benefits: [
          "Explain the delayed stress–shedding connection to clients with clarity",
          "Assess scalp symptoms associated with stress presentation",
          "Guide recovery without over-treating or creating unrealistic expectations",
          "Know when TE assessment warrants medical referral",
        ],
        faqs: [
          {
            question: "Does the module cover chronic TE as well?",
            answer:
              "Yes. Both acute and chronic telogen effluvium are covered, including differential assessment and when the presentation may indicate a more complex underlying cause.",
          },
          {
            question: "Is this useful for practitioners who don't specialise in trichology?",
            answer:
              "Very much so. Any hair professional will benefit from understanding this common presentation and being able to have an informed, reassuring conversation with clients.",
          },
        ],
      },
    },
    {
      slug: "sensitive-scalps",
      title: "Sensitive Scalps: Redness, Itching & Inflammation Explained",
      subtitle: "Clinical framework to assess, explain, and advise clients with reactive scalps",
      description:
        "A clinical training module for practitioners working with clients presenting itchy, sore, red, or reactive scalps. Lorraine explains the pathophysiology of scalp sensitivity, common triggers to assess, and how to advise barrier protection and calming strategies.",
      category: "Scalp Health",
      durationMinutes: 30,
      status: CourseStatus.PUBLISHED,
      videoSourceType: VideoSourceType.LINK,
      publicContent: {
        headline: "Sensitive and reactive scalps — barrier function, triggers, and treatment protocols",
        intro:
          "Clients with sensitive scalps are increasingly common and often frustrating to manage. This module gives you the clinical framework to assess barrier function, identify triggers, and recommend effective treatment approaches.",
        whoItsFor: [
          "Practitioners working with clients who have reactive, inflamed, or sensitive scalps",
          "Trichologists wanting deeper knowledge of scalp barrier function and inflammation",
          "Stylists who regularly encounter product sensitivity or unexplained scalp irritation",
        ],
        learningOutcomes: [
          "Why scalp sensitivity and inflammation develop",
          "Common triggers that worsen symptoms",
          "How to recognise early signs of inflammation",
          "How to calm and protect the scalp barrier",
          "When referral to a medical professional is appropriate",
        ],
        whatItsNot: [
          "A medical diagnosis",
          "A treatment plan for clinical scalp disease",
        ],
        benefits: [
          "Assess scalp barrier function and identify inflammation patterns",
          "Create structured trigger-identification protocols for clients",
          "Recommend treatment approaches that calm without aggravating",
          "Confidently refer when the presentation suggests clinical scalp disease",
        ],
        faqs: [
          {
            question: "Does this cover specific scalp conditions like psoriasis or seborrheic dermatitis?",
            answer:
              "The module focuses on sensitivity and barrier dysfunction. It covers differential assessment so you can recognise when presentations may indicate specific conditions requiring medical referral.",
          },
          {
            question: "Is this suitable for someone new to scalp assessment?",
            answer:
              "Yes. Lorraine builds from fundamentals so you can follow the clinical reasoning even without prior trichology training.",
          },
        ],
      },
    },
  ];

  for (const video of videoProducts) {
    const created = await prisma.videoProduct.upsert({
      where: { slug: video.slug },
      update: {
        title: video.title,
        subtitle: video.subtitle,
        description: video.description,
        category: video.category,
        durationMinutes: video.durationMinutes,
        status: video.status,
        videoSourceType: video.videoSourceType,
        publicContent: video.publicContent,
      },
      create: {
        slug: video.slug,
        title: video.title,
        subtitle: video.subtitle,
        description: video.description,
        category: video.category,
        durationMinutes: video.durationMinutes,
        status: video.status,
        videoSourceType: video.videoSourceType,
        publicContent: video.publicContent,
      },
    });
    await prisma.videoProductPrice.create({
      data: {
        videoProductId: created.id,
        amount: 29,
        currency: "GBP",
        isPrimary: true,
      },
    });
    console.log(`✓ Upserted video product: ${created.title}`);
  }

  // --- SHOP PRODUCT SEEDING ---
  console.log("\nCreating Saco Supernature shop catalog...");

  const shopCategories = await Promise.all([
    prisma.shopCategory.create({
      data: { name: "Shampoo", slug: "shampoo", position: 0, status: "ACTIVE" },
    }),
    prisma.shopCategory.create({
      data: { name: "Conditioner", slug: "conditioner", position: 1, status: "ACTIVE" },
    }),
    prisma.shopCategory.create({
      data: { name: "Masks", slug: "masks", position: 2, status: "ACTIVE" },
    }),
    prisma.shopCategory.create({
      data: { name: "Treatment Styling", slug: "treatment-styling", position: 3, status: "ACTIVE" },
    }),
  ]);
  const categoryBySlug = new Map(shopCategories.map((category) => [category.slug, category.id]));

  const shopProducts = [
    {
      slug: "revitalize-shampoo",
      name: "Revitalize Shampoo",
      categorySlug: "shampoo",
      size: "250ml",
      price: 19,
      shortDescription: "Gently cleanses and revitalizes scalp and hair.",
      description:
        "This advanced Superfood formula gently cleanses and stimulates the scalp, leaving it feeling both refreshed and soothed.",
      perfectFor: "all hair types",
      keyIngredients: ["Amla Fruit Extract", "Wheatgrass Extract", "Horsetail Extract"],
    },
    {
      slug: "color-shampoo",
      name: "Color Shampoo",
      categorySlug: "shampoo",
      size: "250ml",
      price: 20,
      shortDescription: "Protects color depth and vibrancy.",
      description:
        "This unique blend of Quinoa seed extract, Sunflower seed oil and Amla fruit extract helps shield hair from color fade.",
      perfectFor: "bleached and coloured hair",
      keyIngredients: ["Amla Fruit Extract", "Hydrolysed Quinoa Protein", "Zinc Gloconate"],
    },
    {
      slug: "densifying-shampoo",
      name: "Densifying Shampoo",
      categorySlug: "shampoo",
      size: "250ml",
      price: 22,
      shortDescription: "Deep-cleansing support for fine and thinning hair.",
      description:
        "An advanced technology complex deeply cleanses both hair and scalp to promote growth and stronger-feeling hair.",
      perfectFor: "fine, limp and thinning hair",
      keyIngredients: ["Amla", "Biotin", "Saw Palmetto"],
    },
    {
      slug: "hydrating-shampoo",
      name: "Hydrating Shampoo",
      categorySlug: "shampoo",
      size: "250ml",
      price: 21,
      shortDescription: "Rich moisture for dry, course or brittle hair.",
      description:
        "Richly infused with Certified Organic Samoa and Babassu Oils for instant moisture and daily gentle cleansing.",
      perfectFor: "dry and course hair",
      keyIngredients: ["Hydrolysed Pea Protein", "Organic Samoa Oil", "Organic Babassu Oil"],
    },
    {
      slug: "revitalize-conditioner",
      name: "Revitalize Conditioner",
      categorySlug: "conditioner",
      size: "250ml",
      price: 19,
      shortDescription: "Refreshing partner to Revitalize Shampoo.",
      description:
        "Designed to further refresh the scalp using nourishing combinations of Amla Horsetail and Wheatgrass.",
      perfectFor: "all hair types",
      keyIngredients: ["Amla Fruit Extract", "Wheatgrass Extract", "Horsetail Extract"],
    },
    {
      slug: "color-conditioner",
      name: "Color Conditioner",
      categorySlug: "conditioner",
      size: "250ml",
      price: 20,
      shortDescription: "Nourishes while helping protect color vibrancy.",
      description:
        "Contains Amla fruit and Quinoa seed extracts combined with Sunflower seed oil to help preserve color depth.",
      perfectFor: "bleached and coloured hair",
      keyIngredients: ["Amla Fruit Extract", "Hydrolysed Quinoa Protein", "Zinc Gloconate"],
    },
    {
      slug: "densifying-conditioner",
      name: "Densifying Conditioner",
      categorySlug: "conditioner",
      size: "250ml",
      price: 22,
      shortDescription: "Light nourishment for fine and thinning hair.",
      description:
        "Superfood complex with Amla, Biotin and Saw Palmetto to densify hair while nourishing scalp and strands.",
      perfectFor: "fine, limp and thinning hair",
      keyIngredients: ["Amla", "Biotin", "Saw Palmetto"],
    },
    {
      slug: "hydrating-conditioner",
      name: "Hydrating Conditioner",
      categorySlug: "conditioner",
      size: "250ml",
      price: 21,
      shortDescription: "Moisture-rich conditioner for dry lengths.",
      description:
        "A superfood conditioner with Certified Organic Samoa and Babassu Oils for dry, course and brittle hair.",
      perfectFor: "dry, course and brittle hair",
      keyIngredients: ["Hydrolysed Pea Protein", "Organic Samoa Oil", "Organic Babassu Oil"],
    },
    {
      slug: "intense-repair-mask",
      name: "Intense Repair Mask",
      categorySlug: "masks",
      size: "250ml",
      price: 38,
      shortDescription: "Deep treatment for very damaged hair.",
      description:
        "A richly deep and luxurious conditioning treatment in need of repair, creating sleek and luminous hair.",
      perfectFor: "hair in need of rescue",
      keyIngredients: ["Silk Amino Acid", "Horsetail Extract", "Wheatgrass Extract"],
    },
    {
      slug: "intense-hydrating-mask",
      name: "Intense Hydrating Mask",
      categorySlug: "masks",
      size: "250ml",
      price: 39,
      shortDescription: "Superfood hydration with botanical oils.",
      description:
        "Infused with Organic Samoa and Babassu Oils to restore elasticity and improve texture and shine.",
      perfectFor: "dry and thirsty hair",
      keyIngredients: ["Organic Samoa (Coconut) Oil", "Hydrolysed Pea Protein", "Pineapple Enzyme Extract"],
    },
    {
      slug: "hair-density-complex-treatment-styling",
      name: "Hair Density Complex",
      categorySlug: "treatment-styling",
      size: "30ml",
      price: 40,
      shortDescription: "Leave-in scalp treatment to support fuller, denser-looking hair.",
      description:
        "Hair Density Complex is a leave in treatment that increases hair density. This scalp complex contains DHT blocking ingredients and is rich in probiotics, caffeine and baikal skullcap which helps achieve a thicker fuller hair in 6-8 weeks.",
      perfectFor: "fine, thinning and density-concerned hair",
      keyIngredients: ["Apple Stem Cell", "Probiotics", "Caffeine", "Baikal Skullcap"],
    },
    {
      slug: "rebuild-treatment-styling",
      name: "RE-Build",
      categorySlug: "treatment-styling",
      size: "110ml",
      price: 28,
      shortDescription: "Protective blow-dry treatment for dry and damaged hair.",
      description:
        "The latest treatment for the perfect blow-dry, RE-Build protects, repairs and reinforces dry and damaged hair, leaving lengths super-smooth, with improved shine and reduced blow-dry time.",
      perfectFor: "very dry and damaged hair",
      keyIngredients: [],
    },
    {
      slug: "silk-smooth-treatment-styling",
      name: "Silk Smooth",
      categorySlug: "treatment-styling",
      size: "110ml",
      price: 25,
      shortDescription: "Keratin and silk smoothing treatment for softness and shine.",
      description:
        "This unique Silk treatment complex is infused with Natural Keratin and Silk Amino Acids to deeply penetrate the hair, smoothing the cuticle and leaving hair soft, healthy and full of shine.",
      perfectFor: "medium to thick textures",
      keyIngredients: ["Natural Keratin", "Silk Amino Acids"],
    },
    {
      slug: "big-treatment-styling",
      name: "Big",
      categorySlug: "treatment-styling",
      size: "150ml",
      price: 18,
      shortDescription: "Volume booster for thicker, fuller hair and oil-free shine.",
      description:
        "A volume booster to provide thicker fuller hair instantly. Infused with Honey and Bamboo Extracts it's a non-sticky formula with long lasting volume and an oil free shine.",
      perfectFor: "fine and medium hair",
      keyIngredients: ["Honey", "Bamboo Extract"],
    },
    {
      slug: "primer-treatment-styling",
      name: "Primer",
      categorySlug: "treatment-styling",
      size: "150ml",
      price: 18,
      shortDescription: "Leave-in detangler with protection, strength and shine.",
      description:
        "An exceptional leave-in treatment and the perfect detangler for everyday use. Containing Hydrolysed Silk Protein, Comfrey and Bamboo Extracts to strengthen and repair whilst providing protection and adding shine.",
      perfectFor: "all hair types",
      keyIngredients: ["Hydrolysed Silk Protein", "Comfrey", "Bamboo Extract"],
    },
  ];

  for (const product of shopProducts) {
    await prisma.shopProduct.create({
      data: {
        slug: product.slug,
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        categoryId: categoryBySlug.get(product.categorySlug),
        price: product.price,
        currency: "GBP",
        sku: `SACO-${product.slug.toUpperCase().replace(/-/g, "_")}`,
        stockQuantity: 100,
        trackInventory: true,
        status: "PUBLISHED",
        perfectFor: product.perfectFor,
        keyIngredients: product.keyIngredients,
        meta: { size: product.size },
      },
    });
    console.log(`✓ Created shop product: ${product.name}`);
  }

  // --- EMAIL SEEDING ---
  console.log("\nCreating Email data...");

  const audience = await prisma.audience.create({
    data: {
      name: "Newsletter Subscribers",
      type: AudienceType.STANDARD,
      description: "General monthly newsletter list",
    },
  });

  await Promise.all(
    contacts.map((contact) =>
      prisma.audienceMember.create({
        data: {
          audienceId: audience.id,
          contactId: contact.id,
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          status: AudienceMemberStatus.SUBSCRIBED,
        },
      })
    )
  );

  await prisma.emailCampaign.create({
    data: {
      audienceId: audience.id,
      name: "January Newsletter",
      subject: "New Year, New Hair Goals",
      fromName: "Lorraine",
      fromEmail: "info@trichologybylorrainehawkins.co.uk",
      status: CampaignStatus.DRAFT,
    },
  });

  // --- CONTENT FACTORY SEEDING ---
  console.log("Creating Content Factory data...");

  const blogTemplate = await prisma.promptTemplate.create({
    data: {
      name: "Educational Blog Post",
      description: "Generates structured blog posts about hair health topics.",
      useCase: "BLOG",
      template:
        "Write an educational blog post about {{topic}} for {{audience}}. Include sections for Introduction, Symptoms, Causes, and Treatments.",
      provider: "OPENAI",
    },
  });

  const planQ1 = await prisma.contentPlan.create({
    data: {
      name: "Q1 2026 Brand Awareness",
      description: "Focus on educational content and clinic promotion.",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-03-31"),
    },
  });

  await prisma.contentSlot.create({
    data: {
      planId: planQ1.id,
      title: "5 Signs of Healthy Hair",
      channel: ContentChannel.INSTAGRAM,
      scheduledFor: new Date("2026-01-10T10:00:00Z"),
      status: ContentSlotStatus.SCHEDULED,
      assets: {
        create: {
          type: ContentAssetType.IMAGE,
          title: "Hair Shine Photo",
          variants: {
            create: {
              platform: ContentChannel.INSTAGRAM,
              status: AssetVariantStatus.APPROVED,
              headline: "Is your hair trying to tell you something?",
              copy: "Swipe to see the 5 signs of truly healthy hair. #trichology #haircare",
            },
          },
        },
      },
    },
  });

  // --- CHAT SEEDING ---
  console.log("Creating Chat data...");

  await prisma.chatConversation.create({
    data: {
      contactId: contacts[0].id,
      title: "Course Enquiry - Hair & Scalp Foundation Phase 1",
      status: "ACTIVE",
      messages: {
        create: [
          {
            role: "USER",
            content:
              "Hi, I am interested in the Hair & Scalp Foundation Phase 1 course. What topics does it cover?",
          },
          {
            role: "ASSISTANT",
            content:
              "Hello Sarah! The Hair & Scalp Foundation Phase 1 is an 8-day professional certification covering hair science, scalp conditions, diagnosis techniques, and client consultation skills. It's designed for hairstylists and beauty professionals. Would you like more details about specific days?",
          },
        ],
      },
    },
  });

  // --- KNOWLEDGE HUB (BLOG) SEEDING ---
  console.log("Creating Knowledge Hub data...");

  const blogCollection = await prisma.collection.upsert({
    where: { slug: "blog-posts" },
    update: {},
    create: {
      name: "Blog Posts",
      slug: "blog-posts",
      description: "Knowledge Hub articles, guides, and case studies",
      type: CollectionType.DOCUMENT,
    },
  });

  const blogArticles = [
    {
      title: "Understanding Hormonal Hair Loss: A Practical Guide",
      slug: "decoding-hormonal-hair-loss",
      summary: "Learn to recognize hormonal hair loss patterns and have supportive conversations with clients about treatment options.",
      status: EntryStatus.PUBLISHED,
      publishedAt: new Date("2025-10-02"),
      meta: {
        category: "Hair Loss",
        readTime: "8 min read",
        heroImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
      },
      content: {
        sections: [
          { type: "paragraph", text: "Hormonal hair loss is one of the most common concerns clients bring to trichologists and hair care professionals. Understanding the patterns, triggers, and appropriate responses can transform your consultations from uncertain to confident." },
          { type: "heading", text: "Recognizing the patterns" },
          { type: "paragraph", text: "Hormonal hair loss typically presents with specific patterns that differ from other forms of hair loss. The most common presentation is diffuse thinning across the crown and top of the scalp, while the hairline often remains relatively intact. This is distinctly different from male pattern baldness or stress-related shedding." },
          { type: "paragraph", text: "Key indicators include:" },
          { type: "list", items: ["Gradual thinning over months or years rather than sudden shedding", "Increased hair fall during washing or brushing", "Visible scalp becoming more apparent, especially under bright light", "Changes in hair texture—often becoming finer or less dense"] },
          { type: "heading", text: "Common hormonal triggers" },
          { type: "paragraph", text: "Several hormonal transitions can trigger hair loss. Understanding these helps you ask the right questions during consultations:" },
          { type: "subheading", text: "Post-pregnancy changes" },
          { type: "paragraph", text: "Postpartum hair shedding typically occurs 3-6 months after giving birth. During pregnancy, elevated estrogen keeps more hair in the growth phase. After birth, hormone levels normalize and all that 'extra' hair sheds at once. While distressing, this is temporary and usually resolves within 6-12 months." },
          { type: "subheading", text: "Perimenopause and menopause" },
          { type: "paragraph", text: "As estrogen levels decline, the ratio of androgens increases, which can trigger hair thinning. This typically begins in the 40s but varies widely. The thinning is gradual but can be emotionally significant." },
          { type: "subheading", text: "Thyroid imbalances" },
          { type: "paragraph", text: "Both hypothyroidism and hyperthyroidism can cause diffuse hair loss. Thyroid hormones regulate the hair growth cycle, so when levels are off, hair growth is disrupted. Always ask about energy levels, weight changes, and temperature sensitivity." },
          { type: "heading", text: "Having supportive conversations" },
          { type: "paragraph", text: "When a client presents with suspected hormonal hair loss, your role isn't to diagnose but to guide and support. Here's a framework that works:" },
          { type: "list", items: ["Acknowledge their concern without minimizing it", "Ask about recent life changes: pregnancy, medication changes, stress levels", "Explain that you can support scalp health while they explore hormonal factors", "Recommend they speak with their GP about hormone testing if appropriate", "Focus on what you can do: scalp health, product recommendations, gentle treatments"] },
          { type: "heading", text: "Treatment approaches you can offer" },
          { type: "paragraph", text: "While hormonal issues require medical oversight, you can still provide valuable support:" },
          { type: "subheading", text: "Scalp health optimization" },
          { type: "paragraph", text: "A healthy scalp provides the best environment for hair growth. Focus on gentle cleansing, balancing the microbiome, and reducing inflammation. Avoid harsh detox treatments that can further stress already compromised hair." },
          { type: "subheading", text: "Nutritional support guidance" },
          { type: "paragraph", text: "While you shouldn't prescribe supplements, you can discuss the importance of protein, iron, and B vitamins for hair health. Encourage clients to discuss their diet with their healthcare provider." },
          { type: "subheading", text: "Stress management" },
          { type: "paragraph", text: "Hair loss is stressful, and stress worsens hair loss—it's a vicious cycle. Your calm, knowledgeable approach can help break this cycle. Scalp massage, relaxation techniques, and simply being heard can make a significant difference." },
          { type: "heading", text: "When to refer onwards" },
          { type: "paragraph", text: "You should encourage clients to see their doctor if they have:" },
          { type: "list", items: ["Sudden or severe hair loss", "Hair loss accompanied by other symptoms (fatigue, weight changes, irregular periods)", "No improvement after 3-6 months of scalp care", "Concerns about medication side effects"] },
          { type: "paragraph", text: "Remember: your value isn't in diagnosing hormonal issues but in providing expert scalp care, emotional support, and knowledgeable guidance. This approach builds trust and keeps clients coming back even as they work with other healthcare providers." },
          { type: "callout", text: "The most important thing you can offer is reassurance backed by knowledge. Help clients understand that hormonal hair loss is common, often temporary, and manageable with the right support." },
        ],
      },
    },
    {
      title: "Scalp Detox Treatments That Actually Work",
      slug: "future-of-scalp-detox",
      summary: "Science-based detox techniques that cleanse without damaging the scalp's natural protective barrier.",
      status: EntryStatus.PUBLISHED,
      publishedAt: new Date("2025-09-24"),
      meta: {
        category: "Scalp Health",
        readTime: "6 min read",
        heroImage: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80",
      },
      content: {
        sections: [
          { type: "paragraph", text: "Scalp detox has become a buzzword in hair care, but not all approaches are created equal. Many popular methods can actually damage the scalp's natural protective barrier, causing more harm than good. Here's what actually works." },
          { type: "heading", text: "Understanding the scalp microbiome" },
          { type: "paragraph", text: "Your scalp is home to a diverse community of microorganisms that work together to protect skin health. A good detox treatment supports this ecosystem rather than destroying it. Think of it like tending a garden—you want to remove weeds and debris without killing the beneficial organisms." },
          { type: "paragraph", text: "The scalp's sebum isn't the enemy. It's a protective barrier that:" },
          { type: "list", items: ["Prevents water loss and keeps skin hydrated", "Contains antimicrobial compounds that fight harmful bacteria", "Delivers vitamin E and other antioxidants to hair follicles", "Creates an acidic environment that beneficial microbes thrive in"] },
          { type: "heading", text: "What actually needs 'detoxing'" },
          { type: "paragraph", text: "Most scalps don't need aggressive cleansing. What we're really targeting is:" },
          { type: "subheading", text: "Product buildup" },
          { type: "paragraph", text: "Silicones, styling products, and some conditioning agents can accumulate over time. This creates a barrier that prevents moisture absorption and can lead to dullness. A gentle clarifying treatment once a month is usually sufficient." },
          { type: "subheading", text: "Environmental pollutants" },
          { type: "paragraph", text: "City dwellers especially deal with particulate matter that settles on the scalp. These particles can trigger inflammation. Regular cleansing with the right products is key." },
          { type: "subheading", text: "Dead skin cell accumulation" },
          { type: "paragraph", text: "Like facial skin, the scalp sheds dead cells. Sometimes these don't shed efficiently and can clog follicles. Gentle exfoliation helps, but over-exfoliation damages the protective barrier." },
          { type: "heading", text: "Effective detox techniques" },
          { type: "subheading", text: "1. Pre-cleanse oil treatment" },
          { type: "paragraph", text: "Apply a lightweight oil (jojoba or squalane work well) to the scalp 15-20 minutes before shampooing. Massage gently with fingertips in circular motions. This dissolves oil-soluble buildup and sebum plugs without stripping the scalp." },
          { type: "paragraph", text: "Why it works: Oil dissolves oil. This technique, borrowed from Korean skincare, is gentle yet effective." },
          { type: "subheading", text: "2. Clay-based masks (used correctly)" },
          { type: "paragraph", text: "Bentonite or kaolin clay can absorb excess sebum and impurities. The key is application: mix the clay with enough liquid (water, aloe juice, or hydrosol) to create a smooth paste. Apply only to the scalp, not the hair length. Leave for 5-10 minutes maximum—never let it dry completely." },
          { type: "subheading", text: "3. Enzyme exfoliation" },
          { type: "paragraph", text: "Fruit enzymes (papaya, pineapple) gently break down dead skin cells without mechanical scrubbing. Look for products with papain or bromelain. These are gentler than physical scrubs and work with the skin's natural processes." },
          { type: "heading", text: "What to avoid" },
          { type: "list", items: ["Harsh sulfate shampoos marketed as 'deep cleansing'—they strip too much", "Apple cider vinegar rinses stronger than 1:4 dilution—too acidic can damage", "Baking soda scrubs—highly alkaline and disrupts the scalp's pH", "Aggressive physical scrubs with large particles—can cause micro-tears", "Frequent detoxing—once a month is plenty for most people"] },
          { type: "heading", text: "Post-detox care" },
          { type: "paragraph", text: "After any detox treatment, focus on restoring balance:" },
          { type: "list", items: ["Use a gentle, pH-balanced shampoo", "Apply a hydrating scalp serum or toner", "Avoid heat styling for 24 hours", "Let the scalp rest—no treatments for at least a week"] },
          { type: "callout", text: "The best scalp detox is one your client doesn't even notice. They should feel refreshed and clean, not stripped or irritated. If their scalp feels tight or looks red, you've gone too far." },
          { type: "paragraph", text: "Remember: the goal is supporting the scalp's natural cleansing processes, not fighting against them. A healthy scalp detoxifies itself continuously—our job is to help, not hinder." },
        ],
      },
    },
    {
      title: "Building Trust Through Better Consultations",
      slug: "ethical-consultations",
      summary: "Practical tips and conversation frameworks for conducting scalp consultations that clients value and remember.",
      status: EntryStatus.PUBLISHED,
      publishedAt: new Date("2025-09-10"),
      meta: {
        category: "Consultations",
        readTime: "7 min read",
        heroImage: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=1200&q=80",
      },
      content: {
        sections: [
          { type: "paragraph", text: "A consultation isn't just a prelude to treatment—it's where trust is built or broken. Get this right, and clients become advocates. Get it wrong, and even excellent technical work won't save the relationship." },
          { type: "heading", text: "Why consultations matter" },
          { type: "paragraph", text: "In my years of practice, I've noticed that clients who value consultations are the ones who stay with you long-term. They're not price shopping—they're investing in expertise. But you have to demonstrate that expertise in a way that feels helpful, not salesy." },
          { type: "paragraph", text: "A great consultation does three things:" },
          { type: "list", items: ["Makes the client feel heard and understood", "Educates without overwhelming", "Creates clear next steps that feel collaborative, not prescribed"] },
          { type: "heading", text: "The consultation framework" },
          { type: "subheading", text: "1. Start with their story (5-7 minutes)" },
          { type: "paragraph", text: "Begin with open-ended questions and actually listen to the answers. Don't jump to solutions yet." },
          { type: "list", items: ["\"What brings you in today?\"", "\"When did you first notice this concern?\"", "\"What have you tried so far?\"", "\"How is this affecting you day-to-day?\""] },
          { type: "paragraph", text: "That last question is crucial. It reveals the emotional impact, which is often what really matters." },
          { type: "subheading", text: "2. Assessment and education (10-15 minutes)" },
          { type: "paragraph", text: "This is where your expertise shines. But here's the key: explain what you're seeing as you go." },
          { type: "subheading", text: "3. Collaborative planning (8-10 minutes)" },
          { type: "paragraph", text: "This isn't where you sell—it's where you co-create a plan." },
          { type: "heading", text: "Handling common challenges" },
          { type: "subheading", text: "When clients are overwhelmed" },
          { type: "paragraph", text: "If you notice glazed eyes or confusion, pause and simplify. Say: \"I know that's a lot of information. The main things to remember are [1-2 key points]. Would it help if I wrote this down for you?\"" },
          { type: "subheading", text: "When you need to refer out" },
          { type: "paragraph", text: "Some concerns are beyond your scope. That's not a weakness—it's professional integrity. Clients respect this honesty." },
          { type: "subheading", text: "When clients have unrealistic expectations" },
          { type: "paragraph", text: "Be kind but clear about what's achievable. Set realistic timelines and focus on sustainable improvement." },
          { type: "heading", text: "Documentation and follow-up" },
          { type: "paragraph", text: "After the consultation:" },
          { type: "list", items: ["Take detailed notes while it's fresh", "Send a follow-up email summarizing the plan", "Include any resources or articles you mentioned", "Schedule the next appointment before they leave", "Follow up in 2-3 days to check how they're getting on"] },
          { type: "heading", text: "The economics of good consultations" },
          { type: "paragraph", text: "A thorough consultation is worth the investment. Clients who value expertise will happily pay for a proper consultation. And those clients buy recommended products, book follow-up treatments, refer friends, leave glowing reviews, and become long-term clients." },
          { type: "callout", text: "A rushed free consultation attracts price shoppers. A thorough paid consultation attracts clients who value expertise. Choose your business model accordingly." },
          { type: "paragraph", text: "Your consultations are your reputation. Make them count." },
        ],
      },
    },
  ];

  for (const article of blogArticles) {
    await prisma.entry.upsert({
      where: {
        collectionId_slug: {
          collectionId: blogCollection.id,
          slug: article.slug,
        },
      },
      update: {
        title: article.title,
        summary: article.summary,
        meta: article.meta,
        content: article.content,
      },
      create: {
        collectionId: blogCollection.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        status: article.status,
        publishedAt: article.publishedAt,
        meta: article.meta,
        content: article.content,
      },
    });
  }

  console.log("\n🌱 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
