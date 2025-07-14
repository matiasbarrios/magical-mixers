// Exported
export const isInt = n => Number(n) === n && n % 1 === 0;


export const isFloat = n => Number(n) === n && n % 1 !== 0;


export const booleanToBinary = v => (v ? 1 : 0);


export const binaryToBoolean = v => !!v;


export const notBooleanToBinary = v => (v ? 0 : 1);


export const notBinaryToBoolean = v => !v;


export const pad = v => v.toString().padStart(2, '0');


export const objectFlip = o => Object.fromEntries(Object.entries(o).map(a => a.reverse()));


export const isValidIP = v => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(v) && v.split('.').every(n => n >= 0 && n <= 255);


export const isValidPort = port => (port >= 1 && port <= 65536);


export const decimalToHundredRange = v => Math.round((v * 200) - 100);


export const hundredRangeToDecimal = v => (v + 100) / 200;


export const dbAbsoluteMinimum = -128;
