#!/usr/bin/env node

// Requirements
import { x18Run, x18Stop } from './index.js';


// Main
const main = async () => {
    await x18Run();
    process.on('SIGINT', async () => {
        await x18Stop();
        process.exit();
    });
};


// Run
main();
