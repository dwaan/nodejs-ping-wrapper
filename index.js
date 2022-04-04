'use strict';

let
	util = require('util'),
	ping = require ("net-ping"),
	EventEmitter = require('events')
;

// alive: time to take wait untill a device can be consider awake.
//        -> Nintendo Switch have 3 - 8 seconds ping alive when it sleep
var powerStateWithPing = module.exports = function(ip, alive = 10) {
	EventEmitter.call(this);

	this.alive = alive;
	this.count = this.alive;
	this.offCount = 0;
	this.statusCallback = undefined;

	if (!ip) {
		console.log("PS: Please provide your device IP");
		process.exit();
	} else {
		this.ip = ip;
	}
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
	var session = ping.createSession ();
	var run_command = () => {
		session.pingHost (this.ip, (error) => {
			if (error) this.offCount++;
			else this.offCount = 0;

			this.count--;
			if(this.count <= 0) {
				this.count = 0;

				// Run the callback
				if(this.statusCallback) {
					this.statusCallback(!this.isSleep);
					this.statusCallback = undefined;
				}

				if(this.offCount >= this.alive) {
					this.offCount = this.alive;

					if (this.isSleep != true) {
						this.isSleep = true;
						this.emit("sleep");
						if(this.debug) console.log("PS: Sleep");
					}
				} else {
					if (this.isSleep != false) {
						this.isSleep = false;
						this.emit("awake");
						if(this.debug) console.log("PS: Awake");
					}
				}
			} else {
				if(this.debug) console.log("PS: count", this.count);
			}
		});
	}

	run_command();
	clearInterval(this.main_loop);
	this.main_loop = setInterval(run_command, 1000);
}

powerStateWithPing.prototype.disconnect = function() {
	clearInterval(this.main_loop);
}

powerStateWithPing.prototype.status = function(callback = function() {}) {
	this.statusCallback = callback;
}