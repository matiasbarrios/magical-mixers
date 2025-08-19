// Exported
export const models18 = ['X18', 'XR18', 'MR18', 'X18V2', 'XR18V2', 'MR18V2'];


export const models16 = ['XR16', 'XR16V2'];


export const models12 = ['XR12', 'MR12', 'XR12V2', 'MR12V2'];


export const modelsSupported = [...models18, ...models16, ...models12];


export const modelIsSupported = model => modelsSupported.includes(model);


export const modelBrand = model => (model.startsWith('X') ? 'Behringer' : 'Midas');


export const modelIs18 = model => models18.includes(model);


export const modelIs16 = model => models16.includes(model);


export const modelIs12 = model => models12.includes(model);
