export type VideoLesson = {
  id: string;
  title: string;
  category: string;
  duration: string;
  investment: string;
  summary: string;
  highlights: string[];
  image: {
    src: string;
    alt: string;
  };
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
  image: {
    src: string;
    alt: string;
  };
  slug: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
  image: {
    src: string;
    alt: string;
  };
  focus: string[];
  cta: {
    label: string;
    href: string;
  };
};

export const videoLessons: VideoLesson[] = [
  {
    id: "video-diagnostics",
    title: "Scalp Diagnostics Essentials",
    category: "Clinical Skills",
    duration: "42 minutes",
    investment: "£35 download",
    summary:
      "Learn how to assess scalp health using professional imaging techniques. Follow Lorraine's clear process from setup to analysis, ready to use immediately.",
    highlights: [
      "Simple camera setup and lighting guide",
      "How to identify common scalp conditions",
      "Ready-to-use client assessment checklist",
    ],
    image: {
      src: "/images/video-diagnostics-placeholder.png",
      alt: "Video lesson placeholder artwork for Scalp Diagnostics Essentials.",
    },
    slug: "microscopic-diagnostics-primer",
  },
  {
    id: "video-ingredient-science",
    title: "Understanding Scalp Care Ingredients",
    category: "Product Knowledge",
    duration: "55 minutes",
    investment: "£35 download",
    summary:
      "Know which ingredients actually work for different scalp conditions. Build confidence recommending products with this science-backed guide.",
    highlights: [
      "Ingredient guide for common scalp issues",
      "How to explain products to clients",
      "Quick reference cheat sheet included",
    ],
    image: {
      src: "/images/video-ingredient-placeholder.png",
      alt: "Video lesson placeholder artwork for Understanding Scalp Care Ingredients.",
    },
    slug: "ingredient-science-playbook",
  },
  {
    id: "video-detox-rituals",
    title: "Gentle Scalp Detox Techniques",
    category: "Treatment Methods",
    duration: "48 minutes",
    investment: "£35 download",
    summary:
      "Create effective scalp treatments that protect skin health. Includes massage techniques, treatment timing, and home care guidance for clients.",
    highlights: [
      "Before and after photo techniques",
      "Step-by-step massage demonstrations",
      "Client home care instructions template",
    ],
    image: {
      src: "/images/video-detox-placeholder.png",
      alt: "Video lesson placeholder artwork for Gentle Scalp Detox Techniques.",
    },
    slug: "detox-rituals-microbiome",
  },
];

export const inPersonIntensives: IntensiveProgramme[] = [
  {
    id: "intensive-foundations",
    title: "Complete Trichology Training",
    duration: "2 days",
    investment: "£1,250",
    location: "London studio or at your location",
    summary:
      "Lorraine's comprehensive in-person course covering scalp health fundamentals, assessment techniques, and professional consultations with hands-on practice.",
    outcomes: [
      "Practice scalp assessment with real clients",
      "Learn professional consultation techniques",
      "Get personalized nutrition and lifestyle guidance frameworks",
    ],
    image: {
      src: "/images/intensive-foundations-placeholder.png",
      alt: "In-person intensive placeholder imagery for Complete Trichology Training.",
    },
    slug: "trichocare-foundations-intensive",
  },
  {
    id: "intensive-salon",
    title: "Salon Team Training Day",
    duration: "1 day",
    investment: "£350 per participant",
    location: "We come to your salon",
    summary:
      "Bring expert scalp care to your salon. Train your whole team on assessments, treatments, and product recommendations that clients will value.",
    outcomes: [
      "Practice consultations with guided feedback",
      "Learn signature scalp treatment techniques",
      "Get tools to track results and grow revenue",
    ],
    image: {
      src: "/images/intensive-salon-placeholder.png",
      alt: "In-person intensive placeholder imagery for Salon Team Training Day.",
    },
    slug: "salon-scalp-health-consultancy",
  },
  {
    id: "intensive-regenerative-detox",
    title: "Advanced Scalp Treatment Workshop",
    duration: "1 day",
    investment: "£450 per participant",
    location: "Available in UK, Europe & North America",
    summary:
      "Master advanced scalp detox and treatment methods for complex conditions. Focused hands-on workshop for experienced practitioners.",
    outcomes: [
      "Advanced treatment protocols for sensitive scalps",
      "Professional massage and tool techniques",
      "Client aftercare and home treatment plans",
    ],
    image: {
      src: "/images/intensive-detox-placeholder.png",
      alt: "In-person intensive placeholder imagery for Advanced Scalp Treatment Workshop.",
    },
    slug: "regenerative-scalp-detox-lab",
  },
];

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-anita",
    quote:
      "Lorraine taught us how to talk about scalp health in a way our clients understand and value. Our consultation bookings have doubled.",
    author: "Anita Clarke",
    role: "Salon Director, Atelier Beauté",
  },
  {
    id: "testimonial-michael",
    quote:
      "This training gave me the confidence to specialize in scalp care. Lorraine's approach balances real science with practical client care.",
    author: "Michael Evans",
    role: "Certified Trichologist",
  },
  {
    id: "testimonial-isha",
    quote:
      "We added Lorraine's scalp treatments to our menu and clients love them. Retention is up and it's become our signature service.",
    author: "Isha Desai",
    role: "Founder, Root & Ritual",
  },
];

