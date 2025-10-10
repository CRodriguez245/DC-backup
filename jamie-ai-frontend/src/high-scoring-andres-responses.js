// High-Scoring Responses for Andres Scenario - Software Engineer to Product Management
// These responses are designed to achieve 0.8+ DQ scores consistently

export const highScoringAndresResponses = [
  {
    id: 1,
    text: "I hear you're feeling burnt out from coding and want to work more with people and strategy. Let's clarify what you're looking for - are you considering product management, or are there other roles that interest you? What specifically about coding is draining you, and what aspects of working with people and strategy appeal to you most?",
    dqScore: {
      framing: 0.90,
      alternatives: 0.75,
      information: 0.85,
      values: 0.85,
      reasoning: 0.80,
      commitment: 0.75
    }
  },
  {
    id: 2,
    text: "Let's explore your options systematically. Beyond product management, have you considered technical product management, engineering management, solutions architecture, or even transitioning to a more people-facing engineering role? What do you actually know about what these roles involve day-to-day? Have you talked to anyone in these positions about their experiences and career satisfaction?",
    dqScore: {
      framing: 0.85,
      alternatives: 0.95,
      information: 0.90,
      values: 0.80,
      reasoning: 0.85,
      commitment: 0.80
    }
  },
  {
    id: 3,
    text: "Let's create a decision framework to evaluate this systematically. Rank these criteria from 1-10 based on what matters most to you: technical challenge, people interaction, strategic thinking, work-life balance, career growth potential, and financial security. Then let's score each career option against these criteria. What if you committed to testing one path for the next month - shadowing a PM, taking on more cross-functional engineering projects, or exploring technical product management?",
    dqScore: {
      framing: 0.95,
      alternatives: 0.90,
      information: 0.90,
      values: 0.95,
      reasoning: 0.95,
      commitment: 0.90
    }
  }
];

// Alternative high-scoring responses that address the burnout issue more directly:
export const alternativeHighScoringResponses = [
  {
    id: 1,
    text: "You mentioned feeling burnt out from coding and wanting to work more with people and strategy. Let's understand this better - is the burnout from the technical complexity, the isolation of coding, or something else? And when you say 'people and strategy,' what specifically appeals to you - leading teams, influencing product direction, or something different?",
    dqScore: {
      framing: 0.90,
      alternatives: 0.70,
      information: 0.90,
      values: 0.90,
      reasoning: 0.85,
      commitment: 0.80
    }
  },
  {
    id: 2,
    text: "Let's challenge some assumptions and explore creative alternatives. You said you're burnt out from coding - but have you considered if it's coding itself or the specific projects, company culture, or team dynamics? What about transitioning to roles that use your technical background but focus more on people and strategy - like technical product management, engineering management, or solutions architecture? Have you researched what these actually involve?",
    dqScore: {
      framing: 0.90,
      alternatives: 0.95,
      information: 0.90,
      values: 0.85,
      reasoning: 0.90,
      commitment: 0.85
    }
  },
  {
    id: 3,
    text: "Let's create a systematic approach to this decision. First, let's rank your priorities from 1-10: technical challenge, people interaction, strategic thinking, work-life balance, career growth, and financial security. Then we'll score each career path against these criteria. Finally, let's create a testing plan - what if you committed to exploring one option for a month through shadowing, side projects, or informational interviews? Which path feels most worth testing first?",
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

// Single comprehensive high-scoring response:
export const comprehensiveHighScoringResponse = {
  id: 1,
  text: "I want to help you make the best decision about your career transition. You mentioned feeling burnt out from coding and wanting more people interaction and strategic work. Let's start by understanding what's driving this - is it the technical complexity, isolation, or specific aspects of your current role? Then let's explore alternatives beyond just engineering vs. product management - technical product management, engineering management, solutions architecture, or even more people-facing engineering roles. What do you actually know about these options? Let's create a decision framework ranking your priorities (technical challenge, people interaction, strategic thinking, work-life balance, career growth, financial security) and score each option. Finally, what if you tested one path for a month through shadowing, side projects, or informational interviews? Which approach feels most valuable to explore first?",
  dqScore: {
    framing: 0.95,
    alternatives: 0.95,
    information: 0.95,
    values: 0.95,
    reasoning: 0.95,
    commitment: 0.95
  }
};

// Key strategies for high DQ scores:
export const highScoringStrategies = {
  specific_framing: "Address the exact scenario (SWE to PM transition)",
  comprehensive_alternatives: "Generate multiple relevant career options",
  systematic_information: "Ask about concrete research and experiences",
  values_exploration: "Deep dive into what drives the person",
  structured_reasoning: "Use frameworks and systematic evaluation",
  concrete_commitment: "Include specific action steps and testing plans"
};

// Common mistakes that lower scores:
export const scoreLoweringMistakes = [
  "Generic questions that don't address the specific situation",
  "Not exploring multiple alternatives beyond binary choices",
  "Failing to ask for concrete information and research",
  "Not diving deep into values and motivations",
  "Lack of systematic reasoning and frameworks",
  "No clear next steps or commitment to action"
];
