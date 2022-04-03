'use strict';

let
	util = require('util'),
	ping = require ("net-ping"),
	EventEmitter = require('events')
;

// alive: time to take wait untill a device can be consider awake.
//        -> Nintendo Switch have 3 - 8 seconds ping alive when it sleep
var powerStateWithPing = module.exports = function(ip, alive = 10000) {
	EventEmitter.call(this);

	this.alive = alive;

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
		session.pingHost (this.ip, (error, target) => {
			if (error) {
				if(this.debug) {
					if (error instanceof ping.RequestTimedOutError)
						console.log (`PS: ${target} Sleep`);
					else 
						console.log (`PS: ${target} Error`, error.toString());
				}

				if (this.is_sleep != true) {
					this.is_sleep = true;
					this.emit("sleep");
				}
			} else {
				if(this.debug) console.log(`PS: ${target} Awake`);

				if (this.is_sleep != false) {
					this.is_sleep = false;
					this.emit("awake");
				}
			}
		});
	}

	run_command();
	clearInterval(this.main_loop);
	this.main_loop = setInterval(run_command, this.alive);
}

powerStateWithPing.prototype.disconnect = function() {
	clearInterval(this.main_loop);
}

powerStateWithPing.prototype.status = function(callback = function() {}) {
	callback(!this.is_sleep);
}