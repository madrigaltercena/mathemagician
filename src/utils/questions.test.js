// Jest unit tests for question generation and kingdom threshold logic
// Run with: npm test

const { generateQuestions, generateHint, calculateStars } = require('./questions');

describe('KINGDOM_THRESHOLDS', () => {
  // These thresholds define which kingdom a level belongs to:
  // Kingdom i covers levels: threshold[i]+1 to threshold[i+1]
  // level > threshold[i] → kingdom[i]
  const KINGDOM_ORDER = ['kingdom1', 'kingdom2', 'kingdom3', 'kingdom4', 'kingdom5', 'kingdom6', 'kingdom7', 'kingdom8'];
  const KINGDOM_THRESHOLDS = [0, 2, 4, 6, 8, 10, 12, 14];

  function getKingdomForLevel(level) {
    for (let i = KINGDOM_ORDER.length - 1; i >= 0; i--) {
      if (level > KINGDOM_THRESHOLDS[i]) return KINGDOM_ORDER[i];
    }
    return 'kingdom1';
  }

  function getStartingLevel(kingdom) {
    const idx = KINGDOM_ORDER.indexOf(kingdom);
    return idx >= 0 ? KINGDOM_THRESHOLDS[idx] + 1 : 1;
  }

  test('getKingdomForLevel: level 1-2 → kingdom1', () => {
    expect(getKingdomForLevel(1)).toBe('kingdom1');
    expect(getKingdomForLevel(2)).toBe('kingdom1');
  });

  test('getKingdomForLevel: level 3-4 → kingdom2', () => {
    expect(getKingdomForLevel(3)).toBe('kingdom2');
    expect(getKingdomForLevel(4)).toBe('kingdom2');
  });

  test('getKingdomForLevel: level 5-6 → kingdom3', () => {
    expect(getKingdomForLevel(5)).toBe('kingdom3');
    expect(getKingdomForLevel(6)).toBe('kingdom3');
  });

  test('getKingdomForLevel: level 7-8 → kingdom4', () => {
    expect(getKingdomForLevel(7)).toBe('kingdom4');
    expect(getKingdomForLevel(8)).toBe('kingdom4');
  });

  test('getKingdomForLevel: level 9-10 → kingdom5', () => {
    expect(getKingdomForLevel(9)).toBe('kingdom5');
    expect(getKingdomForLevel(10)).toBe('kingdom5');
  });

  test('getKingdomForLevel: level 11-12 → kingdom6', () => {
    expect(getKingdomForLevel(11)).toBe('kingdom6');
    expect(getKingdomForLevel(12)).toBe('kingdom6');
  });

  test('getKingdomForLevel: level 13-14 → kingdom7', () => {
    expect(getKingdomForLevel(13)).toBe('kingdom7');
    expect(getKingdomForLevel(14)).toBe('kingdom7');
  });

  test('getKingdomForLevel: level 15-16 → kingdom8', () => {
    expect(getKingdomForLevel(15)).toBe('kingdom8');
    expect(getKingdomForLevel(16)).toBe('kingdom8');
  });

  test('getStartingLevel: each kingdom starts at correct level', () => {
    expect(getStartingLevel('kingdom1')).toBe(1);
    expect(getStartingLevel('kingdom2')).toBe(3);
    expect(getStartingLevel('kingdom3')).toBe(5);
    expect(getStartingLevel('kingdom4')).toBe(7);
    expect(getStartingLevel('kingdom5')).toBe(9);
    expect(getStartingLevel('kingdom6')).toBe(11);
    expect(getStartingLevel('kingdom7')).toBe(13);
    expect(getStartingLevel('kingdom8')).toBe(15);
  });

  test('getStartingLevel returns 1 for unknown kingdom', () => {
    expect(getStartingLevel('unknown')).toBe(1);
  });
});

describe('calculateStars', () => {
  test('100% correct → 3 stars', () => {
    expect(calculateStars(5, 5)).toBe(3);
    expect(calculateStars(10, 10)).toBe(3);
  });

  test('80-99% correct → 2 stars', () => {
    expect(calculateStars(4, 5)).toBe(2);
    expect(calculateStars(9, 10)).toBe(2);
  });

  test('60-79% correct → 1 star', () => {
    expect(calculateStars(3, 5)).toBe(1);
    expect(calculateStars(6, 10)).toBe(1);
  });

  test('below 60% correct → 0 stars', () => {
    expect(calculateStars(2, 5)).toBe(0);
    expect(calculateStars(0, 5)).toBe(0);
    expect(calculateStars(5, 10)).toBe(0);
  });
});

