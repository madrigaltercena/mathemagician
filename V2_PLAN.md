# Mathemagician V2 — Plano Completo de Implementação

## Visão Geral

Transformar o Mathemagician numa experiência gamificada imersiva onde crianças do 1.º ao 4.º ano aprendem matemática através de uma jornada mágica por 8 reinos. Cada reino conquistado desbloqueia um item mágico colecionável.

---

## Fase 1: Nombres de Reinos e Estrutura de Progressão

### 1.1 Mapa Completo dos Reinos

| Ano | Realm ID | Nome do Reino | Item de Recompensa | Tipo de Splash |
|-----|----------|---------------|-------------------|----------------|
| 1.º Ano | R1 | Vale dos Números Vivos | Cajado de Madeira Nova | Intermédio → Meio Ano |
| 1.º Ano | R2 | Floresta dos Símbolos | Manto de Aprendiz | Fim do 1.º Ano |
| 2.º Ano | R3 | Gruta do Dobro e Metade | Luvas da Duplicação | Intermédio → Meio Ano |
| 2.º Ano | R4 | Montanha do Tempo | Ampulheta de Cristal | Fim do 2.º Ano |
| 3.º Ano | R5 | Deserto das Frações | Escudo de Ouro | Intermédio → Meio Ano |
| 3.º Ano | R6 | Pântano dos Grandes Números | Botas de Sete Léguas | Fim do 3.º Ano |
| 4.º Ano | R7 | Ilha dos Geómetras | Diadema da Sabedoria | Intermédio → Meio Ano |
| 4.º Ano | R8 | Cidade de Mathemagicians | Coroa do Grande Feiticeiro | Fim do 4.º Ano (Jogo Completo) |

### 1.2 Condições de Desbloqueio

- **Nível Intermédio (questão 5 de cada nível 1):** Splash "Nível Concluído!" com confetis simples
- **Fim de Reino (nível 2 completado):** Splash do Item Mágico + texto de progresso
- **Fim de Ano (4 níveis = 2 reinos):** Splash dourado "Mestre do X.º Ano!"

---

## Fase 2: Modelos de Dados e Estado

### 2.1 Objeto `userProgress` (localStorage)

```javascript
{
  completedRealms: [],      // Array de IDs: ["R1", "R2", ...]
  unlockedItems: [],        // Array de itens: ["Cajado de Madeira Nova", ...]
  currentStreak: 0,         // Contador de respostas seguidas
  totalCorrect: 0,         // Total de respostas corretas
  totalAnswered: 0,         // Total de questões respondidas
  lastPlayedDate: null,    // Para sistema de streaks diarios
  currentRealm: "R1",       // Reino atual
  currentLevel: 1,          // Nível atual (1 ou 2)
  grade: 1,                 // Ano de escolaridade atual (1-4)
  avatarItems: [],          // Itens de personalização do avatar
  dailyQuestCompleted: false // Daily quest flag
}
```

### 2.2 Ficheiros a Criar/Modificar

#### Criar:
- `src/utils/curriculumMap.js` — Mapa de dados dos reinos
- `src/hooks/useGamification.js` — Hook central de lógica de progresso
- `src/components/RewardModal/RewardModal.js` — Modal de recompensas
- `src/components/RewardModal/RewardModal.module.css`
- `src/components/Inventory/Inventory.js` — O Baú Mágico
- `src/components/Inventory/Inventory.module.css`
- `src/components/ComboEffects/ComboEffects.js` — Efeitos de streak
- `src/components/ComboEffects/ComboEffects.module.css`
- `src/components/StreakCounter/StreakCounter.js` — Mostrador de série
- `src/components/StreakCounter/StreakCounter.module.css`
- `src/components/DailyQuest/DailyQuest.js` — Missão diária
- `src/components/DailyQuest/DailyQuest.module.css`
- `src/pages/Inventory/Inventory.js` — Página do baú

#### Modificar:
- `src/contexts/GameContext.js` — Integrar lógica de gamification
- `src/pages/Challenge/Challenge.js` — Adicionar triggers de recompensas
- `src/pages/Home/Home.js` — Adicionar acesso ao inventário e streak
- `src/App.js` — Adicionar rota para /inventory

---

## Fase 3: Sistema de Splash Screens

### 3.1 Tipos de Splash

| Tipo | Trigger | Animação | Conteúdo |
|------|---------|----------|----------|
| `level-complete` | Q5 do Nível 1 | Confetis coloridos | "Nível Concluído!" + emoji |
| `realm-complete` | Fim do Nível 2 | Item a aparecer + glow | Nome do Item + descrição |
| `half-year` | 2 reinos completados (meio ano) | Brilho prateado | "Estás a meio do X.º Ano!" |
| `year-complete` | 4 níveis (1 ano completo) | Confetis dourados + aurora | "Mestre do X.º Ano!" + item |
| `game-complete` | R8 completado | Efeito de coroação | "Grande Mathemagician!" |

### 3.2 Textos de Milestone por Reino

