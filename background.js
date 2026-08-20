//central timer state
let timerState = {
    timeLeft: 25 * 60,
    duration: 25,
    isRunning: false,
    endTime: null
};


//save timer state
async function saveState() {
    await chrome.storage.local.set({
        timerState: timerState
    });
}


//load timer state
async function loadState() {

    const result = await chrome.storage.local.get("timerState");

    if (result.timerState) {
        timerState = result.timerState;
    }


    //if timer was running, calculate remaining time
    if (timerState.isRunning && timerState.endTime) {

        timerState.timeLeft = Math.max(
            0,
            Math.ceil(
                (timerState.endTime - Date.now()) / 1000
            )
        );


        //timer has finished
        if (timerState.timeLeft === 0) {

            timerState.isRunning = false;
            timerState.endTime = null;

            await saveState();
        }
    }
}


//load saved state when service worker starts
loadState();


//listen for messages from popup.js
chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        (async () => {

            await loadState();


            //get current timer state
            if (message.action === "GET_STATE") {

                sendResponse(timerState);
            }


            //start / pause / resume
            else if (message.action === "TOGGLE_TIMER") {

                if (!timerState.isRunning) {

                    //only set a new duration if the timer has not already started.
                    if (
                        timerState.timeLeft === timerState.duration * 60 ||
                        timerState.timeLeft === 0
                    ) {

                        timerState.duration = message.duration;
                        timerState.timeLeft = message.duration * 60;
                    }

                    startTimer();

                } else {

                    pauseTimer();
                }

                sendResponse(timerState);
            }


            // Reset
            else if (message.action === "RESET_TIMER") {

                resetTimer();

                sendResponse(timerState);
            }

        })();


        //keeps the message channel open for async response
        return true;
    }
);


//start timer
async function startTimer() {

    timerState.isRunning = true;

    timerState.endTime =
        Date.now() + timerState.timeLeft * 1000;


    chrome.alarms.create("mindsweep_alarm", {
        when: timerState.endTime
    });

    await saveState();
}


//pause timer
async function pauseTimer() {

    timerState.timeLeft = Math.max(
        0,
        Math.ceil(
            (timerState.endTime - Date.now()) / 1000
        )
    );

    timerState.isRunning = false;
    timerState.endTime = null;

    chrome.alarms.clear("mindsweep_alarm");

    await saveState();
}


//reset timer
async function resetTimer() {

    timerState.timeLeft = 25 * 60;
    timerState.duration = 25;
    timerState.isRunning = false;
    timerState.endTime = null;

    chrome.alarms.clear("mindsweep_alarm");

    await saveState();
}


//timer finished
chrome.alarms.onAlarm.addListener(async (alarm) => {

    if (alarm.name !== "mindsweep_alarm") {
        return;
    }

    timerState.timeLeft = 0;
    timerState.isRunning = false;
    timerState.endTime = null;

    await saveState();


    chrome.notifications.create(
        "mindsweep_finished",
        {
            type: "basic",
            iconUrl: "assets/notifications.png",
            title: "MindSweep Complete!",
            message: "Your focus session is done. Take a quick break!",
            priority: 2
        }
    );
});