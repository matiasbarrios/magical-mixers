// Requirements
import dgram from 'dgram';


// Variables
let nextSocketId = 0;
const sockets = {};


// Exported
export const udpSocketOpen = (address, port) => {
    // Define the id
    const socketId = nextSocketId;
    nextSocketId += 1;

    // Create the UDP socket
    const s = dgram.createSocket({
        type: 'udp4',
        reuseAddr: true,
    });

    if (port && address) {
        s.bind(port, address, () => { s.setBroadcast(true); });
    } else {
        s.bind(() => { s.setBroadcast(true); });
    }

    // Keep reference
    sockets[socketId] = s;
    return socketId;
};


export const udpSocketClose = (socketId) => {
    if (!sockets[socketId]) return;
    try {
        sockets[socketId].close();
        delete sockets[socketId];
    } catch (error) {
        console.error(`UDP close socket error: ${error.message}`);
    }
};


export const udpMessageSend = (
    socketId, address, port, message, onError
) => {
    if (!sockets[socketId]) return;
    sockets[socketId].send(
        message, 0, message.length, port, address, (error) => {
            if (!error) return;
            console.error(`UDP message error: ${error}`);
            if (onError) onError(error, socketId);
        }
    );
};


export const onUDPMessageReceived = (onMessageReceived, socketId) => {
    if (!sockets[socketId]) return () => {};
    const socket = sockets[socketId];

    const onReceive = (buffer, { address, port }) => {
        if (!sockets[socketId]) return;
        onMessageReceived(buffer, address, port);
    };

    socket.on('message', onReceive);
    return () => {
        socket.off('message', onReceive);
    };
};
