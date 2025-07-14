// Requirements
import { isValidIP } from '../../../../helpers/values.js';


const readIp = (read, osc) => () => {
    const a0 = read(`/-prefs/is/${osc}/0`);
    const a1 = read(`/-prefs/is/${osc}/1`);
    const a2 = read(`/-prefs/is/${osc}/2`);
    const a3 = read(`/-prefs/is/${osc}/3`);
    return `${a0 || '0'}.${a1 || '0'}.${a2 || '0'}.${a3 || '0'}`;
};


const getIp = (read, get, osc) => (c) => {
    const unlisten0 = get(`/-prefs/is/${osc}/0`, () => { c(readIp(read, osc)); });
    const unlisten1 = get(`/-prefs/is/${osc}/1`, () => { c(readIp(read, osc)); });
    const unlisten2 = get(`/-prefs/is/${osc}/2`, () => { c(readIp(read, osc)); });
    const unlisten3 = get(`/-prefs/is/${osc}/3`, () => { c(readIp(read, osc)); });
    return () => {
        unlisten0();
        unlisten1();
        unlisten2();
        unlisten3();
    };
};


const setIP = (set, osc) => (v) => {
    const parts = v.split('.');
    if (parts.length !== 4) return;
    if (!parts.every(p => parseInt(p, 10) >= 0 && parseInt(p, 10) <= 255)) return;
    set(`/-prefs/is/${osc}/0`, parts[0]);
    set(`/-prefs/is/${osc}/1`, parts[1]);
    set(`/-prefs/is/${osc}/2`, parts[2]);
    set(`/-prefs/is/${osc}/3`, parts[3]);
};


// Exported
export const networkWifiClient = ({ read, get, set }) => ({
    ssid: {
        name: 'SSID',
        type: 'string',
        maxLength: 32,
        has: (c) => { c(true); },
        read: () => read('/-prefs/is/ssid'),
        get: c => get('/-prefs/is/ssid', c),
        set: v => set('/-prefs/is/ssid', v),
    },
    securityType: {
        name: 'Security type',
        type: 'select',
        options: [
            { name: 'Open', value: 0 },
            { name: 'WEP', value: 1 },
            { name: 'WPA', value: 2 },
            { name: 'WPA2', value: 3 },
        ],
        has: (c) => { c(true); },
        read: () => read('/-prefs/is/security'),
        get: c => get('/-prefs/is/security', c),
        set: v => set('/-prefs/is/security', v),
    },
    key: {
        name: 'Key',
        type: 'password',
        minLength: values => (values['networkWifiClient-securityType'] === 1 ? 13 : 1),
        maxLength: values => (values['networkWifiClient-securityType'] === 1 ? 13 : 32),
        hideIf: values => values['networkWifiClient-securityType'] === 0,
        has: (c) => { c(true); },
        read: () => read('/-prefs/is/key'),
        get: c => get('/-prefs/is/key', c),
        set: v => set('/-prefs/is/key', v),
    },
    mode: {
        name: 'Mode',
        type: 'select',
        options: [
            { name: 'Static', value: 0 },
            { name: 'DHCP', value: 1 },
        ],
        has: (c) => { c(true); },
        read: () => read('/-prefs/is/mode'),
        get: c => get('/-prefs/is/mode', c),
        set: v => set('/-prefs/is/mode', v),
    },
    ip: {
        name: 'IP',
        type: 'string',
        isValid: isValidIP,
        minLength: 1,
        maxLength: 15,
        hideIf: values => values['networkWifiClient-mode'] !== 0,
        has: (c) => { c(true); },
        read: readIp(read, 'addr'),
        get: getIp(read, get, 'addr'),
        set: setIP(set, 'addr'),
    },
    mask: {
        name: 'Subnet mask',
        type: 'string',
        isValid: isValidIP,
        minLength: 1,
        maxLength: 15,
        hideIf: values => values['networkWifiClient-mode'] !== 0,
        has: (c) => { c(true); },
        read: readIp(read, 'mask'),
        get: getIp(read, get, 'mask'),
        set: setIP(set, 'mask'),
    },
    gateway: {
        name: 'Gateway',
        type: 'string',
        isValid: isValidIP,
        minLength: 1,
        maxLength: 15,
        hideIf: values => values['networkWifiClient-mode'] !== 0,
        has: (c) => { c(true); },
        read: readIp(read, 'gateway'),
        get: getIp(read, get, 'gateway'),
        set: setIP(set, 'gateway'),
    },
});
