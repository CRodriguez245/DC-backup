// AI-Optimized Responses - Designed for Backend AI to Score Highly
// These responses are crafted to trigger high DQ scores from the AI evaluation system

export const aiOptimizedResponses = [
  {
    id: 1,
    text: "I want to help you make the best decision about your career transition. You mentioned feeling burnt out from coding and wanting to work more with people and strategy. Let's start by clearly defining what you're facing - what specifically about coding is draining you, and what does working with people and strategy mean to you? Have you researched what product managers actually do day-to-day and talked to any PMs about their experiences?",
    expectedScore: "High framing, information, values"
  },
  {
    id: 2,
    text: "Let's explore some creative alternatives beyond just engineering OR product management. What about technical product management, where you'd leverage your coding background in strategic roles? Or engineering management, where you'd lead technical teams? Solutions architecture, which combines technical expertise with client interaction? Have you researched these roles - what they involve day-to-day, career paths, compensation, and work-life balance? Which of these options align with your values around technical challenge, people interaction, strategic thinking, and career growth?",
    expectedScore: "High alternatives, information, values"
  },
  {
    id: 3,
    text: "Let's create a systematic decision framework. First, rank these criteria from 1-10 based on what matters most to you: technical challenge, people interaction, strategic thinking, work-life balance, career growth potential, and financial security. Then let's score each career option against these criteria. But let's also challenge some assumptions - you mentioned being burnt out from coding, but have you considered if it's coding itself or the specific projects, company culture, team dynamics, or lack of meaningful impact? What if you could address these root causes while staying in engineering? Finally, let's create a concrete testing plan: commit to exploring one path for the next month through shadowing, informational interviews, side projects, or taking on relevant responsibilities. Which option feels most worth testing first, and what specific actions will you take to gather real data about that path?",
    expectedScore: "High framing, alternatives, reasoning, commitment"
  }
];

// Alternative approach - more direct and systematic:
export const systematicResponses = [
  {
    id: 1,
    text: "Let's systematically work through your career transition decision. You're a software engineer considering product management due to coding burnout and desire for more people interaction and strategic work. Let's clarify the decision: what specifically about coding is draining you - is it the isolation, lack of user impact, technical complexity, or something else? And what does working with people and strategy look like to you? Have you researched what PMs actually do day-to-day and talked to any PMs about their experiences and career satisfaction?",
    expectedScore: "High framing, information, values"
  },
  {
    id: 2,
    text: "Now let's explore alternatives systematically. Beyond product management, consider technical product management (using your coding skills strategically), engineering management (leading technical teams), solutions architecture (technical expertise with client interaction), or developer advocacy (bridging technical and user communities). What do you know about these roles - their daily responsibilities, career progression, compensation, work-life balance, and growth potential? Have you talked to people in these positions about their experiences? Which options align with your values around technical challenge, people interaction, strategic thinking, and career development?",
    expectedScore: "High alternatives, information, values"
  },
  {
    id: 3,
    text: "Let's create a comprehensive decision framework and testing plan. Rank these criteria from 1-10: technical challenge, people interaction, strategic thinking, work-life balance, career growth, financial security, and job satisfaction. Score each career option against these criteria. Challenge assumptions about coding burnout - is it coding itself or specific factors like projects, culture, or lack of impact? Create a testing plan: explore one path for a month through shadowing, interviews, side projects, or taking on relevant responsibilities. Which option will you test first? What specific actions will you take? How will you measure whether it's a good fit? What's your plan if the test confirms your interest or if it doesn't?",
    expectedScore: "High framing, reasoning, commitment"
  }
];

// Single comprehensive response approach:
export const comprehensiveResponse = {
  id: 1,
  text: "I want to help you make the best decision about transitioning from software engineering to product management. You mentioned feeling burnt out from coding and wanting more people interaction and strategic work. Let's systematically work through this: First, clarify what's driving this change - what specifically about coding drains you, and what does working with people and strategy mean to you? Have you researched what PMs do day-to-day and talked to any PMs? Second, explore alternatives beyond just engineering OR product management: technical product management, engineering management, solutions architecture, or developer advocacy. What do you know about these roles - daily work, career paths, compensation, work-life balance? Which aligns with your values around technical challenge, people interaction, strategic thinking, and career growth? Third, create a decision framework: rank technical challenge, people interaction, strategic thinking, work-life balance, career growth, and financial security from 1-10. Score each option against these criteria. Challenge assumptions about coding burnout - is it coding itself or other factors? Finally, create a testing plan: explore one path for a month through shadowing, interviews, side projects, or taking on relevant responsibilities. Which option will you test first and how?",
  expectedScore: "High across all dimensions"
};

// Key principles for AI-optimized responses:
export const aiOptimizationPrinciples = {
  systematic_approach: "Use structured, methodical thinking",
  comprehensive_coverage: "Address multiple DQ dimensions in each response",
  concrete_questions: "Ask specific, actionable questions",
  values_integration: "Always connect to personal values and priorities",
  assumption_testing: "Challenge assumptions and encourage critical thinking",
  implementation_focus: "Include concrete next steps and testing plans",
  alternative_generation: "Go beyond binary choices to creative options"
};

// Based on demo score ranges, target these scores:
export const targetScoreRanges = {
  framing: "0.65-0.95", // Demo: 0.65-0.95
  alternatives: "0.55-0.85", // Demo: 0.55-0.85  
  information: "0.60-0.90", // Demo: 0.60-0.90
  values: "0.70-1.0", // Demo: 0.70-1.0
  reasoning: "0.62-0.92", // Demo: 0.62-0.92
  commitment: "0.58-0.88" // Demo: 0.58-0.88
};
