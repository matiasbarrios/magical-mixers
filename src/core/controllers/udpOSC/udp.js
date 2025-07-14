// Variables
let provider = null;


// Exported
export const udpSetProvider = (p) => {
    provider = p;
};


export const udpSocketOpen = async (onMessageReceived) => {
    if (!provider) return null;
    const socketId = await provider.udpSocketOpen();
    const unlistenMessageReceived = provider.onUDPMessageReceived(onMessageReceived, socketId);
    return { socketId, unlistenMessageReceived };
};


export const udpMessageSend = (socketId, address, port, message) => {
    if (!provider) return;
    provider.udpMessageSend(socketId, address, port, message);
};


export const udpSocketClose = async (socketId) => {
    if (!provider) return;
    await provider.udpSocketClose(socketId);
};
