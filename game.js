let currentPlayer = '';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { X: 0, O: 0 };
let scoreHistory = [];
let gameMode = '';
let difficulty = 'easy';

const clickSound = document.getElementById('click-sound');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Set game mode (bot or two players)
const setGameMode = (mode) => {
  gameMode = mode;
  document.getElementById('main-menu').style.display = 'none';
  if (mode === 'bot') {
    document.getElementById('difficulty-menu').style.display = 'block';
  } else {
    document.getElementById('side-menu').style.display = 'block';
  }
};

// Set bot difficulty
const setDifficulty = (level) => {
  difficulty = level;
  document.getElementById('difficulty-menu').style.display = 'none';
  document.getElementById('side-menu').style.display = 'block';
  updateChatbot(`Bot difficulty set to ${level.toUpperCase()}.`);
};

// Choose player side (X or O)
const pickSide = (side) => {
  currentPlayer = side;
  document.getElementById('side-menu').style.display = 'none';
  document.getElementById('game-area').style.display = 'block';
  document.getElementById('status').innerText = `${currentPlayer}'s Turn`;
  renderBoard();
  updateChatbot(`You are playing as ${currentPlayer}.`);
};

// Go back to the main menu
const goBackToMenu = () => {
  resetGame();
  document.getElementById('main-menu').style.display = 'block';
  document.getElementById('difficulty-menu').style.display = 'none';
  document.getElementById('side-menu').style.display = 'none';
  document.getElementById('game-area').style.display = 'none';
};

// Render the board
const renderBoard = () => {
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';
  board.forEach((cell, index) => {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');
    cellElement.innerText = cell;
    cellElement.addEventListener('click', () => handleCellClick(index));
    if (cell !== '') cellElement.classList.add('taken');
    boardElement.appendChild(cellElement);
  });
};

// Handle cell click
const handleCellClick = (index) => {
  if (board[index] !== '' || !gameActive) return;

  board[index] = currentPlayer;
  clickSound.play();
  checkResult();

  if (gameActive) {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('status').innerText = `${currentPlayer}'s Turn`;
    updateChatbot(`${currentPlayer}'s Turn.`);
    if (gameMode === 'bot' && currentPlayer === 'O') {
      setTimeout(botMove, 500);
    }
  }
  renderBoard();
};

// Bot move logic
const botMove = () => {
  let availableCells = board.map((cell, index) => (cell === '' ? index : null)).filter(index => index !== null);
  let move;
  if (difficulty === 'hard') {
    move = findBestMove();
  } else {
    move = availableCells[Math.floor(Math.random() * availableCells.length)];
  }
  board[move] = currentPlayer;
  checkResult();

  if (gameActive) {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('status').innerText = `${currentPlayer}'s Turn`;
    updateChatbot(`${currentPlayer}'s Turn.`);
  }
  renderBoard();
};

// Minimax for hard difficulty
const findBestMove = () => {
  const scores = { X: -1, O: 1, tie: 0 };
  const minimax = (board, depth, isMaximizing) => {
    const winner = getWinner();
    if (winner) return scores[winner];

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'O';
          const score = minimax(board, depth + 1, false);
          board[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'X';
          const score = minimax(board, depth + 1, true);
          board[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  let bestMove;
  let bestScore = -Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
};

// Check for a winner or a draw
const checkResult = () => {
  let roundWon = false;
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    document.getElementById('status').innerText = `${currentPlayer} Wins!`;
    scores[currentPlayer]++;
    scoreHistory.push(`${currentPlayer} wins.`);
    updateScores();
    updateScoreHistory();
    winSound.play();
    updateChatbot(`🎉 ${currentPlayer} wins!`);
    gameActive = false;
    return;
  }

  if (!board.includes('')) {
    document.getElementById('status').innerText = 'Draw!';
    scoreHistory.push('Draw.');
    updateScoreHistory();
    drawSound.play();
    updateChatbot("It's a draw! sharp.");
    gameActive = false;
  }
};

// Reset game
const resetGame = () => {
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  currentPlayer = 'X';
  document.getElementById('status').innerText = `${currentPlayer}'s Turn`;
  renderBoard();
  updateChatbot('New game started!');
};

// Update scores
const updateScores = () => {
  document.getElementById('playerXScore').innerText = `Player X: ${scores.X}`;
  document.getElementById('playerOScore').innerText = `Player O: ${scores.O}`;
};

// Update score history
const updateScoreHistory = () => {
  const scoreHistoryElement = document.getElementById('score-history');
  scoreHistoryElement.innerHTML = '';
  scoreHistory.forEach((record) => {
    const listItem = document.createElement('li');
    listItem.innerText = record;
    scoreHistoryElement.appendChild(listItem);
  });
};

// Update chatbot message
const updateChatbot = (message) => {
  const chatbot = document.getElementById('chatbot');
  chatbot.innerText = message;
};

// Toggle light/dark theme
const toggleTheme = () => {
  document.body.classList.toggle('dark-theme');
};

function markCell(cell, player) {
    if (cell.innerHTML.trim() !== "") return; // Prevent overwriting

    if (player === "X") {
      cell.innerHTML = `
        <div class="x">
          <div class="x-line"></div>
          <div class="x-line"></div>
        </div>`;
    } else if (player === "O") {
      cell.innerHTML = `<div class="o"></div>`;
    }

    // Add particles
    addParticles(cell);
  }

  function addParticles(cell) {
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Random direction
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 30;
      particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);

      cell.appendChild(particle);

      // Remove particle after animation
      particle.addEventListener("animationend", () => {
        particle.remove();
      });
    }
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth < 600) {
      updateChatbot("Playing on a mobile device? Tap carefully!");
    }
  });
  