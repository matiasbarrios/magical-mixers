// Requirements
import DOMPurify from 'isomorphic-dompurify';
import { fromBuffer, toBuffer } from '../../helpers/osc.js';
import { isFloat, isInt } from '../../helpers/values.js';


// Internal
const sanitize = v => DOMPurify.sanitize(v, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });


const getOSCType = (v) => {
    if (typeof v === 'string') return 'string';
    if (isFloat(v)) return 'float';
    if (isInt(v)) return 'integer';
    if (v === true) return 'true';
    if (v === false) return 'false';
    return 0;
};


const addType = args => args.map(value => ({
    type: getOSCType(value),
    value: typeof value === 'string' ? sanitize(value) : value,
}));


// Exported
export const oscMessageSend = (callback, address, ...args) => {
    const message = {
        address,
        args: args !== undefined ? addType(args) : undefined,
    };
    const buffer = toBuffer(message);
    if (!address.startsWith('/xremotenfb')
        && !address.startsWith('/meters')
        && !address.startsWith('/status')
        && !address.startsWith('/xinfo')) {
        if (address.includes('undefined')) {
            console.error('oscMessageSend', message.address, message.args || '');
        }
        // console.log('oscMessageSend', message.address, message.args || '');
    }
    callback(buffer);
};


export const oscMessageReceived = (buffer, callback) => {
    // Parse the buffer to an OSC command
    const parsedMessage = fromBuffer(buffer);
    const { address, args } = parsedMessage;

    // Return only the values
    const values = args.map((a) => {
        // Sanitize!
        if (a.type === 'string') return sanitize(a.value);
        return a.value;
    });

    // Call the listener
    callback({ address, values });

    if (!address.startsWith('/status')
        && !address.startsWith('/meters')
        && !address.startsWith('/xinfo')) {
        // console.log('oscMessageReceived', address, values);
    }
};
