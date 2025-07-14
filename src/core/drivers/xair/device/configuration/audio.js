// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';


// Exported
export const audio = ({ read, get, set }) => ({
    clockRate: {
        name: 'Clock rate',
        type: 'select',
        options: [
            { name: '48 kHz', value: 0 },
            { name: '44.1 kHz', value: 1 },
        ],
        has: (c) => { c(true); },
        read: () => read('/-prefs/clockrate'),
        get: c => get('/-prefs/clockrate', c),
        set: v => set('/-prefs/clockrate', v),
    },
    safeLevel: {
        name: 'Mute buses at power cycle',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => read('/-prefs/ponmute'),
        get: c => get('/-prefs/ponmute', c, binaryToBoolean),
        set: v => set('/-prefs/ponmute', v, booleanToBinary),
    },
    linkPreamps: {
        name: 'Link preamps',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => read('/config/linkcfg/preamp'),
        get: c => get('/config/linkcfg/preamp', c, binaryToBoolean),
        set: v => set('/config/linkcfg/preamp', v, booleanToBinary),
    },
    linkEqualizers: {
        name: 'Link equalizers',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => read('/config/linkcfg/eq'),
        get: c => get('/config/linkcfg/eq', c, binaryToBoolean),
        set: v => set('/config/linkcfg/eq', v, booleanToBinary),
    },
    linkDynamics: {
        name: 'Link dynamics (gate, compressor)',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => read('/config/linkcfg/dyn'),
        get: c => get('/config/linkcfg/dyn', c, binaryToBoolean),
        set: v => set('/config/linkcfg/dyn', v, booleanToBinary),
    },
    linkLevelsMute: {
        name: 'Link levels and muting',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => read('/config/linkcfg/fdrmute'),
        get: c => get('/config/linkcfg/fdrmute', c, binaryToBoolean),
        set: v => set('/config/linkcfg/fdrmute', v, booleanToBinary),
    },
    hardMutes: {
        name: 'Buses muted will remain muted even if unmuted through a group',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => read('/-prefs/hardmute'),
        get: c => get('/-prefs/hardmute', c, binaryToBoolean),
        set: v => set('/-prefs/hardmute', v, booleanToBinary),
    },
    dcaGroups: {
        name: 'Muting DCA group mutes buses assigned to them',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => read('/-prefs/dcamute'),
        get: c => get('/-prefs/dcamute', c, binaryToBoolean),
        set: v => set('/-prefs/dcamute', v, booleanToBinary),
    },
    usbInterface: {
        name: 'USB interface mode',
        type: 'select',
        options: [
            { name: '18 input / 18 output', value: 0 },
            { name: '2 input / 2 output', value: 1 },
        ],
        has: (c) => { c(true); },
        read: () => read('/-prefs/usbifcmode'),
        get: c => get('/-prefs/usbifcmode', c),
        set: v => set('/-prefs/usbifcmode', v),
    },
});
