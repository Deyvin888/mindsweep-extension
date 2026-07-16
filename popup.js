const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const timerDisplay = document.getElementById('timer');

let countdownInterval = null;
let timeLeft = 25 * 60;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}

startBtn.addEventListener('click', () => {
    console.log("Started");

    if (countdownInterval !== null) return;

    startBtn.textContent = "Started";
    startBtn.disabled = true;

    countdownInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);
        } else {
            clearInterval(countdownInterval);
            countdownInterval = null;
            startBtn.textContent = "Finished!";
            startBtn.disabled = false;
        }
    }, 1000);
});

resetBtn.addEventListener('click', () => {
    console.log("Reset clicked");
    
    clearInterval(countdownInterval);
    countdownInterval = null;

    timeLeft = 25 * 60;
    
    timerDisplay.textContent = formatTime(timeLeft);
    startBtn.textContent = "Start Timer";
    startBtn.disabled = false;
});