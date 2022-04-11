'use strict';

const netPing = require ("net-ping");
const EventEmitter = require('events');

// live: time to take wait untill a device can be consider awake.
//        -> Nintendo Switch have 3 - 8 seconds ping alive when it sleep
// Emit event: 'connected', 'awake', 'sleep', `update`
class ping extends EventEmitter {
    constructor(ip, alive = 20, every = 4) {
        if (!ip) return;

		super();

		this.ip = ip;
		this.every = every;
		this.alive = alive / this.every;
		this.sleepCount = 0;
		this.awakeCount = 0;
		this.callbackCount = this.alive;

		// Other state
		this.isSleep = undefined;
		this.isAwake = undefined;
		this.statusCallback = undefined;
		this.mainLoop = undefined;
	}

	connect = async (execute = true) => {
		if(execute) {
			await this.subscribe();
			this.emit("connected");
		} else {
			var session = netPing.createSession ({ ttl: 1 });
			session.pingHost(this.ip, (error) => {
				this.emit("connected");

				if(error) {
					this.isSleep = true;
					this.isAwake = !this.isSleep;
					this.emit('sleep');
				} else {
					this.isSleep = false;
					this.isAwake = !this.isSleep;
					this.emit('awake');
				}
			});

			this.subscribe();
		}
	}

	subscribe = async () => {
		return new Promise(async (resolve) => {
			var session = netPing.createSession ({ ttl: 1 });

			if(this.mainLoop) clearInterval(this.mainLoop);
			this.mainLoop = setInterval(() => {
				session.pingHost(this.ip, (error) => {
					if(error) {
						this.sleepCount++;
						this.awakeCount = 0;
					} else {
						this.sleepCount = 0;
						this.awakeCount++;
					}

					if(this.sleepCount > this.alive - 1) {
						if (this.isSleep != true) {
							this.isSleep = true;
							this.isAwake = !this.isSleep;
							this.emit("sleep");
							resolve(this.isAwake);
						}
						this.sleepCount = 0;
					} else if(this.awakeCount > this.alive - 1) {
						if (this.isSleep != false) {
							this.isSleep = false;
							this.isAwake = !this.isSleep;
							this.emit("awake");
							resolve(this.isAwake);
						}
						this.awakeCount = 0;
					}

					// Run status callback
					this.callbackCount--;
					if(this.statusCallback && this.callbackCount <= 0) {
						this.callbackCount = 0;

						if(this.isSleep == undefined) this.isSleep = true;

						this.statusCallback(!this.isSleep);
						this.statusCallback = undefined;
					}

					this.emit(`update`);
				});
			}, this.every * 1000);
		});
	}

	disconnect = () => {
		if(this.mainLoop) clearInterval(this.mainLoop);
	}

	status = (callback = () => {}) => {
		this.statusCallback = callback;
		return this.isAwake;
	}
}

module.exports = ping;