// Requirements
import { initialize } from '../core/index.js';
import { nodePlatform } from '../platforms/index.js';
import { isValidIP, isValidPort } from '../core/helpers/values.js';
import { runManualConnectTest, MANUAL_CONNECT_TEST_TARGET } from './manual-connect-test.js';


// Main
const main = async () => {
    const ip = process.argv.length > 2 ? process.argv[2] : MANUAL_CONNECT_TEST_TARGET.ip;
    const port = process.argv.length > 3
        ? parseInt(process.argv[3], 10)
        : MANUAL_CONNECT_TEST_TARGET.port;

    if (!isValidIP(ip) || !isValidPort(port)) {
        console.error('[connectivity-test] Invalid IP or port');
        console.error('Usage: node src/examples/manual-connect-test-cli.js [ip] [port]');
        process.exit(1);
    }

    initialize(nodePlatform);

    try {
        await runManualConnectTest({
            ip,
            port,
            platform: nodePlatform,
            platformLabel: 'node-dgram (platforms/node)',
            keepSessionOpen: false,
        });
        process.exit(0);
    } catch (error) {
        console.error('[connectivity-test] failed', error?.message || error);
        process.exit(1);
    }
};


main();