```javascript
const milestoneTexts = {
  R1: "Dominaste as somas básicas no Vale! Recebeste o teu primeiro item mágico.",
  R2: "Incrível! Completaste o 1.º Ano de Matemática. Agora és um Aprendiz Oficial!",
  R3: "A magia da multiplicação está nas tuas mãos! O 2.º Ano vai a meio.",
  R4: "Mestre do Tempo! O 2.º Ano foi conquistado com sucesso.",
  R5: "Dividir para conquistar! Estás a meio do caminho no 3.º Ano.",
  R6: "Geometria e números gigantes não te assustam. 3.º Ano concluído!",
  R7: "Quase um mestre! Só falta um reino para seres um Mathemagician.",
  R8: "PARABÉNS! Completaste todos os desafios. És agora um Grande Mathemagician!"
};
```

---

## Fase 4: Componentes UI a Criar

### 4.1 RewardModal

**Ficheiros:** `src/components/RewardModal/`

**Estados:**
- `isLevelComplete` — Confetis simples, ícone de check
- `isRealmComplete` — Item a brilhar, botão "Recebi!"
- `isHalfYear` — Meia lua dourada, "Continuar"
- `isYearComplete` — Coroa/estrela, animação de aurora
- `isGameComplete` — Efeito de coroação total

**Props:**
```javascript
{
  isOpen: boolean,
  type: 'level' | 'realm' | 'half-year' | 'year' | 'game-complete',
  item: { name, description, emoji } | null,
  realmName: string,
  yearNumber: number,
  onClose: () => void
}
```

### 4.2 Inventory (O Baú Mágico)

**Ficheiros:** `src/components/Inventory/` e `src/pages/Inventory/Inventory.js`

**Funcionalidades:**
- Grid 4x2 com 8 slots (itens dos reinos)
- Itens desbloqueados: cor + nome + descrição
- Itens bloqueados: silhueta cinzenta + "???"
- Ao tocar num item desbloqueado: modal com detalhes

### 4.3 ComboEffects

**Ficheiros:** `src/components/ComboEffects/`

**Efeitos por streak:**
- 3 acertos: Halo verde suave
- 5 acertos: Faíscas douradas
- 10 acertos: Efeito de arco-íris
- Reset ao errar: Efeito de "quebrar"

### 4.4 StreakCounter

**Ficheiros:** `src/components/StreakCounter/`

**Display:**
- Chama/miniatura que mostra "🔥 x5" (5 respostas seguidas)
- Posição: topo direito do ecrã de desafio
- Animação de pulsação quando ativo

### 4.5 DailyQuest

**Ficheiros:** `src/components/DailyQuest/`

**Missão padrão:** "Resolve 5 questões corretas hoje"
**Recompensa:** XP bónus + cristal extra

---

## Fase 5: Lógica de Negócio (Hooks)

### 5.1 useGamification.js

```javascript
// Funções exportadas:
- loadProgress() → Carrega do localStorage
- saveProgress(data) → Guarda no localStorage
- completeLevel(realmId, levelId) → Processa vitória
- unlockItem(itemId) → Adiciona item ao inventário
- updateStreak(correct) → Atualiza contador de streak
- checkDailyQuest() → Verifica se daily quest foi completada
- resetDailyQuest() → Reset para novo dia
- getNextRealm(currentRealm) → Determina próximo reino
- isYearComplete(grade) → Verifica se ano está completo
```

### 5.2 curriculumMap.js

```javascript
export const CURRICULUM_MAP = {
  1: {
    grade: 1,
    gradeName: "1.º Ano",
    realms: [
      { id: "R1", name: "Vale dos Números Vivos", item: { name: "Cajado de Madeira Nova", emoji: "🪄" }, levels: 2 },
      { id: "R2", name: "Floresta dos Símbolos", item: { name: "Manto de Aprendiz", emoji: "🧙" }, levels: 2 }
    ]
  },
  // ... 2, 3, 4
};
```

---

## Fase 6: Integração com Código Existente

### 6.1 GameContext.js — Modificações

```javascript
// Adicionar ao estado:
{
  ...existingState,
  userProgress: { /* objeto descrito em 2.1 */ },
  showRewardModal: false,
  rewardModalConfig: { type, item, realmName, yearNumber }
}

// Adicionar ações:
- COMPLETE_LEVEL
- UNLOCK_ITEM
- UPDATE_STREAK
- SHOW_REWARD_MODAL
- HIDE_REWARD_MODAL
- LOAD_PROGRESS
```

### 6.2 Challenge.js — Modificações

```javascript
// Após resposta correta:
1. Incrementar streak com useGamification
2. Se streak >= 3, ativar ComboEffects
3. Se última questão do nível:
   a. Chamar completeLevel() do hook
   b. Determinar tipo de splash
   c. Abrir RewardModal com config apropriada

// Após resposta errada:
1. Reset streak para 0
2. Desativar ComboEffects
```

### 6.3 App.js — Modificações

```javascript
// Adicionar rota:
<Route path="/inventory" element={<InventoryPage />} />

// Adicionar no menu/navegação:
<Link to="/inventory">O Meu Baú</Link>
```

---

## Fase 7: Ordem de Implementação

