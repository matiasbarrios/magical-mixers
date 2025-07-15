// Requirements
import os from 'os';
import { Netmask } from 'netmask';


// Exported
export const getLANBroadcastAddress = () => {
    const interfaces = Object
        .values(os.networkInterfaces() || {})
        .flat()
        .filter(i => i.family === 'IPv4' && !i.internal && i.cidr);

    const privateRanges = [
        new Netmask('10.0.0.0/8'),
        new Netmask('172.16.0.0/12'),
        new Netmask('192.168.0.0/16'),
        new Netmask('169.254.0.0/16'),
    ];

    const broadcasts = new Set();
    interfaces.forEach((i) => {
        if (!privateRanges.some(range => range.contains(i.address))) return;
        const nm = new Netmask(i.cidr);
        broadcasts.add(nm.broadcast);
    });

    return ['127.0.0.1', ...[...broadcasts]];
};

