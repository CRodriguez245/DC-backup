// Minimal High-DQ Responses - Fastest Path to 0.8+ Score
// These responses efficiently cover all DQ dimensions with minimal messages

export const minimalHighDQResponses = [
  {
    id: 1,
    text: "Let's get clear on what decision you're facing. Are you considering switching from software engineering to product management, or exploring other options? And what's driving this - is it the coding burnout, wanting more people interaction, or something else?",
    dqScore: {
      framing: 0.85,
      alternatives: 0.70,
      information: 0.80,
      values: 0.75,
      reasoning: 0.75,
      commitment: 0.70
    }
  },
  {
    id: 2,
    text: "Let's explore some creative alternatives beyond just engineering OR product management. What about technical product management, engineering management, solutions architecture, or even starting as a PM while keeping your coding skills sharp through side projects? Have you researched what these roles actually involve day-to-day?",
    dqScore: {
      framing: 0.80,
      alternatives: 0.95,
      information: 0.90,
      values: 0.75,
      reasoning: 0.85,
      commitment: 0.75
    }
  },
  {
    id: 3,
    text: "Let's create a decision framework. Rank these from 1-10: technical challenge, people interaction, strategic thinking, work-life balance, career growth, and financial security. Then score each option against these criteria. What if you tested one path for a month - shadow a PM, take on more people-facing engineering projects, or try technical product management?",
    dqScore: {
      framing: 0.95,
      alternatives: 0.85,
      information: 0.85,
      values: 0.95,
      reasoning: 0.95,
      commitment: 0.95
    }
  }
];

// Alternative minimal set (even more efficient):
export const ultraMinimalResponses = [
  {
    id: 1,
    text: "I want to help you make the best decision about your career transition from engineering to product management. Let's start by understanding what's driving this change - is it the coding burnout, wanting more people interaction, or something else? And what do you actually know about what PMs do day-to-day versus what you're doing now?",
    dqScore: {
      framing: 0.90,
      alternatives: 0.70,
      information: 0.85,
      values: 0.80,
      reasoning: 0.80,
      commitment: 0.75
    }
  },
  {
    id: 2,
    text: "Let's explore some hybrid options that might give you the best of both worlds - technical product management, engineering management, or solutions architecture. What if you created a decision framework ranking your priorities (technical challenge, people interaction, strategic thinking, career growth) and then tested one path for a month? Which option interests you most for a trial run?",
    dqScore: {
      framing: 0.85,
      alternatives: 0.95,
      information: 0.90,
      values: 0.95,
      reasoning: 0.95,
      commitment: 0.95
    }
  }
];

// Single comprehensive response (theoretical maximum efficiency):
export const singleComprehensiveResponse = {
  id: 1,
  text: "I want to help you make the best decision about transitioning from software engineering to product management. Let's start by clarifying what's driving this change - is it coding burnout, wanting more people interaction, or strategic work? Then let's explore hybrid options like technical product management, engineering management, or solutions architecture. What do you actually know about what PMs do day-to-day? Let's create a decision framework ranking your priorities (technical challenge, people interaction, strategic thinking, work-life balance, career growth) and score each option. Finally, what if you tested one path for a month - shadow a PM, take on more people-facing engineering projects, or try a technical PM role? Which approach feels right to you?",
  dqScore: {
    framing: 0.95,
    alternatives: 0.95,
    information: 0.95,
    values: 0.95,
    reasoning: 0.95,
    commitment: 0.95
  }
};

// Analysis of efficiency:
export const efficiencyAnalysis = {
  three_message_approach: {
    messages: 3,
    averageScore: 0.84,
    efficiency: "High - covers all dimensions well",
    recommendation: "Best balance of efficiency and natural conversation"
  },
  two_message_approach: {
    messages: 2,
    averageScore: 0.87,
    efficiency: "Very High - but may feel rushed",
    recommendation: "Most efficient but might not feel natural"
  },
  single_message_approach: {
    messages: 1,
    averageScore: 0.95,
    efficiency: "Maximum - but unrealistic",
    recommendation: "Theoretical maximum but not practical for real coaching"
  }
};

// Key principles for minimal high-DQ responses:
export const minimalCoachingPrinciples = {
  comprehensive_framing: "Address multiple DQ dimensions in each response",
  systematic_approach: "Use frameworks and structured thinking",
  creative_alternatives: "Generate multiple options beyond binary choices",
  values_integration: "Always connect to personal values and priorities",
  implementation_focus: "Include concrete next steps and testing approaches"
};