### Prioridade 1 — Fundamentos (Semana 1)
1. Criar `src/utils/curriculumMap.js` com todos os dados dos reinos
2. Criar `src/hooks/useGamification.js` com lógica de localStorage
3. Modificar `src/contexts/GameContext.js` para integrar gamification state
4. Criar `RewardModal.js` básico com todos os tipos de splash

### Prioridade 2 — Fluxo Principal (Semana 2)
5. Modificar `src/pages/Challenge/Challenge.js` para disparar splashes
6. Integrar RewardModal no fluxo de conclusão de nível
7. Testar fluxo completo: nível 1 → nível 2 → fim de reino
8. Testar fluxo de meio ano e fim de ano

### Prioridade 3 — Inventário e Coleção (Semana 3)
9. Criar `src/pages/Inventory/Inventory.js`
10. Criar grelha de itens com estados lock/unlock
11. Criar modal de detalhes do item
12. Adicionar link ao inventário na Home

### Prioridade 4 — Feedback Visual (Semana 4)
13. Criar `StreakCounter.js` e integrar no Challenge
14. Criar `ComboEffects.js` com animações CSS
15. Adicionar animações de confetis (usar canvas-confetti)
16. Testar efeitos de streak

### Prioridade 5 — Polish e Daily Quests (Semana 5)
17. Criar `DailyQuest.js` com missões diárias
18. Implementar sistema de reset diário
19. Adicionar efeitos sonoros opcionais ( toggle nas definições)
20. Testes finais e correções

---

## Fase 8: Checklist de Ficheiros

### Criar (20 ficheiros)

```
src/
├── utils/
│   └── curriculumMap.js          # ✅ Criar
├── hooks/
│   └── useGamification.js        # ✅ Criar
├── components/
│   ├── RewardModal/
│   │   ├── RewardModal.js         # ✅ Criar
│   │   └── RewardModal.module.css # ✅ Criar
│   ├── Inventory/
│   │   ├── Inventory.js          # ✅ Criar
│   │   └── Inventory.module.css   # ✅ Criar
│   ├── ComboEffects/
│   │   ├── ComboEffects.js       # ✅ Criar
│   │   └── ComboEffects.module.css # ✅ Criar
│   ├── StreakCounter/
│   │   ├── StreakCounter.js      # ✅ Criar
│   │   └── StreakCounter.module.css # ✅ Criar
│   └── DailyQuest/
│       ├── DailyQuest.js         # ✅ Criar
│       └── DailyQuest.module.css # ✅ Criar
└── pages/
    └── Inventory/
        ├── Inventory.js          # ✅ Criar
        └── Inventory.module.css  # ✅ Criar
```

### Modificar (6 ficheiros)

```
src/
├── contexts/
│   └── GameContext.js             # ✏️ Modificar - adicionar estado de gamificação
├── pages/
│   ├── Challenge/
│   │   └── Challenge.js          # ✏️ Modificar - integrar lógica de recompensas
│   └── Home/
│       └── Home.js               # ✏️ Modificar - adicionar link para inventário
├── App.js                         # ✏️ Modificar - adicionar rota /inventory
├── App.css                        # ✏️ Modificar - estilos globais de gamificação
└── index.js                      # ✏️ Modificar -Provider do contexto
```

---

## Fase 9: Considerações Técnicas

### Dependências a Adicionar
```bash
npm install canvas-confetti   # Para efeitos de confetis
npm install framer-motion     # Opcional: animações suaves
```

### Performance
- Guardar estado no localStorage apenas em mudanças (não em cada resposta)
- Usar `React.memo` para componentes de Effects que não mudam frequentemente
- Lazy load da página de Inventory

### Mobile-First
- Todos os componentes devem funcionar em ecrãs de 320px+
- Touch targets mínimo de 44px
- Modals ocupam 90%+ do ecrã em mobile

### Acessibilidade
- Todos os modais com focus trap
- Animações com `prefers-reduced-motion` support
- Alto contraste para textos em backgrounds coloridos

---

## Fase 10: Testing Checklist

### Testes Unitários
- [ ] useGamification: completar nível desbloqueia item correto
- [ ] useGamification: streak faz reset ao errar
- [ ] useGamification: progresso persiste em localStorage
- [ ] curriculumMap: todos os 8 reinos têm dados completos

### Testes de Integração
- [ ] Fluxo R1 completo: Nível 1 → Splash nível → Nível 2 → Splash reino → Item desbloqueado
- [ ] Fluxo de meio ano: R1 + R2 → Splash "Meio do 1.º Ano"
- [ ] Fluxo de ano completo: R1 + R2 → Item "Manto de Aprendiz" aparece no inventário
- [ ] Fluxo completo até R8: Jogo mostra ecrã de conclusão final

### Testes de UI
- [ ] RewardModal surge corretamente em cada tipo
- [ ] Inventory mostra itens corretos (lock vs unlock)
- [ ] StreakCounter atualiza corretamente
- [ ] ComboEffects ativa aos 3+ acertos

---

*Plano gerado por Lynxpector para Mathemagician V2 — Gamification Update*
