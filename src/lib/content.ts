/* ─────────────────────────────────────────────────────────────────────────────
 * Static content data — used as fallback when DB is empty and for SEO
 * pages that don't yet pull from the database.
 *
 * Audience key:
 *   "professional" – trichologists, stylists, salon owners (all education is professional)
 * ────────────────────────────────────────────────────────────────────────── */

// ── Types ────────────────────────────────────────────────────────────────────

export type VideoLesson = {
  id: string;
  title: string;
  category: string;
  duration: string;
  investment: string;
  summary: string;
  highlights: string[];
  audience: "consumer" | "professional";
  image: { src: string; alt: string };
  slug: string;
};

export type IntensiveProgramme = {
  id: string;
  title: string;
  duration: string;
  investment: string;
  location: string;
  summary: string;
  outcomes: string[];
  image: { src: string; alt: string };
  slug: string;
  headline: string;
  longDescription: string;
  whoItsFor: string[];
  whatYouGet: string[];
  agenda: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  testimonials: { quote: string; author: string; role: string }[];
  ctaLabel: string;
  ctaHref: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
  audience: "consumer" | "professional";
  image: { src: string; alt: string };
  focus: string[];
  cta: { label: string; href: string };
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  audience: "consumer" | "professional";
};

export type BlogHighlight = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  slug: string;
  published: string;
  heroImage?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
  audience?: "consumer" | "professional";
};

export type HomeProductFallback = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  price: number;
  imageUrl?: string | null;
};

// ── Video hero placeholder by slug (used when heroMedia is missing or signed URL fails) ───

/** Single placeholder used until you add slug-specific PNGs under public/images/ */
const VIDEO_PLACEHOLDER_ASSET = "/images/video-placeholder.svg";

export const VIDEO_HERO_PLACEHOLDER_BY_SLUG: Record<string, string> = {
  "menopause-hair-loss": VIDEO_PLACEHOLDER_ASSET,
  "postpartum-hair-loss": VIDEO_PLACEHOLDER_ASSET,
  "stress-hair-loss": VIDEO_PLACEHOLDER_ASSET,
  "sensitive-scalps": VIDEO_PLACEHOLDER_ASSET,
};

/** Fallback when no hero image and slug not in VIDEO_HERO_PLACEHOLDER_BY_SLUG */
export const VIDEO_HERO_PLACEHOLDER_DEFAULT = VIDEO_PLACEHOLDER_ASSET;

export const HOME_PRODUCT_FALLBACKS: HomeProductFallback[] = [
  {
    id: "fallback-revitalize-shampoo",
    slug: "revitalize-shampoo",
    name: "Revitalize Shampoo",
    shortDescription: "Gentle cleansing support for scalp comfort and everyday shine.",
    price: 19,
    imageUrl: null,
  },
  {
    id: "fallback-densifying-shampoo",
    slug: "densifying-shampoo",
    name: "Densifying Shampoo",
    shortDescription: "Lightweight cleansing support for fine and thinning hair routines.",
    price: 22,
    imageUrl: null,
  },
  {
    id: "fallback-intense-hydrating-mask",
    slug: "intense-hydrating-mask",
    name: "Intense Hydrating Mask",
    shortDescription: "Deep moisture treatment to restore softness and elasticity.",
    price: 39,
    imageUrl: null,
  },
  {
    id: "fallback-primer-treatment-styling",
    slug: "primer-treatment-styling",
    name: "Primer",
    shortDescription: "Leave-in detangler with protection, strength and shine.",
    price: 18,
    imageUrl: null,
  },
];

// ── Video Lessons (condition-specific clinical training modules) ────────────

