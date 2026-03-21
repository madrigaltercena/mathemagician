// Question generation — level-based difficulty
// 16 levels, 8 kingdoms (2 per year), 5 questions per level

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// LEVEL_CONFIG: each level specifies operation type(s), result range, tables, digits
// Result range = the actual answer to the question (not operand size)
const LEVEL_CONFIG = {
  // ─── REINO 1 — Níveis 1-2 (1º Ano, resultados 1-10) ───
  1: { ops: ['addition', 'subtraction'], resultRange: [1, 10] },
  2: { ops: ['addition', 'subtraction'], resultRange: [1, 10] },

  // ─── REINO 2 — Níveis 3-4 (1º Ano, resultados 5-20) ───
  3: { ops: ['addition', 'subtraction'], resultRange: [5, 20] },
  4: { ops: ['addition', 'subtraction'], resultRange: [5, 20] },

  // ─── REINO 3 — Níveis 5-6 (2º Ano, + tabuadas 2,3,4,5) ───
  5: { ops: ['addition', 'subtraction', 'multiplication'], resultRange: [10, 100], tables: [2, 3, 4, 5] },
  6: { ops: ['addition', 'subtraction', 'multiplication'], resultRange: [10, 100], tables: [2, 3, 4, 5] },

  // ─── REINO 4 — Níveis 7-8 (2º Ano, tabuadas 2-5, mais difíceis) ───
  7: { ops: ['addition', 'subtraction', 'multiplication'], resultRange: [50, 200], tables: [2, 3, 4, 5] },
  8: { ops: ['addition', 'subtraction', 'multiplication'], resultRange: [50, 200], tables: [2, 3, 4, 5] },

  // ─── REINO 5 — Níveis 9-10 (3º Ano, ×1 dígito, ÷1 dígito) ───
  9:  { ops: ['multiplication', 'division'], resultRange: [10, 100], tables: [2, 3, 4, 5, 6, 7, 8, 9] },
  10: { ops: ['multiplication', 'division'], resultRange: [10, 100], tables: [2, 3, 4, 5, 6, 7, 8, 9] },

  // ─── REINO 6 — Níveis 11-12 (3º Ano, ×2 dígitos, ÷2 dígitos) ───
  11: { ops: ['multiplication', 'division'], resultRange: [50, 500], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  12: { ops: ['multiplication', 'division'], resultRange: [50, 500], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },

  // ─── REINO 7 — Níveis 13-14 (4º Ano, ×÷ harder) ───
  13: { ops: ['multiplication', 'division'], resultRange: [100, 2000], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  14: { ops: ['multiplication', 'division'], resultRange: [100, 2000], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },

  // ─── REINO 8 — Níveis 15-16 (4º Ano, hardest + expressões) ───
  15: { ops: ['multiplication', 'division', 'expression'], resultRange: [100, 5000], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  16: { ops: ['multiplication', 'division', 'expression'], resultRange: [100, 10000], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
};

// ─── Helpers ────────────────────────────────────────────────

function makeAdd(lvl) {
  const [min, max] = LEVEL_CONFIG[lvl].resultRange;
  const result = rand(min, max);
  const a = rand(1, Math.max(1, result - 1));
  const b = result - a;
  return { id: Date.now() + Math.random(), type: 'addition', question: `${a} + ${b} = ?`, answer: result, operands: [a, b], hint: `${a} + ${b}` };
}

function makeSub(lvl) {
  const [min, max] = LEVEL_CONFIG[lvl].resultRange;
  const result = rand(min, max);
  const a = rand(result, result + rand(5, 20));
  const b = a - result;
  return { id: Date.now() + Math.random(), type: 'subtraction', question: `${a} - ${b} = ?`, answer: result, operands: [a, b], hint: `${a} - ${b}` };
}

function makeMul(lvl) {
  const cfg = LEVEL_CONFIG[lvl];
  const tables = cfg.tables || [2, 3, 4, 5, 10];
  const [min, max] = cfg.resultRange;
  const table = tables[rand(0, tables.length - 1)];
  const minA = Math.max(1, Math.ceil(min / table));
  const maxA = Math.floor(max / table);
  const a = minA <= maxA ? rand(minA, maxA) : rand(1, 10);
  return { id: Date.now() + Math.random(), type: 'multiplication', question: `${a} × ${table} = ?`, answer: a * table, operands: [a, table], hint: `${a} × ${table}` };
}

function makeDiv(lvl) {
  const cfg = LEVEL_CONFIG[lvl];
  const divTable = cfg.tables || [2, 3, 4, 5, 6, 7, 8, 9];
  const [min, max] = cfg.resultRange;
  const b = divTable[rand(0, divTable.length - 1)];
  const minQ = Math.max(1, Math.ceil(min / b));
  const maxQ = Math.floor(max / b);
  const quotient = minQ <= maxQ ? rand(minQ, maxQ) : rand(1, 10);
  return { id: Date.now() + Math.random(), type: 'division', question: `${quotient * b} ÷ ${b} = ?`, answer: quotient, operands: [quotient * b, b], hint: `${quotient * b} ÷ ${b}` };
}

function makeExpr(lvl) {
  const [min, max] = LEVEL_CONFIG[lvl].resultRange;
  const a = rand(Math.max(10, min), Math.min(max, 1000));
  const b = rand(Math.max(10, min), Math.min(max, 1000));
  const c = rand(2, 9);
  // (a + b) × c
  const result = (a + b) * c;
  return {
    id: Date.now() + Math.random(),
    type: 'expression',
    question: `(${a} + ${b}) × ${c} = ?`,
    answer: result,
    operands: [a, b, c],
    hint: `Resolve primeiro (a + b), depois multiplica por ${c}!`,
  };
}

// ─── Main generator ──────────────────────────────────────────

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

export function generateHint(question) {
  const { type, operands } = question;
  const [a, b] = operands;
  switch (type) {
    case 'addition': return [`${a} + ${b}`, `Conta!`, `O resultado é ${a + b}!`];
    case 'subtraction': return [`${a} - ${b}`, `Tira ${b} de ${a}.`, `O resultado é ${a - b}!`];
    case 'multiplication': return [`Conta de ${b} em ${b}!`, `${a} × ${b} = ${a * b}`];
    case 'division': return [`Quantas vezes cabe ${b} em ${a}?`, `${a} ÷ ${b} = ${a / b}`];
    case 'expression': return [`Resolve primeiro o que está dentro dos parênteses!`, `Depois multiplica!`, `O resultado é ${question.answer}!`];
    default: return [`O resultado é ${question.answer}!`];
  }
}

export function calculateStars(correct, total) {
  const pct = (correct / total) * 100;
  if (pct >= 100) return 3;
  if (pct >= 80) return 2;
  if (pct >= 60) return 1;
  return 0;
}
