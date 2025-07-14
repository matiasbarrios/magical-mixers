// Requirements
import { Buffer } from 'buffer';


// Constants
const UNIX_EPOCH = 2208988800;

const TWO_POW_32 = 4294967296;


// Internal
const padding = (str) => {
    const bufflength = Buffer.byteLength(str);
    return 4 - (bufflength % 4);
};


const packInt32 = (value, endian = 'big') => {
    const buffer = Buffer.alloc(4);
    if (endian === 'big') {
        buffer.writeInt32BE(value, 0);
    } else {
        buffer.writeInt32LE(value, 0);
    }
    return buffer;
};


const packUInt32 = (value, endian = 'big') => {
    const buffer = Buffer.alloc(4);
    if (endian === 'big') {
        buffer.writeUInt32BE(value, 0);
    } else {
        buffer.writeUInt32LE(value, 0);
    }
    return buffer;
};


const packFloat32 = (value, endian = 'big') => {
    const buffer = Buffer.alloc(4);
    if (endian === 'big') {
        buffer.writeFloatBE(value, 0);
    } else {
        buffer.writeFloatLE(value, 0);
    }
    return buffer;
};


const packFloat64 = (value, endian = 'big') => {
    const buffer = Buffer.alloc(8);
    if (endian === 'big') {
        buffer.writeDoubleBE(value, 0);
    } else {
        buffer.writeDoubleLE(value, 0);
    }
    return buffer;
};


const unpackInt32 = (buffer, endian = 'big') => {
    if (endian === 'big') {
        return buffer.readInt32BE(0);
    }
    return buffer.readInt32LE(0);
};


const unpackUInt32 = (buffer, endian = 'big') => {
    if (endian === 'big') {
        return buffer.readUInt32BE(0);
    }
    return buffer.readUInt32LE(0);
};


const unpackFloat32 = (buffer, endian = 'big') => {
    if (endian === 'big') {
        return buffer.readFloatBE(0);
    }
    return buffer.readFloatLE(0);
};


const unpackFloat64 = (buffer, endian = 'big') => {
    if (endian === 'big') {
        return buffer.readDoubleBE(0);
    }
    return buffer.readDoubleLE(0);
};


const concatBuffers = (buffers) => {
    if (!Array.isArray(buffers)) {
        throw new Error('concat must take an array of buffers');
    }

    // Validate all items are buffers
    for (let i = 0; i < buffers.length; i += 1) {
        if (!Buffer.isBuffer(buffers[i])) {
            throw new Error('concat must take an array of buffers');
        }
    }

    // Calculate total length
    const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);

    // Create destination buffer and copy all buffers
    const destBuffer = Buffer.alloc(totalLength);
    let copyOffset = 0;

    for (let i = 0; i < buffers.length; i += 1) {
        const buffer = buffers[i];
        buffer.copy(destBuffer, copyOffset);
        copyOffset += buffer.length;
    }

    return destBuffer;
};


const normalizeBuffer = (buffer) => {
    if (Buffer.isBuffer(buffer)) {
        return buffer;
    }

    if (buffer instanceof ArrayBuffer) {
        return Buffer.from(buffer);
    }

    if (buffer instanceof Uint8Array) {
        return Buffer.from(buffer);
    }

    if (buffer && typeof buffer === 'object' && buffer.length !== undefined && buffer.constructor === Array) {
        return Buffer.from(buffer);
    }

    throw new Error('Invalid buffer type - expected Buffer, Uint8Array, ArrayBuffer, or Array');
};


const toOscString = (str, strict) => {
    if (typeof str !== 'string') {
        throw new Error("can't pack a non-string into an osc-string");
    }

    const nullIndex = str.indexOf('\u0000');
    if (nullIndex !== -1 && strict) {
        throw Error("Can't pack an osc-string that contains NULL characters");
    }

    let processedStr = str;
    if (nullIndex !== -1) {
        processedStr = str.slice(0, nullIndex);
    }

    const paddingCount = padding(processedStr);
    for (let i = 0; i < paddingCount; i += 1) {
        processedStr += '\u0000';
    }

    return Buffer.from(processedStr, 'utf8');
};


