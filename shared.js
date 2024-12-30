window.gameData = window.gameData || {};

// Load data from localStorage or initialize
function loadGameData() {
    gameData.coins = parseInt(localStorage.getItem('coins')) || 0;
    gameData.cash = parseFloat(localStorage.getItem('cash')) || 0;
    gameData.level = parseInt(localStorage.getItem('level')) || 1;
    gameData.streak = parseInt(localStorage.getItem('streak')) || 0;
    gameData.currentXP = parseInt(localStorage.getItem('currentXP')) || 0;
    gameData.maxXp = parseInt(localStorage.getItem('maxXp')) || 100;
    gameData.todayStats = JSON.parse(localStorage.getItem('todayStats')) || { minutes: 0, pages: 0, slides: 0, videoMinutes: 0, notes: 0, questions: 0 };
    gameData.totalStats = JSON.parse(localStorage.getItem('totalStats')) || { minutes: 0, pages: 0, slides: 0, videoMinutes: 0, notes: 0, questions: 0 };
    gameData.lastStudy = localStorage.getItem('lastStudy') || null;
    gameData.lastReset = localStorage.getItem('lastReset') || null;
}

// Function to update the navbar display
gameData.updateNavbar = function () {
    const coinsDisplay = document.getElementById('coins');
    const cashDisplay = document.getElementById('cash');
    const levelDisplay = document.getElementById('level');
    const streakDisplay = document.getElementById('streak');
    const xpProgress = document.getElementById('xp-progress');
    const xpValue = document.getElementById('xp-value');

    if (coinsDisplay) coinsDisplay.textContent = `Coins: ${gameData.coins.toLocaleString()}`;
    if (cashDisplay) cashDisplay.textContent = `Cash: $${gameData.cash.toLocaleString()}`;
    if (levelDisplay) levelDisplay.textContent = `Level: ${gameData.level.toLocaleString()}`;
    if (streakDisplay) streakDisplay.textContent = `Streak: ${gameData.streak.toLocaleString()}`;
    if (xpProgress) {
        xpProgress.style.width = `${(gameData.currentXP / gameData.maxXp) * 100}%`;
    }
    if (xpValue) xpValue.textContent = `${gameData.currentXP.toLocaleString()}/${gameData.maxXp.toLocaleString()} XP`;
};

function updateXP(xpToAdd) {
    gameData.currentXP += xpToAdd;

    while (gameData.currentXP >= gameData.maxXp) {
        gameData.currentXP -= gameData.maxXp;
        gameData.maxXp = Math.round(gameData.maxXp * 1.2);
        gameData.level++;
    }

    localStorage.setItem('currentXP', gameData.currentXP.toString());
    localStorage.setItem('maxXp', gameData.maxXp.toString());
    localStorage.setItem('level', gameData.level.toString());
}

function levelUp() {
    gameData.level++;
    localStorage.setItem('level', gameData.level.toString());
}

function updateCurrency(coinsToAdd, cashToAdd) {
    gameData.coins += Math.ceil(coinsToAdd);
    gameData.cash += cashToAdd;

    localStorage.setItem('coins', gameData.coins.toString());
    localStorage.setItem('cash', gameData.cash.toString());
}

function updateStats(minutes, pages, slides, videoMinutes, notes, questions) {
    if (isNewDay()) {
        checkStreak();
        resetTodayStats();
    }

    gameData.todayStats.minutes += minutes;
    gameData.todayStats.pages += pages;
    gameData.todayStats.slides += slides;
    gameData.todayStats.videoMinutes += videoMinutes;
    gameData.todayStats.notes += notes;
    gameData.todayStats.questions += questions; // Update questions

    gameData.totalStats.minutes += minutes;
    gameData.totalStats.pages += pages;
    gameData.totalStats.slides += slides;
    gameData.totalStats.videoMinutes += videoMinutes;
    gameData.totalStats.notes += notes;
    gameData.totalStats.questions += questions; // Update questions

    localStorage.setItem('todayStats', JSON.stringify(gameData.todayStats));
    localStorage.setItem('totalStats', JSON.stringify(gameData.totalStats));
}

function checkStreak() {
    const today = new Date();
    const todayDateString = today.toLocaleDateString();

    if (!gameData.lastStudy) {
        gameData.lastStudy = todayDateString;
        gameData.streak = 1;
        localStorage.setItem('lastStudy', todayDateString);
        localStorage.setItem('streak', 1);
        return;
    }

    const lastStudyDate = new Date(gameData.lastStudy);
    if (today.toLocaleDateString() === lastStudyDate.toLocaleDateString()) {
        return; // Already did it today
    }
    else if (isOneDayAfter(today, lastStudyDate)) {
        gameData.streak++;
        gameData.lastStudy = todayDateString;
        localStorage.setItem('lastStudy', todayDateString);
        localStorage.setItem('streak', gameData.streak);
    } else {
        gameData.streak = 1;
        gameData.lastStudy = todayDateString;
        localStorage.setItem('lastStudy', todayDateString);
        localStorage.setItem('streak', gameData.streak);
    }
}

function isOneDayAfter(date1, date2) {
    const timeDiff = date1.getTime() - date2.getTime();
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays === 1;
}

function isNewDay() {
    const today = new Date();

    if (!gameData.lastReset) {
        gameData.lastReset = today.toDateString();
        localStorage.setItem('lastReset', today.toDateString());
        return true;
    }

    const lastResetDate = new Date(gameData.lastReset);
    return today.toDateString() !== lastResetDate.toDateString();
}

function resetTodayStats() {
    gameData.todayStats = { minutes: 0, pages: 0, slides: 0, videoMinutes: 0, notes: 0, questions: 0 }; // Reset questions
    localStorage.setItem('todayStats', JSON.stringify(gameData.todayStats));
}