export const videoLessons: VideoLesson[] = [
  {
    id: "video-menopause",
    title: "Menopause & Hair Loss: What's Normal and What Helps",
    category: "Hormonal Health",
    duration: "30 minutes",
    investment: "£29",
    audience: "professional",
    summary:
      "Clinical training on menopausal hair changes — how to assess, explain to clients, and recommend evidence-based approaches.",
    highlights: [
      "Hormonal mechanisms affecting hair growth",
      "Differentiating shedding from pattern loss",
      "Client communication frameworks",
    ],
    image: {
      src: "/images/video-diagnostics-placeholder.png",
      alt: "Menopause and hair loss video course by Lorraine Hawkins.",
    },
    slug: "menopause-hair-loss",
  },
  {
    id: "video-postpartum",
    title: "Postpartum Hair Loss: Why You're Shedding and When It Stops",
    category: "Hormonal Health",
    duration: "25 minutes",
    investment: "£29",
    audience: "professional",
    summary:
      "Clinical framework for assessing and advising clients on postpartum hair shedding — timelines, triggers, and referral criteria.",
    highlights: [
      "Postpartum shedding mechanisms",
      "Assessment and recovery timelines",
      "When to refer for further investigation",
    ],
    image: {
      src: "/images/video-ingredients-placeholder.png",
      alt: "Postpartum hair loss video course by Lorraine Hawkins.",
    },
    slug: "postpartum-hair-loss",
  },
  {
    id: "video-stress",
    title: "Stress & Hair Loss: Shedding, Inflammation & Recovery",
    category: "Stress & Recovery",
    duration: "25 minutes",
    investment: "£29",
    audience: "professional",
    summary:
      "Clinical training on stress-related hair loss — the cortisol pathway, telogen effluvium assessment, and client recovery guidance.",
    highlights: [
      "Stress–cortisol–hair growth pathway",
      "Telogen effluvium assessment techniques",
      "Recovery guidance for practitioners",
    ],
    image: {
      src: "/images/video-detox-placeholder.png",
      alt: "Stress and hair loss video course by Lorraine Hawkins.",
    },
    slug: "stress-hair-loss",
  },
  {
    id: "video-sensitive-scalps",
    title: "Sensitive Scalps: Redness, Itching & Inflammation Explained",
    category: "Scalp Health",
    duration: "30 minutes",
    investment: "£29",
    audience: "professional",
    summary:
      "Clinical module on sensitive and reactive scalps — barrier function, inflammation pathways, and treatment approaches for practitioners.",
    highlights: [
      "Scalp barrier function and inflammation",
      "Trigger identification protocols",
      "Treatment and referral frameworks",
    ],
    image: {
      src: "/images/video-diagnostics-placeholder.png",
      alt: "Sensitive scalps video course by Lorraine Hawkins.",
    },
    slug: "sensitive-scalps",
  },
];

// ── Video Detail Fallback (publicContent-shaped, used when DB is offline) ─────

export type VideoDetailFallback = {
  slug: string;
  title: string;
  category: string;
  durationMinutes: number;
  price: string;
  headline: string;
  intro: string;
  whoItsFor: string[];
  learningOutcomes: string[];
  whatItsNot: string[];
  benefits: string[];
  faqs: { question: string; answer: string }[];
};

