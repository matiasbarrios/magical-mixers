// Requirements
import dgram from 'dgram';


// Variables
let nextSocketId = 0;
const sockets = {};


// Internal
const bindSocket = (socket, bindAddress, port, enableBroadcast) => new Promise((resolve, reject) => {
    const onBound = (error) => {
        if (error) {
            reject(error);
            return;
        }
        if (enableBroadcast) {
            try {
                socket.setBroadcast(true);
            } catch (broadcastError) {
                reject(broadcastError);
                return;
            }
        }
        resolve();
    };

    if (bindAddress && port) {
        socket.bind({ port, address: bindAddress, exclusive: true }, onBound);
    } else if (bindAddress) {
        socket.bind(0, bindAddress, onBound);
    } else {
        socket.bind(onBound);
    }
});


const getSocket = socketId => sockets[socketId] ?? null;


// Exported
export const udpSocketOpen = async (bindAddress, port, enableBroadcast = false) => {
    const socketId = nextSocketId;
    nextSocketId += 1;

    const s = dgram.createSocket({
        type: 'udp4',
        reuseAddr: true,
    });

    s.on('error', (err) => {
        console.error('UDP Socket error:', err);
    });

    await bindSocket(s, bindAddress, port, enableBroadcast);

    sockets[socketId] = s;
    return socketId;
};


export const udpSocketClose = async (socketId) => {
    const socket = getSocket(socketId);
    if (!socket) return;
    delete sockets[socketId];
    try {
        await new Promise((resolve) => {
            socket.close(() => resolve());
        });
    } catch (error) {
        console.error(`UDP close socket error: ${error.message}`);
    }
};


export const udpMessageSend = (
    socketId, address, port, message, onError
) => {
    const socket = getSocket(socketId);
    if (!socket) return;

    const doOnError = (error) => {
        if (!error) return;
        const bound = socket.address?.();
        console.error(`UDP message error: ${error}`, bound ? `(bound ${bound.address}:${bound.port})` : '');
        if (onError) onError(error, socketId);
    };

    try {
        socket.send(
            message, 0, message.length, port, address, doOnError
        );
    } catch (error) {
        doOnError(error);
    }
};


export const onUDPMessageReceived = (onMessageReceived, socketId) => {
    const socket = getSocket(socketId);
    if (!socket) return () => {};

    const onReceive = (buffer, { address, port }) => {
        if (!getSocket(socketId)) return;
        onMessageReceived(buffer, address, port);
    };

    socket.on('message', onReceive);
    return () => {
        socket.off('message', onReceive);
    };
};
