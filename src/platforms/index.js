// Requirements
import {
    udpSocketOpen,
    udpSocketClose,
    udpMessageSend,
    onUDPMessageReceived,
} from './node/udp.js';
import { getLANBroadcastAddress } from './node/lan.js';


// Exported
export const nodePlatform = {
    udpSocketOpen,
    udpSocketClose,
    udpMessageSend,
    onUDPMessageReceived,
    getLANBroadcastAddress,
};
