/**
 * Standalone seed script for Knowledge Hub articles.
 * Run with: npx tsx scripts/seed-knowledge-hub.ts
 *
 * Safe to re-run — uses upsert for the collection and skips existing slugs.
 */
import { PrismaClient, CollectionType, EntryStatus } from "@prisma/client";

const prisma = new PrismaClient();

const articles = [
  // ── Original 3 clinical articles ──────────────────────────────────────
  {
    title: "Understanding Hormonal Hair Loss: A Practical Guide",
    slug: "decoding-hormonal-hair-loss",
    summary:
      "Learn to recognize hormonal hair loss patterns and have supportive conversations with clients about treatment options.",
    status: EntryStatus.PUBLISHED,
    publishedAt: new Date("2025-10-02"),
    meta: {
      category: "Hair Loss",
      readTime: "8 min read",
      heroImage:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
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
        { type: "paragraph", text: "A healthy scalp provides the best environment for hair growth. Focus on gentle cleansing, balancing the microbiome, and reducing inflammation." },
        { type: "subheading", text: "Nutritional support guidance" },
        { type: "paragraph", text: "While you shouldn't prescribe supplements, you can discuss the importance of protein, iron, and B vitamins for hair health. Encourage clients to discuss their diet with their healthcare provider." },
        { type: "subheading", text: "Stress management" },
        { type: "paragraph", text: "Hair loss is stressful, and stress worsens hair loss—it's a vicious cycle. Your calm, knowledgeable approach can help break this cycle." },
        { type: "heading", text: "When to refer onwards" },
        { type: "paragraph", text: "You should encourage clients to see their doctor if they have:" },
        { type: "list", items: ["Sudden or severe hair loss", "Hair loss accompanied by other symptoms (fatigue, weight changes, irregular periods)", "No improvement after 3-6 months of scalp care", "Concerns about medication side effects"] },
        { type: "callout", text: "The most important thing you can offer is reassurance backed by knowledge. Help clients understand that hormonal hair loss is common, often temporary, and manageable with the right support." },
      ],
    },
  },
  {
    title: "Scalp Detox Treatments That Actually Work",
    slug: "future-of-scalp-detox",
    summary:
      "Science-based detox techniques that cleanse without damaging the scalp's natural protective barrier.",
    status: EntryStatus.PUBLISHED,
    publishedAt: new Date("2025-09-24"),
    meta: {
      category: "Scalp Health",
      readTime: "6 min read",
      heroImage:
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80",
    },
    content: {
      sections: [
        { type: "paragraph", text: "Scalp detox has become a buzzword in hair care, but not all approaches are created equal. Many popular methods can actually damage the scalp's natural protective barrier, causing more harm than good. Here's what actually works." },
        { type: "heading", text: "Understanding the scalp microbiome" },
        { type: "paragraph", text: "Your scalp is home to a diverse community of microorganisms that work together to protect skin health. A good detox treatment supports this ecosystem rather than destroying it." },
        { type: "list", items: ["Prevents water loss and keeps skin hydrated", "Contains antimicrobial compounds that fight harmful bacteria", "Delivers vitamin E and other antioxidants to hair follicles", "Creates an acidic environment that beneficial microbes thrive in"] },
        { type: "heading", text: "Effective detox techniques" },
        { type: "subheading", text: "1. Pre-cleanse oil treatment" },
        { type: "paragraph", text: "Apply a lightweight oil (jojoba or squalane work well) to the scalp 15-20 minutes before shampooing. Massage gently with fingertips in circular motions. This dissolves oil-soluble buildup and sebum plugs without stripping the scalp." },
        { type: "subheading", text: "2. Clay-based masks (used correctly)" },
        { type: "paragraph", text: "Bentonite or kaolin clay can absorb excess sebum and impurities. Apply only to the scalp, not the hair length. Leave for 5-10 minutes maximum—never let it dry completely." },
        { type: "subheading", text: "3. Enzyme exfoliation" },
        { type: "paragraph", text: "Fruit enzymes (papaya, pineapple) gently break down dead skin cells without mechanical scrubbing. Look for products with papain or bromelain." },
        { type: "heading", text: "What to avoid" },
        { type: "list", items: ["Harsh sulfate shampoos marketed as 'deep cleansing'", "Apple cider vinegar rinses stronger than 1:4 dilution", "Baking soda scrubs—highly alkaline and disrupts pH", "Aggressive physical scrubs with large particles", "Frequent detoxing—once a month is plenty"] },
        { type: "callout", text: "The best scalp detox is one your client doesn't even notice. They should feel refreshed and clean, not stripped or irritated." },
      ],
    },
  },
  {
    title: "Building Trust Through Better Consultations",
    slug: "ethical-consultations",
    summary:
      "Practical tips and conversation frameworks for conducting scalp consultations that clients value and remember.",
    status: EntryStatus.PUBLISHED,
    publishedAt: new Date("2025-09-10"),
    meta: {
      category: "Consultations",
      readTime: "7 min read",
      heroImage:
        "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=1200&q=80",
    },
    content: {
      sections: [
        { type: "paragraph", text: "A consultation isn't just a prelude to treatment—it's where trust is built or broken. Get this right, and clients become advocates. Get it wrong, and even excellent technical work won't save the relationship." },
        { type: "heading", text: "Why consultations matter" },
        { type: "paragraph", text: "Clients who value consultations are the ones who stay with you long-term. They're not price shopping—they're investing in expertise." },
        { type: "list", items: ["Makes the client feel heard and understood", "Educates without overwhelming", "Creates clear next steps that feel collaborative, not prescribed"] },
        { type: "heading", text: "The consultation framework" },
        { type: "subheading", text: "1. Start with their story (5-7 minutes)" },
        { type: "paragraph", text: "Begin with open-ended questions and actually listen to the answers. Don't jump to solutions yet." },
        { type: "subheading", text: "2. Assessment and education (10-15 minutes)" },
        { type: "paragraph", text: "This is where your expertise shines. But here's the key: explain what you're seeing as you go." },
        { type: "subheading", text: "3. Collaborative planning (8-10 minutes)" },
        { type: "paragraph", text: "This isn't where you sell—it's where you co-create a plan." },
        { type: "heading", text: "Documentation and follow-up" },
        { type: "list", items: ["Take detailed notes while it's fresh", "Send a follow-up email summarizing the plan", "Schedule the next appointment before they leave", "Follow up in 2-3 days to check how they're getting on"] },
        { type: "callout", text: "A rushed free consultation attracts price shoppers. A thorough paid consultation attracts clients who value expertise. Choose your business model accordingly." },
        { type: "paragraph", text: "Your consultations are your reputation. Make them count." },
      ],
    },
  },

  // ── Marketing & business growth articles ──────────────────────────────
  {
    title: "How to Market Your Trichology Practice Without Feeling Salesy",
    slug: "marketing-trichology-practice",
    summary:
      "Practical marketing strategies for trichologists and scalp care professionals who want to grow their practice authentically.",
    status: EntryStatus.PUBLISHED,
    publishedAt: new Date("2026-01-15"),
    meta: {
      category: "Professional Development",
      readTime: "9 min read",
      heroImage:
        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
    },
    content: {
      sections: [
        { type: "paragraph", text: "Most trichologists didn't get into this profession to become marketers. You trained to help people with their hair and scalp health. But here's the reality: if people don't know you exist, you can't help anyone. Marketing isn't about being pushy — it's about making it easy for the right people to find you." },
        { type: "heading", text: "Why education-led marketing works" },
        { type: "paragraph", text: "The best marketing for a trichology practice doesn't look like marketing at all. It looks like education. When you share genuine knowledge — about conditions, treatments, what to look for, when to seek help — you're simultaneously building trust and demonstrating expertise." },
        { type: "paragraph", text: "Think about it from your potential client's perspective. They're worried about their hair. They're searching online for answers. If they find your article explaining exactly what they're experiencing, in clear and compassionate language, who do you think they'll book with?" },
        { type: "heading", text: "Content that converts" },
        { type: "subheading", text: "Before-and-after education" },
        { type: "paragraph", text: "Not just photos (though those help with consent). Explain the journey. What did the client present with? What was the assessment? What approach did you take and why? How long did improvement take? This tells a story that potential clients can see themselves in." },
        { type: "subheading", text: "Myth-busting posts" },
        { type: "paragraph", text: "Hair care is full of misinformation. Every time you correct a myth with evidence-based facts, you position yourself as the trustworthy expert. Examples: 'Does wearing hats cause hair loss?', 'Can you detox your scalp with apple cider vinegar?', 'Do expensive shampoos actually work better?'" },
        { type: "subheading", text: "Behind-the-scenes" },
        { type: "paragraph", text: "Show your workspace, your tools, your process. People are curious about what a trichology consultation actually involves. Demystifying the experience reduces anxiety about booking." },
        { type: "heading", text: "Your website as your best salesperson" },
        { type: "paragraph", text: "Your website should answer three questions within 10 seconds:" },
        { type: "list", items: ["What do you do? (Trichology — scalp and hair health expertise)", "Who do you help? (People experiencing hair loss, scalp conditions, professionals wanting to upskill)", "What should I do next? (Book a consultation, explore courses, read articles)"] },
        { type: "paragraph", text: "Every page should have a clear next step. Don't make people hunt for how to book or how to contact you." },
        { type: "heading", text: "Social media without the overwhelm" },
        { type: "paragraph", text: "You don't need to be everywhere. Pick one or two platforms where your audience actually spends time, and show up consistently. For most trichologists:" },
        { type: "list", items: ["Instagram — great for visual before/after content and educational reels", "Facebook — useful for local community groups and an older demographic", "LinkedIn — excellent if you're targeting professionals and salon owners", "TikTok — high reach for educational short-form content, especially among younger audiences"] },
        { type: "paragraph", text: "Post 3-4 times per week rather than burning out trying to post daily. Consistency beats frequency every time." },
        { type: "heading", text: "Referral networks" },
        { type: "paragraph", text: "Some of your best clients will come from other professionals. Build relationships with:" },
        { type: "list", items: ["GPs and dermatologists who see hair loss patients but don't have time for extended consultations", "Salons that encounter clients with scalp issues beyond their expertise", "Nutritionists and wellness practitioners who understand the hair-health connection", "Mental health professionals whose clients experience stress-related hair loss"] },
        { type: "paragraph", text: "Don't just hand over business cards. Offer to give a short talk, share educational materials they can pass to patients, or provide a referral guide that makes it easy for them to recommend you." },
        { type: "heading", text: "Pricing as marketing" },
        { type: "paragraph", text: "How you price communicates what you're worth. Undercharging attracts price-sensitive clients who are harder to retain. Charging appropriately attracts people who value expertise." },
        { type: "callout", text: "Marketing your practice isn't about convincing people to buy something they don't need. It's about making sure the people who genuinely need your help can find you. That's a service, not a sales pitch." },
        { type: "paragraph", text: "Start with one thing this week. Write one educational post. Update one page on your website. Reach out to one potential referral partner. Small, consistent steps compound into a thriving practice." },
      ],
    },
  },
  {
    title: "Social Media for Hair Professionals: A No-Nonsense Guide",
    slug: "social-media-hair-professionals",
    summary:
      "How to use Instagram, TikTok, and LinkedIn effectively to grow your client base — without spending hours creating content.",
    status: EntryStatus.PUBLISHED,
    publishedAt: new Date("2026-01-28"),
    meta: {
      category: "Professional Development",
      readTime: "7 min read",
      heroImage:
        "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1200&q=80",
    },
    content: {
      sections: [
        { type: "paragraph", text: "Social media can feel like a full-time job on top of your actual full-time job. But it doesn't have to be. The professionals who grow their practices through social media aren't the ones spending five hours a day on Instagram. They're the ones who show up consistently with genuinely useful content." },
        { type: "heading", text: "The content pillars that work" },
        { type: "paragraph", text: "Every effective social media strategy for hair professionals comes down to four content types. Rotate between them and you'll never run out of things to post:" },
        { type: "list", items: ["Educational — teach something your audience didn't know ('Why your hair sheds more in autumn')", "Proof — show results, transformations, happy clients (with consent)", "Personal — share your why, your journey, your philosophy", "Action — tell people what to do next (book, learn, explore)"] },
        { type: "heading", text: "Instagram: visual storytelling" },
        { type: "paragraph", text: "Instagram remains the strongest platform for hair professionals because it's visual. Your best-performing content will be:" },
        { type: "list", items: ["Reels showing before-and-after scalp improvements (30-60 seconds)", "Carousel posts breaking down a topic into slides", "Stories showing your daily work life and personality", "Static posts with a clear, bold statement and detailed caption"] },
        { type: "paragraph", text: "Pro tip: write your captions first, then create the visual. The caption is where the value lives. The visual just stops the scroll." },
        { type: "heading", text: "TikTok: reach new audiences" },
        { type: "paragraph", text: "TikTok's algorithm shows your content to people who've never heard of you — which is exactly what you want when building awareness. Keep videos under 90 seconds, lead with the hook in the first 2 seconds, and don't over-produce. Authenticity wins on TikTok." },
        { type: "paragraph", text: "Video ideas that perform well:" },
        { type: "list", items: ["'Things your hairdresser should be checking' — educational shock value", "'3 signs your scalp needs attention' — list formats perform well", "'Replying to comments' — engage your community and show expertise", "'What I actually do as a trichologist' — demystify your profession"] },
        { type: "heading", text: "LinkedIn: professional authority" },
        { type: "paragraph", text: "If you train other professionals or work B2B (salon training, speaking engagements), LinkedIn is essential. Share case studies, training insights, industry observations, and opinion pieces. LinkedIn rewards longer, thoughtful posts." },
        { type: "heading", text: "The batch-and-schedule method" },
        { type: "paragraph", text: "Set aside 2-3 hours once a week to create all your content for the coming week. Write all captions in one sitting (you'll find a rhythm). Film all videos back-to-back. Schedule everything using a free tool like Later or Buffer." },
        { type: "paragraph", text: "This approach means you spend a focused block of time on content, then forget about it for the rest of the week. Your feed stays active while you focus on clients." },
        { type: "callout", text: "The best social media strategy is one you'll actually stick with. Three good posts a week, every week, will outperform daily posting that burns out after a month." },
      ],
    },
  },
  {
    title: "Case Study: Rebuilding a Client's Confidence After Alopecia Areata",
    slug: "case-study-alopecia-areata-confidence",
    summary:
      "How a structured consultation and treatment approach helped a client manage alopecia areata and regain her self-confidence.",
    status: EntryStatus.PUBLISHED,
    publishedAt: new Date("2026-02-05"),
    meta: {
      category: "Case Study",
      readTime: "6 min read",
      heroImage:
        "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80",
    },
    content: {
      sections: [
        { type: "paragraph", text: "Sarah (name changed) first came to see me after discovering two coin-sized patches of hair loss behind her right ear. She was 34, otherwise healthy, and had no family history of hair loss. She was, understandably, terrified." },
        { type: "heading", text: "Initial assessment" },
        { type: "paragraph", text: "During our first consultation, the priority wasn't jumping to treatment. It was listening. Sarah told me she'd first noticed the patches three weeks earlier, after a particularly stressful period at work. She'd been to her GP who confirmed alopecia areata but — in her words — 'just said it might grow back and sent me on my way.'" },
        { type: "paragraph", text: "What Sarah needed was someone to take her seriously, explain what was happening in language she could understand, and give her a clear plan. That's exactly what a good trichology consultation provides." },
        { type: "heading", text: "What we found" },
        { type: "paragraph", text: "Scalp examination confirmed two well-defined patches of non-scarring alopecia on the right occipital area. The scalp skin within the patches appeared healthy — smooth, normal colour, no scaling or scarring. I could see some very fine vellus hairs beginning to emerge in parts of the patches, which was encouraging." },
        { type: "list", items: ["Two patches: approximately 2cm and 3cm diameter", "No signs of scarring or scalp disease", "Early vellus regrowth visible under magnification", "Surrounding hair density and quality normal", "No nail changes or other autoimmune markers noted"] },
        { type: "heading", text: "The approach" },
        { type: "paragraph", text: "I was honest with Sarah about what trichology can and can't do for alopecia areata. We can't cure it or guarantee regrowth. But we can support scalp health, reduce inflammation, manage stress, and create conditions that give hair the best chance of recovery." },
        { type: "subheading", text: "Scalp health support" },
        { type: "paragraph", text: "We started with a gentle anti-inflammatory scalp care routine. No harsh products, no aggressive treatments. The goal was to calm the scalp environment and support the follicles that were trying to recover." },
        { type: "subheading", text: "Stress management" },
        { type: "paragraph", text: "Given the stress trigger, we talked about stress management strategies and I recommended she explore this with her GP. The connection between stress and alopecia areata flares is well-documented." },
        { type: "subheading", text: "Emotional support and realistic expectations" },
        { type: "paragraph", text: "Perhaps the most important part. I told Sarah that alopecia areata often resolves on its own, that the vellus hairs were a positive sign, and that we'd monitor progress together. Having someone who understood her condition and wasn't dismissive made a significant difference to her anxiety levels." },
        { type: "heading", text: "Outcome" },
        { type: "paragraph", text: "Over three months, Sarah's patches showed progressive regrowth. The vellus hairs thickened and pigmented. By month five, both patches had largely filled in with terminal hair. She continued with the gentle scalp care routine and stress management." },
        { type: "paragraph", text: "Was this because of our treatment? Honestly, alopecia areata often resolves spontaneously. What I can say is that Sarah felt supported throughout, her anxiety about the condition reduced significantly, and she had a professional monitoring her progress rather than worrying alone." },
        { type: "callout", text: "Sometimes the most valuable thing you can offer a client isn't a treatment — it's knowledge, reassurance, and a plan. That's what keeps them coming back and referring others." },
        { type: "heading", text: "Lessons for practitioners" },
        { type: "list", items: ["Always listen before you assess. The emotional context matters as much as the clinical picture.", "Be honest about what you can and can't influence. Clients respect transparency.", "Document everything. Progress photos (with consent) are powerful for the client and for your practice.", "Follow up proactively. A quick check-in message shows you care beyond the appointment.", "Know when to refer. If patches are extensive or rapidly progressing, dermatology referral is essential."] },
      ],
    },
  },
  {
    title: "Growing Your Salon's Revenue with Scalp Care Services",
    slug: "salon-revenue-scalp-care",
    summary:
      "How adding professional scalp consultations and treatments can transform your salon's average ticket value and client retention.",
    status: EntryStatus.PUBLISHED,
    publishedAt: new Date("2026-02-10"),
    meta: {
      category: "Professional Development",
      readTime: "8 min read",
      heroImage:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    },
    content: {
      sections: [
        { type: "paragraph", text: "Scalp care is no longer a niche offering — it's becoming the service that differentiates salons from the competition. Clients are increasingly aware that healthy hair starts with a healthy scalp, and they're willing to pay for expertise. The question isn't whether to add scalp services — it's how to do it profitably." },
        { type: "heading", text: "The business case" },
        { type: "paragraph", text: "Let's look at the numbers. A typical cut-and-colour appointment might average £80-120. Add a 15-minute scalp consultation as an upsell and you're adding £35-50 to every willing client. If even a quarter of your clients book this each month, the revenue adds up quickly." },
        { type: "paragraph", text: "But it's not just about the immediate revenue. Scalp care services create:" },
        { type: "list", items: ["Higher rebooking rates — clients who receive scalp assessments return more frequently", "Stronger product sales — when you've assessed someone's scalp, product recommendations have authority", "Better client retention — you're offering something most salons can't", "Premium positioning — scalp expertise positions your salon as health-focused, not just aesthetic", "Referral growth — clients with scalp concerns are desperate for help and tell everyone when they find it"] },
        { type: "heading", text: "Services to introduce" },
        { type: "subheading", text: "Tier 1: Scalp health check (add-on)" },
        { type: "paragraph", text: "A quick 10-15 minute scalp assessment that can be added to any existing appointment. Examine the scalp, note any concerns, recommend products or further treatment. Price: £25-40. This is your gateway service — low barrier, high value perception." },
        { type: "subheading", text: "Tier 2: Full scalp consultation (standalone)" },
        { type: "paragraph", text: "A dedicated 45-60 minute appointment including detailed scalp imaging, lifestyle assessment, and personalised treatment plan. Price: £75-120. This is where your team's training really shines." },
        { type: "subheading", text: "Tier 3: Scalp treatment package" },
        { type: "paragraph", text: "A series of 4-6 scalp treatments over 8-12 weeks, with progress tracking and home care guidance. Price: £300-500 for the package. This drives recurring revenue and builds deep client relationships." },
        { type: "heading", text: "Training your team" },
        { type: "paragraph", text: "Your team doesn't need to become trichologists overnight. Start with foundations:" },
        { type: "list", items: ["Basic scalp anatomy and the hair growth cycle", "How to conduct a professional scalp check in 10 minutes", "Recognising the 5-6 most common scalp conditions", "When to recommend further assessment vs. when to refer to a doctor", "Product knowledge — what ingredients actually do what they claim"] },
        { type: "paragraph", text: "A focused training day with an experienced trichologist can give your team the confidence to start offering these services immediately. The investment pays for itself within weeks." },
        { type: "heading", text: "Marketing your new services" },
        { type: "paragraph", text: "Don't just add scalp services to your menu and hope people notice. Launch them:" },
        { type: "list", items: ["Email your existing client base with an educational piece about scalp health, then introduce the service", "Offer a limited-time introductory price for existing clients", "Post before-and-after scalp improvement photos on social media (with consent)", "Partner with local wellness practitioners for cross-referrals", "Add a 'Scalp Health' section to your website with educational content"] },
        { type: "callout", text: "The salons that thrive in the next decade will be the ones that move beyond purely aesthetic services into genuine health and wellness. Scalp care is where that transition begins." },
      ],
    },
  },
  {
    title: "5 Mistakes New Trichologists Make (And How to Avoid Them)",
    slug: "mistakes-new-trichologists",
    summary:
      "Common pitfalls that hold back new trichology practitioners — and the practical fixes that accelerate your success.",
    status: EntryStatus.PUBLISHED,
    publishedAt: new Date("2025-11-18"),
    meta: {
      category: "Professional Development",
      readTime: "6 min read",
      heroImage:
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80",
    },
    content: {
      sections: [
        { type: "paragraph", text: "Starting a trichology practice is exciting, but the early months can be humbling. After training hundreds of practitioners and mentoring many through their first year, I've seen the same mistakes come up again and again. Here's what they are and how to sidestep them." },
        { type: "heading", text: "1. Trying to know everything before you start" },
        { type: "paragraph", text: "Perfectionism is the enemy of progress. You don't need to be an expert in every scalp condition before you see your first client. You need solid foundations, a good consultation framework, and the honesty to say 'I'd like to look into that further and get back to you' when something is outside your current knowledge." },
        { type: "paragraph", text: "The fix: start with what you know well — the common conditions, the standard assessments, the typical client concerns. Your expertise will deepen with every client you see." },
        { type: "heading", text: "2. Undercharging (or not charging at all)" },
        { type: "paragraph", text: "New practitioners often undervalue their consultations because they feel they're 'still learning.' But you've invested time, money, and effort in your training. Your clients are paying for your knowledge and your framework, not a specific number of years' experience." },
        { type: "paragraph", text: "The fix: research what others in your area charge. Set your prices confidently. Remember that low prices attract clients who don't value what you do. It's better to have fewer clients at the right price than many at the wrong one." },
        { type: "heading", text: "3. Neglecting the business side" },
        { type: "paragraph", text: "Clinical skills are essential but they won't build a practice on their own. You also need a professional website, a way for people to book, basic bookkeeping, and a plan for how clients will find you." },
        { type: "paragraph", text: "The fix: block out time each week specifically for business development. Even two hours a week on marketing, networking, or admin will compound over time." },
        { type: "heading", text: "4. Trying to diagnose instead of assess" },
        { type: "paragraph", text: "Unless you're medically qualified, your role is assessment and support, not diagnosis. New trichologists sometimes feel pressure to give definitive answers about conditions. This can lead you into uncomfortable territory and potentially into trouble." },
        { type: "paragraph", text: "The fix: frame your findings as observations and assessments. 'What I'm seeing is consistent with...' rather than 'You have...' Know your scope and refer confidently when needed." },
        { type: "heading", text: "5. Working in isolation" },
        { type: "paragraph", text: "Trichology can be a lonely profession, especially if you're working independently. Without peers to discuss cases with, ask questions, or share challenges, it's easy to lose confidence or develop blind spots." },
        { type: "paragraph", text: "The fix: join professional communities, attend conferences, find a mentor, or connect with other practitioners online. The best trichologists never stop learning from each other." },
        { type: "callout", text: "Every expert was once a beginner. The practitioners who succeed aren't the ones who avoid all mistakes — they're the ones who learn from them quickly and keep showing up." },
      ],
    },
  },
  {
    title: "Client Retention: Why Your Best Marketing Is the Client Already in Your Chair",
    slug: "client-retention-strategies",
    summary:
      "Proven strategies to turn one-time consultations into long-term client relationships that sustain your practice.",
    status: EntryStatus.PUBLISHED,
    publishedAt: new Date("2026-01-05"),
    meta: {
      category: "Professional Development",
      readTime: "7 min read",
      heroImage:
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
    },
    content: {
      sections: [
        { type: "paragraph", text: "Acquiring a new client costs five times more than retaining an existing one. Yet most practitioners spend almost all their marketing energy on finding new clients and almost none on keeping the ones they have. The maths doesn't add up." },
        { type: "heading", text: "Why clients don't come back" },
        { type: "paragraph", text: "Before we talk about retention strategies, let's be honest about why clients leave:" },
        { type: "list", items: ["They forgot about you — out of sight, out of mind", "They didn't see clear results or understand the timeline", "They felt like a number, not a person", "Rebooking was inconvenient or unclear", "They found someone closer, cheaper, or more visible online"] },
        { type: "paragraph", text: "Notice that most of these aren't about your clinical skills. They're about experience and communication." },
        { type: "heading", text: "The retention framework" },
        { type: "subheading", text: "1. Book the next appointment before they leave" },
        { type: "paragraph", text: "This is the single most effective retention tactic. When a client is in your chair, they're engaged and motivated. Book their follow-up right then. 'I'd like to see you in 6 weeks to check progress — shall we get that in the diary now?'" },
        { type: "subheading", text: "2. Follow up within 48 hours" },
        { type: "paragraph", text: "A quick message — email or text — checking how they're getting on with their new routine shows you care beyond the transaction. It also gives them a chance to ask questions they forgot during the appointment." },
        { type: "subheading", text: "3. Send progress reminders" },
        { type: "paragraph", text: "If you've taken scalp photos (with consent), send a comparison at their next visit. Seeing visual improvement — even subtle improvement — is incredibly motivating. It validates their investment and your expertise." },
        { type: "subheading", text: "4. Educate between appointments" },
        { type: "paragraph", text: "Share relevant articles, tips, or product information between visits. Not sales pitches — genuine value. If you see a relevant article about their condition, forward it with a personal note. This keeps you top of mind without being pushy." },
        { type: "subheading", text: "5. Make rebooking effortless" },
        { type: "paragraph", text: "Online booking, automated reminders, easy rescheduling. Every friction point in the booking process is a point where clients drop off. Make it as easy as possible to say yes." },
        { type: "heading", text: "The lifetime value perspective" },
        { type: "paragraph", text: "A single consultation might be worth £80. But a client who stays with you for three years, booking quarterly consultations and purchasing recommended products? That's potentially £1,500+ in lifetime value. And they're referring friends the entire time." },
        { type: "paragraph", text: "When you view every client interaction through the lens of lifetime value rather than single transaction value, your entire approach shifts. You invest more in the experience, follow-up, and relationship — and the revenue follows." },
        { type: "callout", text: "Retention isn't a tactic — it's a philosophy. When you genuinely care about your clients' outcomes more than your next booking, they feel it. And they stay." },
      ],
    },
  },
  {
    title: "Stress-Related Hair Loss: What Every Client Needs to Hear",
    slug: "stress-related-hair-loss-guide",
    summary:
      "How stress triggers hair shedding, why there's usually a delay, and how to support clients through recovery with evidence-based guidance.",
    status: EntryStatus.PUBLISHED,
    publishedAt: new Date("2025-12-08"),
    meta: {
      category: "Hair Loss",
      readTime: "6 min read",
      heroImage:
        "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80",
    },
    content: {
      sections: [
        { type: "paragraph", text: "Stress-related hair loss — medically known as telogen effluvium — is one of the most common reasons clients seek trichology advice. Understanding the mechanism, the timeline, and how to communicate about it effectively can make a huge difference to anxious clients." },
        { type: "heading", text: "The stress-shedding timeline" },
        { type: "paragraph", text: "Here's what catches most clients off guard: hair loss from stress typically starts 2-3 months after the stressful event, not during it. By the time they notice increased shedding, the stressor may have already passed, which creates confusion and anxiety." },
        { type: "paragraph", text: "This delay happens because stress pushes hair follicles prematurely into the telogen (resting) phase. Those follicles then shed their hairs 2-3 months later as part of the natural cycle. It's not that stress causes immediate hair fall — it sets a delayed reaction in motion." },
        { type: "heading", text: "Common triggers" },
        { type: "list", items: ["Major life events: bereavement, divorce, job loss, moving house", "Physical stress: surgery, illness, crash dieting, childbirth", "Chronic stress: ongoing work pressure, caring responsibilities, financial worry", "Medication changes: starting or stopping certain drugs", "Nutritional deficiency: particularly iron, B12, zinc, and protein"] },
        { type: "heading", text: "What clients need to hear" },
        { type: "subheading", text: "Validation" },
        { type: "paragraph", text: "'This is real, it's happening, and you're not imagining it.' Clients often feel dismissed by friends or even healthcare providers who say 'it's just stress.' Acknowledge that stress-related hair loss is a genuine physiological response." },
        { type: "subheading", text: "Explanation" },
        { type: "paragraph", text: "Walk them through the timeline clearly. When they understand why there's a delay between the stress and the shedding, it often reduces anxiety. Knowledge is reassuring." },
        { type: "subheading", text: "Realistic timelines" },
        { type: "paragraph", text: "Hair regrowth typically begins within 3-6 months once the trigger is resolved. Full recovery can take 12-18 months. Be honest about this. Setting realistic expectations prevents disappointment and builds trust." },
        { type: "subheading", text: "What they can do" },
        { type: "list", items: ["Focus on overall health: sleep, nutrition, gentle exercise", "Avoid over-treating the hair — harsh products and heat styling add stress to already compromised follicles", "Consider gentle scalp massage to improve circulation", "Be patient with regrowth — new hairs may initially appear finer or shorter", "Seek medical advice if shedding continues beyond 6 months or is accompanied by other symptoms"] },
        { type: "heading", text: "When it's more than telogen effluvium" },
        { type: "paragraph", text: "Not all stress-related shedding is simple telogen effluvium. Refer to a dermatologist if you see:" },
        { type: "list", items: ["Patchy loss rather than diffuse thinning", "Scarring or changes to the scalp skin", "Shedding continuing beyond 6 months with no improvement", "Loss of eyebrows, eyelashes, or body hair alongside scalp loss", "Signs of underlying autoimmune conditions"] },
        { type: "callout", text: "Your role isn't to eliminate stress from someone's life. It's to help them understand what's happening, reassure them it's manageable, and support their scalp health while their body recovers. That's incredibly valuable." },
      ],
    },
  },
];

async function main() {
  console.log("Seeding Knowledge Hub articles...\n");

  // Upsert the blog-posts collection
  const collection = await prisma.collection.upsert({
    where: { slug: "blog-posts" },
    update: {},
    create: {
      name: "Blog Posts",
      slug: "blog-posts",
      description: "Knowledge Hub articles, guides, and case studies",
      type: CollectionType.DOCUMENT,
    },
  });

  console.log(`Collection: ${collection.name} (${collection.id})\n`);

  let created = 0;
  let skipped = 0;

  for (const article of articles) {
    const existing = await prisma.entry.findFirst({
      where: { collectionId: collection.id, slug: article.slug },
    });

    if (existing) {
      console.log(`  SKIP  ${article.slug} (already exists)`);
      skipped++;
      continue;
    }

    await prisma.entry.create({
      data: {
        collectionId: collection.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        status: article.status,
        publishedAt: article.publishedAt,
        meta: article.meta,
        content: article.content,
      },
    });

    console.log(`  OK    ${article.slug}`);
    created++;
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