export const videoDetailFallbacks: VideoDetailFallback[] = [
  {
    slug: "menopause-hair-loss",
    title: "Menopause & Hair Loss: What's Normal and What Helps",
    category: "Hormonal Health",
    durationMinutes: 30,
    price: "£29",
    headline: "Menopausal hair changes — the clinical picture, assessment, and client guidance",
    intro: "Hormonal shifts during menopause are one of the most common presentations you'll see in practice. This module gives you the clinical framework to assess, explain, and advise your clients with confidence.",
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
      { question: "Is this suitable for stylists without a trichology background?", answer: "Yes. Lorraine explains the clinical concepts clearly, building from fundamentals so any hair professional can follow and apply the knowledge." },
      { question: "Will this cover specific product recommendations?", answer: "The module covers evidence-based approaches and active ingredients. You'll be able to make informed recommendations relevant to your practice and product range." },
    ],
  },
  {
    slug: "postpartum-hair-loss",
    title: "Postpartum Hair Loss: Why You're Shedding and When It Stops",
    category: "Hormonal Health",
    durationMinutes: 25,
    price: "£29",
    headline: "Postpartum shedding — clinical assessment, recovery timelines, and when to investigate further",
    intro: "Postpartum hair loss is one of the most common concerns clients bring to practitioners. This module equips you with the clinical knowledge to assess, reassure, and advise with authority.",
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
      { question: "Is this relevant for stylists as well as trichologists?", answer: "Absolutely. Any hair professional who sees new mothers in their chair will benefit from understanding this presentation and knowing how to advise confidently." },
      { question: "Does the module cover when to refer?", answer: "Yes. Clear referral criteria are included so you know when postpartum shedding may need medical investigation." },
    ],
  },
  {
    slug: "stress-hair-loss",
    title: "Stress & Hair Loss: Understanding Shedding, Inflammation & Recovery",
    category: "Stress & Recovery",
    durationMinutes: 25,
    price: "£29",
    headline: "Stress-related hair loss — the cortisol pathway, clinical assessment, and recovery guidance",
    intro: "Telogen effluvium triggered by stress is a frequent presentation. This module covers the biological mechanism, how to assess and explain it to clients, and evidence-based recovery support.",
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
      { question: "Does the module cover chronic TE as well?", answer: "Yes. Both acute and chronic telogen effluvium are covered, including differential assessment and when the presentation may indicate a more complex underlying cause." },
      { question: "Is this useful for practitioners who don't specialise in trichology?", answer: "Very much so. Any hair professional will benefit from understanding this common presentation and being able to have an informed, reassuring conversation with clients." },
    ],
  },
  {
    slug: "sensitive-scalps",
    title: "Sensitive Scalps: Redness, Itching & Inflammation Explained",
    category: "Scalp Health",
    durationMinutes: 30,
    price: "£29",
    headline: "Sensitive and reactive scalps — barrier function, triggers, and treatment protocols",
    intro: "Clients with sensitive scalps are increasingly common and often frustrating to manage. This module gives you the clinical framework to assess barrier function, identify triggers, and recommend effective treatment approaches.",
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
      { question: "Does this cover specific scalp conditions like psoriasis or seborrheic dermatitis?", answer: "The module focuses on sensitivity and barrier dysfunction. It covers differential assessment so you can recognise when presentations may indicate specific conditions requiring medical referral." },
      { question: "Is this suitable for someone new to scalp assessment?", answer: "Yes. Lorraine builds from fundamentals so you can follow the clinical reasoning even without prior trichology training." },
    ],
  },
];

// ── In-Person Training (professional-facing) ─────────────────────────────────

