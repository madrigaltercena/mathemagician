// Question generation utilities

// Get difficulty settings based on age and difficulty override
export function getDifficulty(age, override) {
  if (override !== 'auto') return override;
  
  // Age-based defaults
  if (age <= 6) return 'easy';
  if (age <= 8) return 'medium';
  return 'hard';
}

// Number ranges by difficulty
const difficultyRanges = {
  easy: { min: 1, max: 10, digitMax: 10 },
  medium: { min: 1, max: 50, digitMax: 50 },
  hard: { min: 10, max: 100, digitMax: 100 },
};

// Generate random number in range
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate addition question
function generateAddition(difficulty) {
  const range = difficultyRanges[difficulty];
  const a = randomInRange(range.min, Math.min(range.digitMax, range.max));
  const b = randomInRange(range.min, Math.min(range.digitMax, range.max));
  
  return {
    id: Date.now() + Math.random(),
    type: 'addition',
    question: `${a} + ${b} = ?`,
    answer: a + b,
    operands: [a, b],
    hint: `${a} + ${b}`,
  };
}

// Generate subtraction question (ensure positive result)
function generateSubtraction(difficulty) {
  const range = difficultyRanges[difficulty];
  const max = Math.min(range.digitMax, range.max);
  let a = randomInRange(range.min, max);
  let b = randomInRange(range.min, max);
  
  // Ensure a >= b for positive result
  if (a < b) [a, b] = [b, a];
  
  return {
    id: Date.now() + Math.random(),
    type: 'subtraction',
    question: `${a} - ${b} = ?`,
    answer: a - b,
    operands: [a, b],
    hint: `${a} - ${b}`,
  };
}

// Generate multiplication question
function generateMultiplication(difficulty) {
  // Multipliers based on difficulty
  let multipliers;
  if (difficulty === 'easy') {
    multipliers = [1, 2, 3, 4, 5];
  } else if (difficulty === 'medium') {
    multipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  } else {
    multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
  
  const a = randomInRange(1, 10);
  const b = multipliers[Math.floor(Math.random() * multipliers.length)];
  
  return {
    id: Date.now() + Math.random(),
    type: 'multiplication',
    question: `${a} × ${b} = ?`,
    answer: a * b,
    operands: [a, b],
    hint: `${a} × ${b}`,
  };
}

// Generate division question (ensure clean division)
function generateDivision(difficulty) {
  let divisors;
  if (difficulty === 'easy') {
    divisors = [2, 3, 4, 5];
  } else {
    divisors = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
  
  const b = divisors[Math.floor(Math.random() * divisors.length)];
  const quotient = randomInRange(1, 10);
  const a = b * quotient;
  
  return {
    id: Date.now() + Math.random(),
    type: 'division',
    question: `${a} ÷ ${b} = ?`,
    answer: quotient,
    operands: [a, b],
    hint: `${a} ÷ ${b}`,
  };
}

// Generate a batch of questions
export function generateQuestions(operation, difficulty, count = 5) {
  const generators = {
    addition: generateAddition,
    subtraction: generateSubtraction,
    multiplication: generateMultiplication,
    division: generateDivision,
  };
  
  const generator = generators[operation];
  if (!generator) {
    console.error(`Unknown operation: ${operation}`);
    return [];
  }
  
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(generator(difficulty));
  }
  
  return questions;
}

// Generate hint based on question type
export function generateHint(question) {
  const { type, operands } = question;
  
  switch (type) {
    case 'addition': {
      const [a, b] = operands;
      const tensA = Math.floor(a / 10) * 10;
      const onesA = a % 10;
      const tensB = Math.floor(b / 10) * 10;
      const onesB = b % 10;
      
      if (a >= 10 || b >= 10) {
        return [
          `Vamos pensar juntos!`,
          `${a} = ${tensA} + ${onesA}`,
          `${b} = ${tensB} + ${onesB}`,
          `${tensA} + ${tensB} = ${tensA + tensB}`,
          `${onesA} + ${onesB} = ${onesA + onesB}`,
          `${tensA + tensB} + ${onesA + onesB} = ${a + b}`,
          `Consegues continuar?`,
        ];
      }
      return [
        `Conta com os dedos!`,
        `Tens ${a} dedos numa mão...`,
        `...e ${b} dedos na outra.`,
        `No total tens ${a + b} dedos!`,
      ];
    }
    
    case 'subtraction': {
      const [a, b] = operands;
      return [
        `Vamos subtrair!`,
        `Tens ${a} maçãs.`,
        `Dás ${b} maçãs ao teu amigo.`,
        `Ficas com ${a - b} maçãs.`,
      ];
    }
    
    case 'multiplication': {
      const [a, b] = operands;
      const lines = [];
      for (let i = 0; i < a; i++) {
        lines.push('⭐');
      }
      const group1 = lines.slice(0, Math.min(a, 5)).join(' ');
      const group2 = lines.slice(Math.min(a, 5)).join(' ');
      
      return [
        `Multiplicar é somar várias vezes!`,
        `${a} grupos de ${b}`,
        `Grupo 1: ${group1 || '(vazio)'}`,
        group2 ? `Grupo 2: ${group2}` : null,
        `Total: ${a} × ${b} = ${a * b}`,
      ].filter(Boolean);
    }
    
    case 'division': {
      const [a, b] = operands;
      const each = Math.floor(a / b);
      return [
        `Dividir é partilhar igualmente!`,
        `Tens ${a} bolinhas.`,
        `Queres partilhar por ${b} amigos.`,
        `Cada amigo fica com ${each} bolinhas.`,
      ];
    }
    
    default:
      return ['Pensa com calma...'];
  }
}

// Calculate XP based on difficulty, hints, and mode
export function calculateXP(difficulty, hintsUsed, mode = 'story') {
  const baseXP = {
    easy: 10,
    medium: 20,
    hard: 35,
  };
  
  let base = baseXP[difficulty] || 10;
  
  // Cap XP at 50% for freeplay mode
  if (mode === 'freeplay') {
    base = Math.floor(base * 0.5);
  }
  
  // 50% XP when hint used
  if (hintsUsed > 0) {
    return Math.floor(base * 0.5);
  }
  return base;
}

// Stars earned based on correct answers
export function calculateStars(correct, total) {
  const percentage = (correct / total) * 100;
  if (percentage >= 100) return 3;
  if (percentage >= 80) return 2;
  if (percentage >= 60) return 1;
  return 0;
}
