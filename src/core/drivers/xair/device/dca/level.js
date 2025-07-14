// Requirements
import { xAirSubscriptionBuild } from '../../shared.js';
import {
    DB_MAXIMUM, DB_MINIMUM, dbToDecimal, decimalToDb,
} from '../bus/level.js';
import { dcaOsc } from './options.js';


// Constants
const preToValue = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
};


// Internal
const preValueGet = dcaId => v => v[preToValue[dcaId]];


const osc = dcaId => `${dcaOsc(dcaId)}/fader`;


const postLevelSubscription = (read, get, subscribe) => (dcaId, c) => {
    const unlistenGet = get(osc(dcaId), () => {}, decimalToDb);
    const unlistenSubscription = subscribe(xAirSubscriptionBuild({
        meterId: 8,
        shortIntegersToRead: 4,
    }), c, (v) => {
        const preValue = preValueGet(dcaId)(v);
        const levelValue = read(osc(dcaId)) || 0;
        return Math.min(preValue + levelValue, 0);
    });
    return () => {
        if (unlistenGet) unlistenGet();
        if (unlistenSubscription) unlistenSubscription();
    };
};


// Exported
export const level = ({
    read, get, set, subscribe,
}) => ({
    has: (dcaId, c) => { c(true); },
    read: dcaId => read(osc(dcaId)),
    get: (dcaId, c) => get(osc(dcaId), c, decimalToDb),
    set: (dcaId, v) => set(osc(dcaId), v, dbToDecimal),
    minimum: DB_MINIMUM,
    maximum: DB_MAXIMUM,
    pre: {
        has: (dcaId, c) => { c(true); },
        get: (dcaId, c) => subscribe(xAirSubscriptionBuild({
            meterId: 8,
            shortIntegersToRead: 4,
        }), c, preValueGet(dcaId)),
    },
    post: {
        has: (dcaId, c) => { c(true); },
        get: postLevelSubscription(read, get, subscribe),
    },
});
