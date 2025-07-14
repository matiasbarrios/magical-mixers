// Requirements
import {
    udpMessageSend,
    udpSocketClose,
    udpSocketOpen,
    onUDPMessageReceived,
} from '../helpers/udp.js';
import { x18Run, x18Stop } from './run.js';


// Main
const main = async () => {
    const platform = {
        udpSocketOpen,
        udpSocketClose,
        udpMessageSend,
        onUDPMessageReceived,
    };

    await x18Run({ platform });

    process.on('SIGINT', async () => {
        await x18Stop();
        process.exit();
    });
};


// Run
main();
