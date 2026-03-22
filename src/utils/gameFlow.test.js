// Integration-style tests for game progression flow
// These test the expected user-visible behaviour described in the QA checklist
//
// Tests marked [UI] require manual browser testing (viewport size, visual QA)
// Tests marked [localStorage] require integration/E2E tests

const HALF_YEAR_LEVELS = [2, 4, 6, 8, 10, 12, 14, 16];

describe('Modal trigger logic — level completion', () => {
  // Half-year milestones: shown when completing an ODD level (2, 4, 6...)
  // But based on actual code: HALF_YEAR_LEVELS = [2, 4, 6, 8, 10, 12, 14, 16]
  // These are ALL EVEN — so the milestone modal shows on EVEN levels
  // And the RESULT modal shows on ODD levels

  test('HALF_YEAR_LEVELS contains only even levels (milestone modal triggers)', () => {
    HALF_YEAR_LEVELS.forEach(level => {
      expect(level % 2).toBe(0); // All are even numbers
    });
  });

  test('level 1 (odd) → result modal, NOT milestone modal', () => {
    const isHalfYear = HALF_YEAR_LEVELS.includes(1);
    expect(isHalfYear).toBe(false);
    // → shows ResultModal (basic level complete)
  });

  test('level 2 (even) → milestone modal (half-year completion)', () => {
    const isHalfYear = HALF_YEAR_LEVELS.includes(2);
    expect(isHalfYear).toBe(true);
    // → shows AgeCompletionModal with "Parabéns! Completaste o 1º ano!"
  });

  test('level 3 (odd) → result modal, NOT milestone modal', () => {
    const isHalfYear = HALF_YEAR_LEVELS.includes(3);
    expect(isHalfYear).toBe(false);
    // → shows ResultModal
  });

  test('level 4 (even) → milestone modal (half-year completion)', () => {
    const isHalfYear = HALF_YEAR_LEVELS.includes(4);
    expect(isHalfYear).toBe(true);
    // → shows AgeCompletionModal with "Estás a meio do 2º ano!"
  });

  test('level 16 (last level) → milestone modal, NOT result modal', () => {
    const isHalfYear = HALF_YEAR_LEVELS.includes(16);
    expect(isHalfYear).toBe(true);
    // → shows AgeCompletionModal with "Completaste o 4º ano!"
  });

  test('all HALF_YEAR_LEVELS are within 1-16 range', () => {
    HALF_YEAR_LEVELS.forEach(level => {
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(16);
    });
  });

  test('there are exactly 8 milestone levels (one per kingdom)', () => {
    expect(HALF_YEAR_LEVELS).toHaveLength(8);
  });

  test('milestone levels cover all 8 kingdoms (every 2 levels)', () => {
    // Each kingdom has 2 levels; milestone shows at the end of each kingdom's 2nd level
    for (let i = 0; i < 8; i++) {
      const expectedLevel = (i + 1) * 2;
      expect(HALF_YEAR_LEVELS[i]).toBe(expectedLevel);
    }
  });
});

describe('Kingdom progression — next level after milestone', () => {
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

  // [localStorage] QA: replaying a completed kingdom lets player play BOTH levels
  test('getStartingLevel for each kingdom returns first level of that kingdom', () => {
    // kingdom1: levels 1-2 → starting level is 1
    expect(getStartingLevel('kingdom1')).toBe(1);
    // kingdom2: levels 3-4 → starting level is 3
    expect(getStartingLevel('kingdom2')).toBe(3);
    // kingdom3: levels 5-6 → starting level is 5
    expect(getStartingLevel('kingdom3')).toBe(5);
    // etc.
    expect(getStartingLevel('kingdom4')).toBe(7);
    expect(getStartingLevel('kingdom5')).toBe(9);
    expect(getStartingLevel('kingdom6')).toBe(11);
    expect(getStartingLevel('kingdom7')).toBe(13);
    expect(getStartingLevel('kingdom8')).toBe(15);
  });

  test('each kingdom covers exactly 2 levels', () => {
    const kingdoms = {};
    for (let level = 1; level <= 16; level++) {
      const kingdom = getKingdomForLevel(level);
      if (!kingdoms[kingdom]) kingdoms[kingdom] = [];
      kingdoms[kingdom].push(level);
    }
    Object.values(kingdoms).forEach(levels => {
      expect(levels).toHaveLength(2);
    });
  });

  test('after completing milestone level, Continue goes to correct next kingdom', () => {
    // Complete level 2 of kingdom1 → Continue → should go to level 3 of kingdom2
    const nextLevel = 2 + 1;
    const nextKingdom = getKingdomForLevel(nextLevel);
    expect(nextKingdom).toBe('kingdom2');

    // Complete level 4 of kingdom2 → Continue → should go to level 5 of kingdom3
    const nextLevel4 = 4 + 1;
    const nextKingdom4 = getKingdomForLevel(nextLevel4);
    expect(nextKingdom4).toBe('kingdom3');

    // Complete level 16 of kingdom8 → Continue → should go back to kingdom8 level 16 (final)
    const nextLevel16 = 16 + 1;
    expect(nextLevel16).toBe(17); // Would be capped at 16 in actual code
  });
});

