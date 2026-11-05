// Internal
// One representative per channel count. Brand and X/XR share these tables.
const modelForChannels = {
    '18': 'X18',
    '16': 'XR16',
    '12': 'XR12',
};


const modelForChannelsV2 = {
    '18': 'X18V2',
    '16': 'XR16V2',
    '12': 'XR12V2',
};


// A reported name ending in V2 or W is hardware v2. Known names are returned first.
const reportedModelIsV2 = model => model.endsWith('V2') || model.endsWith('W');


// Exported
export const models18 = ['X18', 'XR18', 'MR18', 'X18V2', 'XR18V2', 'MR18V2'];


export const models16 = ['XR16', 'XR16V2'];


export const models12 = ['XR12', 'MR12', 'XR12V2', 'MR12V2'];


export const modelsSupported = [...models18, ...models16, ...models12];


export const modelChannels = (model) => {
    if (typeof model !== 'string') return null;
    if (model.includes('18')) return 18;
    if (model.includes('16')) return 16;
    if (model.includes('12')) return 12;
    return null;
};


// Known names stay as reported. Anything else with a channel count maps to that family.
export const modelResolve = (model) => {
    if (typeof model !== 'string') return null;
    if (modelsSupported.includes(model)) return model;
    const channels = modelChannels(model);
    if (!channels) return null;
    const table = reportedModelIsV2(model) ? modelForChannelsV2 : modelForChannels;
    return table[channels];
};


export const modelIsSupported = model => modelResolve(model) !== null;


export const modelBrand = model => (model.startsWith('X') ? 'Behringer' : 'Midas');


export const modelIs18 = model => models18.includes(model);


export const modelIs16 = model => models16.includes(model);


export const modelIs12 = model => models12.includes(model);
