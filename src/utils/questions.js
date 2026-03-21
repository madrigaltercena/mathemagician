// Question generation utilities
// Level-based difficulty: each level (1-20) has specific number ranges and operations

// Random integer in range [min, max]
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Per-level configuration: operation, number ranges, and multipliers/divisors
// Spec: levels 1-4 addition/subtraction, levels 5-9 add/sub/mul, levels 10-14 mul/div, levels 15-20 mul/div harder
const LEVEL_CONFIG = {
  // ─── REINO 1 (6 anos): levels 1-4, addition/subtraction 1-20 → 50-100 ───
  1:  { ops: ['addition', 'subtraction'], range: [1, 20] },
  2:  { ops: ['addition', 'subtraction'], range: [20, 40] },
  3:  { ops: ['addition', 'subtraction'], range: [40, 60] },
  4:  { ops: ['addition', 'subtraction'], range: [50, 100] },

  // ─── REINO 2 (7 anos): levels 5-9, add/sub up to 1000 + times tables ───
  5:  { ops: ['addition'],           range: [10, 100],    tables: [2, 5] },
  6:  { ops: ['subtraction'],        range: [10, 100],    tables: [3, 4] },
  7:  { ops: ['addition', 'subtraction'], range: [10, 100], tables: [2, 3, 4] },
  8:  { ops: ['addition', 'subtraction'], range: [100, 500], tables: [4, 5, 6, 7, 8, 9] },
  9:  { ops: ['addition', 'subtraction'], range: [100, 1000], tables: [5, 6, 7, 8, 9] },

  // ─── REINO 3 (8 anos): levels 10-14, multiplication and division ───
  10: { ops: ['multiplication'],   tables: [2, 3, 4, 5],  digits: 1 }, // 12×3=
  11: { ops: ['multiplication'],   tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], digits: 2 }, // 45×6=
  12: { ops: ['division'],          divDigits: 1 },                       // 72÷8= (exact, 1-digit divisor)
  13: { ops: ['division'],          divDigits: 2, divMax: 50 },            // 48÷6= (exact, 2-digit dividend up to 50)
  14: { ops: ['multiplication', 'division'], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], digits: 2, divDigits: 2, divMax: 100 },

  // ─── REINO 4 (9-10 anos): levels 15-20, harder mul/div + expressions ───
  15: { ops: ['multiplication', 'division'], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], digits: 2, divDigits: 2, range: [1, 1000] },
  16: { ops: ['multiplication', 'division'], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], digits: 2, divDigits: 2, range: [1, 1000] },
  17: { ops: ['multiplication', 'division'], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], digits: 2, divDigits: 2, range: [100, 1000] },
  18: { ops: ['multiplication', 'division'], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], digits: 2, divDigits: 2, range: [100, 1000] },
  19: { ops: ['multiplication', 'division'], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], digits: 2, divDigits: 2, range: [100, 1000] },
  20: { ops: ['multiplication', 'division', 'expression'], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], digits: 2, divDigits: 2, range: [100, 10000] }, // expressions up to 10000
};

// Legacy difficulty → level mapping (for backward compat)
export function getDifficulty(age, override) {
  if (override !== 'auto') return override;
  if (age <= 6) return 1;
  if (age <= 7) return 5;
  if (age <= 8) return 10;
  return 15;
}

// Generate addition question within level range
function makeAdd(lvl) {
  const [min, max] = LEVEL_CONFIG[lvl].range || [1, 100];
  const a = rand(min, max);
  const b = rand(min, max);
  return {
    id: Date.now() + Math.random(),
    type: 'addition',
    question: `${a} + ${b} = ?`,
    answer: a + b,
    operands: [a, b],
    hint: `${a} + ${b}`,
  };
}

// Generate subtraction question within level range
function makeSub(lvl) {
  const [min, max] = LEVEL_CONFIG[lvl].range || [1, 100];
  let a = rand(min, max);
  let b = rand(min, max);
  if (a < b) [a, b] = [b, a]; // ensure positive result
  return {
    id: Date.now() + Math.random(),
    type: 'subtraction',
    question: `${a} - ${b} = ?`,
    answer: a - b,
    operands: [a, b],
    hint: `${a} - ${b}`,
  };
}

// Generate multiplication question (tables and digit count per level)
function makeMul(lvl) {
  const cfg = LEVEL_CONFIG[lvl];
  const tables = cfg.tables || [2, 3, 4, 5, 10];
  const table = tables[rand(0, tables.length - 1)];

  let a;
  if (cfg.digits === 1) {
    // Single digit multiplier: 12×3= or 7×8=
    a = rand(10, 99);
  } else {
    // Two digit: up to 99
    a = rand(10, 99);
  }
  // a × table
  return {
    id: Date.now() + Math.random(),
    type: 'multiplication',
    question: `${a} × ${table} = ?`,
    answer: a * table,
    operands: [a, table],
    hint: `${a} × ${table}`,
  };
}

