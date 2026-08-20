const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const timerDisplay = document.getElementById('timer');

const durationSelect = document.getElementById('duration');
const customDurationInput = document.getElementById('custom-duration');


//format seconds into MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


//update everything displayed in the popup
function updateUI(response) {
    if (!response) return;

    timerDisplay.textContent = formatTime(response.timeLeft);

    if (response.isRunning) {

        startBtn.textContent = "Pause";
        startBtn.classList.add('btn-pause');

    } else if (response.timeLeft === 0) {

        startBtn.textContent = "Finished!";
        startBtn.classList.remove('btn-pause');

    } else if (response.timeLeft < response.duration * 60) {

        startBtn.textContent = "Resume";
        startBtn.classList.remove('btn-pause');

    } else {

        startBtn.textContent = "Start Timer";
        startBtn.classList.remove('btn-pause');
    }
}


//show/hide the custom duration input
durationSelect.addEventListener('change', () => {

    if (durationSelect.value === 'custom') {

        customDurationInput.hidden = false;
        customDurationInput.focus();

    } else {

        customDurationInput.hidden = true;
    }
});


//get current timer state when popup opens
chrome.runtime.sendMessage(
    { action: 'GET_STATE' },
    updateUI
);


//keep the displayed timer updated
setInterval(() => {

    chrome.runtime.sendMessage(
        { action: 'GET_STATE' },
        updateUI
    );

}, 1000);


//start / pause / resume button
startBtn.addEventListener('click', () => {

    let duration;

    // Custom timer
    if (durationSelect.value === 'custom') {

        duration = Number(customDurationInput.value);

        if (!duration || duration < 1) {
            alert("Please enter a valid number of minutes.");
            return;
        }

    } else {

        //preset timer
        duration = Number(durationSelect.value);
    }


    chrome.runtime.sendMessage(
        {
            action: 'TOGGLE_TIMER',
            duration: duration
        },
        updateUI
    );
});


//reset button
resetBtn.addEventListener('click', () => {

    chrome.runtime.sendMessage(
        { action: 'RESET_TIMER' },
        updateUI
    );

});