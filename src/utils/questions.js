// Question generation utilities
// Level-based difficulty: each level (1-20) has specific number ranges and operations

// Random integer in range [min, max] (inclusive)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Per-level configuration: operation, RESULT ranges, and multipliers/divisors
// The RESULT of the operation is always within the specified range
const LEVEL_CONFIG = {
  // ─── REINO 1 (6 anos): levels 1-4, addition/subtraction ───
  1:  { ops: ['addition', 'subtraction'], resultRange: [1, 10] },
  2:  { ops: ['addition', 'subtraction'], resultRange: [5, 20] },
  3:  { ops: ['addition', 'subtraction'], resultRange: [10, 40] },
  4:  { ops: ['addition', 'subtraction'], resultRange: [15, 60] },

  // ─── REINO 2 (7 anos): levels 5-9, add/sub + times tables ───
  5:  { ops: ['addition'],           resultRange: [10, 100],  tables: [2, 5] },
  6:  { ops: ['subtraction'],        resultRange: [10, 100],  tables: [3, 4] },
  7:  { ops: ['addition', 'subtraction'], resultRange: [10, 100], tables: [2, 3, 4] },
  8:  { ops: ['addition', 'subtraction'], resultRange: [50, 300], tables: [4, 5, 6, 7, 8, 9] },
  9:  { ops: ['addition', 'subtraction'], resultRange: [100, 500], tables: [5, 6, 7, 8, 9] },

  // ─── REINO 3 (8 anos): levels 10-14, multiplication and division ───
  10: { ops: ['multiplication'], resultRange: [1, 50],  tables: [2, 3, 4, 5] },   // e.g. 6×7=42
  11: { ops: ['multiplication'], resultRange: [10, 200], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] }, // e.g. 45×6=270
  12: { ops: ['division'],       resultRange: [1, 10],  divTable: [2, 3, 4, 5, 6, 7, 8, 9] }, // e.g. 72÷8=9
  13: { ops: ['division'],       resultRange: [1, 20],  divTable: [2, 3, 4, 5, 6, 7, 8, 9] }, // e.g. 48÷6=8
  14: { ops: ['multiplication', 'division'], resultRange: [10, 100], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },

  // ─── REINO 4 (9-10 anos): levels 15-20, harder mul/div ───
  15: { ops: ['multiplication', 'division'], resultRange: [10, 200],  tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  16: { ops: ['multiplication', 'division'], resultRange: [20, 500],  tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  17: { ops: ['multiplication', 'division'], resultRange: [50, 1000], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  18: { ops: ['multiplication', 'division'], resultRange: [100, 2000], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  19: { ops: ['multiplication', 'division'], resultRange: [100, 5000], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  20: { ops: ['multiplication', 'division'], resultRange: [100, 10000], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
};

// ─── Addition: result is in range ───
function makeAdd(lvl) {
  const [min, max] = LEVEL_CONFIG[lvl].resultRange || [1, 100];
  const result = rand(min, max);
  const a = rand(1, result - 1);
  const b = result - a;
  return {
    id: Date.now() + Math.random(),
    type: 'addition',
    question: `${a} + ${b} = ?`,
    answer: result,
    operands: [a, b],
    hint: `${a} + ${b}`,
  };
}

// ─── Subtraction: result is in range ───
function makeSub(lvl) {
  const [min, max] = LEVEL_CONFIG[lvl].resultRange || [1, 100];
  const result = rand(min, max);
  // minuend must be larger than result to keep it positive
  const a = rand(result, result + rand(5, 20));
  const b = a - result;
  return {
    id: Date.now() + Math.random(),
    type: 'subtraction',
    question: `${a} - ${b} = ?`,
    answer: result,
    operands: [a, b],
    hint: `${a} - ${b}`,
  };
}

// ─── Multiplication: result is in range ───
function makeMul(lvl) {
  const cfg = LEVEL_CONFIG[lvl];
  const tables = cfg.tables || [2, 3, 4, 5, 10];
  const [min, max] = cfg.resultRange || [1, 100];
  const table = tables[rand(0, tables.length - 1)];

  // Find multiplicand so that result is in range
  // result = a * table → a = result / table
  // We need a * table in [min, max]
  const minA = Math.max(1, Math.ceil(min / table));
  const maxA = Math.floor(max / table);
  if (minA > maxA) {
    // Fallback: just pick a and hope
    const a = rand(1, 10);
    return {
      id: Date.now() + Math.random(),
      type: 'multiplication',
      question: `${a} × ${table} = ?`,
      answer: a * table,
      operands: [a, table],
      hint: `${a} × ${table}`,
    };
  }
  const a = rand(minA, maxA);
  return {
    id: Date.now() + Math.random(),
    type: 'multiplication',
    question: `${a} × ${table} = ?`,
    answer: a * table,
    operands: [a, table],
    hint: `${a} × ${table}`,
  };
}

// ─── Division: result is in range (exact, no decimals) ───
function makeDiv(lvl) {
  const cfg = LEVEL_CONFIG[lvl];
  const divTable = cfg.divTable || cfg.tables || [2, 3, 4, 5, 6, 7, 8, 9];
  const [min, max] = cfg.resultRange || [1, 100];

  // Pick a divisor from the table
  const b = divTable[rand(0, divTable.length - 1)];

  // Find quotient so that result is in range
  // result = quotient, a = quotient * b → result * b
  const minQ = Math.max(1, Math.ceil(min / b));
  const maxQ = Math.floor(max / b);
  if (minQ > maxQ) {
    // Fallback
    const quotient = rand(1, 10);
    return {
      id: Date.now() + Math.random(),
      type: 'division',
      question: `${quotient * b} ÷ ${b} = ?`,
      answer: quotient,
      operands: [quotient * b, b],
      hint: `${quotient * b} ÷ ${b}`,
    };
  }
  const quotient = rand(minQ, maxQ);
  return {
    id: Date.now() + Math.random(),
    type: 'division',
    question: `${quotient * b} ÷ ${b} = ?`,
    answer: quotient,
    operands: [quotient * b, b],
    hint: `${quotient * b} ÷ ${b}`,
  };
}

// ─── Generate batch of questions for a kingdom + level ───
export function generateQuestions(kingdom, level, count = 5) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  const ops = cfg.ops || ['addition'];

  const questions = [];
  for (let i = 0; i < count; i++) {
    const op = ops[rand(0, ops.length - 1)];
    let q;
    if (op === 'multiplication') q = makeMul(level);
    else if (op === 'division') q = makeDiv(level);
    else if (op === 'subtraction') q = makeSub(level);
    else q = makeAdd(level);
    questions.push(q);
  }
  return questions;
}

// ─── Hint generation ───
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
    default:
      return [`Tenta resolver!`, `O resultado é ${question.answer}`];
  }
}

// ─── Stars: based on correct answers ───
export function calculateStars(correct, total) {
  const pct = (correct / total) * 100;
  if (pct >= 100) return 3;
  if (pct >= 80) return 2;
  if (pct >= 60) return 1;
  return 0;
}
