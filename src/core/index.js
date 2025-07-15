// Requirements
import { nodePlatform } from '../platforms/index.js';
import { lanSetProvider } from './helpers/lan.js';
import { udpOSCSetProvider } from './controllers/udpOSC/index.js';


// Exported
export { searchNew } from './devices/search.js';


export const initialize = (platform) => {
    const p = platform || nodePlatform;
    lanSetProvider({
        getLANBroadcastAddress: p.getLANBroadcastAddress,
    });
    udpOSCSetProvider({
        udpSocketOpen: p.udpSocketOpen,
        udpSocketClose: p.udpSocketClose,
        udpMessageSend: p.udpMessageSend,
        onUDPMessageReceived: p.onUDPMessageReceived,
    });
};
