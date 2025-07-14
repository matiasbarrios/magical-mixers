// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { inputIsPreamp, inputOsc } from './options.js';


// Exported
export const phantom = ({ read, get, set }) => ({
    has: (inputId, c) => { c(inputIsPreamp(inputId)); },
    read: inputId => read(`${inputOsc(inputId)}phantom`),
    get: (inputId, c) => get(`${inputOsc(inputId)}phantom`, c, binaryToBoolean),
    set: (inputId, v) => set(`${inputOsc(inputId)}phantom`, v, booleanToBinary),
});
