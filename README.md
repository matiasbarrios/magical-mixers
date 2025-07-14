# Magical Mixers

An open-source engine for communicating with digital mixers in Node.js.

This library is the **core communication layer** behind [Magical Mixing Console](https://magicalmixingconsole.com), a cross-platform application for remote control of digital mixers. It is designed to be reusable in other tools or custom workflows that need to interact with compatible digital audio consoles.

Built and maintained with ❤️ by Matías Barrios in Piriápolis, Uruguay 🇺🇾. Aguante la música ✨


## Features

- 🧠 Provides a high-level abstraction layer over digital mixers, allowing applications to interact with them through a unified and simplified interface, regardless of specific model details.
- 🔌 Communication with digital mixers over LAN/WLAN.
- ⚡ Real-time bidirectional message handling.
- 🧱 Modular structure for easy extension and customization.
- 🧰 Used in production by [Magical Mixing Console](https://github.com/matiasbarrios/magical-mixing-console-releases).


## Installation

Clone the repository and run:
```bash
npm install
```


## Usage

### Virtual device

If you don't own a supported digital mixer, you can run a virtual one by excecuting the following script:

```bash
npm run x18
```

By default it wil listen on 127.0.0.1 on port 10024.

### Example

The following code can be found in src/examples/busName.js. It shows how to connect to a device (digatl mixer), get the main bus name, edit it (and get notifications every time it is edited).

Run it from the command line:

```bash
node src/examples/busName.js 127.0.0.1 10024
```

```js
// Requirements
import { searchNew, mixersInitialize } from '../core/index.js';
import { getLANBroadcastAddress } from '../virtual-device/helpers/lan.js';
import {
    udpSocketOpen,
    udpSocketClose,
    udpMessageSend,
    onUDPMessageReceived,
} from '../virtual-device/helpers/udp.js';
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
    mixersInitialize({
        getLANBroadcastAddress,
        udpSocketOpen,
        udpSocketClose,
        udpMessageSend,
        onUDPMessageReceived,
    });

    const ip = process.argv.length > 2 ? process.argv[2] : null;
    const port = process.argv.length > 3 ? process.argv[3] : null;

    if (!isValidIP(ip) || !isValidPort(port)) {
        console.error('Invalid IP or port');
        process.exit(1);
    }

    console.log(`Searching for ${ip}:${port}`);
    const search = searchNew();
    await search.inIPPort(ip, port, onDeviceFound(search), async () => {
        await search.stop();
        console.error('Device not found');
        process.exit(1);
    });
};


// Run
main();
```

## Supported Mixers

Currently supports:

* Behringer X Air series (XR12, XR16, XR18, X18).
* Midas M Air series (MR12, MR18).

Let's hope more models and brands will be supported in the future!


## API Reference

Coming soon – in the meantime, see the source code and join the [Discord](https://discord.gg/Zw3b4DEqbM) community.


## Contributing

Contributions are welcome! If you find a bug or want to request a feature, please open an issue or pull request.
Also feel free to use the discussion board or join our [Discord](https://discord.gg/Zw3b4DEqbM) server for help and collaboration.


## License

Apache License 2.0 © 2025 Matías Barrios  
Piriápolis, Uruguay 🇺🇾  
📧 matias@magicalmixingconsole.com
