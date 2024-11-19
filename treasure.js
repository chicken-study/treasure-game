class TreasureMap {
  static getInitialClue() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("在古老的图书馆里找到了第一个线索...");
      }, 1000);
    });
  }

  static decodeAncientScript(clue) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!clue) {
          reject("没有线索可以解码!");
        }
        resolve("解码成功!宝藏在一座古老的神庙中...");
      }, 1500);
    });
  }

  static searchTemple(location) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const random = Math.random();
        if (random < 0.3) {
          reject("糟糕!遇到了神庙守卫!");
        }
        resolve("找到了一个神秘的箱子...");
      }, 2000);
    });
  }

  static openTreasureBox() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("恭喜!你找到了传说中的宝藏!");
      }, 1000);
    });
  }

  static unlockAncientMechanism(box) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mechanismSolved = Math.random() > 0.3; // 70% 的概率解开机关
        if (!mechanismSolved) {
          reject("机关太复杂了，无法解开...");
        }
        resolve("机关成功解开，宝藏箱可以打开了！");
      }, 1500);
    });
  }

  static async loadTreasureData() {
    const response = await fetch('treasure.txt');
    if (!response.ok) {
      throw new Error('网络响应错误');
    }
    const data = await response.text();
    return data.split('---');
  }
}

function storePlayerInfoAndGameRecord(playerId, playerName, gameRecord) {
  // 将玩家ID和名称存储到本地存储
  localStorage.setItem('playerId', playerId);
  localStorage.setItem('playerName', playerName);

  // 将游戏记录存储到本地存储，先将数组转换为字符串
  localStorage.setItem('gameRecord', JSON.stringify(gameRecord));
}

function retrievePlayerInfoAndGameRecord() {
  const playerId = localStorage.getItem('playerId');
  const playerName = localStorage.getItem('playerName');
  const gameRecordStr = localStorage.getItem('gameRecord');

  let gameRecord = [];
  if (gameRecordStr) {
    gameRecord = JSON.parse(gameRecordStr);
  }

  return { playerId, playerName, gameRecord };
}

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start-button');
  const messagesDiv = document.getElementById('messages');
  const pages = {
    start: document.getElementById('start-page'),
    library: document.getElementById('library-page'),
    treasureMap: document.getElementById('treasure-map-page'),
    chest: document.getElementById('chest-page'),
    guard: document.getElementById('guard-page'),
    end: document.getElementById('end-page'),
    fail: document.getElementById('fail-page')
  };

  const showInfoButton = document.getElementById('show-info-button');
  const infoWindow = document.getElementById('info-window');
  const closeInfoButton = document.getElementById('close-info-button');
  const playerIdDisplay = document.getElementById('player-id-display');
  const playerNameDisplay = document.getElementById('player-name-display');
  const gameRecordList = document.getElementById('game-record-list');

  function showPage(pageId) {
    Object.values(pages).forEach(page => page.classList.remove('active'));
    pages[pageId].classList.add('active');
  }

  async function findTreasureWithAsyncAwait() {
    const playerId = document.getElementById('playerId').value;
    const playerName = document.getElementById('playerName').value;

    startButton.disabled = true;
    messagesDiv.innerHTML = ''; // 清空之前的消息
    showPage('start');

    let gameRecord = [];
    try {
      // 读取之前的游戏记录（如果有）
      const { gameRecord: prevGameRecord } = retrievePlayerInfoAndGameRecord();
      gameRecord = prevGameRecord;

      const [libraryData, templeData, treasureData, mechanismData] = await TreasureMap.loadTreasureData();
      const clue = await TreasureMap.getInitialClue();
      messagesDiv.innerHTML += `<p>${libraryData}</p><p>${clue}</p>`;
      showPage('library');

      const location = await TreasureMap.decodeAncientScript(clue);
      messagesDiv.innerHTML += `<p>${location}</p><p>${templeData}</p>`;
      showPage('treasureMap');

      const box = await TreasureMap.searchTemple(location);
      messagesDiv.innerHTML += `<p>${box}</p><p>${treasureData}</p>`;
      showPage('chest');

      const mechanismUnlocked = await TreasureMap.unlockAncientMechanism(box);
      messagesDiv.innerHTML += `<p>${mechanismData}</p><p>${mechanismUnlocked}</p>`;
      showPage('chest');

      const treasure = await TreasureMap.openTreasureBox();
      messagesDiv.innerHTML += `<p>${treasure}</p>`;
      showPage('end');

      // 通关成功，将成功记录添加到游戏记录中
      gameRecord.push('通关成功');
    } catch (error) {
      messagesDiv.innerHTML += `<p class="error">任务失败: ${error}</p>`;
      showPage('fail');

      // 通关失败，将失败记录添加到游戏记录中
      gameRecord.push('通关失败');
    } finally {
      startButton.disabled = false;

      // 存储玩家信息和更新后的游戏记录
      storePlayerInfoAndGameRecord(playerId, playerName, gameRecord);
    }
  }

  startButton.addEventListener('click', findTreasureWithAsyncAwait);

  const musicControlButton = document.getElementById('music-control');
  const backgroundMusic = document.getElementById('background-music');

  musicControlButton.addEventListener('click', () => {
    if (backgroundMusic.paused) {
      backgroundMusic.play();
      musicControlButton.textContent = 'Pause Music';
    } else {
      backgroundMusic.pause();
      musicControlButton.textContent = 'Play Music';
    }
  });

  // 在游戏开始时自动播放音乐
  backgroundMusic.play();
  musicControlButton.textContent = 'Pause Music';

  // 新增展示信息窗口的显示逻辑
  showInfoButton.addEventListener('click', () => {
    const { playerId, playerName, gameRecord } = retrievePlayerInfoAndGameRecord();

    playerIdDisplay.textContent = `玩家ID：${playerId}`;
    playerNameDisplay.textContent = `玩家名称：${playerName}`;

    gameRecordList.innerHTML = '';
    gameRecord.forEach((record, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = `第${index + 1}次游戏：${record}`;
      gameRecordList.appendChild(listItem);
    });

    infoWindow.classList.remove('hidden');
  });

  // 新增关闭信息窗口的逻辑
  closeInfoButton.addEventListener('click', () => {
    infoWindow.classList.add('hidden');
  });
});