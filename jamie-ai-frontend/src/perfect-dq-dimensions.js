// Perfect DQ Responses - Targeting All 6 Dimensions for High Scores
// Based on the actual backend DQ scoring system

export const perfectDQResponses = [
  {
    id: 1,
    text: "Let's clearly define what decision you're facing - you're considering transitioning from software engineering to product management due to coding burnout and desire for more people interaction and strategic work. What specifically about coding is draining you, and what does working with people and strategy mean to you? Have you researched what PMs do day-to-day and talked to any PMs about their experiences? Let's also explore alternatives like technical product management, engineering management, or solutions architecture - what do you know about these options?",
    targets: {
      framing: "Clear decision definition",
      alternatives: "Multiple options mentioned",
      information: "Asks for research and experiences",
      values: "Asks about personal meaning",
      reasoning: "Systematic exploration",
      commitment: "Engagement in research"
    }
  },
  {
    id: 2,
    text: "Let's systematically evaluate your options. First, what are your core values - technical challenge, people interaction, strategic thinking, work-life balance, career growth, or financial security? Rank these from 1-10. Now let's explore alternatives: technical product management, engineering management, solutions architecture, developer advocacy, or staying in engineering but with more people-facing roles. What do you know about each - daily work, career paths, compensation, work-life balance? Which aligns with your values? Let's challenge assumptions - is it coding itself or specific factors like projects, culture, or lack of impact? Finally, what if you tested one path for a month through shadowing, interviews, or side projects? Which would you test first?",
    targets: {
      framing: "Systematic evaluation approach",
      alternatives: "Comprehensive option exploration",
      information: "Detailed research questions",
      values: "Values ranking and alignment",
      reasoning: "Assumption challenging and systematic thinking",
      commitment: "Concrete testing plan"
    }
  },
  {
    id: 3,
    text: "Let's create a comprehensive decision framework. First, clearly define your decision: transitioning from software engineering to more people-oriented, strategic work. Rank your priorities: technical challenge, people interaction, strategic thinking, work-life balance, career growth, financial security. Explore alternatives: product management, technical PM, engineering management, solutions architecture, developer advocacy, or hybrid roles. Research each option thoroughly - daily responsibilities, career progression, compensation, work-life balance, growth potential. Challenge assumptions about coding burnout - is it the work itself or specific factors? Create a testing plan: commit to exploring one path for a month through shadowing, informational interviews, side projects, or taking on relevant responsibilities. Which option will you test first? What specific actions will you take? How will you measure success? What's your plan if the test confirms your interest or if it doesn't?",
    targets: {
      framing: "Comprehensive framework creation",
      alternatives: "Extensive option exploration",
      information: "Thorough research requirements",
      values: "Priority ranking and alignment",
      reasoning: "Systematic evaluation and assumption testing",
      commitment: "Detailed implementation and measurement plan"
    }
  }
];

// Single comprehensive response targeting all dimensions:
export const singleComprehensiveResponse = {
  id: 1,
  text: "Let's systematically work through your career transition decision. First, clearly define what you're facing: transitioning from software engineering to product management due to coding burnout and desire for more people interaction and strategic work. What specifically about coding drains you, and what does working with people and strategy mean to you? Have you researched what PMs do day-to-day and talked to any PMs? Now explore alternatives: technical product management, engineering management, solutions architecture, developer advocacy, or hybrid roles. What do you know about each - daily work, career paths, compensation, work-life balance? Rank your values: technical challenge, people interaction, strategic thinking, work-life balance, career growth, financial security. Which options align with your values? Challenge assumptions about coding burnout - is it coding itself or specific factors? Create a testing plan: explore one path for a month through shadowing, interviews, side projects, or taking on relevant responsibilities. Which will you test first? What specific actions will you take? How will you measure success? What's your plan if the test confirms your interest or if it doesn't?",
  targets: {
    framing: "Clear decision definition and systematic approach",
    alternatives: "Multiple relevant options explored",
    information: "Comprehensive research questions",
    values: "Values ranking and alignment",
    reasoning: "Systematic thinking and assumption challenging",
    commitment: "Detailed testing and implementation plan"
  }
};

// Key strategies for each DQ dimension:
export const dimensionStrategies = {
  framing: [
    "Clearly define the decision being made",
    "Set up systematic approach to evaluation",
    "Establish decision framework and criteria"
  ],
  alternatives: [
    "Generate multiple relevant options",
    "Explore hybrid and creative solutions",
    "Go beyond binary thinking"
  ],
  information: [
    "Ask for specific research and data",
    "Request concrete experiences and insights",
    "Seek detailed information about options"
  ],
  values: [
    "Identify and rank personal priorities",
    "Connect options to personal values",
    "Explore what truly matters to the person"
  ],
  reasoning: [
    "Use systematic evaluation methods",
    "Challenge assumptions and biases",
    "Apply structured thinking frameworks"
  ],
  commitment: [
    "Create concrete action plans",
    "Establish testing and measurement criteria",
    "Set specific timelines and next steps"
  ]
};

// Common mistakes that lower scores:
export const scoreLoweringMistakes = {
  framing: "Vague or unclear problem definition",
  alternatives: "Only considering binary options",
  information: "Not asking for specific research or data",
  values: "Not exploring personal priorities and values",
  reasoning: "Lack of systematic thinking or assumption challenging",
  commitment: "No concrete next steps or testing plans"
};