export const inPersonIntensives: IntensiveProgramme[] = [
  {
    id: "intensive-foundations",
    title: "Hair & scalp science education",
    duration: "2 days",
    investment: "£1,250",
    location: "London studio or at your location",
    summary:
      "Lorraine's comprehensive in-person course covering scalp health fundamentals, assessment techniques, and professional consultation skills. For stylists and practitioners who want clinical confidence.",
    outcomes: [
      "Conduct professional scalp assessments with confidence",
      "Master client consultation frameworks that build trust",
      "Identify common scalp conditions and their root causes",
      "Build personalised treatment plans for every client",
      "Understand the science behind hair growth and loss",
      "Use diagnostic tools and scalp imaging effectively",
    ],
    image: {
      src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
      alt: "Hair & scalp science education — in-person intensive with Lorraine Hawkins.",
    },
    slug: "trichocare-foundations-intensive",
    headline: "Two days that will transform how you care for every client who sits in your chair",
    longDescription:
      "Most stylists and practitioners know something is wrong when they see a client's scalp — but they don't have the language, the framework, or the confidence to address it. This intensive changes that.\n\nOver two focused days with Lorraine, you'll learn to assess scalps professionally, have honest conversations with clients about what you're seeing, and build treatment plans grounded in real science. You'll practise on real cases, receive direct feedback, and leave with a clinical toolkit you can use from day one.\n\nThis isn't theory you'll forget by Friday. It's hands-on, practical training that earns client trust and transforms your professional reputation.",
    whoItsFor: [
      "Stylists who want to offer scalp consultations as a service",
      "Practitioners transitioning into trichology or scalp care",
      "Salon owners looking to differentiate with clinical-grade expertise",
      "Beauty professionals ready to move beyond product sales to genuine client care",
    ],
    whatYouGet: [
      "Two full days of hands-on training with Lorraine",
      "Comprehensive course manual and reference guide",
      "Practice scalp assessments with live case studies",
      "Professional consultation script templates",
      "Certificate of completion",
      "Post-training email support for 30 days",
      "Access to the private alumni community",
    ],
    agenda: [
      {
        title: "Day 1 — Foundations & Assessment",
        description:
          "Scalp anatomy and hair biology fundamentals. How to conduct a professional scalp assessment. Identifying the most common conditions you'll encounter. Hands-on practice with diagnostic tools and scalp imaging.",
      },
      {
        title: "Day 2 — Consultations & Treatment",
        description:
          "Building a consultation framework that clients trust. Creating personalised treatment plans. Product science — what works, what doesn't, and why. Live case studies with direct feedback from Lorraine. Action planning for integrating trichology into your practice.",
      },
    ],
    faqs: [
      {
        question: "Do I need any formal qualifications to attend?",
        answer:
          "No formal trichology qualifications are required. This training is designed for working stylists, therapists, and beauty professionals who want to add scalp care expertise to their practice.",
      },
      {
        question: "What if I can't attend in London?",
        answer:
          "Lorraine can deliver this training at your location — anywhere in the UK, Europe, or North America. Contact us to discuss travel dates and arrangements.",
      },
      {
        question: "Is lunch included?",
        answer:
          "Light refreshments are provided throughout. For London sessions, we'll recommend local lunch options. For on-site training, catering arrangements can be discussed.",
      },
      {
        question: "Will I be able to offer scalp consultations after this?",
        answer:
          "Yes. You'll leave with the knowledge, scripts, and frameworks to start offering professional scalp consultations immediately. Many graduates add this as a premium service within weeks.",
      },
      {
        question: "How many people attend each session?",
        answer:
          "Groups are kept small — typically 6 to 10 participants — so everyone gets personal attention and hands-on practice time with Lorraine.",
      },
    ],
    testimonials: [
      {
        quote:
          "This training gave me the confidence to specialise in scalp care. Lorraine's approach balances real science with practical client care. I've added a consultation service and it's become the most requested part of my business.",
        author: "Michael Evans",
        role: "Certified Trichologist",
      },
      {
        quote:
          "I came in as a stylist with 15 years of experience but no real scalp knowledge. Two days later, I could see things I'd been missing for years. My clients notice the difference immediately.",
        author: "Sarah Jennings",
        role: "Senior Stylist, The Hair Lab",
      },
    ],
    ctaLabel: "Reserve your place",
    ctaHref: "/contact?intensive=trichocare-foundations-intensive",
  },
  {
    id: "intensive-salon",
    title: "Salon Team Training Day",
    duration: "1 day",
    investment: "£350 per participant",
    location: "We come to your salon",
    summary:
      "Bring expert scalp care skills to your whole team. Covers assessments, treatments, and product recommendations that build client trust and revenue.",
    outcomes: [
      "Run confident scalp consultations with every client",
      "Deliver signature scalp treatments your clients will love",
      "Make product recommendations that clients actually follow",
      "Track results and build long-term client relationships",
      "Increase rebooking rates with structured aftercare",
      "Speak about scalp health in a way clients understand and value",
    ],
    image: {
      src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
      alt: "Salon Team Training Day — Lorraine Hawkins visits your salon.",
    },
    slug: "salon-scalp-health-consultancy",
    headline: "Turn your whole team into scalp care experts — without leaving your salon",
    longDescription:
      "Your team already has the client relationships. What they need is the knowledge and confidence to talk about scalp health in a way that feels natural, builds trust, and drives revenue.\n\nLorraine comes to your salon for a full day of hands-on training. Every team member — from juniors to senior stylists — learns how to assess scalps, have meaningful conversations about what they're seeing, and recommend treatments and products with genuine authority.\n\nSalons that complete this training consistently report higher consultation bookings, stronger product sales, and clients who rebook because they feel genuinely looked after.",
    whoItsFor: [
      "Salon owners who want to differentiate their business with scalp care expertise",
      "Teams ready to move from purely aesthetic services to holistic hair and scalp health",
      "Salons looking to increase average ticket value and client retention",
      "Multi-location businesses that want consistent scalp care standards across teams",
    ],
    whatYouGet: [
      "Full-day on-site training at your salon",
      "Training for your entire team (any size)",
      "Customised content based on your salon's services and product range",
      "Consultation scripts and client communication templates",
      "Scalp assessment quick-reference cards for each team member",
      "Post-training follow-up call with Lorraine (within 30 days)",
      "Certificate of completion for every participant",
    ],
    agenda: [
      {
        title: "Morning — Scalp Science & Assessment",
        description:
          "Understanding the scalp and hair growth cycle. How to conduct a quick but thorough scalp check during any appointment. Recognising the most common conditions and knowing when to refer. Hands-on practice with guided feedback from Lorraine.",
      },
      {
        title: "Afternoon — Consultations, Treatments & Revenue",
        description:
          "Building consultations into your existing service flow. Signature scalp treatment techniques your team can deliver today. Product recommendations that feel helpful, not salesy. Tracking client progress and building rebooking habits. Team action plan for launching scalp services.",
      },
    ],
    faqs: [
      {
        question: "How many team members can attend?",
        answer:
          "There's no limit. The training is priced per participant so you can include your entire team — from receptionists to senior stylists. Everyone benefits from understanding scalp health.",
      },
      {
        question: "Do you tailor the training to our product range?",
        answer:
          "Yes. Before the training day, Lorraine reviews your current services and product lines so the recommendations and techniques are directly relevant to your salon.",
      },
      {
        question: "What if some of our team are complete beginners?",
        answer:
          "The training is designed to work for mixed experience levels. Lorraine adjusts the depth for each exercise, ensuring beginners build confidence while experienced team members deepen their expertise.",
      },
      {
        question: "Can you come to salons outside the UK?",
        answer:
          "Absolutely. Lorraine regularly delivers training across the UK, Europe, and North America. Contact us to discuss dates and travel arrangements.",
      },
      {
        question: "What results can we expect?",
        answer:
          "Salons typically see an increase in consultation bookings within the first month, stronger product attachment rates, and clients who specifically rebook for scalp care services.",
      },
    ],
    testimonials: [
      {
        quote:
          "Lorraine taught us how to talk about scalp health in a way our clients understand and value. Our consultation bookings have doubled since the training.",
        author: "Anita Clarke",
        role: "Salon Director, Atelier Beauté",
      },
      {
        quote:
          "We added Lorraine's scalp treatments to our menu and clients love them. Retention is up and it's become our signature service. The team's confidence has completely transformed.",
        author: "Isha Desai",
        role: "Founder, Root & Ritual",
      },
    ],
    ctaLabel: "Book training for your team",
    ctaHref: "/contact?intensive=salon-scalp-health-consultancy",
  },
  {
    id: "intensive-regenerative-detox",
    title: "Advanced Scalp Analysis Workshop",
    duration: "1 day",
    investment: "£450 per participant",
    location: "Available in UK, Europe & North America",
    summary:
      "Master advanced scalp analysis, scoping, and treatment methods for complex conditions. A focused, hands-on workshop for experienced practitioners.",
    outcomes: [
      "Master advanced treatment protocols for sensitive and reactive scalps",
      "Perform professional scalp massage and tool-based techniques",
      "Design client aftercare and home treatment plans",
      "Understand the science behind scalp detoxification",
      "Handle complex cases with confidence and clinical reasoning",
      "Build premium treatment packages that command higher prices",
    ],
    image: {
      src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
      alt: "Advanced Scalp Analysis Workshop — hands-on training with Lorraine Hawkins.",
    },
    slug: "regenerative-scalp-detox-lab",
    headline: "Advanced scalp analysis and scoping for practitioners who are ready to handle the cases others can't",
    longDescription:
      "You already know the basics. Your clients trust you. But some cases push beyond what general training covers — sensitive scalps that react to everything, chronic conditions that don't respond to standard treatments, clients who've tried everything and need a different approach.\n\nThis advanced workshop is for experienced practitioners who want to go deeper. Lorraine shares the analysis, scoping process, protocols, massage techniques, and clinical reasoning she uses in her own practice for the most complex scalp conditions. Every technique is demonstrated, practised, and refined with direct feedback.\n\nYou'll leave with advanced skills that set you apart — and the confidence to charge accordingly.",
    whoItsFor: [
      "Qualified trichologists looking to expand their treatment repertoire",
      "Experienced stylists who already offer basic scalp services",
      "Practitioners working with clients who have sensitive or reactive scalps",
      "Professionals who want to build a premium scalp treatment offering",
    ],
    whatYouGet: [
      "Full-day advanced workshop with Lorraine",
      "Detailed treatment protocol manuals",
      "Hands-on practice with advanced massage and tool techniques",
      "Client aftercare plan templates",
      "Product formulation guidance for complex conditions",
      "Certificate of advanced training",
      "Access to the advanced practitioners community",
    ],
    agenda: [
      {
        title: "Morning — Advanced Science & Protocols",
        description:
          "Deep dive into scalp barrier function and inflammatory pathways. Advanced assessment techniques for complex conditions. Treatment protocols for sensitive, reactive, and compromised scalps. Understanding when to treat and when to refer.",
      },
      {
        title: "Afternoon — Hands-on Techniques & Practice",
        description:
          "Professional scalp massage techniques for treatment and relaxation. Tool-based methods for scalp detoxification. Designing multi-session treatment plans. Building premium aftercare packages. Live practice with feedback from Lorraine on your technique.",
      },
    ],
    faqs: [
      {
        question: "What experience level is required?",
        answer:
          "This workshop is designed for practitioners who already have foundational scalp care knowledge — either through formal training, Lorraine's Complete Trichology Training, or equivalent professional experience.",
      },
      {
        question: "Is this different from the Complete Trichology Training?",
        answer:
          "Yes. The Complete Trichology Training covers foundations and assessment. This workshop builds on that with advanced treatment techniques, complex case management, and premium service design.",
      },
      {
        question: "What tools or products do I need to bring?",
        answer:
          "Everything is provided for the workshop. You'll receive a list of recommended tools and products to source for your own practice after the training.",
      },
      {
        question: "Can I attend without completing the foundations course?",
        answer:
          "If you have equivalent professional experience, yes. Contact us to discuss your background and Lorraine will confirm whether this workshop is the right fit.",
      },
      {
        question: "Where are workshops held?",
        answer:
          "Workshops will be done in Cheshire or in your own salon space.",
      },
    ],
    testimonials: [
      {
        quote:
          "The advanced workshop took my treatment skills to another level. I'm now confidently handling cases I would have referred out before. My clients can feel the difference in my hands.",
        author: "Dr. Elaine Foster",
        role: "Consultant Trichologist",
      },
      {
        quote:
          "Lorraine's massage techniques alone were worth the investment. I've created a premium scalp treatment menu that clients book out weeks in advance.",
        author: "Tomoko Sato",
        role: "Scalp Therapist, Strand & Root",
      },
    ],
    ctaLabel: "Reserve your place",
    ctaHref: "/contact?intensive=regenerative-scalp-detox-lab",
  },
];

