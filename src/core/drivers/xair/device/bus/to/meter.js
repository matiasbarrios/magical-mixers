// Requirements
import { inputPostSubscription } from '../../input/gain.js';
import { preEqualizerSubscription } from '../equalizer.js';
import { busInputIdGet, busInputIdHas } from '../input.js';
import { postLevelSubscription, preLevelSubscription } from '../level.js';
import { busGet } from '../options.js';
import { panAndLevelApply } from '../../../../../helpers/panLevel.js';
import {
    monitorChannelLineEffectTapGet, monitorChannelLineEffectTapIsPostLevel,
    monitorSecondaryTapGet, monitorSecondaryTapIsPostLevel,
} from '../monitor.js';
import { muteGet, muteHas } from '../mute.js';
import { dbAbsoluteMinimum } from '../../../../../helpers/values.js';
import {
    toPanGet, toPanHas, toPanMaximum, toPanMinimum,
} from './pan.js';
import {
    toTapIsInput, toTapIsPostEqualizer, toTapIsPostLevel,
    toTapIsPreEqualizer, toTapIsPreLevel, toTapIsSameLevel,
    toTapGet,
} from './tap.js';
import { toLevelGet, toLevelHas } from './level.js';


// Internal
const meterHas = (busIdFrom, busIdTo, callback) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    let unlistener;

    if (from.type === 'main') {
        if (to.type === 'main') callback(false);
        if (to.type === 'monitor') callback(true);
        if (to.type === 'secondary') callback(false);
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'monitor') {
        if (to.type === 'main') callback(false);
        if (to.type === 'monitor') callback(false);
        if (to.type === 'secondary') callback(false);
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') callback(true);
        if (to.type === 'secondary') callback(false);
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'effect') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') callback(true);
        if (to.type === 'secondary') callback(true);
        if (to.type === 'effect') callback(true);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'line') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') callback(true);
        if (to.type === 'secondary') callback(true);
        if (to.type === 'effect') callback(true);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'channel') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') callback(true);
        if (to.type === 'secondary') callback(true);
        if (to.type === 'effect') callback(true);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }

    return unlistener;
};