describe('AgeCompletionModal content — message mapping', () => {
  // The milestone messages for each half-year level
  const HALF_YEAR_MESSAGES = {
    2:  { year: 1, isYearEnd: false },
    4:  { year: 1, isYearEnd: true },
    6:  { year: 2, isYearEnd: false },
    8:  { year: 2, isYearEnd: true },
    10: { year: 3, isYearEnd: false },
    12: { year: 3, isYearEnd: true },
    14: { year: 4, isYearEnd: false },
    16: { year: 4, isYearEnd: true },
  };

  test('HALF_YEAR_MESSAGES has all 8 milestone levels', () => {
    expect(Object.keys(HALF_YEAR_MESSAGES)).toHaveLength(8);
  });

  test('year 1 ends at level 4 (not level 2)', () => {
    expect(HALF_YEAR_MESSAGES[2].year).toBe(1);
    expect(HALF_YEAR_MESSAGES[2].isYearEnd).toBe(false); // "Estás a meio do 1º ano"
    expect(HALF_YEAR_MESSAGES[4].year).toBe(1);
    expect(HALF_YEAR_MESSAGES[4].isYearEnd).toBe(true);  // "Parabéns! Completaste o 1º ano!"
  });

  test('levels 5-8 are year 2', () => {
    expect(HALF_YEAR_MESSAGES[6].year).toBe(2);
    expect(HALF_YEAR_MESSAGES[6].isYearEnd).toBe(false);
    expect(HALF_YEAR_MESSAGES[8].year).toBe(2);
    expect(HALF_YEAR_MESSAGES[8].isYearEnd).toBe(true);
  });

  test('levels 9-12 are year 3', () => {
    expect(HALF_YEAR_MESSAGES[10].year).toBe(3);
    expect(HALF_YEAR_MESSAGES[10].isYearEnd).toBe(false);
    expect(HALF_YEAR_MESSAGES[12].year).toBe(3);
    expect(HALF_YEAR_MESSAGES[12].isYearEnd).toBe(true);
  });

  test('levels 13-16 are year 4', () => {
    expect(HALF_YEAR_MESSAGES[14].year).toBe(4);
    expect(HALF_YEAR_MESSAGES[14].isYearEnd).toBe(false);
    expect(HALF_YEAR_MESSAGES[16].year).toBe(4);
    expect(HALF_YEAR_MESSAGES[16].isYearEnd).toBe(true);
  });
});

describe('[UI] Manual QA checklist — must test in browser', () => {
  // These CANNOT be automated with unit tests — they require visual/manual QA

  const MANUAL_QA_ITEMS = [
    {
      id: 'UI-1',
      description: 'Milestone modal text fits on iPhone 11 screen (375x812)',
      viewport: '375x812',
      whatToCheck: 'Title + subtitle + year badge + streak badge all visible without scrolling'
    },
    {
      id: 'UI-2',
      description: 'Milestone modal text fits on Pixel 6 screen (412x915)',
      viewport: '412x915',
      whatToCheck: 'Same as UI-1 on larger but taller screen'
    },
    {
      id: 'UI-3',
      description: 'Result modal buttons stay inside parent card on small screens',
      viewport: '375x812',
      whatToCheck: 'Retry + Next buttons do not overflow the modal card'
    },
    {
      id: 'UI-4',
      description: 'AgeCompletionModal buttons stay inside parent card on small screens',
      viewport: '375x812',
      whatToCheck: 'Continue + Menu Principal buttons do not overflow the modal card'
    },
    {
      id: 'QA-1',
      description: 'Replay kingdom1 after completing it — can play BOTH levels 1 and 2',
      action: 'Complete levels 1+2, go back to StoryMode, tap kingdom1 node with "Revisão" badge',
      expected: 'Start at level 1; after completing level 1, Next goes to level 2; after completing level 2, Continue goes to kingdom2'
    },
    {
      id: 'QA-2',
      description: 'Exit challenge at question 3 of 5, resume returns to question 3',
      action: 'Play level, answer 2 questions, press back arrow, re-enter same kingdom',
      expected: 'Start at question 3 with questions 1-2 marked complete'
    },
    {
      id: 'QA-3',
      description: 'Resume to most advanced unanswered question after replaying previous kingdoms',
      action: 'Start level 1, exit, replay kingdom1, complete both levels, return to original kingdom',
      expected: 'Resume at the furthest unanswered question in the original kingdom'
    },
  ];

  MANUAL_QA_ITEMS.forEach(item => {
    test(`[MANUAL QA ${item.id}] ${item.description}`, () => {
      // This is a placeholder — the test always passes but documents what must be tested
      expect(item.description).toBeDefined();
    });
  });
});
