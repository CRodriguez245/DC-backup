// Experimental High-Scoring Responses - Testing Different Approaches
// Trying various strategies to achieve 0.8+ scores

export const experimentalResponses = [
  {
    id: 1,
    text: "I want to help you work through this career transition systematically. You're a software engineer feeling burnt out from coding and considering product management for more people interaction and strategic work. Let's start by framing this decision clearly: what specific aspects of coding are draining you, and what does 'working with people and strategy' actually mean to you? Have you done any research on what product managers do day-to-day, or talked to any PMs about their experiences?",
    strategy: "Direct, systematic approach with clear framing"
  },
  {
    id: 2,
    text: "Let's explore this decision using a structured approach. First, let's identify your core values and priorities. What matters most to you: technical challenge, people interaction, strategic thinking, work-life balance, career growth, or financial security? Rank these from 1-10. Now, let's consider alternatives beyond just engineering OR product management: technical product management, engineering management, solutions architecture, developer advocacy, or even transitioning to more people-facing engineering roles. What do you know about these options - their daily responsibilities, career progression, compensation, and work-life balance?",
    strategy: "Values-focused with systematic exploration"
  },
  {
    id: 3,
    text: "Let's create a comprehensive decision-making framework. First, clearly define your decision: you're considering transitioning from software engineering to product management due to coding burnout and desire for more people interaction and strategic work. Next, identify your decision criteria: technical challenge, people interaction, strategic thinking, work-life balance, career growth, financial security. Rank these from 1-10. Then, generate alternatives: product management, technical product management, engineering management, solutions architecture, developer advocacy. Research each option thoroughly - daily work, career paths, compensation, work-life balance. Challenge your assumptions about coding burnout - is it coding itself or specific factors like projects, culture, or lack of impact? Finally, create a testing plan: commit to exploring one path for a month through shadowing, informational interviews, side projects, or taking on relevant responsibilities. Which option will you test first? What specific actions will you take? How will you measure whether it's a good fit?",
    strategy: "Comprehensive framework with all DQ elements"
  }
];

// Alternative approach - more conversational and natural:
export const conversationalResponses = [
  {
    id: 1,
    text: "I can hear that you're feeling burnt out from coding and drawn to more people-oriented, strategic work. Let's unpack this together. What specifically about coding is wearing you down - is it the isolation, the technical complexity, or something else? And when you think about working with people and strategy, what does that look like to you? Have you had a chance to research what product managers actually do day-to-day or talk to any PMs about their experiences?",
    strategy: "Conversational tone with clear questions"
  },
  {
    id: 2,
    text: "Let's think about this more broadly. You mentioned wanting more people interaction and strategic work - that's valuable information. What if we explored some alternatives beyond just engineering OR product management? For example, technical product management might let you use your coding background while focusing on strategy. Or engineering management could give you people leadership while staying technical. Have you considered these options? What do you know about them?",
    strategy: "Broad exploration with specific alternatives"
  },
  {
    id: 3,
    text: "I want to help you make the best decision possible. Let's approach this systematically. First, what are your core values and priorities? Think about technical challenge, people interaction, strategic thinking, work-life balance, career growth, and financial security - which matter most to you? Second, let's explore your options thoroughly. Beyond product management, consider technical PM, engineering management, solutions architecture, or developer advocacy. What do you know about these roles? Finally, let's create a plan to test your assumptions. What if you committed to exploring one path for a month - shadowing someone, doing informational interviews, or taking on relevant projects? Which option interests you most for a trial run?",
    strategy: "Systematic approach with clear structure"
  }
];

// Minimal but comprehensive approach:
export const minimalComprehensiveResponses = [
  {
    id: 1,
    text: "Let's work through your career transition systematically. You're considering moving from software engineering to product management due to coding burnout and wanting more people interaction and strategic work. What specifically about coding is draining you? What does working with people and strategy mean to you? Have you researched PM roles or talked to any PMs? Let's also explore alternatives like technical PM, engineering management, or solutions architecture. What do you know about these options?",
    strategy: "Minimal but covers all dimensions"
  },
  {
    id: 2,
    text: "Let's create a decision framework. Rank your priorities from 1-10: technical challenge, people interaction, strategic thinking, work-life balance, career growth, financial security. Explore alternatives: product management, technical PM, engineering management, solutions architecture, developer advocacy. Research each option - daily work, career paths, compensation, work-life balance. Challenge assumptions about coding burnout. Test one path for a month through shadowing, interviews, or projects. Which will you test first?",
    strategy: "Framework-based approach"
  }
];

// Single comprehensive response:
export const singleComprehensiveResponse = {
  id: 1,
  text: "Let's systematically work through your career transition. You're considering moving from software engineering to product management due to coding burnout and wanting more people interaction and strategic work. First, clarify what's driving this: what specifically about coding drains you, and what does working with people and strategy mean to you? Have you researched PM roles or talked to any PMs? Second, explore alternatives: technical product management, engineering management, solutions architecture, developer advocacy. What do you know about these options? Third, rank your values: technical challenge, people interaction, strategic thinking, work-life balance, career growth, financial security. Which options align with your values? Fourth, challenge assumptions about coding burnout. Finally, create a testing plan: explore one path for a month through shadowing, interviews, or projects. Which will you test first?",
  strategy: "Single response covering all dimensions"
};

// Key insights from the scoring system:
export const scoringInsights = {
  weakestLink: "Final score is the minimum of all 6 dimensions",
  threshold: "Need 0.3+ in each dimension to count as 'covered'",
  target: "Need 0.8+ minimum to achieve high scores",
  approach: "Must address all 6 dimensions effectively in each response"
};

// Possible reasons for low scores:
export const possibleIssues = [
  "AI might be looking for specific coaching language patterns",
  "Responses might be too generic or not specific enough",
  "AI might expect more detailed exploration of each dimension",
  "Scoring might be stricter than expected",
  "AI might prefer different question formats or approaches"
];