// ── Testimonials (audience-tagged) ───────────────────────────────────────────

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-rachel",
    quote:
      "The postpartum module gave me the clinical framework I was missing. Now when new mothers sit in my chair, I can explain exactly what's happening and when they should expect recovery. It's transformed my consultations.",
    author: "Rachel M.",
    role: "Senior Stylist",
    audience: "professional",
  },
  {
    id: "testimonial-priya",
    quote:
      "The menopause module filled a real gap in my training. I can now have informed, confident conversations with clients about hormonal hair changes — and they notice the difference.",
    author: "Priya S.",
    role: "Trichology Practitioner",
    audience: "professional",
  },
  {
    id: "testimonial-anita",
    quote:
      "Lorraine taught us how to talk about scalp health in a way our clients understand and value. Our consultation bookings have doubled.",
    author: "Anita Clarke",
    role: "Salon Director, Atelier Beauté",
    audience: "professional",
  },
  {
    id: "testimonial-michael",
    quote:
      "This training gave me the confidence to specialise in scalp care. Lorraine's approach balances real science with practical client care.",
    author: "Michael Evans",
    role: "Certified Trichologist",
    audience: "professional",
  },
  {
    id: "testimonial-isha",
    quote:
      "We added Lorraine's scalp treatments to our menu and clients love them. Retention is up and it's become our signature service.",
    author: "Isha Desai",
    role: "Founder, Root & Ritual",
    audience: "professional",
  },
];

