import { Server as WebSocketServer } from 'ws';

function parseJSON(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    return null;
  }
}

export default class WebSocketServerConnector {
  constructor(options, useOwn = false) {
    // User may want to provide their own websocket instance
    if (!useOwn) {
      this.server = new WebSocketServer(options);
    } else {
      this.server = options;
    }
    this.clients = {};
    this.clientIds = 1;
    this.replacer = null;
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
  meta(data, clientId) {
    this.sendData({ type: 'meta', data }, clientId);
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
    if (this.clients[clientId] == null) return;
    if (this.clients[clientId].readyState !== 1) return;
    this.clients[clientId].send(JSON.stringify(data, this.replacer));
  }
  disconnect(clientId) {
    if (this.clients[clientId] == null) return;
    if (this.clients[clientId].readyState !== 1) return;
    this.clients[clientId].close();
    this.clients[clientId] = undefined;
  }
  error(data, clientId) {
    this.sendData({ type: 'error', data }, clientId);
    setTimeout(() => this.disconnect(clientId), 0);
  }
  start(metadata, noRegister = false) {
    if (!noRegister) {
      this.server.on('connection', this.handleConnect.bind(this));
    }
    this.synchronizer.start(metadata);
  }
  stop() {
    if (this.server) this.server.close();
  }
  handleConnect(client) {
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
    // We don't have to send 'handshake header' packet, right?
    // It's not really necessary...
  }
  handleMessage(string, clientId) {
    let data = parseJSON(string);
    if (data == null) return;
    switch (data.type) {
    case 'meta':
      // :P?
      if (this.synchronizer.handleMeta) {
        this.synchronizer.handleMeta(data.data, 0);
      }
      break;
    case 'push':
      this.synchronizer.handlePush(data.data, clientId);
      break;
    case 'ack':
      this.synchronizer.handleAck(data.data, clientId);
      break;
    case 'connect':
      this.synchronizer.handleConnect(data.data, clientId);
      break;
    }
  }
  handleError(event, clientId) {
    this.synchronizer.handleError(event.message, clientId);
  }
  handleDisconnect(clientId) {
    if (this.clients[clientId] == null) return;
    this.synchronizer.handleDisconnect(clientId);
  }
}
