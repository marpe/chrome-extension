import {WebSocket, WebSocketServer} from "ws";
import * as fs from "node:fs";
import * as path from "node:path";
import * as child_process from "node:child_process";

const wss = new WebSocketServer({port: 8080});

let ws: WebSocket | null = null;

wss.on('connection', function connection(websocket) {
  websocket.on('error', console.error);

  websocket.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws = websocket;
});

console.log('websocket server started');

function watchChanges(dir: string, lastTimestamp: number, callback: () => void) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat = fs.lstatSync(filePath);
    if (fileStat.isDirectory()) {
      watchChanges(filePath, lastTimestamp, callback);
    } else if (fileStat.mtimeMs > lastTimestamp) {
      console.log(`${filePath} has changed`);
      callback();
      return;
    }
  }
}

let lastBuildStart = Date.now();
let lastBuildEnd = Date.now();

let isBuilding = false;

function build() {
  lastBuildStart = Date.now();
  isBuilding = true;
  console.log('running build...');
  try {
    child_process.execSync('bun run build', {stdio: "inherit"});
  } catch (error) {
    console.error(error);
    console.error("build failed")
    return;
  }
  console.log('build completed');
  console.log('sending reload message');
  ws?.send('reload');
  isBuilding = false;
  lastBuildEnd = Date.now();
}

const watchDir = "./src";
console.log(`watching for changes in "${watchDir}"`);
setInterval(() => {
  if (isBuilding) {
    return;
  }
  watchChanges(watchDir, lastBuildEnd, build);
}, 1000);