const splitOscString = (buffer, strict) => {
    const actualBuffer = normalizeBuffer(buffer);

    const rawStr = actualBuffer.toString('utf8');
    const nullIndex = rawStr.indexOf('\u0000');

    if (nullIndex === -1) {
        if (strict) {
            throw new Error('All osc-strings must contain a null character');
        }
        return {
            string: rawStr,
            rest: Buffer.alloc(0),
        };
    }

    const str = rawStr.slice(0, nullIndex);
    const splitPoint = Buffer.byteLength(str) + padding(str);

    if (strict && splitPoint > actualBuffer.length) {
        throw Error('Not enough padding for osc-string');
    }

    if (strict) {
        const strByteLength = Buffer.byteLength(str);
        for (let i = strByteLength; i < splitPoint; i += 1) {
            if (actualBuffer[i] !== 0) {
                throw Error('Not enough or incorrect padding for osc-string');
            }
        }
    }

    const rest = actualBuffer.slice(splitPoint);
    return {
        string: str,
        rest,
    };
};


const toIntegerBuffer = (number, type = 'Int32') => {
    if (typeof number !== 'number') {
        throw new Error('cannot pack a non-number into an integer buffer');
    }

    if (type === 'Int32') {
        return packInt32(number, 'big');
    }
    return packUInt32(number, 'big');
};


const splitInteger = (buffer, type = 'Int32') => {
    const bytes = type === 'Int32' ? 4 : 4; // Both Int32 and UInt32 are 4 bytes

    if (buffer.length < bytes) {
        throw new Error('buffer is not big enough for integer type');
    }

    let value;
    if (type === 'Int32') {
        value = unpackInt32(buffer.slice(0, bytes), 'big');
    } else {
        value = unpackUInt32(buffer.slice(0, bytes), 'big');
    }

    const rest = buffer.slice(bytes);
    return {
        integer: value,
        rest,
    };
};


const splitTimetag = (buffer) => {
    const bytes = 4; // UInt32 size

    if (buffer.length < bytes * 2) {
        throw new Error('buffer is not big enough to contain a timetag');
    }

    const seconds = unpackUInt32(buffer.slice(0, bytes), 'big');
    const fractional = unpackUInt32(buffer.slice(bytes, bytes * 2), 'big');
    const rest = buffer.slice(bytes * 2);

    return {
        timetag: [seconds, fractional],
        rest,
    };
};


const makeTimetag = (unixseconds, fracSeconds) => {
    const ntpSecs = unixseconds + UNIX_EPOCH;
    const ntpFracs = Math.round(TWO_POW_32 * fracSeconds);
    return [ntpSecs, ntpFracs];
};


const timestampToTimetag = (secs) => {
    const wholeSecs = Math.floor(secs);
    const fracSeconds = secs - wholeSecs;
    return makeTimetag(wholeSecs, fracSeconds);
};


const dateToTimetag = date => timestampToTimetag(date.getTime() / 1000);


const toTimetagBuffer = (timetag) => {
    let processedTimetag = timetag;

    if (typeof timetag === 'number') {
        processedTimetag = timestampToTimetag(timetag);
    } else if (typeof timetag === 'object' && 'getTime' in timetag) {
        processedTimetag = dateToTimetag(timetag);
    } else if (timetag.length !== 2) {
        throw new Error(`Invalid timetag${timetag}`);
    }

    const high = packUInt32(processedTimetag[0], 'big');
    const low = packUInt32(processedTimetag[1], 'big');

    return concatBuffers([high, low]);
};


