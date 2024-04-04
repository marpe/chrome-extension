"use strict";
exports.__esModule = true;
var ws_1 = require("ws");
var fs = require("node:fs");
var path = require("node:path");
var child_process = require("node:child_process");
var wss = new ws_1.WebSocketServer({ port: 8080 });
var ws = null;
wss.on('connection', function connection(websocket) {
    websocket.on('error', console.error);
    websocket.on('message', function message(data) {
        console.log('received: %s', data);
    });
    ws = websocket;
});
console.log('websocket server started');
function watchChanges(dir, lastTimestamp, callback) {
    var files = fs.readdirSync(dir);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var filePath = path.join(dir, file);
        var fileStat = fs.lstatSync(filePath);
        if (fileStat.isDirectory()) {
            watchChanges(filePath, lastTimestamp, callback);
        }
        else if (fileStat.mtimeMs > lastTimestamp) {
            console.log(filePath + " has changed");
            callback();
            return;
        }
    }
}
var lastBuild = Date.now();
function build() {
    lastBuild = Date.now();
    console.log('running build...');
    try {
        child_process.execSync('node ./build.js', { stdio: "inherit" });
    }
    catch (error) {
        console.error(error);
        console.error("build failed");
        return;
    }
    console.log('build completed');
    console.log('sending reload message');
    ws === null || ws === void 0 ? void 0 : ws.send('reload');
}
console.log('watching for changes...');
setInterval(function () {
    watchChanges('src', lastBuild, build);
}, 1000);
