// Constants
const DELAY_BETWEEN_MESSAGES = 5;


// Exported
export const sendQueueNew = (paceMs = DELAY_BETWEEN_MESSAGES) => {
    const queue = [];
    const waiters = [];
    let drainTimer = null;
    let draining = false;

    const notifyDrained = () => {
        draining = false;
        while (waiters.length) waiters.shift()();
    };

    const cancelDrain = () => {
        if (drainTimer === null) return;
        clearTimeout(drainTimer);
        drainTimer = null;
    };

    const scheduleNext = (sendItem) => {
        drainTimer = setTimeout(() => {
            drainTimer = null;
            sendItem();
        }, paceMs);
    };

    const drainStep = (canSend, doSend) => {
        if (!canSend()) {
            queue.length = 0;
            cancelDrain();
            notifyDrained();
            return;
        }

        const item = queue.shift();
        doSend(item.address, ...item.args);

        if (queue.length > 0) {
            scheduleNext(() => drainStep(canSend, doSend));
        } else {
            notifyDrained();
        }
    };

    const startDrain = (canSend, doSend) => {
        if (draining) return;
        draining = true;
        scheduleNext(() => drainStep(canSend, doSend));
    };

    return {
        enqueue(canSend, doSend, address, ...args) {
            if (!canSend()) return undefined;
            queue.push({ address, args });
            startDrain(canSend, doSend);
            return queue.length * paceMs;
        },
        drained() {
            if (!draining && queue.length === 0) return Promise.resolve();
            return new Promise(resolve => waiters.push(resolve));
        },
        dispose() {
            cancelDrain();
            queue.length = 0;
            notifyDrained();
        },
        get pending() {
            return queue.length;
        },
        get outstanding() {
            return queue.length + (draining ? 1 : 0);
        },
    };
};
