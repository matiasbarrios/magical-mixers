// Requirements
import { searchNew, initialize } from '../core/index.js';


// Variables
let search;


// Internal
const onUpdate = (found) => {
    const output = ['Devices found:'];    
    if (found.length === 0) {
        output.push('  No devices found yet...');
    } else {
        found.forEach((d, index) => {
            output.push(`  ${index + 1}. ${d.name} | ${d.ip} | ${d.port} | ${d.firmware} | ${d.brand} | ${d.model}`);
        });
    }

    output.forEach(line => console.log(line));
};


const onStop = async () => {
    console.log('Search stopped');
    if (!search) return;
    await search.stop();
    process.exit(1);
};


// Main
const main = async () => {
    process.on('SIGTERM', onStop);
    process.on('SIGINT', onStop);

    console.log(`Searching for devices`);
    initialize();
    search = searchNew();
    await search.start(null, null, true);
    search.onUpdate(onUpdate);
};


// Run
main();
