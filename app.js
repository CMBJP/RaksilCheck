// ===== 유틸 함수
// 저장 관련
const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
};
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
// 포멧 관련
const formatKRW = n => `${n.toLocaleString()}원`;
const todayStr = () => new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit' });
  
// ===== 데이터 변수
let games = load("games", []); //[{name, price, count}]
let history = load("history", []); // [{dateISO, total, games:[{name, price, count}], humanDate}]

// ===== 요소
const el = {
    gameName: document.getElementById("gameName"),
    gamePrice: document.getElementById("gamePrice"),
    addBtn: document.getElementById("addBtn"),
    total: document.getElementById("total"),
    sessionBadge: document.getElementById("sessionBadge"),
    gameList: document.getElementById("gameList"),
    saveBtn: document.getElementById("saveBtn"),
    clearAllBtn: document.getElementById("clearAllBtn"),
    resetCountsBtn: document.getElementById("resetCountsBtn"),
    historyBtn: document.getElementById("historyBtn"),
    historySec: document.getElementById("history"),
    historyList: document.getElementById("historyList"),
}

// ===== 메서드
// 게임 리스트 렌더
function renderGames() {
    el.gameList.innerHTML = "";
    let total = 0;
    let plays = 0;

    games.forEach((game, index) => {
        total += game.price * game.count;
        plays += game.count;

        // 게임 항목을 감싸는 container div 생성
        const container = document.createElement("div");
        container.className = "game";

        // 게임 메타 데이터를 담는 meta div 생성
        const meta = document.createElement("div");
        meta.className = "meta";
        meta.innerHTML = `
          <div><strong>${game.name}</strong></div>
          <div class="muted">${game.count}회 · ${formatKRW(game.price * game.count)} (1회 ${formatKRW(game.price)})</div>
        `;

        // 버튼을 담고 있는 actions div 생성
        const actions = document.createElement("div");
        actions.className = "actions";
        actions.innerHTML = `
            <button aria-label="감소">-</button>
            <div class="num" aria-label="횟수">${game.count}</div>
            <button aria-label="증가">+</button>
            <button title="삭제" aria-label="삭제">🗑️</button>
        `;

        // 버튼에 이벤트 연결
        const [minusBtn, plusBtn, delBtn] = actions.querySelectorAll("button");
        minusBtn.onclick = () => { changeCount(index, -1); };
        plusBtn.onclick = () => { changeCount(index, +1); };
        delBtn.onclick   = () => { removeGame(index); renderHistory(); };

        container.append(meta, actions);
        el.gameList.appendChild(container);
    });

    el.total.textContent = `총합: ${formatKRW(total)}`;
    el.sessionBadge.textContent = `오늘 ${plays}회`;

    save("games", games);
}

// 히스토리 렌더
function renderHistory() {
    el.historyList.innerHTML = "";
    if (history.length === 0) {
        el.historyList.innerHTML = `<div class="muted">저장된 기록이 없습니다.</div>`;
        return;
    }

    // 최신이 위로
    [...history].reverse().forEach(h => {
        // 히스토리 데이터를 한 줄로 풀기
        const itemLines = h.games.map(game => `${game.name} ${game.count}회 (${formatKRW(game.price * game.count)})`).join(", ");

        // 히스토리 데이터를 감싸는 container div 생성
        const container = document.createElement("div");
        container.className = "game";
        container.innerHTML = `
        <div class="meta">
          <div><strong>${h.humanDate}</strong> · <span class="badge">${formatKRW(h.total)}</span></div>
          <div class="muted">${itemLines}</div>
        </div>
        <div class="actions">
          <button aria-label="해당 기록 불러오기">불러오기</button>
          <button aria-label="기록 삭제">삭제</button>
        </div>
      `;

        // 버튼에 이벤트 연결
        const [loadBtn, delBtn] = container.querySelectorAll("button");
        loadBtn.onclick = () => { 
            games = h.games;
            renderGames();
            scrollTo({ top: 0, behavior: 'smooth' }); 
        };
        delBtn.onclick = () => {
            if (confirm("이 기록을 삭제할까요?")) {
                history = history.filter(x => x.dateISO !== h.dateISO);
                save("history", history);
                renderHistory();
            }
        };

        el.historyList.appendChild(container);
    });
}

// 게임 추가
function addGame() {
    const name = el.gameName.value.trim();
    const price = parseInt(el.gamePrice.value, 10);
    if (!name || isNaN(price) || price < 0) {
        alert("게임 이름과 1회 가격을 정확히 입력해주세요.");
        return;
    }
    games.push({ name, price, count: 0 });
    el.gameName.value = "";
    el.gamePrice.value = "";
    renderGames();
}

// 게임 삭제
function removeGame(index) {
    if (confirm(`${games[index].name}을(를) 삭제할까요?`)) {
        games.splice(index, 1);
        renderGames();
    }
}

// 게임 횟수 변경
function changeCount(index, amount) {
    games[index].count += amount;
    if (games[index].count < 0) games[index].count = 0;
    renderGames();
}


// 오늘 기록 저장
function saveTodayData() {
    const total = games.reduce((sum, game) => sum + game.price * game.count, 0);
    const dateISO = new Date().toISOString().slice(0,10);
    const humanDate = todayStr();
    // 중복 제거
    // 같은 날짜 인덱스 위치 찾기
    const i = history.findIndex(h => h.dateISO === dateISO);
    if (i >= 0) { // 이미 있으면 덮어쓰기
        history[i] = { dateISO, total, games, humanDate };
    } else {      // 없으면 추가
        history.push({ dateISO, total, games, humanDate });
    }
    save("history", history);
    renderHistory();
    alert(`${humanDate} 기록 저장 완료!`);
}

// 모든 횟수 초기화
function resetCounts() {
    games = games.map(g => ({ ...g, count: 0 }));
    renderGames();
}
  

// 모든 데이터 삭제
function clearAll() {
    if (!confirm("모든 데이터를 삭제할까요? (게임 목록/히스토리 포함)")) return;
    games = [];
    history = [];
    localStorage.removeItem("games");
    localStorage.removeItem("history");
    renderGames();
    renderHistory();
}

// ===== 이벤트 할당
el.addBtn.addEventListener("click", addGame);
el.saveBtn.addEventListener("click", saveTodayData);
el.resetCountsBtn.addEventListener("click", resetCounts);
el.clearAllBtn.addEventListener("click", clearAll);


// el.historyBtn.onclick = () => {
//   const hidden = el.historySec.hasAttribute("hidden");
//   if (hidden) renderHistory();
//   el.historySec.toggleAttribute("hidden");
// };

// ===== 초기 렌더
renderGames();
renderHistory();