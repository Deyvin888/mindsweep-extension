//central timer state stored in background memory
let timerState = {
    timeLeft: 25 * 60,
    isRunning: false,
    endTime: null
};

//listens for messages coming from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //recalculates remaining time accurately if timer is active
    if (timerState.isRunning && timerState.endTime) {
        const remaining = Math.max(0, Math.round((timerState.endTime - Date.now()) / 1000));
        timerState.timeLeft = remaining;
    }

    if (message.action === 'GET_STATE') {
        sendResponse(timerState);
    } 
    else if (message.action === 'TOGGLE_TIMER') {
        if (!timerState.isRunning) {
            startTimer();
        } else {
            pauseTimer();
        }
        sendResponse(timerState);
    } 
    else if (message.action === 'RESET_TIMER') {
        resetTimer();
        sendResponse(timerState);
    }
    
    return true;
});

//start/resume the timer
function startTimer() {
    timerState.isRunning = true;
    timerState.endTime = Date.now() + (timerState.timeLeft * 1000);

    //schedules the system alarm to wake up when timer hits 0
    chrome.alarms.create('mindsweep_alarm', { 
        when: timerState.endTime 
    });
}

//pause the timer
function pauseTimer() {
    timerState.isRunning = false;
    timerState.timeLeft = Math.max(0, Math.round((timerState.endTime - Date.now()) / 1000));
    timerState.endTime = null;
    
    chrome.alarms.clear('mindsweep_alarm');
}

//reset the timer
function resetTimer() {
    timerState.isRunning = false;
    timerState.timeLeft = 25 * 60;
    timerState.endTime = null;
    
    chrome.alarms.clear('mindsweep_alarm');
}

//system event, executes when the timer reaches zero
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'mindsweep_alarm') {
        timerState.isRunning = false;
        timerState.timeLeft = 0;
        timerState.endTime = null;

        //trigger the google chrome desktop notification
        chrome.notifications.create('mindsweep_finished', {
            type: 'basic',
            iconUrl: 'notifications.png',
            title: 'MindSweep Complete!',
            message: 'Your focus session is done. Take a quick break!',
            priority: 2
        });
    }
});