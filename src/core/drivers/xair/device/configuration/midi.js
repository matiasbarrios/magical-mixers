// Constants
const osc = '/-prefs/midiconfig';

// Internal
const binaryRead = bitToRead => v => (Number
    .isInteger(v) ? v.toString(2).padStart(7, '0').charAt(bitToRead) === '1' : false);


const binarySet = (read, bitToChange) => (value) => {
    const current = read(osc);
    let res = '0000000'.split('');
    if (Number.isInteger(current)) {
        res = current.toString(2).padStart(7, '0').split('');
    }
    res[bitToChange] = value ? '1' : '0';
    return parseInt(res.join(''), 2);
};


// Exported
export const midi = ({ read, get, set }) => ({
    dinRx: {
        name: 'DIN Rx',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => binaryRead(6)(read(osc)),
        get: c => get(osc, v => c(binaryRead(6)(v))),
        set: v => set(osc, v, binarySet(read, 6)),
    },
    dinTx: {
        name: 'DIN Tx',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => binaryRead(5)(read(osc)),
        get: c => get(osc, v => c(binaryRead(5)(v))),
        set: v => set(osc, v, binarySet(read, 5)),
    },
    dinXOsc: {
        name: 'DIN X Osc',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => binaryRead(4)(read(osc)),
        get: c => get(osc, v => c(binaryRead(4)(v))),
        set: v => set(osc, v, binarySet(read, 4)),
    },
    usbRx: {
        name: 'USB Rx',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => binaryRead(3)(read(osc)),
        get: c => get(osc, v => c(binaryRead(3)(v))),
        set: v => set(osc, v, binarySet(read, 3)),
    },
    usbTx: {
        name: 'USB Tx',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => binaryRead(2)(read(osc)),
        get: c => get(osc, v => c(binaryRead(2)(v))),
        set: v => set(osc, v, binarySet(read, 2)),
    },
    usbOsc: {
        name: 'USB Osc',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => binaryRead(1)(read(osc)),
        get: c => get(osc, v => c(binaryRead(1)(v))),
        set: v => set(osc, v, binarySet(read, 1)),
    },
    usbPassThrough: {
        name: 'USB pass through',
        type: 'boolean',
        has: (c) => { c(true); },
        read: () => binaryRead(0)(read(osc)),
        get: c => get(osc, v => c(binaryRead(0)(v))),
        set: v => set(osc, v, binarySet(read, 0)),
    },
});
