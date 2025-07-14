// Requirements
import { lanSetProvider } from './helpers/lan.js';
import { fromBuffer, toBuffer } from './helpers/osc.js';
import { udpOSCSetProvider } from './controllers/udpOSC/index.js';


// Exported
export const oscFromBuffer = fromBuffer;


export const oscToBuffer = toBuffer;


export { searchNew } from './devices/search.js';


export const mixersInitialize = (platform) => {
    lanSetProvider({
        getLANBroadcastAddress: platform.getLANBroadcastAddress,
    });
    udpOSCSetProvider({
        udpSocketOpen: platform.udpSocketOpen,
        udpSocketClose: platform.udpSocketClose,
        udpMessageSend: platform.udpMessageSend,
        onUDPMessageReceived: platform.onUDPMessageReceived,
    });
};
