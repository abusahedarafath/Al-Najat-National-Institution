const RtseSetting = require("../models/RtseSetting");

let schedulerStarted = false;
let timer = null;

async function checkScheduledPublication() {
    try {
        const published = await RtseSetting.publishScheduledResults();

        if (published) {
            console.log(
                "[RTSE Result Scheduler] Results automatically published."
            );
        }
    } catch (err) {
        console.error(
            "[RTSE Result Scheduler] Publication check failed:",
            err
        );
    }
}

function start() {
    if (schedulerStarted) {
        return;
    }

    schedulerStarted = true;

    console.log(
        "[RTSE Result Scheduler] Started. Checking every second."
    );

    // Check immediately after server startup.
    checkScheduledPublication();

    timer = setInterval(
        checkScheduledPublication,
        1000
    );

    // Do not prevent Node from shutting down naturally.
    if (timer && typeof timer.unref === "function") {
        timer.unref();
    }
}

module.exports = {
    start,
    checkScheduledPublication
};