// ── Blog Highlights ──────────────────────────────────────────────────────────

export const blogHighlights: BlogHighlight[] = [
  {
    id: "blog-hormonal",
    title: "Why Hormonal Changes Affect Your Hair",
    excerpt:
      "Menopause, pregnancy, and stress can all change how your hair grows. Here's what's actually happening — and what you can do about it.",
    category: "Hair Loss",
    slug: "decoding-hormonal-hair-loss",
    published: "2025-10-02",
    heroImage:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "blog-scalp-health",
    title: "Scalp Care Basics: What Actually Matters",
    excerpt:
      "Not every product or technique lives up to its claims. Lorraine breaks down what evidence-based scalp care really looks like.",
    category: "Scalp Health",
    slug: "future-of-scalp-detox",
    published: "2025-09-24",
    heroImage:
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "blog-consultation",
    title: "What to Expect from a Trichology Consultation",
    excerpt:
      "Never seen a trichologist before? Here's what happens during a consultation, what Lorraine looks for, and how it helps.",
    category: "Consultations",
    slug: "ethical-consultations",
    published: "2025-09-10",
    heroImage:
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=1200&q=80",
  },
];

// ── FAQs (audience-tagged) ───────────────────────────────────────────────────

export const faqItems: FaqItem[] = [
  {
    question: "What kind of video courses do you offer?",
    answer:
      "Condition-specific clinical training modules covering menopausal hair changes, postpartum shedding, stress-related hair loss, and scalp sensitivity. Each module gives you the clinical framework to assess, explain, and advise your clients with confidence.",
    audience: "professional",
  },
  {
    question: "Do I need a trichology qualification to benefit?",
    answer:
      "No. The video modules are designed for all hair professionals — stylists, therapists, and practitioners. Lorraine builds from fundamentals so anyone can follow the clinical reasoning.",
    audience: "professional",
  },
  {
    question: "How do I access the modules after purchasing?",
    answer:
      "After purchase you get instant access in your Academy library. Watch as many times as you like — there's no expiry.",
    audience: "professional",
  },
  {
    question: "What professional training is available?",
    answer:
      "Lorraine offers structured online courses for trichology professionals, plus in-person intensive workshops for salon teams and practitioners. Training covers clinical assessment, treatment protocols, and consultation skills.",
    audience: "professional",
  },
  {
    question: "Can you train our salon team on-site?",
    answer:
      "Yes. Lorraine travels to salons across the UK, Europe, and North America. Training is customised to your team's needs. Contact us to discuss dates and pricing.",
    audience: "professional",
  },
];