export type BlogHighlight = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  slug: string;
  published: string;
};

export const blogHighlights: BlogHighlight[] = [
  {
    id: "blog-hormonal",
    title: "Understanding Hormonal Hair Loss: A Practical Guide",
    excerpt:
      "Learn to recognize hormonal hair loss patterns and have supportive conversations with clients about treatment options.",
    category: "Clinical Guide",
    slug: "decoding-hormonal-hair-loss",
    published: "2025-10-02",
  },
  {
    id: "blog-detox",
    title: "Scalp Detox Treatments That Actually Work",
    excerpt:
      "Science-based detox techniques that cleanse without damaging the scalp's natural protective barrier.",
    category: "Treatment Methods",
    slug: "future-of-scalp-detox",
    published: "2025-09-24",
  },
  {
    id: "blog-ethical",
    title: "Building Trust Through Better Consultations",
    excerpt:
      "Practical tips and conversation frameworks for conducting scalp consultations that clients value and remember.",
    category: "Business Growth",
    slug: "ethical-consultations",
    published: "2025-09-10",
  },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "Who are these courses for?",
    answer:
      "Hair stylists, beauty therapists, and anyone interested in scalp health. The video lessons are perfect if you want to learn at your own pace. No prior experience needed.",
  },
  {
    question: "Can you train our salon team in person?",
    answer:
      "Yes! Lorraine travels to salons across the UK, Europe, and North America. We'll customize the training to fit your team's needs and schedule. Contact us to discuss dates and pricing.",
  },
  {
    question: "How do I access the video courses?",
    answer:
      "After purchase, you get instant download access. Watch as many times as you like—there's no expiry. For in-person training, we'll arrange a call to plan the details together.",
  },
];

export const services: Service[] = [
  {
    id: "service-consultation",
    name: "Personal Scalp Health Consultation",
    description:
      "Get expert assessment and a personalized treatment plan. Includes professional scalp imaging, health review, and product recommendations.",
    duration: "75 minutes",
    focus: ["Professional scalp imaging", "Health & lifestyle review", "Custom treatment plan"],
    image: {
      src: "/images/service-consultation-placeholder.png",
      alt: "Service imagery placeholder — replace public/images/service-consultation-placeholder.png.",
    },
    cta: {
      label: "Book appointment",
      href: "/contact",
    },
  },
  {
    id: "service-team-training",
    name: "Salon Team Training",
    description:
      "Comprehensive training for your salon team. Learn professional consultations, treatment techniques, and how to recommend products with confidence.",
    duration: "Full day",
    focus: ["Consultation skills", "Treatment techniques", "Product knowledge"],
    image: {
      src: "/images/service-training-placeholder.png",
      alt: "Service imagery placeholder — replace public/images/service-training-placeholder.png.",
    },
    cta: {
      label: "Plan your training",
      href: "/contact",
    },
  },
  {
    id: "service-detox",
    name: "Scalp Treatment Workshop",
    description:
      "One-day hands-on workshop teaching professional scalp detox treatments, massage techniques, and client aftercare guidance.",
    duration: "1 day",
    focus: ["Treatment methods", "Massage techniques", "Client aftercare"],
    image: {
      src: "/images/service-detox-placeholder.png",
      alt: "Service imagery placeholder — replace public/images/service-detox-placeholder.png.",
    },
    cta: {
      label: "View workshop dates",
      href: "/education",
    },
  },
];

