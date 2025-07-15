// Requirements
import { searchNew, initialize } from '../core/index.js';
import { isValidIP, isValidPort } from '../core/helpers/values.js';


// Constants
const mainBusId = 27;


// Internal
const disconnect = async (device) => {
    await device.dispose();
    console.log('Disconnecting, bye bye!');
    process.exit(0);
};


const readWriteBusName = async (device) => {
    // Does the device have buses? It should!
    device.features.bus.name.has(mainBusId, (has) => {
        if (!has) {
            console.error('Main bus not found');
            setTimeout(() => disconnect(device), 1);
            return;
        }

        // Get the main bus name
        // Every time it's edited this will run
        device.features.bus.name.get(mainBusId, (name) => {
            console.log(`Main bus name: ${name}`);
        });

        // Edit it it two times, every time it should be printed
        setTimeout(() => {
            device.features.bus.name.set(mainBusId, 'The Great Main Bus');
        }, 3000);

        setTimeout(async () => {
            device.features.bus.name.set(mainBusId, 'The Main Bus');
            // Once finished, disconnect
            await disconnect(device);
        }, 6000);
    });
};


const onDeviceFound = search => async (data) => {
    const device = await search.getFound(data.ip, data.port);
    await device.connect();
    await search.stop();
    console.log(`Device found on ${data.ip}:${data.port}`);
    await readWriteBusName(device);
};


// Main
const main = async () => {
    const ip = process.argv.length > 2 ? process.argv[2] : null;
    const port = process.argv.length > 3 ? process.argv[3] : null;

    if (!isValidIP(ip) || !isValidPort(port)) {
        console.error('Invalid IP or port');
        process.exit(1);
    }

    console.log(`Searching for ${ip}:${port}`);
    initialize();
    const search = searchNew();
    await search.inIPPort(ip, port, onDeviceFound(search), async () => {
        await search.stop();
        console.error('Device not found');
        process.exit(1);
    });
};


// Run
main();
