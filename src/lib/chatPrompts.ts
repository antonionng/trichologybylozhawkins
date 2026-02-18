import {
  services,
  videoLessons,
  inPersonIntensives,
  testimonials,
  faqItems,
} from "./content";

// Condition reference knowledge for the AI assistant
const conditionKnowledge = [
  {
    name: "Alopecia Areata",
    category: "Hair Loss",
    description: "Autoimmune condition causing patchy hair loss with well-demarcated shiny patches. Short exclamation hairs may appear at the periphery. Unpredictable but often resolves over time. Can occur at any age.",
    treatment: "GP can prescribe steroids (injected or topical) to suppress immune cells attacking follicles."
  },
  {
    name: "Male Pattern Hair Loss (MPHL)",
    category: "Hair Loss",
    description: "Androgenic alopecia beginning after puberty. Caused by DHT effects, progresses slowly over years to decades. Charted using Hamilton-Norwood scale. Inherited from either or both parents.",
    treatment: "Minoxidil solution, Finasteride tablets, Dutasteride, or hair transplantation."
  },
  {
    name: "Female Pattern Hair Loss (FPHL)",
    category: "Hair Loss",
    description: "Similar to MPHL with follicle miniaturization, often at inner frontal hairline. Genetically driven, charted using Ludwig scale. No cure but manageable.",
    treatment: "Minoxidil solution. Manage expectations - accelerated phases followed by stability periods."
  },
  {
    name: "Telogen Effluvium",
    category: "Hair Loss",
    description: "Sudden excess hair shedding. Causes include postpartum, illness, blood loss, medications, hormonal disorders, or nutritional deficiencies.",
    treatment: "Good prognosis once underlying cause is treated."
  },
  {
    name: "Traction Alopecia",
    category: "Hair Loss",
    description: "Hair loss from repeated pulling - ponytails, braids, cornrows, dreadlocks. Causes inflammation, soreness, or itching. May cause scarring if continued.",
    treatment: "Early intervention allows recovery. Remove tension and treat inflammation to prevent permanent loss."
  },
  {
    name: "Frontal Fibrosing Alopecia",
    category: "Hair Loss",
    description: "Scarring alopecia affecting the frontal hairline. Destroys follicles which are replaced by scar tissue.",
    treatment: "Hair will not regrow in scarred areas. Focus on halting progression."
  },
  {
    name: "Trichotillomania",
    category: "Behavioral",
    description: "Compulsive hair pulling from scalp, eyebrows, or eyelashes. Stress-related, often co-occurs with other habits. Provides sense of relief.",
    treatment: "For most resolves within 12 months; some have lifelong disorder. Requires behavioral intervention."
  },
  {
    name: "Seborrheic Dermatitis",
    category: "Scalp Condition",
    description: "Red, yellow, greasy flakes with inflammation. Associated with nasal folds and eyebrows. Genetic, yeast-related, or stress-triggered. Worse in winter.",
    treatment: "Long-term recurring condition that can be managed but not cured."
  },
  {
    name: "Psoriasis",
    category: "Scalp Condition",
    description: "Pink/silvery scaled plaques, often posterior hairline and above ears. Autoimmune, genetic, stress-related. Causes scalp tightness and itchiness.",
    treatment: "Can be managed but not cured."
  },
  {
    name: "Allergic Contact Dermatitis",
    category: "Dermatitis",
    description: "Type 4 reaction with redness, heat, swelling, blistering. Occurs 12-72 hours after exposure. Once sensitized, lifelong condition.",
    treatment: "Avoid allergen. GP/Pharmacy for hydrocortisone, antihistamines, or topical steroids."
  },
  {
    name: "Irritant Contact Dermatitis (ICD)",
    category: "Dermatitis",
    description: "Skin barrier damage from chemicals or detergents. Common in hairdressers. Causes soreness, redness, cracked or weeping skin.",
    treatment: "Temporary reaction. Avoid irritants, use emollient or moisturizing cream."
  },
  {
    name: "Folliculitis",
    category: "Infection",
    description: "Inflammation of hair follicle. Causes itching, burning, redness. Can be bacterial or friction-based.",
    treatment: "Very good prognosis - easily treated and curable."
  },
  {
    name: "Tinea Capitis (Ringworm)",
    category: "Infection",
    description: "Fungal infection causing dry scaling with moth-eaten hair loss. Highly contagious via combs or towels.",
    treatment: "GP referral required. Positive prognosis once treated."
  }
];

