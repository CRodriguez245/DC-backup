// 10 High-Quality Coaching Responses for Game Mode (Target: 0.8+ DQ Score)
// These demonstrate strong decision quality framework principles

export const highQualityResponses = [
  {
    id: 1,
    text: "Let's start by clearly defining the decision you're facing. What specific choice are you trying to make between mechanical engineering and art/design? Are you considering switching majors, adding a minor, or exploring career paths after graduation?",
    dqScore: {
      framing: 0.95, // Excellent problem definition
      alternatives: 0.85, // Good alternative clarification
      information: 0.80, // Good information gathering
      values: 0.75, // Somewhat addresses values
      reasoning: 0.85, // Strong logical approach
      commitment: 0.70 // Moderate commitment to process
    }
  },
  {
    id: 2,
    text: "I hear that your parents' expectations are really important to you. Can you tell me more about what specifically they value? Is it financial security, prestige, practical skills, or something else? And what do you personally value most in a career - creativity, helping others, problem-solving, or something different?",
    dqScore: {
      framing: 0.80, // Good context setting
      alternatives: 0.70, // Limited alternatives
      information: 0.90, // Excellent information gathering
      values: 0.95, // Excellent values exploration
      reasoning: 0.85, // Strong logical approach
      commitment: 0.75 // Good engagement
    }
  },
  {
    id: 3,
    text: "Let's explore some creative alternatives beyond just 'engineering OR art.' Have you considered industrial design, which combines both? Or UX/UI design in tech? Or engineering roles at creative companies like Tesla, Apple, or design firms? What about double majoring or getting a master's in design after engineering?",
    dqScore: {
      framing: 0.85, // Good problem reframing
      alternatives: 0.95, // Excellent alternative generation
      information: 0.80, // Good information about options
      values: 0.75, // Somewhat addresses values
      reasoning: 0.90, // Strong creative reasoning
      commitment: 0.80 // Good commitment to exploration
    }
  },
  {
    id: 4,
    text: "To make an informed decision, let's gather some concrete information. What's the average starting salary for mechanical engineers vs. industrial designers in your area? How long does it take to break even on student loans for each path? Have you talked to any professionals in both fields about their daily work and career satisfaction?",
    dqScore: {
      framing: 0.75, // Good context
      alternatives: 0.70, // Limited alternatives
      information: 0.95, // Excellent information gathering
      values: 0.70, // Somewhat addresses values
      reasoning: 0.90, // Strong analytical reasoning
      commitment: 0.85 // Good commitment to research
    }
  },
  {
    id: 5,
    text: "Let's think about your reasoning process. You mentioned feeling 'alive' in design classes - that's a strong emotional signal. But let's also consider: Which path better aligns with your long-term goals? Which gives you more flexibility to pivot later? Which challenges you to grow in ways you want to develop?",
    dqScore: {
      framing: 0.80, // Good problem context
      alternatives: 0.75, // Good alternative consideration
      information: 0.75, // Moderate information
      values: 0.85, // Good values consideration
      reasoning: 0.95, // Excellent reasoning process
      commitment: 0.80 // Good commitment to analysis
    }
  },
  {
    id: 6,
    text: "I want to help you create a decision framework. Let's rank your priorities: financial security (1-10), creative fulfillment (1-10), family approval (1-10), job stability (1-10), and personal growth (1-10). Then we can score each option against these criteria. Does this approach feel right to you?",
    dqScore: {
      framing: 0.90, // Excellent problem structuring
      alternatives: 0.80, // Good alternative evaluation
      information: 0.85, // Good systematic approach
      values: 0.95, // Excellent values clarification
      reasoning: 0.95, // Excellent analytical framework
      commitment: 0.90 // Excellent commitment to process
    }
  },
  {
    id: 7,
    text: "Let's test your assumptions. You mentioned art 'doesn't pay the bills' - but what if we researched actual salary data? And you said engineering feels uninspiring - but what if we found engineering roles that use creativity, like product design or R&D? Let's challenge these assumptions with real information.",
    dqScore: {
      framing: 0.85, // Good assumption testing
      alternatives: 0.90, // Excellent alternative exploration
      information: 0.95, // Excellent information gathering
      values: 0.80, // Good values consideration
      reasoning: 0.95, // Excellent critical thinking
      commitment: 0.85 // Good commitment to truth-seeking
    }
  },
  {
    id: 8,
    text: "Now let's think about commitment and implementation. If you chose engineering, what specific steps would you take to make it more fulfilling? If you chose design, how would you address your parents' concerns about financial security? What's your plan to succeed in either path?",
    dqScore: {
      framing: 0.80, // Good implementation focus
      alternatives: 0.85, // Good alternative planning
      information: 0.80, // Good practical information
      values: 0.85, // Good values integration
      reasoning: 0.90, // Strong planning reasoning
      commitment: 0.95 // Excellent commitment focus
    }
  },
  {
    id: 9,
    text: "Let's consider the 'both/and' approach. What if you pursued mechanical engineering but took design electives, joined design clubs, or did design internships? Or what if you got an engineering degree and then pursued design graduate studies? How might you honor both your practical and creative sides?",
    dqScore: {
      framing: 0.95, // Excellent integrative thinking
      alternatives: 0.95, // Excellent creative alternatives
      information: 0.85, // Good information about hybrid paths
      values: 0.90, // Excellent values integration
      reasoning: 0.95, // Excellent creative reasoning
      commitment: 0.90 // Excellent commitment to synthesis
    }
  },
  {
    id: 10,
    text: "Based on our conversation, I'd like you to make a preliminary decision and then test it. Choose one path and commit to exploring it fully for the next month - research careers, talk to professionals, take relevant courses, or get experience. Then we can evaluate how it feels and whether you want to continue or pivot. What do you think?",
    dqScore: {
      framing: 0.90, // Excellent decision closure
      alternatives: 0.85, // Good alternative testing
      information: 0.90, // Excellent information gathering plan
      values: 0.85, // Good values testing
      reasoning: 0.95, // Excellent experimental reasoning
      commitment: 0.95 // Excellent commitment to action
    }
  }
];

// Average DQ scores for these responses:
export const averageScores = {
  framing: 0.855, // Strong problem definition and structuring
  alternatives: 0.83, // Good alternative generation and exploration
  information: 0.865, // Excellent information gathering
  values: 0.835, // Strong values exploration and integration
  reasoning: 0.905, // Excellent reasoning and critical thinking
  commitment: 0.845, // Strong commitment to process and action
  minimum: 0.83 // Above 0.8 target
};

// Key principles demonstrated:
export const coachingPrinciples = {
  framing: [
    "Clear problem definition",
    "Structured decision framework", 
    "Assumption testing",
    "Integrative thinking"
  ],
  alternatives: [
    "Creative option generation",
    "Hybrid solutions",
    "Beyond binary thinking",
    "Alternative testing"
  ],
  information: [
    "Systematic data gathering",
    "Professional interviews",
    "Salary and career research",
    "Real-world validation"
  ],
  values: [
    "Values clarification",
    "Priority ranking",
    "Values integration",
    "Values testing"
  ],
  reasoning: [
    "Critical thinking",
    "Analytical frameworks",
    "Creative reasoning",
    "Experimental approach"
  ],
  commitment: [
    "Action planning",
    "Implementation steps",
    "Progress tracking",
    "Commitment testing"
  ]
};
