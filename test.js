var ping = require('../nodejs-ping-wrapper');
var nSwitch = new ping('192.168.1.106', 22);

function getDateTime() {
    var date = new Date();

    var hour = (date.getHours() < 10 ? "0" : "") + date.getHours();
    var min = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    var sec =  (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
    var year = date.getFullYear();
    var month = ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1);
    var day = (date.getDate() < 10 ? "0" : "") + date.getDate();

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

nSwitch.on('awake', () => {
    console.log(getDateTime(), "TS: Nintendo Switch -> awake");
});

nSwitch.on('sleep', () => {
    console.log(getDateTime(), "TS: Nintendo Switch -> sleep");
});

nSwitch.on(`update`, (count, awake, sleep) => {
    console.log(getDateTime(), `TS: Nintendo Switch -> Count: ${count}, awake: ${awake}, sleep: ${sleep}`);
});

nSwitch.on(`connected`, () => {
    console.log("TS: Nintendo Switch ready");
    nSwitch.status((status) => {
        console.log(getDateTime(), "TS: Nintendo Switch current status -> ", status ? "ON" : "OFF");
    });
});

nSwitch.on(`before`, (count) => {
    console.log("TS: count", count);
});

nSwitch.connect().catch(e => console.log("Can't use net-ping", e));