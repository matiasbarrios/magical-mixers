// Requirements
import { binaryToBoolean, booleanToBinary, objectFlip } from '../../../../helpers/values.js';
import {
    busesChannels, busesSecondary, busIsOfType, busMain, busOsc,
} from '../bus/options.js';
import { fxOsc } from './options.js';


// Constants
const nullOption = { id: null, type: 'Unassigned', number: '' };

const options = [
    nullOption,
    ...busesChannels,
    ...busesSecondary,
    ...busMain,
];

const unassignedFX = 0;

const stereoAssignmentToFxId = {
    '1': 0,
    '2': 1,
    '3': 2,
    '4': 3,
};

const leftAssignmentToFxId = {
    '1': 0,
    '3': 1,
    '5': 2,
    '7': 3,
};

const rightAssignmentToFxId = {
    '2': 0,
    '4': 1,
    '6': 2,
    '8': 3,
};


// Internal
const busOscInsertAssignment = busId => `${busOsc(busId)}/insert/sel`;


const assignmentRead = (read, sideAssignmentToFxId) => (fxId) => {
    let res; // undefined
    let isThereAnUndefined = false;

    options.forEach((bus) => {
        if (bus.id === null) return;
        const current = read(busOscInsertAssignment(bus.id));
        if (current === undefined) isThereAnUndefined = true;

        if ((bus.type === 'main' && stereoAssignmentToFxId[current] === fxId)
            || (['channel', 'secondary'].includes(bus.type) && sideAssignmentToFxId[current] === fxId)) {
            res = bus.id;
        }
    });

    if (res === undefined && !isThereAnUndefined) return null;
    return res;
};


const assignmentGet = (read, get, sideAssignmentToFxId) => (fxId, c) => {
    const toUnlisten = [];

    const oneValueGotten = () => {
        const value = assignmentRead(read, sideAssignmentToFxId)(fxId);
        if (value !== undefined) c(value);
    };

    options.forEach((bus) => {
        if (bus.id === null) return;
        const unlisten = get(busOscInsertAssignment(bus.id), oneValueGotten);
        toUnlisten.push(unlisten);
    });

    return () => {
        toUnlisten.forEach(u => u());
    };
};


const assignmentSet = (read, get, set, sideAssignmentToFxId) => (fxId, newBusId) => {
    let alreadySet = false;
    let toUnlisten = null;

    const onGotten = (previousBusId) => {
        if (alreadySet) return;
        alreadySet = true;

        if (toUnlisten) toUnlisten();

        if (previousBusId !== null) {
            set(busOscInsertAssignment(previousBusId), unassignedFX);
        }

        let fxValue = (newBusId !== null && busIsOfType(newBusId, 'main'))
            ? objectFlip(stereoAssignmentToFxId)
            : objectFlip(sideAssignmentToFxId);
        fxValue = parseInt(fxValue[fxId] || unassignedFX, 10);
        if (newBusId !== null) {
            set(busOscInsertAssignment(newBusId), fxValue);
        }
    };

    toUnlisten = assignmentGet(read, get, sideAssignmentToFxId)(fxId, onGotten);
};


// Exported
export const insert = ({ read, get, set }) => ({
    has: (fxId, c) => { c(true); },
    on: {
        has: (fxId, c) => { c(true); },
        read: fxId => read(`${fxOsc(fxId)}insert`),
        get: (fxId, c) => get(`${fxOsc(fxId)}insert`, c, binaryToBoolean),
        set: (fxId, v) => set(`${fxOsc(fxId)}insert`, v, booleanToBinary),
    },
    left: {
        has: (fxId, c) => { c(true); },
        read: assignmentRead(read, leftAssignmentToFxId),
        get: assignmentGet(read, get, leftAssignmentToFxId),
        set: assignmentSet(read, get, set, leftAssignmentToFxId),
        // eslint-disable-next-line no-unused-vars
        options: fxId => options,
        // eslint-disable-next-line no-unused-vars
        defaultOption: fxId => nullOption,
    },
    right: {
        has: (fxId, c) => { c(true); },
        read: assignmentRead(read, rightAssignmentToFxId),
        get: assignmentGet(read, get, rightAssignmentToFxId),
        set: assignmentSet(read, get, set, rightAssignmentToFxId),
        // eslint-disable-next-line no-unused-vars
        options: fxId => options,
        // eslint-disable-next-line no-unused-vars
        defaultOption: fxId => nullOption,
    },
});

