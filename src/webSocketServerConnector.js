import { Server as WebSocketServer } from 'ws';

function parseJSON(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    return null;
  }
}

export default class WebSocketServerConnector {
  constructor(options) {
    // TODO User may want to provide their own websocket instance
    this.server = new WebSocketServer(options);
    this.clients = {};
    this.clientIds = 1;
  }
  setSynchronizer(synchronizer) {
    this.synchronizer = synchronizer;
  }
  getHostId() {
    return 0;
  }
  getClientId() {
    return 0;
  }
  push(data, clientId) {
    this.sendData({ type: 'push', data }, clientId);
  }
  ack(data, clientId) {
    this.sendData({ type: 'ack', data }, clientId);
  }
  connect(data, clientId) {
    this.sendData({ type: 'connect', data }, clientId);
  }
  sendData(data, clientId) {
    this.clients[clientId].send(JSON.stringify(data));
  }
  disconnect(clientId) {
    this.clients[clientId].close();
    this.handleDisconnect(clientId);
  }
  error(data, clientId) {
    // TODO Error handler
    if (data instanceof Error) {
      console.log(data.stack);
    } else {
      console.log(data);
    }
    this.disconnect(clientId);
  }
  start() {
    this.server.on('connection', client => {
      let clientId = this.clientIds ++;
      this.clients[clientId] = client;
      client.onmessage = event => {
        this.handleMessage(event.data, clientId);
      };
      client.onerror = event => {
        this.handleError(event, clientId);
      };
      client.onclose = () => {
        this.handleDisconnect(clientId);
      };
      this.handleConnect(clientId);
    });
  }
  stop() {
    this.server.close();
  }
  handleMessage(string, clientId) {
    let data = parseJSON(string);
    if (data == null) return;
    switch (data.type) {
    case 'push':
      this.synchronizer.handlePush(data.data, clientId);
      break;
    case 'ack':
      this.synchronizer.handleAck(data.data, clientId);
      break;
    }
  }
  handleError(event, clientId) {
    this.error(event, clientId);
  }
  handleConnect(clientId) {
    this.synchronizer.handleConnect(null, clientId);
  }
  handleDisconnect(clientId) {
    this.synchronizer.handleDisconnect(clientId);
  }
}