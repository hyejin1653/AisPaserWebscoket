const express = require("express");
const app = express();
const WebSocket = require("ws");

const iniparser = require("iniparser");
const config = iniparser.parseSync("./config.ini");

const dgram = require("dgram");
const server = dgram.createSocket("udp4");

let ip = config.SETTING.ip;
let port = config.SETTING.port;

let wsPort = config.SETTING.wsPort;

const WebSocketServer = WebSocket.Server,
  wss = new WebSocketServer({ port: wsPort });

wss.on("connection", (ws, request) => {
  if (ws.readyState === ws.OPEN) {
    console.log("새로운 클라이언트");
  }
});

//에러 발생 시
server.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

//클라이언트로부터 메시지 수신 시
server.on("message", (msg, remote_info) => {
  let data = msg.toString();
  let dataArr = data.split(",");

  let obj = {};
  obj["mmsi"] = dataArr[0];
  obj["latitude"] = parseFloat(dataArr[1]);
  obj["longitude"] = parseFloat(dataArr[2]);
  obj["sog"] = parseFloat(dataArr[3]);
  obj["cog"] = parseFloat(dataArr[5]);
  obj["trueHeading"] = parseFloat(dataArr[6]);
  obj["regDate"] = dataArr[7];

  let json = JSON.stringify(obj);
  console.log(json);
  wss.clients.forEach((client) => {
    client.send(json);
  });
});

//서버 start시
server.on("listening", () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(port, ip);