// Generate division question (exact, no decimals)
function makeDiv(lvl) {
  const cfg = LEVEL_CONFIG[lvl];
  const divDigits = cfg.divDigits || 1;
  const divMax = cfg.divMax || 100;

  let b; // divisor
  if (divDigits === 1) {
    const divisors = cfg.tables || [2, 3, 4, 5, 6, 7, 8, 9];
    b = divisors[rand(0, divisors.length - 1)];
  } else {
    // 2-digit divisor: pick from 11-99 that divide evenly
    const candidates = [];
    for (let d = 11; d <= 99; d++) {
      if (divMax / d <= 10) { // keep quotient reasonable
        candidates.push(d);
      }
    }
    b = candidates.length > 0 ? candidates[rand(0, candidates.length - 1)] : 11;
  }

  const quotient = rand(2, Math.floor(divMax / b));
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

// Generate a simple expression for level 20 (e.g. 12 + 8 × 3 = ?)
function makeExpr(lvl) {
  const cfg = LEVEL_CONFIG[lvl];
  const [min, max] = cfg.range || [100, 10000];
  const a = rand(min, max);
  const b = rand(min, max);
  const c = rand(2, 9);
  // Mix of operations: (a + b) × c or (a - b) × c or a × c + b
  const opType = rand(1, 3);
  if (opType === 1) {
    return {
      id: Date.now() + Math.random(),
      type: 'expression',
      question: `${a} + ${b} × ${c} = ?`,
      answer: a + b * c, // respecting precedence
      operands: [a, b, c],
      hint: ` Lembra: ×/÷ antes de +/-! ${a} + ${b} × ${c} = ?`,
    };
  } else if (opType === 2) {
    const smaller = Math.min(a, b);
    const larger = Math.max(a, b);
    return {
      id: Date.now() + Math.random(),
      type: 'expression',
      question: `${larger} - ${smaller} × ${c} = ?`,
      answer: larger - smaller * c,
      operands: [larger, smaller, c],
      hint: `×/÷ antes de +/-!`,
    };
  } else {
    return {
      id: Date.now() + Math.random(),
      type: 'expression',
      question: `${a} × ${c} + ${rand(1, 50)} = ?`,
      answer: a * c,
      operands: [a, c],
      hint: `Resolve a × primeiro!`,
    };
  }
}

// Generate a batch of questions for a given level
export function generateQuestions(kingdom, level, count = 5) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  const ops = cfg.ops || ['addition'];

  const questions = [];
  for (let i = 0; i < count; i++) {
    const op = ops[rand(0, ops.length - 1)];
    let q;
    if (op === 'multiplication') q = makeMul(level);
    else if (op === 'division') q = makeDiv(level);
    else if (op === 'expression') q = makeExpr(level);
    else if (op === 'subtraction') q = makeSub(level);
    else q = makeAdd(level);
    questions.push(q);
  }
  return questions;
}

// Generate hint (simplified for level-based questions)
export function generateHint(question) {
  const { type, operands } = question;
  const [a, b] = operands;

  switch (type) {
    case 'addition':
      return [
        `Vamos somar!`,
        `${a} + ${b}`,
        `Podes contar nos dedos ou fazer de cabeça.`,
        `O resultado é ${a + b}!`,
      ];
    case 'subtraction':
      return [
        `Vamos subtrair!`,
        `${a} - ${b}`,
        `Tira ${b} de ${a}.`,
        `O resultado é ${a - b}!`,
      ];
    case 'multiplication':
      return [
        `Conta de ${b} em ${b}!`,
        `${b}, ${b * 2}, ${b * 3}...`,
        `Ou soma ${a} vezes: ${a} + ${a}...`,
        `${a} × ${b} = ${a * b}`,
      ];
    case 'division':
      return [
        `Pergunta: quantas vezes cabe ${b} em ${a}?`,
        `Usa a tabuada do ${b}!`,
        `${b} × ${Math.floor(a / b)} = ${b * Math.floor(a / b)}`,
        `Sobra ${a % b > 0 ? `${a % b}` : 'nada'}!`,
        `${a} ÷ ${b} = ${a / b}`,
      ];
    case 'expression':
      return [
        `Cuidado com a ordem das operações!`,
        `Primeiro resolve a multiplicação/divisão.`,
        `Depois faz a adição/subtração.`,
        `O resultado é ${question.answer}!`,
      ];
    default:
      return [`Tenta resolver!`, `${a} + ${b} = ${a + b}`];
  }
}

// XP calculation (keep existing)
export function calculateXP(difficulty, hintsUsed, mode) {
  const baseXP = { easy: 10, medium: 15, hard: 20 };
  const level = difficulty;
  const base = baseXP[level] || 15;
  const hintPenalty = hintsUsed > 0 ? 0.5 : 1;
  return mode === 'story' ? Math.round(base * hintPenalty) : Math.round(base * 0.5 * hintPenalty);
}

// Stars calculation (keep existing)
export function calculateStars(correct, total) {
  const pct = (correct / total) * 100;
  if (pct >= 100) return 3;
  if (pct >= 80) return 2;
  if (pct >= 60) return 1;
  return 0;
}
