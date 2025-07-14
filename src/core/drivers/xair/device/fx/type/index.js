// Requirements
import { fxOsc } from '../options.js';
import type0 from './type0.js';
import type1 from './type1.js';
import type2 from './type2.js';
import type3 from './type3.js';
import type4 from './type4.js';
import type5 from './type5.js';
import type6 from './type6.js';
import type7 from './type7.js';
import type8 from './type8.js';
import type9 from './type9.js';
import type10 from './type10.js';
import type11 from './type11.js';
import type12 from './type12.js';
import type13 from './type13.js';
import type14 from './type14.js';
import type15 from './type15.js';
import type16 from './type16.js';
import type17 from './type17.js';
import type18 from './type18.js';
import type19 from './type19.js';
import type20 from './type20.js';
import type21 from './type21.js';
import type22 from './type22.js';
import type23 from './type23.js';
import type24 from './type24.js';
import type25 from './type25.js';
import type26 from './type26.js';
import type27 from './type27.js';
import type28 from './type28.js';
import type29 from './type29.js';
import type30 from './type30.js';
import type31 from './type31.js';
import type32 from './type32.js';
import type33 from './type33.js';
import type34 from './type34.js';
import type35 from './type35.js';
import type36 from './type36.js';
import type37 from './type37.js';
import type38 from './type38.js';
import type39 from './type39.js';
import type40 from './type40.js';
import type41 from './type41.js';
import type42 from './type42.js';
import type43 from './type43.js';
import type44 from './type44.js';
import type45 from './type45.js';
import type46 from './type46.js';
import type47 from './type47.js';
import type48 from './type48.js';
import type49 from './type49.js';
import type50 from './type50.js';
import type51 from './type51.js';
import type52 from './type52.js';
import type53 from './type53.js';
import type54 from './type54.js';
import type55 from './type55.js';
import type56 from './type56.js';
import type57 from './type57.js';
import type58 from './type58.js';
import type59 from './type59.js';
import type60 from './type60.js';


// Constants
const defaultTypeIdPerFxId = {
    '0': 7,
    '1': 0,
    '2': 26,
    '3': 38,
};


// Internal
const options = [
    type0,
    type1,
    type2,
    type3,
    type4,
    type5,
    type6,
    type7,
    type8,
    type9,
    type10,
    type11,
    type12,
    type13,
    type14,
    type15,
    type16,
    type17,
    type18,
    type19,
    type20,
    type21,
    type22,
    type23,
    type24,
    type25,
    type26,
    type27,
    type28,
    type29,
    type30,
    type31,
    type32,
    type33,
    type34,
    type35,
    type36,
    type37,
    type38,
    type39,
    type40,
    type41,
    type42,
    type43,
    type44,
    type45,
    type46,
    type47,
    type48,
    type49,
    type50,
    type51,
    type52,
    type53,
    type54,
    type55,
    type56,
    type57,
    type58,
    type59,
    type60,
];


const optionsWithoutParameters = options.map(o => ({
    id: o.id,
    category: o.category,
    name: o.name,
}));


// Exported
export const types = options;


export const type = ({ read, get, set }) => ({
    has: (fxId, c) => { c(true); },
    read: fxId => read(`${fxOsc(fxId)}type`),
    get: (fxId, c) => get(`${fxOsc(fxId)}type`, c),
    set: (fxId, v) => set(`${fxOsc(fxId)}type`, v),
    // eslint-disable-next-line no-unused-vars
    options: fxId => optionsWithoutParameters,
    defaultOption: fxId => options.find(o => o.id === defaultTypeIdPerFxId[fxId]),
});
