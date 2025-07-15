#!/usr/bin/env node

import { x18Run, x18Stop } from 'magical-mixers';

const main = async () => {
  await x18Run();
  process.on('SIGINT', async () => {
    await x18Stop();
    process.exit();
  });
};

main();
