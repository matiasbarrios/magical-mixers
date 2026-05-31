// Requirements
import os from 'os';
import { Netmask } from 'netmask';


// Constants
const NON_LAN_INTERFACE_PREFIXES = ['awdl', 'llw'];

const PRIVATE_RANGES = [
    new Netmask('10.0.0.0/8'),
    new Netmask('172.16.0.0/12'),
    new Netmask('192.168.0.0/16'),
    new Netmask('169.254.0.0/16'),
];


// Internal
const isNonLANInterface = name => NON_LAN_INTERFACE_PREFIXES
    .some(prefix => name.startsWith(prefix));


const getInterfacePriority = (name) => {
    const enMatch = name.match(/^en(\d+)$/);
    if (enMatch) return Number(enMatch[1], 10);

    const utunMatch = name.match(/^utun(\d+)$/);
    if (utunMatch) return 50 + Number(utunMatch[1], 10);

    const pppMatch = name.match(/^ppp(\d+)$/);
    if (pppMatch) return 50 + Number(pppMatch[1], 10);

    return 100;
};


const getIPv4Interfaces = () => Object
    .entries(os.networkInterfaces() || {})
    .flatMap(([name, addrs]) => addrs.map(i => ({ ...i, name })))
    .filter(i => i.family === 'IPv4' && !i.internal && i.cidr)
    .filter(i => !isNonLANInterface(i.name));


const pickBestInterface = (interfaces) => {
    if (!interfaces.length) return null;

    return [...interfaces].sort((a, b) => {
        const prefixDiff = b.netmask.bitmask - a.netmask.bitmask;
        if (prefixDiff !== 0) return prefixDiff;
        return getInterfacePriority(a.name) - getInterfacePriority(b.name);
    })[0];
};


const getLocalInterfacesForIP = targetIp => getIPv4Interfaces()
    .map(i => ({ ...i, netmask: new Netmask(i.cidr) }))
    .filter(i => i.netmask.contains(targetIp));


// Exported
export const getLANInterfaces = () => {
    const interfaces = getIPv4Interfaces()
        .filter(i => PRIVATE_RANGES.some(range => range.contains(i.address)))
        .map((i) => {
            const nm = new Netmask(i.cidr);
            return {
                localAddress: i.address,
                broadcastAddress: nm.broadcast,
                interfaceName: i.name,
            };
        });

    return [{
        localAddress: '127.0.0.1',
        broadcastAddress: '127.0.0.1',
        interfaceName: 'lo0',
    }, ...interfaces];
};


export const getLocalAddressForIP = (targetIp) => {
    if (!targetIp) return null;
    if (targetIp === '127.0.0.1') return '127.0.0.1';

    const match = pickBestInterface(getLocalInterfacesForIP(targetIp));
    return match?.address ?? null;
};


export const getLANBroadcastAddress = getLANInterfaces;
