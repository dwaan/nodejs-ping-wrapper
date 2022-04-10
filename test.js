var ping = require('../power-state-with-ping');
var nintendoSwitch = new ping('192.168.1.106', 20, 4);

function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + " " + hour + ":" + min + ":" + sec;
}

nintendoSwitch.on('ready', function () {
	console.log("TS: Nintendo Switch ready");
	this.status((status) => {
		console.log(getDateTime(), "TS: Nintendo Switch current status -> ", status ? "ON" : "OFF");
	});
});
nintendoSwitch.connect();
nintendoSwitch.debug = true;

nintendoSwitch.on('awake', function () {
	console.log(getDateTime(), "TS: Nintendo Switch -> awake");
});

nintendoSwitch.on('sleep', function () {
	console.log(getDateTime(), "TS: Nintendo Switch -> sleep");
});

nintendoSwitch.on(`update`, function () {
    console.log(getDateTime(), `TS: Nintendo Switch -> Awake count: ${this.awakeCount * this.every}, sleep count: ${this.sleepCount * this.every}`);
})