const oscUtils = {
    oscTypeCodes: {
        s: {
            representation: 'string',
            split: (buffer, strict) => {
                const split = splitOscString(buffer, strict);
                return {
                    value: split.string,
                    rest: split.rest,
                };
            },
            toArg: (value) => {
                if (typeof value !== 'string') {
                    throw new Error('expected string');
                }
                return toOscString(value);
            },
        },
        i: {
            representation: 'integer',
            split: (buffer) => {
                const split = splitInteger(buffer);
                return {
                    value: split.integer,
                    rest: split.rest,
                };
            },
            toArg: (value) => {
                if (typeof value !== 'number') {
                    throw new Error('expected number');
                }
                return toIntegerBuffer(value);
            },
        },
        t: {
            representation: 'timetag',
            split: (buffer) => {
                const split = splitTimetag(buffer);
                return {
                    value: split.timetag,
                    rest: split.rest,
                };
            },
            toArg: value => toTimetagBuffer(value),
        },
        f: {
            representation: 'float',
            split: buffer => ({
                value: unpackFloat32(buffer.slice(0, 4), 'big'),
                rest: buffer.slice(4),
            }),
            toArg: (value) => {
                if (typeof value !== 'number') {
                    throw new Error('expected number');
                }
                return packFloat32(value, 'big');
            },
        },
        d: {
            representation: 'double',
            split: buffer => ({
                value: unpackFloat64(buffer.slice(0, 8), 'big'),
                rest: buffer.slice(8),
            }),
            toArg: (value) => {
                if (typeof value !== 'number') {
                    throw new Error('expected number');
                }
                return packFloat64(value, 'big');
            },
        },
        b: {
            representation: 'blob',
            split: (buffer) => {
                const { integer: length, rest: remainingBuffer } = splitInteger(buffer);
                return {
                    value: remainingBuffer.slice(0, length),
                    rest: remainingBuffer.slice(length),
                };
            },
            toArg: (value) => {
                if (!Buffer.isBuffer(value)) {
                    throw new Error('expected node.js Buffer');
                }
                const size = toIntegerBuffer(value.length);
                return concatBuffers([size, value]);
            },
        },
        T: {
            representation: 'true',
            split: buffer => ({
                rest: buffer,
                value: true,
            }),
            toArg: (value, strict) => {
                if (!value && strict) {
                    throw new Error('true must be true');
                }
                return Buffer.alloc(0);
            },
        },
        F: {
            representation: 'false',
            split: buffer => ({
                rest: buffer,
                value: false,
            }),
            toArg: (value, strict) => {
                if (value && strict) {
                    throw new Error('false must be false');
                }
                return Buffer.alloc(0);
            },
        },
        N: {
            representation: 'null',
            split: buffer => ({
                rest: buffer,
                value: null,
            }),
            toArg: (value, strict) => {
                if (value && strict) {
                    throw new Error('null must be false');
                }
                return Buffer.alloc(0);
            },
        },
        I: {
            representation: 'bang',
            split: buffer => ({
                rest: buffer,
                value: 'bang',
            }),
            toArg: () => Buffer.alloc(0),
        },
    },


    oscTypeCodeToTypeString: code => oscUtils.oscTypeCodes[code]?.representation,


    typeStringToOscTypeCode: (rep) => {
        const entries = Object.entries(oscUtils.oscTypeCodes);
        for (let i = 0; i < entries.length; i += 1) {
            const [code, typeInfo] = entries[i];
            if (typeInfo.representation === rep) {
                return code;
            }
        }
        return null;
    },


    splitOscArgument: (buffer, type, strict) => {
        const osctype = oscUtils.typeStringToOscTypeCode(type);
        if (osctype) {
            return oscUtils.oscTypeCodes[osctype].split(buffer, strict);
        }
        throw new Error(`I don't understand how I'm supposed to unpack ${type}`);
    },

    toOscArgument: (value, type, strict) => {
        const osctype = oscUtils.typeStringToOscTypeCode(type);
        if (osctype) {
            return oscUtils.oscTypeCodes[osctype].toArg(value, strict);
        }
        throw new Error(`I don't know how to pack ${type}`);
    },


    isOscBundleBuffer: (buffer, strict) => {
        const { string } = splitOscString(buffer, strict);
        return string === '#bundle';
    },


    mapBundleList: (buffer, func) => {
        const elems = [];
        let currentBuffer = buffer;

        while (currentBuffer.length) {
            const { integer: size, rest: afterSize } = splitInteger(currentBuffer);

            if (size > afterSize.length) {
                throw new Error('Invalid bundle list: size of element is bigger than buffer');
            }

            const thisElemBuffer = afterSize.slice(0, size);
            currentBuffer = afterSize.slice(size);

            try {
                elems.push(func(thisElemBuffer));
            } catch {
                elems.push(null);
            }
        }

        return elems.filter(elem => elem !== null);
    },


    getArrayArg: (arg) => {
        if (Array.isArray(arg)) {
            return arg;
        }
        if (arg?.type === 'array' && Array.isArray(arg?.value)) {
            return arg.value;
        }
        if (arg && !arg.type && Array.isArray(arg.value)) {
            return arg.value;
        }
        return null;
    },


    argToTypeCode: (arg, strict) => {
        if (arg?.type && typeof arg.type === 'string') {
            const code = oscUtils.typeStringToOscTypeCode(arg.type);
            if (code) {
                return code;
            }
        }

        const value = arg?.value !== undefined ? arg.value : arg;

        if (strict && value == null) {
            throw new Error('Argument has no value');
        }

        if (typeof value === 'string') {
            return 's';
        }
        if (typeof value === 'number') {
            return 'f';
        }
        if (Buffer.isBuffer(value)) {
            return 'b';
        }
        if (typeof value === 'boolean') {
            return value ? 'T' : 'F';
        }
        if (value === null) {
            return 'N';
        }

        throw new Error("I don't know what type this is supposed to be.");
    },


    toOscTypeAndArgs: (argList, strict) => {
        let osctype = '';
        let oscargs = [];

        for (let i = 0; i < argList.length; i += 1) {
            const arg = argList[i];
            const arrayArg = oscUtils.getArrayArg(arg);

            if (arrayArg) {
                const [thisType, thisArgs] = oscUtils.toOscTypeAndArgs(arrayArg, strict);
                osctype += `[${thisType}]`;
                oscargs = oscargs.concat(thisArgs);
            } else {
                const typeCode = oscUtils.argToTypeCode(arg, strict);
                if (typeCode) {
                    let value = arg?.value;
                    if (value === undefined) {
                        value = arg;
                    }

                    const typeString = oscUtils.oscTypeCodeToTypeString(typeCode);
                    const buff = oscUtils.toOscArgument(value, typeString, strict);
                    if (buff) {
                        oscargs.push(buff);
                        osctype += typeCode;
                    }
                }
            }
        }

        return [osctype, oscargs];
    },


    fromOscMessage: (buffer, strict) => {
        const { string: address, rest: afterAddress } = splitOscString(buffer, strict);

        if (strict && address[0] !== '/') {
            throw Error('addresses must start with /');
        }

        if (!afterAddress.length) {
            return {
                address,
                args: [],
            };
        }

        const { string: types, rest: afterTypes } = splitOscString(afterAddress, strict);

        if (types[0] !== ',') {
            if (strict) {
                throw Error('Argument lists must begin with ,');
            }
            return {
                address,
                args: [],
            };
        }

        const typeString = types.slice(1);
        const args = [];
        const arrayStack = [args];
        let currentBuffer = afterTypes;

        for (let i = 0; i < typeString.length; i += 1) {
            const type = typeString[i];

            if (type === '[') {
                arrayStack.push([]);
            } else if (type === ']') {
                if (arrayStack.length <= 1) {
                    if (strict) {
                        throw new Error("Mismatched ']' character.");
                    }
                } else {
                    const built = arrayStack.pop();
                    arrayStack[arrayStack.length - 1].push({
                        type: 'array',
                        value: built,
                    });
                }
            } else {
                const typeRep = oscUtils.oscTypeCodeToTypeString(type);
                if (!typeRep) {
                    throw new Error(`I don't understand the argument code ${type}`);
                }

                const arg = oscUtils.splitOscArgument(currentBuffer, typeRep, strict);
                if (arg) {
                    currentBuffer = arg.rest;
                }

                arrayStack[arrayStack.length - 1].push({
                    type: typeRep,
                    value: arg?.value,
                });
            }
        }

        if (arrayStack.length !== 1 && strict) {
            throw new Error("Mismatched '[' character");
        }

        return {
            address,
            args,
            oscType: 'message',
        };
    },


    fromOscBundle: (buffer, strict) => {
        const { string: bundleTag, rest: afterTag } = splitOscString(buffer, strict);

        if (bundleTag !== '#bundle') {
            throw new Error('osc-bundles must begin with #bundle');
        }

        const { timetag, rest: afterTimetag } = splitTimetag(afterTag);

        const convertedElems = oscUtils.mapBundleList(afterTimetag,
            childBuffer => oscUtils.fromOscPacket(childBuffer, strict));

        return {
            timetag,
            elements: convertedElems,
            oscType: 'bundle',
        };
    },

    fromOscPacket: (buffer, strict) => {
        // Normalize the buffer first
        const normalizedBuffer = normalizeBuffer(buffer);

        if (oscUtils.isOscBundleBuffer(normalizedBuffer, strict)) {
            return oscUtils.fromOscBundle(normalizedBuffer, strict);
        }
        return oscUtils.fromOscMessage(normalizedBuffer, strict);
    },


    toOscMessage: (message, strict) => {
        const address = message?.address || message;

        if (typeof address !== 'string') {
            throw new Error('message must contain an address');
        }

        let args = message?.args;
        if (args === undefined) {
            args = [];
        }

        if (!Array.isArray(args)) {
            args = [args];
        }

        const oscaddr = toOscString(address, strict);
        const [osctype, oscargs] = oscUtils.toOscTypeAndArgs(args, strict);
        const typeString = `,${osctype}`;
        const allArgs = concatBuffers(oscargs);
        const osctypeBuffer = toOscString(typeString);

        return concatBuffers([oscaddr, osctypeBuffer, allArgs]);
    },


    toOscBundle: (bundle, strict) => {
        if (strict && !bundle?.timetag) {
            throw Error('bundles must have timetags.');
        }

        const timetag = bundle?.timetag || new Date();
        let elements = bundle?.elements || [];

        if (!Array.isArray(elements)) {
            elements = [elements];
        }

        const oscBundleTag = toOscString('#bundle');
        const oscTimeTag = toTimetagBuffer(timetag);
        const oscElems = [];

        for (let i = 0; i < elements.length; i += 1) {
            const elem = elements[i];
            try {
                const buff = oscUtils.toOscPacket(elem, strict);
                const size = toIntegerBuffer(buff.length);
                oscElems.push(concatBuffers([size, buff]));
            } catch {
                // Ignore failed elements
            }
        }

        const allElems = concatBuffers(oscElems);
        return concatBuffers([oscBundleTag, oscTimeTag, allElems]);
    },


    toOscPacket: (bundleOrMessage, strict) => {
        if (bundleOrMessage?.oscType) {
            if (bundleOrMessage.oscType === 'bundle') {
                return oscUtils.toOscBundle(bundleOrMessage, strict);
            }
            return oscUtils.toOscMessage(bundleOrMessage, strict);
        }

        if (bundleOrMessage?.timetag || bundleOrMessage?.elements) {
            return oscUtils.toOscBundle(bundleOrMessage, strict);
        }

        return oscUtils.toOscMessage(bundleOrMessage, strict);
    },


    applyMessageTranformerToBundle: transform => (buffer) => {
        const { string, rest: afterString } = splitOscString(buffer);

        if (string !== '#bundle') {
            throw new Error('osc-bundles must begin with #bundle');
        }

        const bundleTagBuffer = toOscString(string);
        const timetagBuffer = afterString.slice(0, 8);
        const elementsBuffer = afterString.slice(8);

        const elems = oscUtils.mapBundleList(elementsBuffer,
            childBuffer => oscUtils.applyTransform(childBuffer,
                transform,
                oscUtils.applyMessageTranformerToBundle(transform)));

        const totalLength = bundleTagBuffer.length + timetagBuffer.length
            + elems.reduce((sum, elem) => sum + 4 + elem.length, 0);
        const outBuffer = Buffer.alloc(totalLength);

        let copyIndex = 0;
        bundleTagBuffer.copy(outBuffer, copyIndex);
        copyIndex += bundleTagBuffer.length;

        timetagBuffer.copy(outBuffer, copyIndex);
        copyIndex += timetagBuffer.length;

        for (let i = 0; i < elems.length; i += 1) {
            const elem = elems[i];
            const lengthBuff = toIntegerBuffer(elem.length);
            lengthBuff.copy(outBuffer, copyIndex);
            copyIndex += 4;
            elem.copy(outBuffer, copyIndex);
            copyIndex += elem.length;
        }

        return outBuffer;
    },


    applyTransform: (buffer, mTransform, bundleTransform) => {
        const bundleTransformFunc = bundleTransform
            || oscUtils.applyMessageTranformerToBundle(mTransform);

        if (oscUtils.isOscBundleBuffer(buffer)) {
            return bundleTransformFunc(buffer);
        }
        return mTransform(buffer);
    },


    addressTransform: transform => (buffer) => {
        const { string, rest } = splitOscString(buffer);
        const transformedString = transform(string);
        return concatBuffers([toOscString(transformedString), rest]);
    },


    messageTransform: transform => (buffer) => {
        const message = oscUtils.fromOscMessage(buffer);
        return oscUtils.toOscMessage(transform(message));
    },
};


// Exported
export const fromBuffer = oscUtils.fromOscPacket;


export const toBuffer = oscUtils.toOscPacket;
