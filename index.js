'use strict';

const ping = require ("net-ping");
const EventEmitter = require('events');

// live: time to take wait untill a device can be consider awake.
//        -> Nintendo Switch have 3 - 8 seconds ping alive when it sleep
// Emit event: 'ready', 'awake', 'sleep'
class nPing extends EventEmitter {
    constructor(ip, alive = 10, every = 1) {
        if (!ip) return;

		super();

		this.ip = ip;
		this.every = every;
		this.alive = alive / this.every;
		this.sleepCount = 0;
		this.awakeCount = 0;
		this.callbackCount = this.alive;
		this.isSleep = undefined;
		this.statusCallback = undefined;
	}

	connect = function(execute = true) {
		if(execute) this.subscribe();
		this.emit("ready");
	}

	subscribe = function() {
		var session = ping.createSession ({
			ttl: 1
		});
		var runPing = () => {
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
						this.emit("sleep");
					}

					this.sleepCount = 0;
				} else if(this.awakeCount > this.alive - 1) {
					if (this.isSleep != false) {
						this.isSleep = false;
						this.emit("awake");
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
		}

		if(this.main_loop) clearInterval(this.main_loop);
		this.main_loop = setInterval(runPing, this.every * 1000);
	}

	disconnect = function() {
		if(this.main_loop) clearInterval(this.main_loop);
	}

	status = function(callback = function() {}) {
		this.statusCallback = callback;
	}
}

module.exports = nPing;