// Variables
let provider = null;


// Exported
export const udpSetProvider = (p) => {
    provider = p;
};


export const udpSocketOpen = async (onMessageReceived, bindAddress, enableBroadcast = false) => {
    if (!provider) return null;
    const socketId = await provider.udpSocketOpen(bindAddress, undefined, enableBroadcast);
    const unlistenMessageReceived = provider.onUDPMessageReceived(onMessageReceived, socketId);
    return { socketId, unlistenMessageReceived };
};


export const udpSocketRetarget = async (socketWrapper, onMessageReceived) => {
    if (!provider || !socketWrapper) return null;
    if (socketWrapper.unlistenMessageReceived) {
        await socketWrapper.unlistenMessageReceived();
    }
    const { socketId } = socketWrapper;
    const unlistenMessageReceived = provider.onUDPMessageReceived(onMessageReceived, socketId);
    return { socketId: socketWrapper.socketId, unlistenMessageReceived };
};


export const udpMessageSend = (socketId, address, port, message) => {
    if (!provider) return;
    provider.udpMessageSend(socketId, address, port, message);
};


export const udpSocketClose = async (socketId) => {
    if (!provider) return;
    await provider.udpSocketClose(socketId);
};
