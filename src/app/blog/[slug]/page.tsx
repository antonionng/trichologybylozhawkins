import { notFound } from "next/navigation";
import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { Surface } from "@/components/layout/Surface";
import { ConsultationCta } from "@/components/sections/ConsultationCta";
import { ButtonLink } from "@/components/ui/Button";
import { blogHighlights } from "@/lib/content";

// Blog post content
const blogPosts = {
  "decoding-hormonal-hair-loss": {
    title: "Understanding Hormonal Hair Loss: A Practical Guide",
    category: "Clinical Guide",
    published: "2025-10-02",
    readTime: "8 min read",
    excerpt: "Learn to recognize hormonal hair loss patterns and have supportive conversations with clients about treatment options.",
    content: [
      {
        type: "paragraph",
        text: "Hormonal hair loss is one of the most common concerns clients bring to trichologists and hair care professionals. Understanding the patterns, triggers, and appropriate responses can transform your consultations from uncertain to confident."
      },
      {
        type: "heading",
        text: "Recognizing the patterns"
      },
      {
        type: "paragraph",
        text: "Hormonal hair loss typically presents with specific patterns that differ from other forms of hair loss. The most common presentation is diffuse thinning across the crown and top of the scalp, while the hairline often remains relatively intact. This is distinctly different from male pattern baldness or stress-related shedding."
      },
      {
        type: "paragraph",
        text: "Key indicators include:"
      },
      {
        type: "list",
        items: [
          "Gradual thinning over months or years rather than sudden shedding",
          "Increased hair fall during washing or brushing",
          "Visible scalp becoming more apparent, especially under bright light",
          "Changes in hair texture—often becoming finer or less dense"
        ]
      },
      {
        type: "heading",
        text: "Common hormonal triggers"
      },
      {
        type: "paragraph",
        text: "Several hormonal transitions can trigger hair loss. Understanding these helps you ask the right questions during consultations:"
      },
      {
        type: "subheading",
        text: "Post-pregnancy changes"
      },
      {
        type: "paragraph",
        text: "Postpartum hair shedding typically occurs 3-6 months after giving birth. During pregnancy, elevated estrogen keeps more hair in the growth phase. After birth, hormone levels normalize and all that 'extra' hair sheds at once. While distressing, this is temporary and usually resolves within 6-12 months."
      },
      {
        type: "subheading",
        text: "Perimenopause and menopause"
      },
      {
        type: "paragraph",
        text: "As estrogen levels decline, the ratio of androgens increases, which can trigger hair thinning. This typically begins in the 40s but varies widely. The thinning is gradual but can be emotionally significant."
      },
      {
        type: "subheading",
        text: "Thyroid imbalances"
      },
      {
        type: "paragraph",
        text: "Both hypothyroidism and hyperthyroidism can cause diffuse hair loss. Thyroid hormones regulate the hair growth cycle, so when levels are off, hair growth is disrupted. Always ask about energy levels, weight changes, and temperature sensitivity."
      },
      {
        type: "heading",
        text: "Having supportive conversations"
      },
      {
        type: "paragraph",
        text: "When a client presents with suspected hormonal hair loss, your role isn't to diagnose but to guide and support. Here's a framework that works:"
      },
      {
        type: "list",
        items: [
          "Acknowledge their concern without minimizing it",
          "Ask about recent life changes: pregnancy, medication changes, stress levels",
          "Explain that you can support scalp health while they explore hormonal factors",
          "Recommend they speak with their GP about hormone testing if appropriate",
          "Focus on what you can do: scalp health, product recommendations, gentle treatments"
        ]
      },
      {
        type: "heading",
        text: "Treatment approaches you can offer"
      },
      {
        type: "paragraph",
        text: "While hormonal issues require medical oversight, you can still provide valuable support:"
      },
      {
        type: "subheading",
        text: "Scalp health optimization"
      },
      {
        type: "paragraph",
        text: "A healthy scalp provides the best environment for hair growth. Focus on gentle cleansing, balancing the microbiome, and reducing inflammation. Avoid harsh detox treatments that can further stress already compromised hair."
      },
      {
        type: "subheading",
        text: "Nutritional support guidance"
      },
      {
        type: "paragraph",
        text: "While you shouldn't prescribe supplements, you can discuss the importance of protein, iron, and B vitamins for hair health. Encourage clients to discuss their diet with their healthcare provider."
      },
      {
        type: "subheading",
        text: "Stress management"
      },
      {
        type: "paragraph",
        text: "Hair loss is stressful, and stress worsens hair loss—it's a vicious cycle. Your calm, knowledgeable approach can help break this cycle. Scalp massage, relaxation techniques, and simply being heard can make a significant difference."
      },
      {
        type: "heading",
        text: "When to refer onwards"
      },
      {
        type: "paragraph",
        text: "You should encourage clients to see their doctor if they have:"
      },
      {
        type: "list",
        items: [
          "Sudden or severe hair loss",
          "Hair loss accompanied by other symptoms (fatigue, weight changes, irregular periods)",
          "No improvement after 3-6 months of scalp care",
          "Concerns about medication side effects"
        ]
      },
      {
        type: "paragraph",
        text: "Remember: your value isn't in diagnosing hormonal issues but in providing expert scalp care, emotional support, and knowledgeable guidance. This approach builds trust and keeps clients coming back even as they work with other healthcare providers."
      },
      {
        type: "callout",
        text: "The most important thing you can offer is reassurance backed by knowledge. Help clients understand that hormonal hair loss is common, often temporary, and manageable with the right support."
      }
    ]
  },
  "future-of-scalp-detox": {
    title: "Scalp Detox Treatments That Actually Work",
    category: "Treatment Methods",
    published: "2025-09-24",
    readTime: "6 min read",
    excerpt: "Science-based detox techniques that cleanse without damaging the scalp's natural protective barrier.",
    content: [
      {
        type: "paragraph",
        text: "Scalp detox has become a buzzword in hair care, but not all approaches are created equal. Many popular methods can actually damage the scalp's natural protective barrier, causing more harm than good. Here's what actually works."
      },
      {
        type: "heading",
        text: "Understanding the scalp microbiome"
      },
      {
        type: "paragraph",
        text: "Your scalp is home to a diverse community of microorganisms that work together to protect skin health. A good detox treatment supports this ecosystem rather than destroying it. Think of it like tending a garden—you want to remove weeds and debris without killing the beneficial organisms."
      },
      {
        type: "paragraph",
        text: "The scalp's sebum isn't the enemy. It's a protective barrier that:"
      },
      {
        type: "list",
        items: [
          "Prevents water loss and keeps skin hydrated",
          "Contains antimicrobial compounds that fight harmful bacteria",
          "Delivers vitamin E and other antioxidants to hair follicles",
          "Creates an acidic environment that beneficial microbes thrive in"
        ]
      },
      {
        type: "heading",
        text: "What actually needs 'detoxing'"
      },
      {
        type: "paragraph",
        text: "Most scalps don't need aggressive cleansing. What we're really targeting is:"
      },
      {
        type: "subheading",
        text: "Product buildup"
      },
      {
        type: "paragraph",
        text: "Silicones, styling products, and some conditioning agents can accumulate over time. This creates a barrier that prevents moisture absorption and can lead to dullness. A gentle clarifying treatment once a month is usually sufficient."
      },
      {
        type: "subheading",
        text: "Environmental pollutants"
      },
      {
        type: "paragraph",
        text: "City dwellers especially deal with particulate matter that settles on the scalp. These particles can trigger inflammation. Regular cleansing with the right products is key."
      },
      {
        type: "subheading",
        text: "Dead skin cell accumulation"
      },
      {
        type: "paragraph",
        text: "Like facial skin, the scalp sheds dead cells. Sometimes these don't shed efficiently and can clog follicles. Gentle exfoliation helps, but over-exfoliation damages the protective barrier."
      },
      {
        type: "heading",
        text: "Effective detox techniques"
      },
      {
        type: "subheading",
        text: "1. Pre-cleanse oil treatment"
      },
      {
        type: "paragraph",
        text: "Apply a lightweight oil (jojoba or squalane work well) to the scalp 15-20 minutes before shampooing. Massage gently with fingertips in circular motions. This dissolves oil-soluble buildup and sebum plugs without stripping the scalp."
      },
      {
        type: "paragraph",
        text: "Why it works: Oil dissolves oil. This technique, borrowed from Korean skincare, is gentle yet effective."
      },
      {
        type: "subheading",
        text: "2. Clay-based masks (used correctly)"
      },
      {
        type: "paragraph",
        text: "Bentonite or kaolin clay can absorb excess sebum and impurities. The key is application: mix the clay with enough liquid (water, aloe juice, or hydrosol) to create a smooth paste. Apply only to the scalp, not the hair length. Leave for 5-10 minutes maximum—never let it dry completely."
      },
      {
        type: "paragraph",
        text: "Why it works: Clay has a negative electrical charge that attracts positively charged toxins and metals. But dried clay pulls moisture from skin, so timing matters."
      },
      {
        type: "subheading",
        text: "3. Enzyme exfoliation"
      },
      {
        type: "paragraph",
        text: "Fruit enzymes (papaya, pineapple) gently break down dead skin cells without mechanical scrubbing. Look for products with papain or bromelain. These are gentler than physical scrubs and work with the skin's natural processes."
      },
      {
        type: "paragraph",
        text: "Why it works: Enzymes selectively digest the proteins that hold dead cells together, allowing them to shed naturally."
      },
      {
        type: "subheading",
        text: "4. Scalp brushing (the right way)"
      },
      {
        type: "paragraph",
        text: "Use a soft bristle brush on dry hair before washing. Brush gently from the hairline toward the crown, using light pressure. This loosens debris and stimulates circulation without causing micro-tears in the skin."
      },
      {
        type: "paragraph",
        text: "Why it works: Gentle mechanical action aids in the natural shedding process and increases blood flow to follicles."
      },
      {
        type: "heading",
        text: "What to avoid"
      },
      {
        type: "list",
        items: [
          "Harsh sulfate shampoos marketed as 'deep cleansing'—they strip too much",
          "Apple cider vinegar rinses stronger than 1:4 dilution—too acidic can damage",
          "Baking soda scrubs—highly alkaline and disrupts the scalp's pH",
          "Aggressive physical scrubs with large particles—can cause micro-tears",
          "Frequent detoxing—once a month is plenty for most people"
        ]
      },
      {
        type: "heading",
        text: "Post-detox care"
      },
      {
        type: "paragraph",
        text: "After any detox treatment, focus on restoring balance:"
      },
      {
        type: "list",
        items: [
          "Use a gentle, pH-balanced shampoo",
          "Apply a hydrating scalp serum or toner",
          "Avoid heat styling for 24 hours",
          "Let the scalp rest—no treatments for at least a week"
        ]
      },
      {
        type: "callout",
        text: "The best scalp detox is one your client doesn't even notice. They should feel refreshed and clean, not stripped or irritated. If their scalp feels tight or looks red, you've gone too far."
      },
      {
        type: "paragraph",
        text: "Remember: the goal is supporting the scalp's natural cleansing processes, not fighting against them. A healthy scalp detoxifies itself continuously—our job is to help, not hinder."
      }
    ]
  },
  "ethical-consultations": {
    title: "Building Trust Through Better Consultations",
    category: "Business Growth",
    published: "2025-09-10",
    readTime: "7 min read",
    excerpt: "Practical tips and conversation frameworks for conducting scalp consultations that clients value and remember.",
    content: [
      {
        type: "paragraph",
        text: "A consultation isn't just a prelude to treatment—it's where trust is built or broken. Get this right, and clients become advocates. Get it wrong, and even excellent technical work won't save the relationship."
      },
      {
        type: "heading",
        text: "Why consultations matter"
      },
      {
        type: "paragraph",
        text: "In my years of practice, I've noticed that clients who value consultations are the ones who stay with you long-term. They're not price shopping—they're investing in expertise. But you have to demonstrate that expertise in a way that feels helpful, not salesy."
      },
      {
        type: "paragraph",
        text: "A great consultation does three things:"
      },
      {
        type: "list",
        items: [
          "Makes the client feel heard and understood",
          "Educates without overwhelming",
          "Creates clear next steps that feel collaborative, not prescribed"
        ]
      },
      {
        type: "heading",
        text: "The consultation framework"
      },
      {
        type: "subheading",
        text: "1. Start with their story (5-7 minutes)"
      },
      {
        type: "paragraph",
        text: "Begin with open-ended questions and actually listen to the answers. Don't jump to solutions yet."
      },
      {
        type: "paragraph",
        text: "Questions that work:"
      },
      {
        type: "list",
        items: [
          "\"What brings you in today?\"",
          "\"When did you first notice this concern?\"",
          "\"What have you tried so far?\"",
          "\"How is this affecting you day-to-day?\""
        ]
      },
      {
        type: "paragraph",
        text: "That last question is crucial. It reveals the emotional impact, which is often what really matters. Someone might say their hair loss is mild, but if it's affecting their confidence at work, that's significant."
      },
      {
        type: "subheading",
        text: "2. Assessment and education (10-15 minutes)"
      },
      {
        type: "paragraph",
        text: "This is where your expertise shines. But here's the key: explain what you're seeing as you go."
      },
      {
        type: "paragraph",
        text: "Instead of: *Silently examining scalp, then launching into treatment options*"
      },
      {
        type: "paragraph",
        text: "Try: \"I'm looking at how your hair is distributed across the scalp... I can see the density is good here at the sides... and there's some thinning through the crown area, which is common with [specific pattern]. Let me show you what I mean...\""
      },
      {
        type: "paragraph",
        text: "If you use imaging tools:"
      },
      {
        type: "list",
        items: [
          "Show them the images in real-time",
          "Point out both concerns and healthy areas",
          "Save images for progress tracking (with consent)",
          "Explain what you're looking for in plain language"
        ]
      },
      {
        type: "subheading",
        text: "3. Collaborative planning (8-10 minutes)"
      },
      {
        type: "paragraph",
        text: "This isn't where you sell—it's where you co-create a plan."
      },
      {
        type: "paragraph",
        text: "Framework that builds trust:"
      },
      {
        type: "paragraph",
        text: "**Explain the 'why'**: \"Based on what I'm seeing, the priority is supporting your scalp's natural barrier function. When that's compromised, it's hard for hair to thrive.\""
      },
      {
        type: "paragraph",
        text: "**Offer options, not prescriptions**: \"There are a few ways we could approach this. Some clients prefer to start with [option A], while others find [option B] fits better with their routine. What sounds more realistic for you?\""
      },
      {
        type: "paragraph",
        text: "**Be honest about timelines**: \"Scalp health changes take time. Most clients see initial improvements around 6-8 weeks, but we're really looking at a 3-6 month journey to see lasting change.\""
      },
      {
        type: "paragraph",
        text: "**Discuss investment transparently**: \"This treatment plan involves [X], which is [cost]. There's also a home care element, which runs about [Y] per month. Does that align with what you had in mind?\""
      },
      {
        type: "heading",
        text: "Handling common challenges"
      },
      {
        type: "subheading",
        text: "When clients are overwhelmed"
      },
      {
        type: "paragraph",
        text: "If you notice glazed eyes or confusion, pause and simplify:"
      },
      {
        type: "paragraph",
        text: "\"I know that's a lot of information. The main things to remember are [1-2 key points]. Would it help if I wrote this down for you?\""
      },
      {
        type: "subheading",
        text: "When you need to refer out"
      },
      {
        type: "paragraph",
        text: "Some concerns are beyond your scope. That's not a weakness—it's professional integrity."
      },
      {
        type: "paragraph",
        text: "\"What I'm seeing suggests this might have a [medical/hormonal/dermatological] component. I'd feel better if you saw [specialist type] to rule out [specific concern]. Once you've done that, I can support with scalp treatments, but I want to make sure we're addressing the root cause.\""
      },
      {
        type: "paragraph",
        text: "Clients respect this honesty. You'll often find they come back to you after seeing the specialist, because you've demonstrated that their wellbeing matters more than making a sale."
      },
      {
        type: "subheading",
        text: "When clients have unrealistic expectations"
      },
      {
        type: "paragraph",
        text: "Be kind but clear:"
      },
      {
        type: "paragraph",
        text: "\"I appreciate what you're hoping for, and I want to be honest about what's achievable. Based on what I'm seeing, we can realistically expect [realistic outcome] over [timeframe]. That might not be the dramatic change you're hoping for, but it's sustainable improvement that will support your hair health long-term.\""
      },
      {
        type: "heading",
        text: "Documentation and follow-up"
      },
      {
        type: "paragraph",
        text: "After the consultation:"
      },
      {
        type: "list",
        items: [
          "Take detailed notes while it's fresh",
          "Send a follow-up email summarizing the plan (builds trust and reduces confusion)",
          "Include any resources or articles you mentioned",
          "Schedule the next appointment before they leave",
          "Follow up in 2-3 days to check how they're getting on with any new routines"
        ]
      },
      {
        type: "heading",
        text: "The economics of good consultations"
      },
      {
        type: "paragraph",
        text: "I know what you're thinking: \"This takes too long. I can't spend 30 minutes on every consultation.\""
      },
      {
        type: "paragraph",
        text: "Here's the thing: charge properly for consultations and you can afford to take time. A thorough consultation is worth £75-150 depending on your location and experience. Clients who balk at this aren't your people."
      },
      {
        type: "paragraph",
        text: "The clients who value expertise will happily pay for a proper consultation. And those clients:"
      },
      {
        type: "list",
        items: [
          "Buy the recommended products",
          "Book follow-up treatments",
          "Refer their friends",
          "Leave glowing reviews",
          "Become long-term clients worth thousands over time"
        ]
      },
      {
        type: "callout",
        text: "A rushed free consultation attracts price shoppers. A thorough paid consultation attracts clients who value expertise. Choose your business model accordingly."
      },
      {
        type: "heading",
        text: "Practice makes progress"
      },
      {
        type: "paragraph",
        text: "Like any skill, consultations improve with practice. After each one, jot down:"
      },
      {
        type: "list",
        items: [
          "What went well",
          "What felt awkward",
          "Questions you didn't know how to answer",
          "Moments where you really connected"
        ]
      },
      {
        type: "paragraph",
        text: "Over time, you'll develop your own style and flow. But the foundation remains the same: listen more than you talk, educate without overwhelming, and build plans collaboratively."
      },
      {
        type: "paragraph",
        text: "Your consultations are your reputation. Make them count."
      }
    ]
  }
};

type BlogPostProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return blogHighlights.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPost({ params }: BlogPostProps) {
  const post = blogPosts[params.slug as keyof typeof blogPosts];

  if (!post) {
    notFound();
  }

  const formatPublishedDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = Number(month) - 1;
    const monthLabel = monthNames[monthIndex] ?? month;
    return `${day.padStart(2, "0")} ${monthLabel} ${year}`;
  };

  return (
    <main>
      <PageSection tone="sand" texture="linen" className="relative">
        <Container className="max-w-4xl">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <ButtonLink href="/blog" variant="ghost" size="sm">
                ← Back to articles
              </ButtonLink>
              <span className="inline-flex rounded-full bg-brand-salmon/60 px-4 py-1.5 text-xs uppercase tracking-[0.32em] text-brand-ivory">
                {post.category}
              </span>
              <h1 className="font-display text-4xl leading-tight text-brand-graphite lg:text-5xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-brand-graphite/60">
                <span>{formatPublishedDate(post.published)}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </Container>
      </PageSection>

      {/* Content */}
      <PageSection tone="transparent">
        <Container className="max-w-3xl">
          <Surface variant="card" padding="lg" className="prose prose-lg max-w-none">
            <div className="space-y-6">
              {post.content.map((section, index) => {
                if (section.type === "paragraph") {
                  return (
                    <p key={index} className="text-base leading-relaxed text-brand-graphite/80">
                      {section.text}
                    </p>
                  );
                }
                if (section.type === "heading") {
                  return (
                    <h2 key={index} className="mt-12 font-display text-2xl text-brand-graphite first:mt-0">
                      {section.text}
                    </h2>
                  );
                }
                if (section.type === "subheading") {
                  return (
                    <h3 key={index} className="mt-8 font-display text-xl text-brand-graphite">
                      {section.text}
                    </h3>
                  );
                }
                if (section.type === "list" && section.items) {
                  return (
                    <ul key={index} className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-3 text-base leading-relaxed text-brand-graphite/80">
                          <span className="mt-2 inline-flex h-1.5 w-1.5 flex-none rounded-full bg-brand-salmon/60" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (section.type === "callout") {
                  return (
                    <div
                      key={index}
                      className="my-8 rounded-lg border-l-4 border-brand-salmon/60 bg-brand-salmon/5 p-6"
                    >
                      <p className="text-base italic leading-relaxed text-brand-graphite/90">
                        {section.text}
                      </p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </Surface>
        </Container>
      </PageSection>

      <ConsultationCta />
    </main>
  );
}