export function buildSystemPrompt(): string {
  const servicesInfo = services
    .map(
      (s) =>
        `- ${s.name}: ${s.description} (${s.duration}). Focus: ${s.focus.join(", ")}`
    )
    .join("\n");

  const videoLessonsInfo = videoLessons
    .map(
      (v) =>
        `- ${v.title} (${v.category}): ${v.duration}, ${v.investment}. ${v.summary}`
    )
    .join("\n");

  const intensivesInfo = inPersonIntensives
    .map(
      (i) =>
        `- ${i.title}: ${i.duration}, ${i.investment}, ${i.location}. ${i.summary}`
    )
    .join("\n");

  const faqInfo = faqItems
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");

  const conditionsInfo = conditionKnowledge
    .map(
      (c) =>
        `### ${c.name} (${c.category})\n${c.description}\nTreatment: ${c.treatment}`
    )
    .join("\n\n");

  return `You are Lorraine Hawkins' AI assistant, helping visitors to her trichology and scalp health platform.

## Your Role & Personality

You embody Lorraine's professional yet warm approach to trichology. You are:
- Knowledgeable and evidence-based, but never clinical or cold
- Helpful and educational without being pushy or sales-focused
- Patient and attentive, asking clarifying questions when needed
- Supportive and encouraging about scalp health journeys
- Clear and practical in your guidance

## Your Expertise

You have deep knowledge of:
- Trichology (scalp health, hair science, common conditions)
- Scalp assessment techniques and diagnostics
- Treatment approaches that protect skin health
- Professional consultation practices
- Ingredient science for scalp care products
- Training methods for stylists and beauty professionals

## Available Services & Offerings

### Personal Services
${servicesInfo}

### Video Lessons (Online)
${videoLessonsInfo}

### In-Person Intensives
${intensivesInfo}

## Frequently Asked Questions
${faqInfo}

## Hair & Scalp Condition Reference

Use this knowledge base to provide accurate information about common conditions:

${conditionsInfo}

## What You Can Help With

1. **Answer trichology questions**: Provide educational guidance on scalp health, hair loss, conditions, treatments
2. **Recommend services**: Help visitors find the right service, course, or training for their needs
3. **Facilitate bookings**: Collect information for consultation requests and course enquiries
4. **Guide through offerings**: Explain what's available and help users choose
5. **Create connections**: Capture contact details (with permission) for follow-up

## Available Actions

When appropriate, you can:
- Create or update contact records (always ask permission first)
- Submit course enquiries with visitor details
- Create consultation booking requests
- Log the conversation for follow-up by Lorraine's team

## Important Guidelines

- Always be honest about what you know and don't know
- For medical conditions, encourage professional medical consultation
- Don't make exaggerated claims or guarantees about results
- Protect visitor privacy - only collect information with clear consent
- If you're unsure, suggest connecting them with Lorraine directly
- Keep responses concise but thorough - aim for 2-3 paragraphs max
- Use natural, conversational language
- When discussing prices, always mention them clearly and accurately

## Conversation Style

- Start with a warm greeting and ask how you can help
- Listen carefully and ask clarifying questions
- Provide specific, actionable next steps
- Suggest relevant services or resources naturally
- End with a clear call-to-action when appropriate

Remember: You're here to educate, guide, and connect - not to hard-sell. Build trust through helpful, authentic conversation.`;
}

export const SUGGESTED_PROMPTS = [
  "What's the difference between the video lessons and in-person training?",
  "I'm experiencing scalp sensitivity - what should I do?",
  "How do I book a consultation with Lorraine?",
  "I want to add scalp services to my salon - where do I start?",
  "Tell me about the Complete Trichology Training course",
];

export const ACTION_PROMPT_TEMPLATES = {
  createContact: `Based on our conversation, would you like me to save your details so Lorraine's team can follow up with you? I'll need your name and email address.`,
  
  submitEnquiry: `I can submit a course enquiry for you right away. This will put you in touch with Lorraine's team who can answer specific questions and help with enrollment. May I have your name, email, and phone number?`,
  
  bookConsultation: `Let me help you request a consultation booking. I'll need a few details: your name, email, phone number, and a brief description of what you'd like to discuss. The team will follow up within 24 hours to confirm a time.`,
};













