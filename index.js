'use strict';

let
	util = require('util'),
	ping = require ("net-ping"),
	EventEmitter = require('events')
;

// alive: time to take wait untill a device can be consider awake.
//        -> Nintendo Switch have 3 - 8 seconds ping alive when it sleep
var powerStateWithPing = module.exports = function(ip, alive = 10, every = 1) {
	if (!ip) {
		console.log("PS: Please provide your device IP");
		process.exit();
	} else this.ip = ip;

	this.every = every;
	this.alive = alive / this.every;
	this.sleepCount = 0;
	this.awakeCount = 0;
	this.callbackCount = this.alive;
	this.isSleep = undefined;
	this.statusCallback = undefined;

	EventEmitter.call(this);
}
util.inherits(powerStateWithPing, EventEmitter);
powerStateWithPing.debug = false;

// Emit event: 'ready', 'awake', 'sleep'
powerStateWithPing.prototype.connect = function(execute = true) {
	if(execute) this.subscribe();
	if(this.debug) console.log("PS: Ready");
	this.emit("ready");
}

powerStateWithPing.prototype.subscribe = function() {
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
					if(this.debug) console.log("PS: Sleep");
				} 

				this.sleepCount = 0;
			} else if(this.awakeCount > this.alive - 1) {
				if (this.isSleep != false) {
					this.isSleep = false;
					this.emit("awake");
					if(this.debug) console.log("PS: Awake");
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

			if(this.debug) console.log("PS: count: asleep", this.sleepCount * this.every, "awake", this.awakeCount * this.every);
		});
	}

	clearInterval(this.main_loop);
	this.main_loop = setInterval(runPing, this.every * 1000);
}

powerStateWithPing.prototype.disconnect = function() {
	clearInterval(this.main_loop);
}

powerStateWithPing.prototype.status = function(callback = function() {}) {
	this.statusCallback = callback;
}