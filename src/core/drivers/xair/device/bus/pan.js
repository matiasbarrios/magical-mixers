// Requirements
import { decimalToHundredRange, hundredRangeToDecimal } from '../../../../helpers/values.js';
import { ONE } from '../../shared.js';
import { busOsc, busIsOfType } from './options.js';


// Constants
const PAN_MINIMUM = -100;

const PAN_MAXIMUM = 100;


// Internal
const hundredRangeToDecimalXair = v => hundredRangeToDecimal(v) * ONE;


const osc = busId => `${busOsc(busId)}/mix/pan`;


const panHas = (busId, c) => { c(busIsOfType(busId, 'main')); };


const panRead = read => busId => read(osc(busId));


const panGet = get => (busId, c) => get(osc(busId), c, decimalToHundredRange);


const panSet = set => (busId, v) => set(osc(busId), v, hundredRangeToDecimalXair);


// Exported
export {
    panHas, panRead, panGet, panSet,
    PAN_MINIMUM as panMinimum,
    PAN_MAXIMUM as panMaximum,
};


export const pan = ({ read, get, set }) => ({
    has: panHas,
    read: panRead(read),
    get: panGet(get),
    set: panSet(set),
    minimum: PAN_MINIMUM,
    maximum: PAN_MAXIMUM,
    defaultValue: 0,
});
