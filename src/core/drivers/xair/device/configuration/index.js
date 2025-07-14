// Requirements
import { device } from './device.js';
import { networkAccessPoint } from './networkAccessPoint.js';
import { networkWifiClient } from './networkWifiClient.js';
import { networkLan } from './networkLan.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { reset } from './reset.js';


// Constants
const categories = [
    { id: 'device', name: 'Device' },
    { id: 'networkLan', name: 'Network: LAN mode' },
    { id: 'networkAccessPoint', name: 'Network: Access point mode' },
    { id: 'networkWifiClient', name: 'Network: Wifi client mode' },
    { id: 'audio', name: 'Audio' },
    { id: 'midi', name: 'Midi' },
];


// Exported
export const configuration = ({ read, get, set }) => {
    const res = {
        device: device({ read, get, set }),
        networkAccessPoint: networkAccessPoint({ read, get, set }),
        networkWifiClient: networkWifiClient({ read, get, set }),
        networkLan: networkLan({ read, get, set }),
        audio: audio({ read, get, set }),
        midi: midi({ read, get, set }),
    };

    const options = categories.map(c => Object.keys(res[c.id]).map(categoryOptionId => ({
        optionId: `${c.id}-${categoryOptionId}`,
        categoryId: c.id,
        categoryOptionId,
    }))).flat();

    return {
        ...res,
        has: (c) => { c(true); },
        categories,
        options,
        reset: reset(res),
    };
};