describe('generateQuestions', () => {
  test('generates correct number of questions', () => {
    const qs = generateQuestions('kingdom1', 1, 5);
    expect(qs).toHaveLength(5);
  });

  test('generates 10 questions for freeplay', () => {
    const qs = generateQuestions('kingdom1', 1, 10, ['addition']);
    expect(qs).toHaveLength(10);
  });

  test('all questions have required fields', () => {
    const qs = generateQuestions('kingdom1', 1, 5);
    qs.forEach(q => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('type');
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('answer');
      expect(q).toHaveProperty('operands');
      expect(q).toHaveProperty('hint');
    });
  });

  test('addition questions have correct answer', () => {
    const qs = generateQuestions('kingdom1', 1, 20);
    qs.filter(q => q.type === 'addition').forEach(q => {
      const [a, b] = q.operands;
      expect(q.answer).toBe(a + b);
      expect(q.question).toBe(`${a} + ${b} = ?`);
    });
  });

  test('subtraction questions have correct answer', () => {
    const qs = generateQuestions('kingdom1', 1, 20);
    qs.filter(q => q.type === 'subtraction').forEach(q => {
      const [a, b] = q.operands;
      expect(q.answer).toBe(a - b);
      expect(q.question).toBe(`${a} - ${b} = ?`);
    });
  });

  test('multiplication questions have correct answer', () => {
    const qs = generateQuestions('kingdom5', 9, 20);
    qs.filter(q => q.type === 'multiplication').forEach(q => {
      const [a, b] = q.operands;
      expect(q.answer).toBe(a * b);
    });
  });

  test('division questions have correct answer', () => {
    const qs = generateQuestions('kingdom5', 9, 20);
    qs.filter(q => q.type === 'division').forEach(q => {
      const [a, b] = q.operands;
      expect(q.answer).toBe(a / b);
    });
  });

  test('freeplay with opsArray cycles through operations', () => {
    const qs = generateQuestions('kingdom1', 1, 4, ['addition', 'subtraction']);
    const types = qs.map(q => q.type);
    // Should cycle: addition, subtraction, addition, subtraction
    expect(types[0]).toBe('addition');
    expect(types[1]).toBe('subtraction');
    expect(types[2]).toBe('addition');
    expect(types[3]).toBe('subtraction');
  });

  test('freeplay progressive difficulty uses easier levels early', () => {
    const qs = generateQuestions('kingdom1', 1, 10, ['addition']);
    // First 4 questions should use easier levels (1-2)
    // Last 6 should use harder levels (3+)
    // Check that operands in early questions are smaller
    const firstHalf = qs.slice(0, 4);
    const secondHalf = qs.slice(6);
    const firstMax = Math.max(...firstHalf.map(q => Math.max(...q.operands)));
    const secondMax = Math.max(...secondHalf.map(q => Math.max(...q.operands)));
    expect(secondMax).toBeGreaterThanOrEqual(firstMax);
  });
});

describe('generateHint', () => {
  test('addition hint contains operands', () => {
    const hint = generateHint({ type: 'addition', operands: [3, 7] });
    expect(hint[0]).toContain('3 + 7');
  });

  test('subtraction hint contains operands', () => {
    const hint = generateHint({ type: 'subtraction', operands: [10, 3] });
    expect(hint[0]).toContain('10 - 3');
  });

  test('multiplication hint contains the table number', () => {
    const hint = generateHint({ type: 'multiplication', operands: [4, 6] });
    // Hint uses the table number (6), not the first operand (4)
    expect(hint[0]).toContain('6');
  });

  test('division hint contains operands', () => {
    const hint = generateHint({ type: 'division', operands: [20, 4] });
    expect(hint[0]).toContain('20');
  });

  test('returns array of hints', () => {
    const hint = generateHint({ type: 'addition', operands: [1, 2] });
    expect(Array.isArray(hint)).toBe(true);
    expect(hint.length).toBeGreaterThan(0);
  });
});
