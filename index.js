'use strict';

const EventEmitter = require(`events`);
const { execFile } = require(`child_process`);

// alive: time to take wait untill a device can be consider awake.
// Emit event: 'connected', 'awake', 'sleep', `update`
class ping extends EventEmitter {
	constructor(ip, alive = 20, every = 4) {
		if (!ip) return;

		super();

		this._ip = ip;
		this._every = every;
		this._alive = alive / this._every;
		this._count = [];

		// Published state
		this.isSleep = undefined;
		this.isAwake = undefined;

		// Other state
		this._statusCallback = undefined;
		this._mainLoop = undefined;
	}

	connect = async (execute = true) => {
		if (execute) {
			await this.subscribe();
			this.emit("connected");
		} else {
			let result = await this.ping();
			if (result) {
				this.isSleep = true;
				this.isAwake = !this.isSleep;
				this.emit('sleep');
			} else {
				this.isSleep = false;
				this.isAwake = !this.isSleep;
				this.emit('awake');
			}

			this.subscribe();
			this.emit("connected");
		}
	}

	ping = async () => {
		return new Promise(async (resolve) => {
			try {
				execFile(`ping`, [`-c 1`, `-t 1`, this._ip], (error) => {
					if (error) resolve(false);
					else resolve(true);
				});
			} catch (error) {
				resolve(false);
			}
		});
	}

	subscribe = async () => {
		function count(arr) {
			let result = 0;
			arr.forEach(el => {
				if (el === 1) result++;
			});
			return result;
		}

		return new Promise(async (resolve) => {
			if (this._mainLoop) clearInterval(this._mainLoop);
			this._mainLoop = setInterval(async () => {
				let result = await this.ping();

				this._count.push(result ? 1 : 0);

				if (this._count.length == this._alive + 1) {
					this._count.shift();
					result = count(this._count);

					if (result == this._alive && !this.isAwake) {
						this.isSleep = false;
						this.isAwake = !this.isSleep;
						this.emit("awake", result, this.isAwake, this.isSleep);
					} else if (result < this._alive && !this.isSleep) {
						this.isSleep = true;
						this.isAwake = !this.isSleep;
						this.emit("sleep", result, this.isAwake, this.isSleep);
					}

					// Run status callback
					if (this._statusCallback) {
						if (this.isAwake == undefined) {
							this.isSleep = true;
							this.isAwake = !this.isSleep;
						}

						this._statusCallback(this.isAwake);
						this._statusCallback = undefined;
					}

					resolve(this.isAwake);
				}

				if (this.isAwake != undefined) this.emit(`update`, result, this.isAwake, this.isSleep);
			}, this._every * 1000);
		});
	}

	disconnect = () => {
		if (this._mainLoop) clearInterval(this._mainLoop);
	}

	status = (callback = () => { }) => {
		this._statusCallback = callback;
		return this.isAwake;
	}
}

module.exports = ping;