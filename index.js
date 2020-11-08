'use strict';

let
	util = require('util'),
	exec = require('child_process').exec,
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
	var run_command = () => {
		exec(`ping -c ${this.alive/1000} -t ${this.alive/1000} -s 1 ${this.ip} | grep -E " 0.0% | 0% "`, (err, stdout, stderr) => {
			if (this.is_sleep == null) {
				if (stdout.trim().length > 0) {
					this.is_sleep = true;
				} else {
					this.is_sleep = false;
				}
			}

			if (stdout.trim().length > 0) {
				if(this.is_sleep) {
					this.awake_time++;

					if (this.awake_time > 2) {
						if(this.debug) console.log("PS: Awake");

						this.awake_time = 0;
						this.is_sleep = false;
						this.emit("awake");
					}
				}
			} else {
				if (!this.is_sleep) {
					if(this.debug) console.log(`PS: Sleep`);

					this.is_sleep = true;
					this.emit("sleep");
				}
			}
		});
	}

	this.awake_time = 0;
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