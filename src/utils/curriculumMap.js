// Mathemagician V2 — Curriculum & Kingdom Data
// This file is the single source of truth for all kingdom/item/creature data.

export const CURRICULUM_MAP = {
  1: {
    grade: 1,
    gradeName: '1.º Ano',
    realms: [
      {
        id: 'kingdom1',
        name: 'Vale dos Números Vivos',
        item: { name: 'Cajado de Madeira Nova', emoji: '🪄' },
        creature: { name: 'Dragão dos Números', emoji: '🐉' },
        levels: 2,
      },
      {
        id: 'kingdom2',
        name: 'Floresta dos Símbolos',
        item: { name: 'Manto de Aprendiz', emoji: '🧥' },
        creature: { name: 'Borboleta Simbólica', emoji: '🦋' },
        levels: 2,
      },
    ],
  },
  2: {
    grade: 2,
    gradeName: '2.º Ano',
    realms: [
      {
        id: 'kingdom3',
        name: 'Gruta do Dobro e Metade',
        item: { name: 'Luvas da Duplicação', emoji: '🧤' },
        creature: { name: 'Lobo Tabuada', emoji: '🐺' },
        levels: 2,
      },
      {
        id: 'kingdom4',
        name: 'Montanha do Tempo',
        item: { name: 'Ampulheta de Cristal', emoji: '⏳' },
        creature: { name: 'Coruja do Tempo', emoji: '🦉' },
        levels: 2,
      },
    ],
  },
  3: {
    grade: 3,
    gradeName: '3.º Ano',
    realms: [
      {
        id: 'kingdom5',
        name: 'Deserto das Frações',
        item: { name: 'Escudo de Ouro', emoji: '🛡️' },
        creature: { name: 'Escorpião das Frações', emoji: '🦂' },
        levels: 2,
      },
      {
        id: 'kingdom6',
        name: 'Pântano dos Grandes Números',
        item: { name: 'Botas de Sete Léguas', emoji: '🥾' },
        creature: { name: 'Sapo do Pântano', emoji: '🐸' },
        levels: 2,
      },
    ],
  },
  4: {
    grade: 4,
    gradeName: '4.º Ano',
    realms: [
      {
        id: 'kingdom7',
        name: 'Ilha dos Geómetras',
        item: { name: 'Diadema da Sabedoria', emoji: '👑' },
        creature: { name: 'Caranguejo Geómetra', emoji: '🦀' },
        levels: 2,
      },
      {
        id: 'kingdom8',
        name: 'Cidade dos Mathemagicians',
        item: { name: 'Coroa do Grande Feiticeiro', emoji: '💎' },
        creature: { name: 'Polvo Matemático', emoji: '🐙' },
        levels: 2,
      },
    ],
  },
};

// Flat lookup: kingdomId → realm data
export const REALM_DATA = Object.values(CURRICULUM_MAP)
  .flatMap(grade => grade.realms)
  .reduce((acc, realm) => {
    acc[realm.id] = realm;
    return acc;
  }, {});

// Kingdom IDs in order (internal IDs — never exposed to user)
export const KINGDOM_ORDER = ['kingdom1', 'kingdom2', 'kingdom3', 'kingdom4', 'kingdom5', 'kingdom6', 'kingdom7', 'kingdom8'];

// Milestone texts shown when completing each kingdom
export const KINGDOM_MILESTONE_TEXTS = {
  kingdom1: 'Dominaste as somas básicas no Vale! Recebeste o teu primeiro item mágico.',
  kingdom2: 'Incrível! Completaste o 1.º Ano de Matemática. Agora és um Aprendiz Oficial!',
  kingdom3: 'A magia da multiplicação está nas tuas mãos! O 2.º Ano vai a meio.',
  kingdom4: 'Mestre do Tempo! O 2.º Ano foi conquistado com sucesso.',
  kingdom5: 'Dividir para conquistar! Estás a meio do caminho no 3.º Ano.',
  kingdom6: 'Geometria e números gigantes não te assustam. 3.º Ano concluído!',
  kingdom7: 'Quase um mestre! Só falta um reino para seres um Mathemagician.',
  kingdom8: 'PARABÉNS! Completaste todos os desafios. És agora um Grande Mathemagician!',
};

// Year completion milestone texts
export const YEAR_MILESTONE_TEXTS = {
  1: 'Conquistaste o Vale dos Números Vivos e a Floresta dos Símbolos! És um verdadeiro Aprendiz de Feiticeiro!',
  2: 'Dominaste a Gruta do Dobro e Metade e a Montanha do Tempo! A tua magia cresce a cada dia!',
  3: 'Venceste o Deserto das Frações e o Pântano dos Grandes Números! Estás cada vez mais perto do título de Mago!',
  4: 'A Ilha dos Geómetras e a Cidade dos Mathemagicians foram conquistadas! És agora um GRÃO-MAGO DA MATEMÁTICA!',
};

// Display name for each kingdom (narrative names only — internal IDs stay unchanged)
export const KINGDOM_DISPLAY_NAMES = {
  kingdom1: 'Vale dos Números Vivos',
  kingdom2: 'Floresta dos Símbolos',
  kingdom3: 'Gruta do Dobro e Metade',
  kingdom4: 'Montanha do Tempo',
  kingdom5: 'Deserto das Frações',
  kingdom6: 'Pântano dos Grandes Números',
  kingdom7: 'Ilha dos Geómetras',
  kingdom8: 'Cidade dos Mathemagicians',
};

// Reward types for RewardModal
export const REWARD_TYPES = {
  LEVEL_COMPLETE: 'level-complete',     // Odd level (1,3,5...) — simple confetti
  REALM_COMPLETE: 'realm-complete',      // Even level (2,4,6...) — item unlock
  HALF_YEAR: 'half-year',                // After kingdom 2, 4, 6 (meio ano)
  YEAR_COMPLETE: 'year-complete',        // After kingdom 4, 8 (ano completo)
  GAME_COMPLETE: 'game-complete',       // After kingdom 8
};

// Map internal level number to reward type
// Each kingdom has 2 levels: level N = kingdom index floor((N-1)/2) + 1
// level 1,2 → kingdom1; level 3,4 → kingdom2; ...
//
// IMPORTANT: realm completion must be checked FIRST before year/half-year milestones,
// otherwise levels 4,8 (which are both year-end AND realm-end) skip the realm item.
export const getRewardTypeForLevel = (level, totalLevelsInKingdom = 2) => {
  const isLastLevelInKingdom = level % totalLevelsInKingdom === 0;
  const kingdomIndex = Math.floor((level - 1) / totalLevelsInKingdom);
  const isHalfYear = kingdomIndex === 1; // After kingdom 2 (level 6)
  const isYearEnd = kingdomIndex === 3;   // After kingdom 4 (level 8)
  const isGameEnd = level === 16;

  if (isGameEnd) return REWARD_TYPES.GAME_COMPLETE;

  // Realm completion takes priority — always show realm item even at year/half-year
  if (isLastLevelInKingdom) {
    if (isYearEnd) return REWARD_TYPES.YEAR_COMPLETE;
    if (isHalfYear) return REWARD_TYPES.HALF_YEAR;
    return REWARD_TYPES.REALM_COMPLETE;
  }

  return REWARD_TYPES.LEVEL_COMPLETE;
};
