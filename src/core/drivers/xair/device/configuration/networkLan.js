// Requirements
import { isValidIP } from '../../../../helpers/values.js';


// Internal
const readIp = (read, osc) => () => {
    const a0 = read(`/-prefs/lan/${osc}/0`);
    const a1 = read(`/-prefs/lan/${osc}/1`);
    const a2 = read(`/-prefs/lan/${osc}/2`);
    const a3 = read(`/-prefs/lan/${osc}/3`);
    return `${a0 || '0'}.${a1 || '0'}.${a2 || '0'}.${a3 || '0'}`;
};


const getIp = (read, get, osc) => (c) => {
    const unlisten0 = get(`/-prefs/lan/${osc}/0`, () => { c(readIp(read, osc)); });
    const unlisten1 = get(`/-prefs/lan/${osc}/1`, () => { c(readIp(read, osc)); });
    const unlisten2 = get(`/-prefs/lan/${osc}/2`, () => { c(readIp(read, osc)); });
    const unlisten3 = get(`/-prefs/lan/${osc}/3`, () => { c(readIp(read, osc)); });
    return () => {
        unlisten0();
        unlisten1();
        unlisten2();
        unlisten3();
    };
};


const setIP = (set, setBatch, osc) => (v) => {
    const parts = v.split('.');
    if (parts.length !== 4) return;
    if (!parts.every(p => parseInt(p, 10) >= 0 && parseInt(p, 10) <= 255)) return;
    const writes = parts.map((part, i) => ({
        address: `/-prefs/lan/${osc}/${i}`,
        value: part,
    }));
    if (setBatch) setBatch(writes);
    else writes.forEach(({ address, value }) => set(address, value));
};


// Exported
export const networkLan = ({ read, get, set, setBatch }) => ({
    mode: {
        name: 'Mode',
        type: 'select',
        options: [
            { name: 'Static', value: 0 },
            { name: 'DHCP', value: 1 },
            { name: 'DHCP server', value: 2 },
        ],
        has: (c) => { c(true); },
        read: () => read('/-prefs/lan/mode'),
        get: c => get('/-prefs/lan/mode', c),
        set: v => set('/-prefs/lan/mode', v),
    },
    ip: {
        name: 'IP',
        type: 'string',
        isValid: isValidIP,
        minLength: 1,
        maxLength: 15,
        hideIf: values => values['networkLan-mode'] === 1,
        has: (c) => { c(true); },
        read: readIp(read, 'addr'),
        get: getIp(read, get, 'addr'),
        set: setIP(set, setBatch, 'addr'),
    },
    mask: {
        name: 'Subnet mask',
        type: 'string',
        isValid: isValidIP,
        minLength: 1,
        maxLength: 15,
        hideIf: values => values['networkLan-mode'] === 1,
        has: (c) => { c(true); },
        read: readIp(read, 'mask'),
        get: getIp(read, get, 'mask'),
        set: setIP(set, setBatch, 'mask'),
    },
    gateway: {
        name: 'Gateway',
        type: 'string',
        isValid: isValidIP,
        minLength: 1,
        maxLength: 15,
        hideIf: values => values['networkLan-mode'] === 1,
        has: (c) => { c(true); },
        read: readIp(read, 'gateway'),
        get: getIp(read, get, 'gateway'),
        set: setIP(set, setBatch, 'gateway'),
    },
});
