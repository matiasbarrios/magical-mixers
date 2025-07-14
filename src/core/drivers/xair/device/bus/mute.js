// Requirements
import {
    binaryToBoolean, booleanToBinary, notBinaryToBoolean, notBooleanToBinary,
} from '../../../../helpers/values.js';
import { busOsc, busGet, busIsOfType } from './options.js';


// Internal
const osc = (busId) => {
    const bus = busGet(busId);
    if (bus.type === 'monitor') return `${busOsc(busId)}/mute`;
    return `${busOsc(busId)}/mix/on`;
};

const getTranslate = busId => (busIsOfType(busId, 'monitor') ? binaryToBoolean : notBinaryToBoolean);

const setTranslate = busId => (busIsOfType(busId, 'monitor') ? booleanToBinary : notBooleanToBinary);

const muteHas = (busId, c) => { c(true); };

const muteRead = read => busId => read(osc(busId));

const muteGet = (read, get) => (busId, c) => {
    const onGotten = () => { c(read(osc(busId))); };
    return get(osc(busId), onGotten, getTranslate(busId));
};

const muteSet = set => (busId, v) => set(osc(busId), v, setTranslate(busId));


// Exported
export { muteHas, muteGet };


export const mute = ({ read, get, set }) => ({
    has: muteHas,
    read: muteRead(read),
    get: muteGet(read, get),
    set: muteSet(set),
});
