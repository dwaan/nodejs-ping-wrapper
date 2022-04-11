# Node.JS Device Power State based on Ping

A Node.JS module to determine device power state based on ping response, this module was made for detecting wether a Nintendo Switch is On of Off. Nintendo Switch will sometimes response a ping request when it's Off in a spesific interval. Example:

## Installation

````bash
npm install nodejs-ping-wrapper --save
````

## Example

To wake a machine with a given mac address do:

```javascript
var ping = require('../nodejs-ping-wrapper');
var nSwitch = new ping('192.168.1.106', 20, 4);


nSwitch.on('awake', function () {
	console.log("TS: Nintendo Switch -> awake");
});

nSwitch.on('sleep', function () {
	console.log("TS: Nintendo Switch -> sleep");
});

nSwitch.on(`update`, function () {
    console.log(`TS: Nintendo Switch -> Awake count: ${this.awakeCount * this.every}, sleep count: ${this.sleepCount * this.every}`);
});

nSwitch.on(`connected`, function () {
	console.log("TS: Nintendo Switch ready");
	this.status((status) => {
		console.log("TS: Nintendo Switch current status -> ", status ? "ON" : "OFF");
	});
});

nSwitch.connect();
```

## Options

* **ip** - The device IP (mandatory)
* *alive*: Determine how long to observe the ping result in seconds, default: 20
* *every*: Ping will be done every x seconds, default: 4

## Emiter

* connected: When the first time it can determined the power status
* awake: when device is awake
* sleep: when device is sleep
* update: everytime a ping command is send

## Getting device state

* Using variables `isAwake` or `isSleep`
* Using `status` helper, example:

```javascript
nSwitch.status((status) => {
    console.log(status);
});
```