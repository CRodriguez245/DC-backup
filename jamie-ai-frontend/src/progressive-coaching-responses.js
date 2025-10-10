// 10 Progressive Coaching Responses for Andres - Building to 0.8+ DQ Score
// Andres: Software engineer considering product management pivot

export const progressiveCoachingResponses = [
  {
    id: 1,
    text: "What's the main decision you're trying to make here?",
    dqScore: {
      framing: 0.60,
      alternatives: 0.40,
      information: 0.50,
      values: 0.30,
      reasoning: 0.40,
      commitment: 0.30
    }
  },
  {
    id: 2,
    text: "So you're considering switching from software engineering to product management. What are your main concerns about making this career change?",
    dqScore: {
      framing: 0.70,
      alternatives: 0.50,
      information: 0.65,
      values: 0.50,
      reasoning: 0.55,
      commitment: 0.45
    }
  },
  {
    id: 3,
    text: "You mentioned feeling burnt out from coding and wanting to work more with people and strategy. What matters most to you - having more human interaction, influencing product direction, or something else? And what specifically is draining about your current coding work?",
    dqScore: {
      framing: 0.75,
      alternatives: 0.55,
      information: 0.70,
      values: 0.75,
      reasoning: 0.65,
      commitment: 0.55
    }
  },
  {
    id: 4,
    text: "Let's explore some options beyond just engineering OR product management. What about technical product management, where you'd use your coding background? Or maybe engineering management, or even solutions architecture? Have you considered these hybrid paths?",
    dqScore: {
      framing: 0.80,
      alternatives: 0.80,
      information: 0.75,
      values: 0.70,
      reasoning: 0.75,
      commitment: 0.65
    }
  },
  {
    id: 5,
    text: "To make a good decision, we need more information. What do you actually know about what product managers do day-to-day? Have you talked to any PMs about their experiences, or shadowed anyone in that role? What about the career progression and compensation differences?",
    dqScore: {
      framing: 0.80,
      alternatives: 0.70,
      information: 0.85,
      values: 0.65,
      reasoning: 0.80,
      commitment: 0.70
    }
  },
  {
    id: 6,
    text: "You mentioned wanting to work with people and strategy more. That's important information! Let's think systematically - what would success look like to you in 5 years? Which path would give you more flexibility if you changed your mind? And which would challenge you to grow in ways you actually want to develop?",
    dqScore: {
      framing: 0.85,
      alternatives: 0.75,
      information: 0.80,
      values: 0.85,
      reasoning: 0.85,
      commitment: 0.75
    }
  },
  {
    id: 7,
    text: "Let's create a framework to evaluate this decision. Can you rank these from 1-10: technical challenge, people interaction, strategic thinking, work-life balance, career growth, and job security? Then we can score each career path against these criteria.",
    dqScore: {
      framing: 0.90,
      alternatives: 0.85,
      information: 0.85,
      values: 0.90,
      reasoning: 0.90,
      commitment: 0.80
    }
  },
  {
    id: 8,
    text: "I want to challenge some assumptions. You said you're burnt out from coding - but have you considered if it's the coding itself or the specific projects/company culture? And you think PMs work more with people - but have you actually researched what percentage of a PM's day is meetings vs strategy vs other tasks? Let's test these assumptions with real data.",
    dqScore: {
      framing: 0.85,
      alternatives: 0.90,
      information: 0.90,
      values: 0.80,
      reasoning: 0.90,
      commitment: 0.85
    }
  },
  {
    id: 9,
    text: "What if you didn't have to choose just one path? You could stay in engineering but move to a more people-facing role like solutions architect or engineering manager. Or transition to technical product management where you'd use both skills. Or even try a PM role while keeping your engineering skills sharp through side projects. How might you honor both your technical and people-oriented sides?",
    dqScore: {
      framing: 0.95,
      alternatives: 0.95,
      information: 0.85,
      values: 0.90,
      reasoning: 0.95,
      commitment: 0.85
    }
  },
  {
    id: 10,
    text: "Let's think about implementation. What if you made a preliminary choice and tested it out? Pick one path and commit to exploring it fully for the next month - shadow a PM, take on more people-facing projects in engineering, or start learning product strategy. Then we can evaluate how it feels and whether you want to continue or pivot. What do you think?",
    dqScore: {
      framing: 0.90,
      alternatives: 0.85,
      information: 0.90,
      values: 0.85,
      reasoning: 0.95,
      commitment: 0.95
    }
  }
];

// Progressive DQ Score Development:
export const progressionAnalysis = {
  message1: {
    overall: 0.42,
    note: "Basic question - low scores across all dimensions"
  },
  message2: {
    overall: 0.56,
    note: "Starting to explore concerns - moderate improvement"
  },
  message3: {
    overall: 0.62,
    note: "Values exploration begins - values score jumps to 0.75"
  },
  message4: {
    overall: 0.71,
    note: "Alternative generation - alternatives score reaches 0.80"
  },
  message5: {
    overall: 0.75,
    note: "Information gathering focus - information reaches 0.85"
  },
  message6: {
    overall: 0.81,
    note: "First 0.8+ score! Systematic thinking emerges"
  },
  message7: {
    overall: 0.87,
    note: "Strong framework creation - all dimensions above 0.80"
  },
  message8: {
    overall: 0.87,
    note: "Critical thinking and assumption testing"
  },
  message9: {
    overall: 0.93,
    note: "Peak performance - creative integration"
  },
  message10: {
    overall: 0.90,
    note: "Implementation focus - commitment reaches 0.95"
  }
};

// Learning progression summary:
export const learningProgression = {
  early_stage: {
    messages: "1-3",
    focus: "Basic problem understanding and values exploration",
    avgScore: 0.53
  },
  developing_stage: {
    messages: "4-6", 
    focus: "Alternative generation and information gathering",
    avgScore: 0.76
  },
  advanced_stage: {
    messages: "7-10",
    focus: "Systematic frameworks, critical thinking, and implementation",
    avgScore: 0.89
  }
};

// Key coaching skills developed:
export const skillDevelopment = {
  message1: ["Basic questioning"],
  message2: ["Problem clarification"],
  message3: ["Values exploration"],
  message4: ["Alternative generation"],
  message5: ["Information gathering"],
  message6: ["Systematic thinking"],
  message7: ["Framework creation"],
  message8: ["Critical thinking", "Assumption testing"],
  message9: ["Creative integration"],
  message10: ["Implementation planning"]
};
