// ─── Tab switching ───
document.querySelectorAll('.demo-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.demo-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ─── Mock Data ───
const champions = [
  'Jinx', 'Vi', 'Caitlyn', 'Jayce', 'Ekko', 'Silco', 'Warwick',
  'Zeri', 'Viego', 'Akali', 'Yasuo', 'Yone', 'Garen', 'Darius',
  'Lux', 'Ahri', 'Zed', 'Lee Sin', 'Sett', 'Kayn', 'Morgana',
  'Thresh', 'Blitzcrank', 'Orianna', 'Camille', 'Fiora', 'Renata'
];

const synergies = [
  'Arcane', 'Enforcer', 'Innovator', 'Hextech', 'Chemtech',
  'Bruiser', 'Assassin', 'Sniper', 'Scholar', 'Socialite',
  'Yordle', 'Mutant', 'Scrap', 'Clockwork', 'Academy'
];

const costs = [1, 1, 2, 2, 3, 3, 4, 4, 5];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ─── Summoner Search Demo ───
function searchSummoner() {
  const input = document.getElementById('summoner-input').value.trim();
  if (!input) return;

  const name = input.split('#')[0] || input;
  const tag = input.split('#')[1] || 'KR1';
  const result = document.getElementById('search-result');

  const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
  const rank = randomFrom(ranks);
  const tier = randomInt(1, 4);
  const lp = randomInt(0, 99);
  const wins = randomInt(30, 150);
  const losses = randomInt(20, 120);
  const winRate = ((wins / (wins + losses)) * 100).toFixed(1);

  const isHigh = ['Diamond', 'Master'].includes(rank);
  const rankClass = isHigh ? 'rank-diamond' : 'rank-gold';

  let matchHtml = '';
  for (let i = 0; i < 5; i++) {
    const place = randomInt(1, 8);
    const placeClass = place <= 4 ? 'top4' : 'bot4';
    const champCount = randomInt(6, 9);
    let champsHtml = '';
    for (let j = 0; j < champCount; j++) {
      const cost = costs[randomInt(0, costs.length - 1)];
      champsHtml += `<div class="match-champ cost-${cost}">${randomFrom(champions).slice(0, 2)}</div>`;
    }
    const synCount = randomInt(2, 4);
    let synHtml = '';
    for (let j = 0; j < synCount; j++) {
      synHtml += `<span class="match-syn">${randomFrom(synergies)}</span>`;
    }
    matchHtml += `
      <div class="match-item" style="animation-delay: ${i * 0.08}s">
        <div class="match-place ${placeClass}">#${place}</div>
        <div class="match-champs">${champsHtml}</div>
        <div class="match-synergies">${synHtml}</div>
      </div>`;
  }

  result.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">${name.charAt(0).toUpperCase()}</div>
        <div>
          <div class="profile-name">${name}</div>
          <div class="profile-tag">#${tag}</div>
          <span class="profile-rank ${rankClass}">${rank} ${tier} &middot; ${lp} LP</span>
        </div>
      </div>
      <div style="display:flex;gap:24px;font-size:.85rem;color:var(--fg-dim)">
        <span><strong style="color:var(--blue)">${wins}</strong>승</span>
        <span><strong style="color:var(--red)">${losses}</strong>패</span>
        <span>승률 <strong style="color:var(--fg)">${winRate}%</strong></span>
        <span>최근 <strong style="color:var(--fg)">30</strong>경기</span>
      </div>
    </div>
    <h4 style="margin-bottom:10px;font-size:.9rem;color:var(--fg-dim)">최근 매치 (데모 데이터)</h4>
    <div class="match-list">${matchHtml}</div>
  `;
}

// ─── AI Chat Demo ───
const chatResponses = [
  {
    keywords: ['메타', '추천', '덱', '뭐해'],
    response: '현재 메타에서는 **Hextech Innovator** 조합이 강력합니다.\n\n핵심 유닛: Jayce(5), Jinx(5), Vi(2)\n주요 시너지: Hextech 4 + Innovator 4\n\n초반에 Ezreal과 Zilean으로 시작하여 중반에 Jayce로 전환하는 것이 핵심입니다. 아이템은 Jinx에게 Giant Slayer + Last Whisper + Guinsoo를 추천드려요.'
  },
  {
    keywords: ['아이템', '뭐 줘', '뭘 줘', 'item'],
    response: '캐리 챔피언 별 추천 아이템:\n\n**Jinx**: Giant Slayer + Last Whisper + Guinsoo\n**Jhin**: Infinity Edge + Last Whisper + Giant Slayer\n**Viktor**: Blue Buff + Jeweled Gauntlet + Giant Slayer\n\n방어 아이템은 탱커에게 Warmog + Bramble Vest + Dragon\'s Claw를 추천합니다.'
  },
  {
    keywords: ['시너지', '조합', 'synergy'],
    response: '현재 강력한 시너지 조합 TOP 3:\n\n1. **Hextech 6** — 마법 피해 폭발 (승률 52.3%)\n2. **Assassin 4 + Mutant** — 백라인 암살 (승률 49.8%)\n3. **Bruiser 6 + Scholar** — 전열 탱킹 (승률 48.5%)\n\n시너지 활성화 단계를 잘 맞추는 것이 핵심입니다.'
  },
  {
    keywords: ['이겼', '졌', '분석', '피드백', '왜'],
    response: '전적 분석 결과 몇 가지 개선점이 보입니다:\n\n1. **아이템 타이밍** — 2-1 단계까지 2개 이상의 완성 아이템을 목표로 하세요\n2. **이코노미 관리** — 연패 시에도 50골드 이자를 최대한 유지하세요\n3. **포지셔닝** — 캐리를 후방 코너에 배치하고, 어쌔신 상대 시 전방으로 이동하세요\n\n전반적으로 레벨링 타이밍이 빠른 편이니, 4-1에 레벨 7, 5-1에 레벨 8을 목표로 잡으세요.'
  }
];

const defaultResponse = '좋은 질문이네요! TFT에서 실력을 올리려면 3가지에 집중하세요:\n\n1. **메타 덱 2~3개 숙련** — 한 덱을 완벽히 이해하는 것이 핵심\n2. **이코노미 원칙** — 50골드 이자 관리 + 적절한 레벨링\n3. **스카우팅** — 상대 보드를 확인하고 컨테스트 여부 판단\n\n구체적으로 어떤 부분이 궁금하신가요? 메타 덱, 아이템, 시너지 등에 대해 물어보세요!';

function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  const messages = document.getElementById('chat-messages');

  // User message
  messages.innerHTML += `
    <div class="chat-msg user">
      <div class="chat-avatar">나</div>
      <div class="chat-bubble">${escapeHtml(msg)}</div>
    </div>`;

  input.value = '';

  // Bot typing indicator
  const typingId = 'typing-' + Date.now();
  messages.innerHTML += `
    <div class="chat-msg bot" id="${typingId}">
      <div class="chat-avatar">AI</div>
      <div class="chat-bubble" style="color:var(--fg-dim)">입력 중...</div>
    </div>`;
  messages.scrollTop = messages.scrollHeight;

  // Bot response (simulated delay)
  setTimeout(() => {
    const typing = document.getElementById(typingId);
    if (typing) typing.remove();

    let response = defaultResponse;
    const lower = msg.toLowerCase();
    for (const r of chatResponses) {
      if (r.keywords.some(k => lower.includes(k))) {
        response = r.response;
        break;
      }
    }

    messages.innerHTML += `
      <div class="chat-msg bot">
        <div class="chat-avatar">AI</div>
        <div class="chat-bubble">${formatMarkdown(response)}</div>
      </div>`;
    messages.scrollTop = messages.scrollHeight;
  }, 800 + Math.random() * 600);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

// ─── Meta Decks ───
const metaDecks = [
  {
    name: 'Hextech Innovator',
    hot: true,
    winRate: '52.3%',
    champions: ['Jayce', 'Jinx', 'Vi', 'Ekko', 'Zilean', 'Ezreal', 'Orianna', 'Seraphine'],
    synergies: ['Hextech 4', 'Innovator 4', 'Enforcer 2', 'Scholar 2']
  },
  {
    name: 'Assassin Mutant',
    hot: true,
    winRate: '49.8%',
    champions: ['Kayn', 'Ekko', 'Talon', 'Kassadin', 'Cho\'Gath', 'Malzahar', 'Rek\'Sai'],
    synergies: ['Assassin 4', 'Mutant 5', 'Bruiser 2']
  },
  {
    name: 'Bruiser Scholar',
    hot: false,
    winRate: '48.5%',
    champions: ['Vi', 'Tahm Kench', 'Illaoi', 'Mundo', 'Janna', 'Orianna', 'Lissandra'],
    synergies: ['Bruiser 6', 'Scholar 2', 'Enforcer 2']
  },
  {
    name: 'Yordle Scrap',
    hot: false,
    winRate: '47.2%',
    champions: ['Veigar', 'Lulu', 'Poppy', 'Ziggs', 'Tristana', 'Heimerdinger', 'Jinx'],
    synergies: ['Yordle 6', 'Scrap 2', 'Sniper 2']
  }
];

function renderMeta() {
  const grid = document.getElementById('meta-grid');
  grid.innerHTML = metaDecks.map(deck => {
    const champsHtml = deck.champions.map(c => {
      const cost = randomInt(1, 5);
      return `<div class="match-champ cost-${cost}">${c.slice(0, 2)}</div>`;
    }).join('');
    const synHtml = deck.synergies.map(s => `<span class="match-syn">${s}</span>`).join('');

    return `
      <div class="meta-card">
        <div class="meta-card-header">
          <div>
            <div class="meta-name">${deck.name}</div>
            <div class="meta-winrate">승률 ${deck.winRate}</div>
          </div>
          ${deck.hot ? '<span class="meta-hot">HOT</span>' : ''}
        </div>
        <div class="meta-champs">${champsHtml}</div>
        <div class="meta-synergies">${synHtml}</div>
      </div>`;
  }).join('');
}

// Init
renderMeta();

// Enter key for search
document.getElementById('summoner-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') searchSummoner();
});
