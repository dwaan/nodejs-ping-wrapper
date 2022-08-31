var ping = require('../nodejs-ping-wrapper');
var device = new ping('192.168.1.121', 40, 5);

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

device.on('awake', () => {
    console.log(getDateTime(), "TS: Device -> awake");
});

device.on('sleep', () => {
    console.log(getDateTime(), "TS: Device -> sleep");
});

device.on(`update`, (count, awake, sleep) => {
    console.log(getDateTime(), `TS: Device -> Count: ${count}, awake: ${awake}, sleep: ${sleep}`);
});

device.on(`connected`, () => {
    console.log(getDateTime(), "TS: Device ready");
    device.status((status) => {
        console.log(getDateTime(), "TS: Device current status -> ", status ? "ON" : "OFF");
    });
});

device.on(`before`, (count) => {
    console.log(getDateTime(), "TS: count", count);
});

device.connect().catch(e => console.log(getDateTime(), "Can't use net-ping", e));