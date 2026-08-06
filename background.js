//central timer state stored in background memory
let timerState = {
    timeLeft: 25 * 60,
    isRunning: false,
    endTime: null
};

//save timer to storage
async function saveState() {
    await chrome.storage.local.set({ timerState });
}


//load timer from storage
async function loadState() {
    const result = await chrome.storage.local.get("timerState");

    if (result.timerState) {
        timerState = result.timerState;
    }

    // If timer was running, calculate remaining time
    if (timerState.isRunning && timerState.endTime) {
        timerState.timeLeft = Math.max(
            0,
            Math.ceil((timerState.endTime - Date.now()) / 1000)
        );

        if (timerState.timeLeft === 0) {
            timerState.isRunning = false;
            timerState.endTime = null;
            await saveState();
        }
    }
}

//load saved timer when service worker starts
loadState();

//message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    (async () => {

        await loadState();

        if (message.action === "GET_STATE") {
            sendResponse(timerState);
        }

        else if (message.action === "TOGGLE_TIMER") {

            if (!timerState.isRunning) {
                startTimer();
            } else {
                pauseTimer();
            }

            sendResponse(timerState);
        }

        else if (message.action === "RESET_TIMER") {
            resetTimer();
            sendResponse(timerState);
        }

    })();

    return true;
});

//start timer
async function startTimer() {

    timerState.isRunning = true;
    timerState.endTime = Date.now() + timerState.timeLeft * 1000;

    chrome.alarms.create("mindsweep_alarm", {
        when: timerState.endTime
    });

    await saveState();
}

//pause timer
async function pauseTimer() {

    timerState.timeLeft = Math.max(
        0,
        Math.ceil((timerState.endTime - Date.now()) / 1000)
    );

    timerState.isRunning = false;
    timerState.endTime = null;

    chrome.alarms.clear("mindsweep_alarm");

    await saveState();
}

//reset timer
async function resetTimer() {

    timerState.timeLeft = 25 * 60;
    timerState.isRunning = false;
    timerState.endTime = null;

    chrome.alarms.clear("mindsweep_alarm");

    await saveState();
}

//timer finished
chrome.alarms.onAlarm.addListener(async (alarm) => {

    if (alarm.name !== "mindsweep_alarm")
        return;

    timerState.timeLeft = 0;
    timerState.isRunning = false;
    timerState.endTime = null;

    await saveState();

    chrome.notifications.create("mindsweep_finished", {
        type: "basic",
        iconUrl: "notifications.png",
        title: "MindSweep Complete!",
        message: "Your focus session is done. Take a quick break!",
        priority: 2
    });
});