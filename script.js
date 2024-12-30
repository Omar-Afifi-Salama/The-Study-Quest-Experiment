const studyButton = document.getElementById('study-button');
const popup = document.getElementById('popup');
const closeButton = document.querySelector('.close-button');
const xpProgress = document.getElementById('xp-progress');
const xpValue = document.getElementById('xp-value');
const coinsDisplay = document.getElementById('coins');
const cashDisplay = document.getElementById('cash');
const levelDisplay = document.getElementById('level');
const streakDisplay = document.getElementById('streak');
let currentXP = 0;
let maxXp = 100;

studyButton.addEventListener('click', () => {
  popup.style.display = 'block';
});

closeButton.addEventListener('click', () => {
  popup.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target == popup) {
    popup.style.display = 'none';
  }
});

function calculateRewards() {
  const minutes = parseInt(document.getElementById("minutes").value);
  const difficulty = parseInt(document.getElementById("difficulty").value);
  const focus = parseInt(document.getElementById("focus").value);
  const pages = parseInt(document.getElementById("pages").value);
  const slides = parseInt(document.getElementById("slides").value);
  const videoMinutes = parseInt(document.getElementById("videoMinutes").value);
  const notes = parseInt(document.getElementById("notes").value);

  const focusDifficultyMultiplier = (focus / 2.5 + difficulty / 2.5);

  let xpFromMinutes = minutes * focusDifficultyMultiplier;
  let xpFromOtherActivities = (pages + slides / 3 + videoMinutes / 15 + notes / 100) * focusDifficultyMultiplier * 5;

  let xp = Math.round(xpFromMinutes + xpFromOtherActivities);
  let coins = Math.ceil(xp / 50); // 100 XP = 1 Coin
  let cash = Math.round(xp * (200 + Math.random() * 50)); // XP * random number between 450 and 550

  document.getElementById("rewards").innerHTML = `XP: ${xp.toLocaleString()}, Coins: ${coins.toLocaleString()}, Cash: $${cash.toLocaleString()}`;

  updateXP(xp);
  updateStats(minutes, pages, slides, videoMinutes, notes);
  updateCurrency(coins, cash);
  saveData();
}

function updateXP(xpToAdd) {
  currentXP += xpToAdd;

  while (currentXP >= maxXp) {
    currentXP -= maxXp;
    maxXp = Math.round(maxXp * 1.2); // 1.2x XP requirement for next level
    levelUp();
  }

  xpValue.textContent = `${currentXP.toLocaleString()} / ${maxXp.toLocaleString()} XP`; // Regular spaces around /
  xpProgress.style.width = `${(currentXP / maxXp) * 100}%`;
}

function levelUp() {
  let currentLevel = parseInt(levelDisplay.textContent.split(":")[1].trim());
  currentLevel++;
  levelDisplay.textContent = `Level: ${currentLevel}`;
}

function updateCurrency(coinsToAdd, cashToAdd) {
    let currentCoins = parseInt(coinsDisplay.textContent.split(":")[1].trim().replace(/,/g, '')) || 0;
    let currentCash = parseFloat(cashDisplay.textContent.split("$")[1].trim().replace(/,/g, '')) || 0;

    currentCoins += Math.ceil(coinsToAdd); // Use Math.ceil here
    currentCash += cashToAdd;

    coinsDisplay.textContent = `Coins: ${currentCoins.toLocaleString()}`;
    cashDisplay.textContent = `Cash: $${currentCash.toLocaleString()}`;
}

function updateStats(minutes, pages, slides, videoMinutes, notes) {
    // Check if it's a new day
    if (isNewDay()) {
        checkStreak(); // Check and update streak at the beginning of a new day
        resetTodayStats();
    }

    let todayStats = JSON.parse(localStorage.getItem('todayStats')) || { minutes: 0, pages: 0, slides: 0, videoMinutes: 0, notes: 0 };
    let totalStats = JSON.parse(localStorage.getItem('totalStats')) || { minutes: 0, pages: 0, slides: 0, videoMinutes: 0, notes: 0 };

    todayStats.minutes += minutes;
    todayStats.pages += pages;
    todayStats.slides += slides;
    todayStats.videoMinutes += videoMinutes;
    todayStats.notes += notes;

    totalStats.minutes += minutes;
    totalStats.pages += pages;
    totalStats.slides += slides;
    totalStats.videoMinutes += videoMinutes;
    totalStats.notes += notes;

    localStorage.setItem('todayStats', JSON.stringify(todayStats));
    localStorage.setItem('totalStats', JSON.stringify(totalStats));

    displayStats();
}

