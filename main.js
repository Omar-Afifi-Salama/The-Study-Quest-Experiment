document.addEventListener('DOMContentLoaded', () => {
    loadGameData(); // Load data FIRST!
    gameData.updateNavbar(); // Update navbar after loading data
    displayStats(); // Display stats after loading data

    const studyButton = document.getElementById('study-button');
    const popup = document.getElementById('popup');
    const closeButton = document.querySelector('.close-button');

    if (studyButton) {
        studyButton.addEventListener('click', () => {
            if (popup) {
                popup.style.display = 'block';
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            if (popup) {
                popup.style.display = 'none';
            }
        });
    }

    window.addEventListener('click', (event) => {
        if (popup && event.target === popup) {
            popup.style.display = 'none';
        }
    });

    const calculateButton = document.getElementById("calculate-button")
    if(calculateButton){
        calculateButton.addEventListener("click", calculateRewards)
    }

    const downloadDataButton = document.getElementById('download-data-button');
    if (downloadDataButton) {
        downloadDataButton.addEventListener('click', downloadAllData);
    }
});

function calculateRewards() {
    const minutes = parseInt(document.getElementById("minutes").value) || 0;
    const difficulty = parseInt(document.getElementById("difficulty").value) || 1;
    const focus = parseInt(document.getElementById("focus").value) || 1;
    const pages = parseInt(document.getElementById("pages").value) || 0;
    const slides = parseInt(document.getElementById("slides").value) || 0;
    const videoMinutes = parseInt(document.getElementById("videoMinutes").value) || 0;
    const notes = parseInt(document.getElementById("notes").value) || 0;
    const questions = parseInt(document.getElementById("questions").value) || 0;

    // Improved Focus/Difficulty Multipliers (More Balanced):
    const focusMultiplier = 1 + ((focus - 1) * 0.25); // Scales from 1 to 2
    const difficultyMultiplier = 1 + ((difficulty - 1) * 0.25); // Scales from 1 to 2
    const focusDifficultyMultiplier = focusMultiplier * difficultyMultiplier; // Combines the effects

    // XP from Minutes (Time Studied):
    let xpFromMinutes = minutes * focusDifficultyMultiplier * (1/3); // 1 XP per 3 minutes

    // XP from Other Activities (Scaled based on effort):
    let xpFromPages = (pages / 3) * 5;
    let xpFromSlides = (slides / 3) * 5;
    let xpFromVideo = (videoMinutes / 15) * 10;
    let xpFromNotes = (notes / 100) * 8;
    let xpFromQuestions = questions * 1;

    let xpFromOtherActivities = (xpFromPages + xpFromSlides + xpFromVideo + xpFromNotes + xpFromQuestions) * focusDifficultyMultiplier;

    let xp = Math.round(xpFromMinutes + xpFromOtherActivities);
    let coins = Math.ceil(xp / 25);
    let cash = Math.round(xp * (250 + Math.random() * 50)) / 10; // Adjusted cash calculation

    document.getElementById("rewards").innerHTML = `XP: ${xp.toLocaleString()}, Coins: ${coins.toLocaleString()}, Cash: $${cash.toLocaleString()}`;

    updateXP(xp);
    updateStats(minutes, pages, slides, videoMinutes, notes,questions);
    updateCurrency(coins, cash);
    gameData.updateNavbar(); // Update navbar after calculations
    displayStats(); // Update stats display after calculations

        // Store input data in localStorage
        const now = new Date();
        const dateString = now.toLocaleDateString();
        const timeString = now.toLocaleTimeString();
    
        const inputData = {
            date: dateString,
            time: timeString,
            minutes,
            pages,
            slides,
            videoMinutes,
            notes,
            questions,
            focus,
            difficulty,
            xp,
            coins,
            cash,
            level: gameData.level,       // Add level
            streak: gameData.streak,     // Add streak
        };
    
        let studyLog = JSON.parse(localStorage.getItem('studyLog')) || [];
        studyLog.push(inputData);
        localStorage.setItem('studyLog', JSON.stringify(studyLog));
    }
    
    function downloadAllData() {
        let studyLog = JSON.parse(localStorage.getItem('studyLog')) || [];
    
        if (studyLog.length === 0) {
            alert("No study data to download.");
            return;
        }
    
        let csvContent = "Date,Time,Minutes,Pages,Slides,Video Minutes,Notes,Questions,Focus,Difficulty,XP,Coins,Cash,Level,Streak\n";
    
        studyLog.forEach(entry => {
            csvContent += `${entry.date},${entry.time},${entry.minutes},${entry.pages},${entry.slides},${entry.videoMinutes},${entry.notes},${entry.questions},${entry.focus},${entry.difficulty},${entry.xp},${entry.coins},${entry.cash},${entry.level},${entry.streak}\n`;
        });
    
        downloadCSV(csvContent);
    }

function displayStats() {
    const todayStatsDisplay = document.getElementById('today-stats');
    const totalStatsDisplay = document.getElementById('total-stats');

    if (todayStatsDisplay && totalStatsDisplay && gameData && gameData.todayStats && gameData.totalStats) {
        todayStatsDisplay.innerHTML = `
            <p>Minutes Studied: ${(gameData.todayStats.minutes || 0).toLocaleString()} minutes</p>
            <p>Pages Read: ${(gameData.todayStats.pages || 0).toLocaleString()} pages</p>
            <p>PowerPoint Slides Read: ${(gameData.todayStats.slides || 0).toLocaleString()} slides</p>
            <p>Video Minutes Watched: ${(gameData.todayStats.videoMinutes || 0).toLocaleString()} minutes</p>
            <p>Notes Written: ${(gameData.todayStats.notes || 0).toLocaleString()} words</p>
            <p>Questions Answered: ${(gameData.todayStats.questions || 0).toLocaleString()} questions</p>
        `;

        totalStatsDisplay.innerHTML = `
            <p>Minutes Studied: ${(gameData.totalStats.minutes || 0).toLocaleString()} minutes</p>
            <p>Pages Read: ${(gameData.totalStats.pages || 0).toLocaleString()} pages</p>
            <p>PowerPoint Slides Read: ${(gameData.totalStats.slides || 0).toLocaleString()} slides</p>
            <p>Video Minutes Watched: ${(gameData.totalStats.videoMinutes || 0).toLocaleString()} minutes</p>
            <p>Notes Written: ${(gameData.totalStats.notes || 0).toLocaleString()} words</p>
            <p>Questions Answered: ${(gameData.totalStats.questions || 0).toLocaleString()} questions</p>
        `;
    } else {
        console.error("One or more required elements or game data is missing.");
    }
}