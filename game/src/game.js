(function () {
  const data = window.EOL_DATA;
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const loadingScreen = document.getElementById("loading-screen");
  const loadingFill = document.getElementById("loading-fill");
  const titleBrand = document.getElementById("title-brand");
  const menuPanel = document.getElementById("menu-panel");
  const dialoguePanel = document.getElementById("dialogue-panel");
  const hudPanel = document.getElementById("hud-panel");

  const TILE = 48;
  const MAP_W = 20;
  const MAP_H = 13;
  const SAVE_KEY = "explorersOfLegends.standalone.save.v1";

  const state = {
    scene: "loading",
    phase: "title",
    quizIndex: 0,
    quizScores: {},
    player: null,
    partner: null,
    teamName: "Lowstep",
    renown: { heroic: 0, explorer: 0, social: 0 },
    ap: {
      unspent: 0,
      player: blankAp(),
      partner: blankAp()
    },
    flags: {
      quizComplete: false,
      partnerChosen: false,
      missionAccepted: false,
      prologueComplete: false,
      chapterOneComplete: false
    },
    party: {
      hp: 24,
      maxHp: 24,
      x: 5,
      y: 7,
      partnerX: 4,
      partnerY: 7
    },
    dungeon: null,
    dialogue: [],
    dialogueIndex: 0,
    lastMessage: "Arrow keys or WASD to move. Space or Enter to interact."
  };

  function blankAp() {
    return {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0
    };
  }

  function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      player: state.player,
      partner: state.partner,
      teamName: state.teamName,
      renown: state.renown,
      ap: state.ap,
      flags: state.flags
    }));
  }

  function loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    state.player = saved.player;
    state.partner = saved.partner;
    state.teamName = saved.teamName || "Lowstep";
    state.renown = saved.renown || state.renown;
    state.ap = saved.ap || state.ap;
    state.flags = saved.flags || state.flags;
    return true;
  }

  function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }

  function setScene(scene) {
    state.scene = scene;
    titleBrand.classList.toggle("is-active", scene === "title");
    menuPanel.classList.remove("is-active");
    dialoguePanel.classList.remove("is-active");
    hudPanel.classList.toggle("is-active", scene === "hub" || scene === "dungeon");
  }

  function setPanel(html) {
    menuPanel.innerHTML = html;
    menuPanel.classList.add("is-active");
  }

  function clearPanel() {
    menuPanel.innerHTML = "";
    menuPanel.classList.remove("is-active");
  }

  function showDialogue(lines, onDone) {
    state.dialogue = lines.slice();
    state.dialogueIndex = 0;
    state.dialogueDone = onDone;
    setScene("dialogue");
    renderDialogue();
  }

  function renderDialogue() {
    const line = state.dialogue[state.dialogueIndex];
    if (!line) {
      const done = state.dialogueDone;
      state.dialogueDone = null;
      dialoguePanel.classList.remove("is-active");
      if (done) done();
      return;
    }
    dialoguePanel.innerHTML = `
      ${line.speaker ? `<div class="speaker">${line.speaker}</div>` : ""}
      <div>${line.text}<span class="next">Next</span></div>
    `;
    dialoguePanel.classList.add("is-active");
  }

  function nextDialogue() {
    if (state.scene !== "dialogue") return;
    state.dialogueIndex += 1;
    renderDialogue();
  }

  function buttonHtml(label, action, extraClass) {
    return `<button class="${extraClass || ""}" data-action="${action}">${label}</button>`;
  }

  function showTitle() {
    loadingScreen.classList.remove("is-active");
    setScene("title");
    setPanel(`
      <p>A standalone prologue slice. Take the quiz, choose your partner, and earn the team's first Renown.</p>
      <div class="choice-grid">
        ${buttonHtml("New Game", "new-game", "primary")}
        ${buttonHtml("Continue", "continue")}
        ${buttonHtml("Reset Save", "reset")}
      </div>
    `);
  }

  function beginNewGame() {
    Object.assign(state.quizScores, {
      steady: 0,
      brave: 0,
      gentle: 0,
      clever: 0,
      restless: 0,
      lonely: 0
    });
    state.quizIndex = 0;
    state.player = null;
    state.partner = null;
    state.flags.quizComplete = false;
    state.flags.partnerChosen = false;
    state.flags.missionAccepted = false;
    state.flags.prologueComplete = false;
    state.flags.chapterOneComplete = false;
    state.renown = { heroic: 0, explorer: 0, social: 0 };
    state.ap = { unspent: 0, player: blankAp(), partner: blankAp() };
    showQuiz();
  }

  function showQuiz() {
    setScene("quiz");
    const q = data.quiz[state.quizIndex];
    const answers = q.answers.map((answer, index) => {
      return buttonHtml(answer.text, `quiz-${index}`);
    }).join("");
    setPanel(`
      <h2>Personality Quiz</h2>
      <p>${q.prompt}</p>
      <div class="choice-grid">${answers}</div>
    `);
  }

  function answerQuiz(index) {
    const q = data.quiz[state.quizIndex];
    const answer = q.answers[index];
    for (const [key, value] of Object.entries(answer.scores)) {
      state.quizScores[key] += value;
    }
    state.quizIndex += 1;
    if (state.quizIndex < data.quiz.length) {
      showQuiz();
      return;
    }
    finishQuiz();
  }

  function finishQuiz() {
    let best = "steady";
    for (const [key, value] of Object.entries(state.quizScores)) {
      if (value > state.quizScores[best]) best = key;
    }
    state.player = { id: best, ...data.starters[best] };
    state.flags.quizComplete = true;
    setPanel(`
      <h2>You feel ${best}.</h2>
      <p>The quiz suggests <strong>${state.player.species}</strong>: ${state.player.note}.</p>
      <div class="choice-grid">${buttonHtml(`Begin as ${state.player.species}`, "choose-partner", "primary")}</div>
    `);
  }

  function showPartnerSelect() {
    setScene("partner");
    const cards = data.partners.map((partner) => `
      <button data-action="partner-${partner.id}">
        <strong>${partner.species}</strong><br>
        <span>${partner.style}</span>
      </button>
    `).join("");
    setPanel(`
      <h2>Choose Your Partner</h2>
      <p>Your partner is always ambitious and headstrong. Their species changes how the team feels on screen.</p>
      <div class="partner-grid">${cards}</div>
    `);
  }

  function choosePartner(id) {
    state.partner = data.partners.find((partner) => partner.id === id);
    state.flags.partnerChosen = true;
    clearPanel();
    showDialogue(data.prologueLines, () => {
      startHub();
    });
  }

  function startHub() {
    state.party.x = 5;
    state.party.y = 7;
    state.party.partnerX = 4;
    state.party.partnerY = 7;
    state.lastMessage = "Visit the request board, then enter First Step Cave.";
    setScene("hub");
    saveGame();
  }

  function acceptMission() {
    if (state.flags.missionAccepted) {
      state.lastMessage = "The mission is already accepted. Head to First Step Cave.";
      return;
    }
    state.flags.missionAccepted = true;
    showDialogue(data.missionLines, () => {
      state.lastMessage = "Mission accepted. Enter First Step Cave at the east path.";
      setScene("hub");
      saveGame();
    });
  }

  function startDungeon() {
    if (!state.flags.missionAccepted) {
      state.lastMessage = "The partner points back to the request board first.";
      return;
    }
    state.dungeon = makeDungeonFloor(1);
    state.party.hp = state.party.maxHp;
    setScene("dungeon");
    state.lastMessage = "Find the stairs. On floor 4, recover the courier badge.";
  }

  function makeDungeonFloor(floor) {
    const width = 13;
    const height = 9;
    const tiles = [];
    for (let y = 0; y < height; y += 1) {
      const row = [];
      for (let x = 0; x < width; x += 1) {
        const edge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
        const pillar = (x === 5 && y > 1 && y < 7 && floor % 2 === 0) || (y === 4 && x > 2 && x < 10 && floor % 2 === 1);
        row.push(edge || pillar ? "wall" : "floor");
      }
      tiles.push(row);
    }
    tiles[4][5] = "floor";
    tiles[4][6] = "floor";
    tiles[4][7] = "floor";

    return {
      floor,
      width,
      height,
      tiles,
      playerX: 1,
      playerY: 1,
      partnerX: 1,
      partnerY: 2,
      stairs: { x: 11, y: 7 },
      badge: floor === 4 ? { x: 8, y: 2, found: false } : null,
      apple: floor === 2 ? { x: 9, y: 2, found: false } : null,
      enemies: [
        { species: floor % 2 === 0 ? "Rattata" : "Pidgey", x: 8, y: 6, hp: 2, color: floor % 2 === 0 ? "#a98a78" : "#d2a35c" },
        { species: floor > 2 ? "Zubat" : "Sentret", x: 3, y: 6, hp: 2, color: floor > 2 ? "#6372be" : "#c9955b" }
      ]
    };
  }

  function move(dx, dy) {
    if (state.scene === "hub") {
      moveHub(dx, dy);
    } else if (state.scene === "dungeon") {
      moveDungeon(dx, dy);
    }
  }

  function moveHub(dx, dy) {
    const nx = state.party.x + dx;
    const ny = state.party.y + dy;
    if (nx < 1 || nx > 18 || ny < 2 || ny > 11) return;
    if ((nx === 3 && ny === 3) || (nx === 16 && ny === 8) || (nx === 10 && ny === 5)) return;
    state.party.partnerX = state.party.x;
    state.party.partnerY = state.party.y;
    state.party.x = nx;
    state.party.y = ny;
  }

  function moveDungeon(dx, dy) {
    const d = state.dungeon;
    const nx = d.playerX + dx;
    const ny = d.playerY + dy;
    if (d.tiles[ny]?.[nx] !== "floor") return;

    const enemy = d.enemies.find((mob) => mob.x === nx && mob.y === ny);
    if (enemy) {
      enemy.hp -= 1 + state.ap.player.attack;
      state.lastMessage = `${state.player.species} used Tackle on ${enemy.species}.`;
      if (enemy.hp <= 0) {
        d.enemies = d.enemies.filter((mob) => mob !== enemy);
        state.renown.explorer += 1;
        state.lastMessage = `${enemy.species} fled deeper into the cave. Explorer Renown rose.`;
      }
      enemyTurn();
      return;
    }

    d.partnerX = d.playerX;
    d.partnerY = d.playerY;
    d.playerX = nx;
    d.playerY = ny;

    if (d.apple && !d.apple.found && d.apple.x === nx && d.apple.y === ny) {
      d.apple.found = true;
      state.party.hp = Math.min(state.party.maxHp, state.party.hp + 6);
      state.lastMessage = "Found an apple. The team recovered HP.";
    }

    if (d.badge && !d.badge.found && d.badge.x === nx && d.badge.y === ny) {
      d.badge.found = true;
      state.lastMessage = "Recovered the missing courier badge.";
    }

    if (d.stairs.x === nx && d.stairs.y === ny) {
      if (d.floor === 4 && (!d.badge || !d.badge.found)) {
        state.lastMessage = "The stairs shimmer, but the badge is still missing.";
        return;
      }
      nextFloor();
      return;
    }

    enemyTurn();
  }

  function enemyTurn() {
    const d = state.dungeon;
    d.enemies.forEach((enemy) => {
      const dist = Math.abs(enemy.x - d.playerX) + Math.abs(enemy.y - d.playerY);
      if (dist === 1) {
        const damage = Math.max(1, 3 - state.ap.player.defense);
        state.party.hp -= damage;
        state.lastMessage = `${enemy.species} bumped the team for ${damage} damage.`;
      } else if (dist < 6) {
        const stepX = Math.sign(d.playerX - enemy.x);
        const stepY = Math.sign(d.playerY - enemy.y);
        const tryX = enemy.x + (Math.abs(d.playerX - enemy.x) > Math.abs(d.playerY - enemy.y) ? stepX : 0);
        const tryY = enemy.y + (tryX === enemy.x ? stepY : 0);
        if (d.tiles[tryY]?.[tryX] === "floor" && !(tryX === d.playerX && tryY === d.playerY)) {
          enemy.x = tryX;
          enemy.y = tryY;
        }
      }
    });

    if (state.party.hp <= 0) {
      state.party.hp = state.party.maxHp;
      state.dungeon = makeDungeonFloor(Math.max(1, state.dungeon.floor));
      state.lastMessage = "The team steadied themselves and returned to the floor entrance.";
    }
  }

  function nextFloor() {
    const floor = state.dungeon.floor;
    if (floor < 4) {
      state.dungeon = makeDungeonFloor(floor + 1);
      state.lastMessage = `First Step Cave B${floor + 1}F.`;
      return;
    }
    completeChapter();
  }

  function completeChapter() {
    state.flags.prologueComplete = true;
    state.flags.chapterOneComplete = true;
    state.renown.heroic += 1;
    state.renown.explorer += 2;
    state.renown.social += 1;
    state.ap.unspent += 3;
    saveGame();
    showDialogue(data.arcanineLines, showReward);
  }

  function showReward() {
    setScene("reward");
    setPanel(`
      <h2>Chapter 1 Complete</h2>
      <p>Heroic Renown +1, Explorer Renown +2, Social Renown +1. Attribute Points +3.</p>
      <div class="tag-row">
        <span class="tag">Heroic ${state.renown.heroic}</span>
        <span class="tag">Explorer ${state.renown.explorer}</span>
        <span class="tag">Social ${state.renown.social}</span>
        <span class="tag">AP ${state.ap.unspent}</span>
      </div>
      <p style="margin-top:12px">Spend AP now. Costs are equal across all stats and all Pokemon.</p>
      <div class="choice-grid">${data.apStats.map((stat) => buttonHtml(`${stat.label}: ${stat.note}`, `ap-${stat.id}`)).join("")}</div>
      <div class="choice-grid" style="margin-top:10px">${buttonHtml("Return to Title", "title", "primary")}</div>
    `);
  }

  function spendAp(statId) {
    if (state.ap.unspent <= 0) {
      state.lastMessage = "No Attribute Points left to spend.";
      showReward();
      return;
    }
    state.ap.player[statId] += 1;
    state.ap.partner[statId] += 1;
    state.ap.unspent -= 1;
    saveGame();
    showReward();
  }

  function interact() {
    if (state.scene === "dialogue") {
      nextDialogue();
      return;
    }
    if (state.scene !== "hub") return;
    const near = (x, y) => Math.abs(state.party.x - x) + Math.abs(state.party.y - y) <= 1;
    if (near(3, 3)) {
      acceptMission();
    } else if (near(16, 8)) {
      startDungeon();
    } else if (near(10, 5)) {
      state.lastMessage = "The town sign reads: Lowstep Supply Yard. Nothing ever happens here, supposedly.";
    } else {
      state.lastMessage = "Nothing to inspect here.";
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (state.scene === "loading" || state.scene === "title" || state.scene === "quiz" || state.scene === "partner" || state.scene === "reward" || state.scene === "dialogue") {
      drawTitleBackground();
    }
    if (state.scene === "hub") {
      drawHub();
    }
    if (state.scene === "dungeon") {
      drawDungeon();
    }
    drawHud();
    requestAnimationFrame(draw);
  }

  function drawTitleBackground() {
    const w = canvas.width;
    const h = canvas.height;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#2074f0");
    sky.addColorStop(.44, "#268cff");
    sky.addColorStop(1, "#6aa8ef");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    drawCloud(105, 275, 1.08);
    drawCloud(760, 292, 1.28);
    drawCloud(690, 180, .58);
    drawCloud(520, 205, .5);
    drawSunburst(478, 277, 54);

    drawDistantCliff();
    drawAncientArch(482, 333, 1.12);
    drawTitleTrail();

    drawSimpleToken(244, 462, 33, "#5dbb6b", "#245f39", "leaf");
    drawSimpleToken(303, 464, 33, "#f28a38", "#a33a18", "flame");
    drawSimpleToken(360, 461, 32, "#f7cf3d", "#7d5a16", "spark");

    drawCloud(382, 496, 1.45);
    drawCloud(718, 512, 1.7);
  }

  function drawHubBackground() {
    const w = canvas.width;
    const h = canvas.height;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#75d4ff");
    sky.addColorStop(.55, "#b6ebff");
    sky.addColorStop(.56, "#7bd563");
    sky.addColorStop(1, "#3b9e4d");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    drawCloud(130, 90, 1.15);
    drawCloud(720, 78, .9);
    drawCloud(500, 150, .7);

    ctx.fillStyle = "#5fb85a";
    roundedHill(0, 410, 500, 180);
    ctx.fillStyle = "#4aa052";
    roundedHill(420, 430, 620, 170);

    ctx.fillStyle = "rgba(12, 44, 88, .16)";
    ctx.fillRect(0, 590, w, 50);
    for (let x = 0; x < w; x += 48) {
      ctx.fillRect(x, 590, 24, 50);
    }
  }

  function drawHub() {
    drawHubBackground();
    drawGroundGrid();
    drawBuilding(110, 118, "Request Board");
    drawBuilding(450, 215, "Lowstep");
    drawCave(720, 350);
    drawPath();
    drawParty(state.party.x, state.party.y, state.party.partnerX, state.party.partnerY);
  }

  function drawDungeon() {
    ctx.fillStyle = "#263044";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const d = state.dungeon;
    const offsetX = 160;
    const offsetY = 92;
    for (let y = 0; y < d.height; y += 1) {
      for (let x = 0; x < d.width; x += 1) {
        const tile = d.tiles[y][x];
        const px = offsetX + x * TILE;
        const py = offsetY + y * TILE;
        ctx.fillStyle = tile === "wall" ? "#526070" : "#b7a47a";
        ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = tile === "wall" ? "#3d4653" : "#8d7956";
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, TILE, TILE);
      }
    }
    drawTileMarker(offsetX + d.stairs.x * TILE + 24, offsetY + d.stairs.y * TILE + 24, "#56b2ff", "stairs");
    if (d.apple && !d.apple.found) drawTileMarker(offsetX + d.apple.x * TILE + 24, offsetY + d.apple.y * TILE + 24, "#f04f38", "apple");
    if (d.badge && !d.badge.found) drawTileMarker(offsetX + d.badge.x * TILE + 24, offsetY + d.badge.y * TILE + 24, "#ffd857", "badge");
    d.enemies.forEach((enemy) => drawSimpleToken(offsetX + enemy.x * TILE + 24, offsetY + enemy.y * TILE + 24, 17, enemy.color, "#342a3d", "wild"));
    drawPokemonToken(offsetX + d.partnerX * TILE + 24, offsetY + d.partnerY * TILE + 26, state.partner, 18);
    drawPokemonToken(offsetX + d.playerX * TILE + 24, offsetY + d.playerY * TILE + 24, state.player, 20);

    ctx.fillStyle = "#fff8df";
    ctx.font = "900 22px Trebuchet MS";
    ctx.fillText(`First Step Cave B${d.floor}F`, 160, 66);
  }

  function drawHud() {
    if (state.scene !== "hub" && state.scene !== "dungeon") return;
    hudPanel.innerHTML = `
      ${state.player?.species || "Player"} + ${state.partner?.species || "Partner"}
      <span class="small">HP ${state.party.hp}/${state.party.maxHp}</span>
      <span class="small">Renown H${state.renown.heroic} E${state.renown.explorer} S${state.renown.social} | AP ${state.ap.unspent}</span>
      <span class="small">${state.lastMessage}</span>
    `;
  }

  function drawGroundGrid() {
    ctx.strokeStyle = "rgba(37, 101, 55, .24)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += TILE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += TILE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawPath() {
    ctx.fillStyle = "#d8bd7c";
    for (const [x, y] of [[4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7], [13, 7], [14, 7], [15, 8]]) {
      roundRect(x * TILE + 5, y * TILE + 8, 38, 30, 8);
      ctx.fill();
    }
  }

  function drawBuilding(x, y, label) {
    ctx.fillStyle = "#f5d177";
    roundRect(x, y, 160, 106, 12);
    ctx.fill();
    ctx.fillStyle = "#315fa8";
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 26);
    ctx.lineTo(x + 80, y - 28);
    ctx.lineTo(x + 172, y + 26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a3921";
    roundRect(x + 63, y + 52, 36, 54, 8);
    ctx.fill();
    ctx.fillStyle = "#18386f";
    ctx.font = "900 15px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(label, x + 80, y + 132);
    ctx.textAlign = "left";
  }

  function drawCave(x, y) {
    ctx.fillStyle = "#667382";
    roundRect(x, y, 138, 122, 22);
    ctx.fill();
    ctx.fillStyle = "#202a3e";
    roundRect(x + 33, y + 34, 72, 88, 28);
    ctx.fill();
    ctx.fillStyle = "#18386f";
    ctx.font = "900 15px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("First Step Cave", x + 69, y + 150);
    ctx.textAlign = "left";
  }

  function drawParty(px, py, qx, qy) {
    drawPokemonToken(qx * TILE + 24, qy * TILE + 26, state.partner, 18);
    drawPokemonToken(px * TILE + 24, py * TILE + 24, state.player, 20);
  }

  function drawPokemonToken(x, y, mon, radius) {
    if (!mon) return;
    drawSimpleToken(x, y, radius, mon.color, mon.accent, mon.id || mon.species?.toLowerCase());
  }

  function drawSimpleToken(x, y, radius, color, accent, kind) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, .18)";
    ctx.beginPath();
    ctx.ellipse(x, y + radius + 4, radius * 1.1, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.strokeStyle = "#fff8df";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = accent;
    if (kind === "leaf" || kind === "bulbasaur" || kind === "sprigatito" || kind === "chikorita") {
      ctx.beginPath();
      ctx.ellipse(x, y - radius - 8, 8, 18, -.7, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === "flame" || kind === "charmander" || kind === "vulpix") {
      ctx.beginPath();
      ctx.moveTo(x + radius - 2, y + 2);
      ctx.quadraticCurveTo(x + radius + 22, y - 20, x + radius + 8, y + 18);
      ctx.quadraticCurveTo(x + radius + 3, y + 10, x + radius - 2, y + 2);
      ctx.fill();
    } else if (kind === "spark" || kind === "pikachu" || kind === "shinx") {
      ctx.beginPath();
      ctx.moveTo(x - 4, y - radius - 2);
      ctx.lineTo(x + 8, y - 8);
      ctx.lineTo(x - 1, y - 8);
      ctx.lineTo(x + 7, y + 12);
      ctx.lineTo(x - 12, y - 4);
      ctx.lineTo(x - 2, y - 4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y - radius * .15, radius * .45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#17243a";
    ctx.beginPath();
    ctx.arc(x - radius * .35, y - radius * .08, 2.5, 0, Math.PI * 2);
    ctx.arc(x + radius * .35, y - radius * .08, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawTileMarker(x, y, color, kind) {
    ctx.fillStyle = color;
    ctx.strokeStyle = "#fff8df";
    ctx.lineWidth = 3;
    if (kind === "stairs") {
      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x + 16, y);
      ctx.lineTo(x, y + 16);
      ctx.lineTo(x - 16, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawCloud(x, y, scale) {
    ctx.fillStyle = "rgba(255, 255, 255, .92)";
    ctx.beginPath();
    ctx.arc(x, y, 32 * scale, 0, Math.PI * 2);
    ctx.arc(x + 36 * scale, y - 8 * scale, 42 * scale, 0, Math.PI * 2);
    ctx.arc(x + 80 * scale, y, 30 * scale, 0, Math.PI * 2);
    ctx.rect(x - 10 * scale, y, 104 * scale, 34 * scale);
    ctx.fill();
  }

  function drawSunburst(x, y, radius) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(255, 255, 255, .78)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 18; i += 1) {
      ctx.rotate(Math.PI / 9);
      ctx.beginPath();
      ctx.moveTo(radius * .42, 0);
      ctx.lineTo(radius * 1.55, 0);
      ctx.stroke();
    }
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    glow.addColorStop(0, "rgba(255, 255, 255, .95)");
    glow.addColorStop(.45, "rgba(255, 245, 157, .82)");
    glow.addColorStop(1, "rgba(255, 245, 157, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDistantCliff() {
    ctx.fillStyle = "#77c968";
    ctx.beginPath();
    ctx.moveTo(0, 472);
    ctx.quadraticCurveTo(200, 408, 395, 432);
    ctx.quadraticCurveTo(560, 444, 716, 408);
    ctx.quadraticCurveTo(850, 432, 960, 410);
    ctx.lineTo(960, 640);
    ctx.lineTo(0, 640);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#4ea85a";
    ctx.beginPath();
    ctx.moveTo(0, 530);
    ctx.quadraticCurveTo(238, 492, 430, 526);
    ctx.quadraticCurveTo(602, 555, 812, 500);
    ctx.quadraticCurveTo(898, 486, 960, 502);
    ctx.lineTo(960, 640);
    ctx.lineTo(0, 640);
    ctx.closePath();
    ctx.fill();
  }

  function drawAncientArch(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#617385";
    roundRect(-82, -116, 164, 172, 20);
    ctx.fill();
    ctx.fillStyle = "#344457";
    roundRect(-48, -70, 96, 126, 33);
    ctx.fill();
    ctx.strokeStyle = "#d7b34e";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-43, -57);
    ctx.lineTo(43, -57);
    ctx.stroke();
    ctx.fillStyle = "#506173";
    ctx.fillRect(-92, 38, 184, 34);
    ctx.restore();
  }

  function drawTitleTrail() {
    ctx.fillStyle = "#d9c17e";
    ctx.beginPath();
    ctx.moveTo(472, 420);
    ctx.quadraticCurveTo(530, 490, 486, 640);
    ctx.lineTo(318, 640);
    ctx.quadraticCurveTo(356, 500, 432, 420);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(97, 78, 47, .13)";
    for (let y = 448; y < 640; y += 38) {
      ctx.fillRect(354 + (y % 3) * 14, y, 130, 8);
    }
  }

  function roundedHill(x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h, w / 2, h, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(x + w, canvas.height);
    ctx.lineTo(x, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  menuPanel.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "new-game") beginNewGame();
    if (action === "continue") {
      if (loadGame() && state.flags.partnerChosen) {
        startHub();
      } else {
        beginNewGame();
      }
    }
    if (action === "reset") resetGame();
    if (action === "choose-partner") showPartnerSelect();
    if (action.startsWith("quiz-")) answerQuiz(Number(action.split("-")[1]));
    if (action.startsWith("partner-")) choosePartner(action.replace("partner-", ""));
    if (action.startsWith("ap-")) spendAp(action.replace("ap-", ""));
    if (action === "title") showTitle();
  });

  dialoguePanel.addEventListener("click", nextDialogue);

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowup", "w"].includes(key)) move(0, -1);
    if (["arrowdown", "s"].includes(key)) move(0, 1);
    if (["arrowleft", "a"].includes(key)) move(-1, 0);
    if (["arrowright", "d"].includes(key)) move(1, 0);
    if (key === " " || key === "enter") {
      event.preventDefault();
      interact();
    }
  });

  let load = 0;
  const loadTimer = setInterval(() => {
    load += 18;
    loadingFill.style.width = `${Math.min(load, 100)}%`;
    if (load >= 100) {
      clearInterval(loadTimer);
      setTimeout(showTitle, 260);
    }
  }, 160);

  draw();
}());
