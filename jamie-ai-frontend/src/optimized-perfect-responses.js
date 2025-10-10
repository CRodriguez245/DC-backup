// Optimized Perfect DQ Responses - Designed for Maximum Scoring
// These responses are optimized for the specific DQ scoring criteria

export const optimizedPerfectResponses = [
  {
    id: 1,
    text: "Let's clearly define your decision: you're a software engineer considering transitioning to product management due to coding burnout and desire for more people interaction and strategic work. What specifically about coding is draining you - is it the isolation, lack of user impact, or technical complexity? And what does working with people and strategy mean to you? Have you researched what PMs actually do day-to-day and talked to any PMs about their experiences?",
    dqScore: {
      framing: 0.95,
      alternatives: 0.85,
      information: 0.95,
      values: 0.90,
      reasoning: 0.90,
      commitment: 0.85
    }
  },
  {
    id: 2,
    text: "Let's explore alternatives beyond just engineering OR product management. Consider technical product management (using your coding skills strategically), engineering management (leading technical teams), solutions architecture (technical expertise with client interaction), or developer advocacy (bridging technical and user communities). What do you know about these roles - their daily work, career paths, and compensation? Which aligns with your values around technical challenge, people interaction, and career growth?",
    dqScore: {
      framing: 0.90,
      alternatives: 0.95,
      information: 0.90,
      values: 0.95,
      reasoning: 0.90,
      commitment: 0.85
    }
  },
  {
    id: 3,
    text: "Let's create a decision framework. Rank these from 1-10: technical challenge, people interaction, strategic thinking, work-life balance, career growth, and financial security. Score each option against these criteria. Challenge assumptions - is it coding itself or specific factors like projects, culture, or lack of impact? Create a testing plan: explore one path for a month through shadowing, interviews, or side projects. Which option will you test first and what specific actions will you take?",
    dqScore: {
      framing: 0.95,
      alternatives: 0.90,
      information: 0.90,
      values: 0.95,
      reasoning: 0.95,
      commitment: 0.95
    }
  }
];

// Alternative approach - more focused and direct:
export const focusedPerfectResponses = [
  {
    id: 1,
    text: "You're considering transitioning from software engineering to product management due to coding burnout and wanting more people interaction and strategic work. Let's clarify: what specifically about coding drains you, and what does working with people and strategy look like to you? Have you researched PM roles and talked to any PMs about their experiences?",
    dqScore: {
      framing: 0.95,
      alternatives: 0.80,
      information: 0.95,
      values: 0.90,
      reasoning: 0.85,
      commitment: 0.80
    }
  },
  {
    id: 2,
    text: "Explore alternatives: technical product management, engineering management, solutions architecture, or developer advocacy. What do you know about these roles - daily work, career paths, compensation? Which aligns with your values around technical challenge, people interaction, and career growth?",
    dqScore: {
      framing: 0.85,
      alternatives: 0.95,
      information: 0.90,
      values: 0.95,
      reasoning: 0.85,
      commitment: 0.85
    }
  },
  {
    id: 3,
    text: "Create a decision framework: rank technical challenge, people interaction, strategic thinking, work-life balance, career growth, and financial security from 1-10. Score each option. Challenge assumptions about coding burnout - is it coding itself or other factors? Test one path for a month through shadowing, interviews, or projects. Which will you test and how?",
    dqScore: {
      framing: 0.95,
      alternatives: 0.90,
      information: 0.90,
      values: 0.95,
      reasoning: 0.95,
      commitment: 0.95
    }
  }
];

// Single comprehensive optimized response:
export const singleOptimizedResponse = {
  id: 1,
  text: "You're a software engineer considering transitioning to product management due to coding burnout and desire for more people interaction and strategic work. Let's clarify what's driving this - what specifically about coding drains you, and what does working with people and strategy mean to you? Have you researched PM roles and talked to any PMs? Explore alternatives: technical product management, engineering management, solutions architecture, or developer advocacy. What do you know about these roles - daily work, career paths, compensation? Which aligns with your values around technical challenge, people interaction, and career growth? Create a decision framework: rank technical challenge, people interaction, strategic thinking, work-life balance, career growth, and financial security from 1-10. Score each option. Challenge assumptions about coding burnout. Test one path for a month through shadowing, interviews, or projects. Which will you test and how?",
  dqScore: {
    framing: 0.95,
    alternatives: 0.95,
    information: 0.95,
    values: 0.95,
    reasoning: 0.95,
    commitment: 0.95
  }
};

// Key optimization strategies:
export const optimizationStrategies = {
  concise_framing: "Clear, specific problem definition without being verbose",
  focused_alternatives: "Multiple relevant options without overwhelming detail",
  targeted_information: "Specific questions about research and experiences",
  clear_values: "Direct connection to personal priorities and motivations",
  structured_reasoning: "Systematic approach with frameworks and assumption testing",
  concrete_commitment: "Specific action steps and testing plans"
};

// Common issues that lower scores:
export const scoreLoweringIssues = [
  "Responses too long or verbose",
  "Not specific enough to the scenario",
  "Generic questions that don't address the situation",
  "Missing systematic approach or frameworks",
  "Lack of concrete next steps or testing plans",
  "Not challenging assumptions effectively"
];

// Average scores for optimized responses:
export const optimizedScoreAverages = {
  three_message_set: 0.92,
  focused_set: 0.90,
  single_comprehensive: 0.95
};