// ── Services (audience-tagged) ───────────────────────────────────────────────

export const services: Service[] = [
  {
    id: "service-consultation",
    name: "Clinical Consultation & Assessment",
    description:
      "A one-to-one clinical session with Lorraine. Includes professional scalp imaging, comprehensive assessment, and a structured care plan. Available for practitioners seeking mentorship or complex case review.",
    duration: "75 minutes",
    audience: "professional",
    focus: ["Professional scalp imaging", "Comprehensive assessment", "Structured care plan"],
    image: {
      src: "/images/service-consultation-placeholder.png",
      alt: "Personal scalp health consultation with Lorraine Hawkins.",
    },
    cta: { label: "Book a consultation", href: "/contact" },
  },
  {
    id: "service-team-training",
    name: "Salon Team Training",
    description:
      "On-site training for your salon team. Build confidence in scalp consultations, treatment delivery, and product recommendations that clients value.",
    duration: "Full day",
    audience: "professional",
    focus: ["Consultation skills", "Treatment techniques", "Product knowledge"],
    image: {
      src: "/images/service-training-placeholder.png",
      alt: "Salon team training with Lorraine Hawkins.",
    },
    cta: { label: "Plan your training", href: "/contact" },
  },
  {
    id: "service-workshop",
    name: "Advanced Scalp Analysis Workshop",
    description:
      "A hands-on workshop for experienced practitioners. Master advanced scalp analysis, scoping, and client aftercare protocols.",
    duration: "1 day",
    audience: "professional",
    focus: ["Advanced treatment methods", "Massage techniques", "Client aftercare"],
    image: {
      src: "/images/service-detox-placeholder.png",
      alt: "Scalp treatment workshop with Lorraine Hawkins.",
    },
    cta: { label: "View workshop dates", href: "/education" },
  },
];
