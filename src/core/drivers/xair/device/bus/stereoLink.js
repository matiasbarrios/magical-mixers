// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { busGet, busIsOfType } from './options.js';


// Constants
const idToStereoLinkId = {
    '0': '1-2',
    '1': '1-2',
    '2': '3-4',
    '3': '3-4',
    '4': '5-6',
    '5': '5-6',
    '6': '7-8',
    '7': '7-8',
    '8': '9-10',
    '9': '9-10',
    '10': '11-12',
    '11': '11-12',
    '12': '13-14',
    '13': '13-14',
    '14': '15-16',
    '15': '15-16',
    '21': '1-2',
    '22': '1-2',
    '23': '3-4',
    '24': '3-4',
    '25': '5-6',
    '26': '5-6',
};


const typePrefix = {
    channel: 'ch',
    secondary: 'bus',
};


const side = busId => (busGet(busId).number % 2 === 1 ? 'L' : 'R');


const pair = busId => (busGet(busId).number % 2 === 1 ? busId + 1 : busId - 1);


const osc = (busId) => {
    const bus = busGet(busId);
    return `/config/${typePrefix[bus.type]}link/${idToStereoLinkId[busId]}`;
};


const stereoLinkHas = (busId, c) => { c(busIsOfType(busId, ...Object.keys(typePrefix))); };


const stereoLinkRead = read => busId => read(osc(busId));


const stereoLinkGet = get => (busId, c) => get(osc(busId), c, binaryToBoolean);


const stereoLinkSet = set => (busId, v) => set(osc(busId), v, booleanToBinary);


// Exported
export { stereoLinkRead, stereoLinkGet };


export const busIsStereoLinked = (read, busId) => !!read(osc(busId));


export const stereoLink = ({ read, get, set }) => ({
    has: stereoLinkHas,
    read: stereoLinkRead(read),
    get: stereoLinkGet(get),
    set: stereoLinkSet(set),
    side,
    pair,
});