function checkStreak() {
    const today = new Date();
    const todayDateString = today.toLocaleDateString(); // Get today's date string

    let lastStudyString = localStorage.getItem('lastStudy');
    let streak = parseInt(localStorage.getItem('streak')) || 0;

    if (!lastStudyString) { // First time user
        localStorage.setItem('lastStudy', todayDateString);
        localStorage.setItem('streak', 1);
        streakDisplay.textContent = `Streak: 1`;
        return;
    }

    const lastStudyDate = new Date(lastStudyString); // Create Date object from stored string
    const lastStudyDateString = lastStudyDate.toLocaleDateString(); // Get stored date string

    if (todayDateString === lastStudyDateString) {
        return; // Already studied today - DO NOTHING
    } else if (isOneDayAfter(today, lastStudyDate)) { //is it the day after
        streak++;
        localStorage.setItem('lastStudy', todayDateString);
        localStorage.setItem('streak', streak);
        streakDisplay.textContent = `Streak: ${streak}`;
    } else { //Streak broken
        streak = 1; // Reset to 1 (studied today)
        localStorage.setItem('lastStudy', todayDateString);
        localStorage.setItem('streak', streak);
        streakDisplay.textContent = `Streak: ${streak}`;
    }
}

function isOneDayAfter(date1, date2) {
    const timeDiff = date1.getTime() - date2.getTime();
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays === 1;
}

function displayStats() {
    let todayStats = JSON.parse(localStorage.getItem('todayStats')) || { minutes: 0, pages: 0, slides: 0, videoMinutes: 0, notes: 0 };
    let totalStats = JSON.parse(localStorage.getItem('totalStats')) || { minutes: 0, pages: 0, slides: 0, videoMinutes: 0, notes: 0 };

    document.getElementById('today-stats').innerHTML = `
        <p>Minutes Studied: ${todayStats.minutes} minutes</p>
        <p>Pages Read: ${todayStats.pages} pages</p>
        <p>PowerPoint Slides Read: ${todayStats.slides} slides</p>
        <p>Video Minutes Watched: ${todayStats.videoMinutes} minutes</p>
        <p>Notes Written: ${todayStats.notes} words</p>
    `;

    document.getElementById('total-stats').innerHTML = `
        <p>Minutes Studied: ${totalStats.minutes} minutes</p>
        <p>Pages Read: ${totalStats.pages} pages</p>
        <p>PowerPoint Slides Read: ${totalStats.slides} slides</p>
        <p>Video Minutes Watched: ${totalStats.videoMinutes} minutes</p>
        <p>Notes Written: ${totalStats.notes} words</p>
    `;
}

function isNewDay() {
    const today = new Date();
    const lastReset = localStorage.getItem('lastReset');

    if (!lastReset) {
        // First time visiting the site
        localStorage.setItem('lastReset', today.toDateString());
        return false;
    }

    const lastResetDate = new Date(lastReset);

    if (today.toDateString() !== lastResetDate.toDateString()) {
        localStorage.setItem('lastReset', today.toDateString());
        return true;
    }

    return false;
}

function resetTodayStats() {
    localStorage.setItem('todayStats', JSON.stringify({ minutes: 0, pages: 0, slides: 0, videoMinutes: 0, notes: 0 }));
}

window.onload = function() {
    if (isNewDay()) {
        resetTodayStats();
    }
    loadData();
}


function saveData() {
    let currentCoins = parseInt(coinsDisplay.textContent.split(":")[1].trim().replace(/,/g, '')) || 0;
    let currentCash = parseFloat(cashDisplay.textContent.split("$")[1].trim().replace(/,/g, '')) || 0;
    localStorage.setItem('coins', currentCoins.toString());
    localStorage.setItem('cash', currentCash.toString());
    localStorage.setItem('level', parseInt(levelDisplay.textContent.split(":")[1].trim()));
    localStorage.setItem('streak', parseInt(streakDisplay.textContent.split(":")[1].trim()));
    localStorage.setItem('maxXp', maxXp.toString()); // Store as string
    localStorage.setItem('currentXP', currentXP.toString()); // Store as string
    localStorage.setItem('lastStudy', new Date().toLocaleDateString());
    let stats = JSON.parse(localStorage.getItem('stats')) || { minutes: 0, pages: 0, slides: 0, videoMinutes: 0, notes: 0 };
    localStorage.setItem('stats', JSON.stringify(stats));
}

