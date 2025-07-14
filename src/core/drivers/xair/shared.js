// Internal
const xAirMetersRead = twoBytesValuesToRead => (buffer) => {
    // If trying to read more than available, return empty
    if (twoBytesValuesToRead > (buffer.length / 2) - 2) return [];

    const res = [];
    let j = 0;
    for (let i = 4; i < 4 + (twoBytesValuesToRead * 2); i += 2) {
        let db = buffer.readIntLE(i, 2);
        db /= 256;
        res[j] = db;
        j += 1;
    }
    return res;
};


// Exported
export const xAirSubscriptionBuild = ({
    meterId, shortIntegersToRead, argOne, metersTimeFactor, metersRenewInterval,
}) => ({
    address: '/meters',
    args: [
        `/meters/${meterId}`,
        argOne || 0,
        0,
        metersTimeFactor || 1, // 50ms * METERS_TIME_FACTOR = frequency of messages received
    ],
    addressToListenTo: `/meters/${meterId}`,
    onResponse: xAirMetersRead(shortIntegersToRead),
    renewal: metersRenewInterval || 9 * 1000, // 9 seconds
    unsubscribe: {
        address: '/unsubscribe',
        args: [`/meters/${meterId}`],
    },
});


export const ONE = 0.999999; // Strange bug when setting 1 in some binary values