const meterGet = (model, read, get, subscribe) => (busIdFrom, busIdTo, callback) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    let toPanHasValue = false;
    let toLevelHasValue = false;
    let fromMuteHasValue = false;

    let toPanUnlistener;
    let toLevelUnlistener;
    let fromMuteUnlistener;

    let toPan = 0;
    let toLevel = 0;
    let fromMute = false;

    const toPanHasUnlistener = toPanHas(read, get)(busIdFrom, busIdTo, (has) => {
        if (toPanHasValue === has) return;
        toPanHasValue = has;
        toPan = 0;
        if (toPanUnlistener) toPanUnlistener();
        toPanUnlistener = toPanGet(read, get)(busIdFrom, busIdTo, (v) => { toPan = v; });
    });

    const toLevelHasUnlistener = toLevelHas(read, get)(busIdFrom, busIdTo, (has) => {
        if (toLevelHasValue === has) return;
        toLevelHasValue = has;
        toLevel = 0;
        if (toLevelUnlistener) toLevelUnlistener();
        toLevelUnlistener = toLevelGet(read, get)(busIdFrom, busIdTo, (v) => { toLevel = v; });
    });

    const fromMuteHasUnlistener = muteHas(busIdFrom, (has) => {
        if (fromMuteHasValue === has) return;
        fromMuteHasValue = has;
        fromMute = false;
        if (fromMuteUnlistener) fromMuteUnlistener();
        fromMuteUnlistener = muteGet(read, get)(busIdFrom, (v) => { fromMute = v; });
    });

    const inputPost = inputPostSubscription(subscribe);
    const preEqualizer = preEqualizerSubscription(model, read, get, subscribe);
    const preLevel = preLevelSubscription(subscribe);
    const postLevel = postLevelSubscription(read, get, subscribe);

    let getUnlistener;
    let subscriptionUnlistener;
    let currentSubscription;

    const setCurrent = (subscriptionId, supscriptionCaller, ...subscriptionParams) => {
        if (currentSubscription === subscriptionId) return;
        currentSubscription = subscriptionId;
        if (subscriptionUnlistener) subscriptionUnlistener();
        subscriptionUnlistener = supscriptionCaller(...subscriptionParams);
    };

    const muteApply = c => (v) => {
        if (!fromMute) c(v);
        else c(Array.isArray(v) ? v.map(() => dbAbsoluteMinimum) : dbAbsoluteMinimum);
    };

    const doToPanLevelApply = panAndLevelApply(toPanMinimum, toPanMaximum);

    const toPanLevelApply = (v) => { muteApply(callback)(doToPanLevelApply(toPan, toLevel, v)); };

    let inputIdHasValue = false;
    const inputIdHas = busInputIdHas(model);
    const inputIdGet = busInputIdGet(model, read, get);
    let inputIdHasUnistener;
    let inputIdGetUnistener;

    const setInput = () => {
        inputIdHasUnistener = inputIdHas(busIdFrom, (has) => {
            if (inputIdHasValue === has) return;
            inputIdHasValue = has;
            if (inputIdGetUnistener) inputIdGetUnistener();
            if (!has) return;
            inputIdGetUnistener = inputIdGet(busIdFrom, (inputId) => {
                if (inputId === undefined) return;
                setCurrent(`input-${inputId}`, inputPost, inputId, toPanLevelApply);
            });
        });
    };

    if ((from.type === 'main' && to.type === 'monitor') || to.type === 'main') {
        setCurrent('postLevel', postLevel, busIdFrom, toPanLevelApply);
    } else if (from.type !== 'monitor') {
        if (to.type === 'monitor') {
            if (from.type === 'secondary') {
                getUnlistener = monitorSecondaryTapGet(get)(busIdTo, () => {
                    if (monitorSecondaryTapIsPostLevel(read, busIdTo)) {
                        setCurrent('postLevel', postLevel, busIdFrom, toPanLevelApply);
                    } else {
                        setCurrent('preLevel', preLevel, busIdFrom, toPanLevelApply);
                    }
                });
            } else if (['effect', 'line', 'channel'].includes(from.type)) {
                getUnlistener = monitorChannelLineEffectTapGet(get)(busIdTo, () => {
                    if (monitorChannelLineEffectTapIsPostLevel(read, busIdTo)) {
                        setCurrent('postLevel', postLevel, busIdFrom, toPanLevelApply);
                    } else {
                        setCurrent('preLevel', preLevel, busIdFrom, toPanLevelApply);
                    }
                });
            }
        } else {
            getUnlistener = toTapGet(read, get)(busIdFrom, busIdTo, () => {
                if (toTapIsSameLevel(read, busIdFrom, busIdTo)) {
                    setCurrent('sameLevel', postLevel, busIdFrom, muteApply(callback));
                } else if (toTapIsPostLevel(read, busIdFrom, busIdTo)) {
                    setCurrent('postLevel', postLevel, busIdFrom, toPanLevelApply);
                } else if (toTapIsPreLevel(read, busIdFrom, busIdTo)) {
                    setCurrent('preLevel', preLevel, busIdFrom, toPanLevelApply);
                } else if (toTapIsInput(read, busIdFrom, busIdTo)) {
                    setInput();
                } else if (toTapIsPreEqualizer(read, busIdFrom, busIdTo)) {
                    if (from.type === 'channel') {
                        setCurrent('preEqualizer', preEqualizer, busIdFrom, toPanLevelApply);
                    } else if (from.type === 'line' || from.type === 'effect') {
                        setInput();
                    }
                } else if (toTapIsPostEqualizer(read, busIdFrom, busIdTo)) {
                    if (from.type === 'channel') {
                        // THIS IS NOT CORRECT, but is the best approximation
                        setCurrent('preLevel', preLevel, busIdFrom, toPanLevelApply);
                    } else if (from.type === 'line' || from.type === 'effect') {
                        setCurrent('preLevel', preLevel, busIdFrom, toPanLevelApply);
                    }
                }
            });
        }
    }
    return () => {
        if (toPanHasUnlistener) toPanHasUnlistener();
        if (toPanUnlistener) toPanUnlistener();
        if (toLevelHasUnlistener) toLevelHasUnlistener();
        if (toLevelUnlistener) toLevelUnlistener();
        if (fromMuteHasUnlistener) fromMuteHasUnlistener();
        if (fromMuteUnlistener) fromMuteUnlistener();
        if (getUnlistener) getUnlistener();
        if (subscriptionUnlistener) subscriptionUnlistener();
        if (inputIdHasUnistener) inputIdHasUnistener();
        if (inputIdGetUnistener) inputIdGetUnistener();
    };
};


// Exported
export const meter = ({
    read, get, subscribe, model,
}) => ({
    has: meterHas,
    get: meterGet(model, read, get, subscribe),
});
