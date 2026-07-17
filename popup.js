const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const timerDisplay = document.getElementById('timer');

let countdownInterval = null;
let timeLeft = 25 * 60;
let isRunning = false;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}

function startTimer() {
    countdownInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);
        } else {
            clearInterval(countdownInterval);
            countdownInterval = null;
            isRunning = false;
            startBtn.textContent = "Finished!";
            startBtn.classList.remove('btn-pause');
            startBtn.disabled = false;
        }
    }, 1000);
}

startBtn.addEventListener('click', () => {
    if (!isRunning) {
        console.log("Started/Resumed");
        isRunning = true;
        startBtn.textContent = "Pause";
        startBtn.classList.add('btn-pause');
        startTimer();
    } else {
        console.log("Paused");
        clearInterval(countdownInterval);
        countdownInterval = null;
        isRunning = false;
        startBtn.textContent = "Resume";
        startBtn.classList.remove('btn-pause');
    }
});

resetBtn.addEventListener('click', () => {
    console.log("Reset clicked");
    
    clearInterval(countdownInterval);
    countdownInterval = null;
    isRunning = false;

    timeLeft = 25 * 60;
    
    timerDisplay.textContent = formatTime(timeLeft);
    startBtn.textContent = "Start Timer";
    startBtn.classList.remove('btn-pause');
    startBtn.disabled = false;
});