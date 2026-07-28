const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const timerDisplay = document.getElementById('timer');

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}

function updateUI(response) {
    if (!response) return;

    timerDisplay.textContent = formatTime(response.timeLeft);

    if (response.isRunning) {
        startBtn.textContent = "Pause";
        startBtn.classList.add('btn-pause');
    } else if (response.timeLeft === 0) {
        startBtn.textContent = "Finished!";
        startBtn.classList.remove('btn-pause');
    } else if (response.timeLeft < 25 * 60) {
        startBtn.textContent = "Resume";
        startBtn.classList.remove('btn-pause');
    } else {
        startBtn.textContent = "Start Timer";
        startBtn.classList.remove('btn-pause');
    }
}

chrome.runtime.sendMessage({ action: 'GET_STATE' }, updateUI);

setInterval(() => {
    chrome.runtime.sendMessage({ action: 'GET_STATE' }, updateUI);
}, 1000);

startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'TOGGLE_TIMER' }, updateUI);
});

resetBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'RESET_TIMER' }, updateUI);
});