window.createItem = function () {
    const itemName = document.getElementById('item-name').value;
    const time = parseInt(document.getElementById('time').value);
    const energy = parseInt(document.getElementById('energy').value);

    const coinCost = Math.ceil(time * (energy / 2) * 0.4);
    const cashCost = Math.round(time * energy * (2700 + Math.random() * 600));

    const shopItems = document.getElementById('shop-items');
    const newItem = document.createElement('div');
    newItem.classList.add('shop-item');
    newItem.innerHTML = `
        <h3>${itemName}</h3>
        <p>Time: ${time} minutes</p>
        <p>Energy: ${energy}</p>
        <p>Cost: ${coinCost.toLocaleString()} Coins, $${cashCost.toLocaleString()}</p>
        <button data-item-name="${itemName}" data-coin-cost="${coinCost}" data-cash-cost="${cashCost}" class="purchase">Purchase</button>
        <button class="edit-item">Edit</button>
        <button class="delete-item">Delete</button>
    `;
    shopItems.appendChild(newItem);
    document.getElementById('item-form').reset();
    document.getElementById('create-item-popup').style.display = 'none'; // Close the popup
};

document.addEventListener('DOMContentLoaded', () => {
    // ... (Rest of your DOMContentLoaded code - event listeners, etc.)
    const coinsDisplay = document.getElementById('coins');
    const openCreatePopup = document.getElementById('open-create-popup');
    const closeCreatePopup = document.getElementById('close-create-popup');
    const createItemButton = document.getElementById('create-item-button');
    const createItemPopup = document.getElementById('create-item-popup');
    const shopItems = document.getElementById('shop-items');
    let editingItem = null;

    if (openCreatePopup) {
        openCreatePopup.addEventListener('click', () => {
            editingItem = null;
            document.getElementById('item-form').reset();
            createItemPopup.style.display = 'block';
            createItemButton.textContent = "Create Item";
        });
    }

    if (closeCreatePopup) {
        closeCreatePopup.addEventListener('click', () => {
            createItemPopup.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target == createItemPopup) {
            createItemPopup.style.display = 'none';
        }
    });

    if (createItemButton) {
        createItemButton.addEventListener("click", createItem)
    }
    if (shopItems) {
        shopItems.addEventListener('click', function (event) {
            if (event.target.classList.contains('purchase')) {
                const itemName = event.target.dataset.itemName;
                const coinCost = parseInt(event.target.dataset.coinCost);
                const cashCost = parseFloat(event.target.dataset.cashCost);
                purchaseItem(itemName, coinCost, cashCost);
            } else if (event.target.classList.contains('delete-item')) {
                event.target.parentNode.remove();
            } else if (event.target.classList.contains('edit-item')) {
                editingItem = event.target.parentNode;
                const itemName = editingItem.querySelector('h3').textContent;
                const time = parseInt(editingItem.querySelector('p:nth-child(2)').textContent.split(":")[1].trim());
                const energy = parseInt(editingItem.querySelector('p:nth-child(3)').textContent.split(":")[1].trim());
                document.getElementById('item-name').value = itemName;
                document.getElementById('time').value = time;
                document.getElementById('energy').value = energy;
                createItemPopup.style.display = 'block';
                createItemButton.textContent = "Save Changes";
            }
        });
    }

    function purchaseItem(itemName, coinCost, cashCost) {
        if(coinsDisplay){
            let currentCoins = parseInt(coinsDisplay.textContent.split(":")[1].trim().replace(/,/g, '')) || 0;
            let currentCash = parseFloat(cashDisplay.textContent.split("$")[1].trim().replace(/,/g, '')) || 0;

            if (currentCoins >= coinCost && currentCash >= cashCost) {
                currentCoins -= coinCost;
                currentCash -= cashCost;

                coinsDisplay.textContent = `Coins: ${currentCoins.toLocaleString()}`;
                cashDisplay.textContent = `Cash: $${currentCash.toLocaleString()}`;

                alert(`You purchased ${itemName}!`);
                saveData();
                loadData();
            } else {
                alert("Not enough resources!");
            }
        }
    }
});

function loadData() {
    coinsDisplay.textContent = "Coins: " + (parseInt(localStorage.getItem('coins')) || 0).toLocaleString();
    cashDisplay.textContent = "Cash: $" + (parseFloat(localStorage.getItem('cash')) || 0).toLocaleString();
    levelDisplay.textContent = "Level: " + (parseInt(localStorage.getItem('level')) || 1);
    streakDisplay.textContent = "Streak: " + (parseInt(localStorage.getItem('streak')) || 0);
    maxXp = parseInt(localStorage.getItem('maxXp')) || 100;
    currentXP = parseInt(localStorage.getItem('currentXP')) || 0;
    xpValue.textContent = `${currentXP.toLocaleString()} / ${maxXp.toLocaleString()} XP`; // Regular spaces around /
    xpProgress.style.width = `${(currentXP / maxXp) * 100}%`;
    displayStats();
}

window.onload = function() {
    if (isNewDay()) {
        resetTodayStats();
    }
    loadData();
}