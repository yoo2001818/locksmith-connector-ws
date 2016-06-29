// Use web browser's native WebSocket if possible.
let WebSocket = WebSocket;

if (typeof WebSocket === 'undefined') {
  WebSocket = require('ws');
}

function parseJSON(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    return null;
  }
}

export default class WebSocketClientConnector {
  constructor(address, protocols, options) {
    this.address = address;
    this.protocols = protocols;
    this.options = options;
    this.client = null;
  }
  setSynchronizer(synchronizer) {
    this.synchronizer = synchronizer;
  }
  // This is not used at all by clients for now, so we're sending a dummy value.
  getHostId() {
    return 0;
  }
  getClientId() {
    return 1;
  }
  push(data) {
    this.sendData({ type: 'push', data });
  }
  ack(data) {
    this.sendData({ type: 'ack', data });
  }
  sendData(data) {
    this.client.send(JSON.stringify(data));
  }
  connect() {
    if (this.client &&
      (this.client.readyState === 0 || this.client.readyState === 1)
    ) {
      return;
    }
    this.client = new WebSocket(this.address, this.protocols, this.options);
    // Open event should handled by server, as client can't do anything at
    // that point.
    this.client.onopen = () => {};
    this.client.onmessage = event => {
      this.handleMessage(event.data);
    };
    this.client.onerror = event => {
      this.handleError(event);
    };
    this.client.onclose = event => {
      this.handleDisconnect(event);
    };
  }
  disconnect() {
    this.client.close();
    this.handleDisconnect();
  }
  error(data) {
    // TODO Error handler
    if (data instanceof Error) {
      console.log(data.stack);
    } else {
      console.log(data);
    }
    this.disconnect();
  }
  start() {
    this.connect();
  }
  handleMessage(string) {
    let data = parseJSON(string);
    if (data == null) return;
    switch (data.type) {
    case 'push':
      this.synchronizer.handlePush(data, 0);
      break;
    case 'ack':
      this.synchronizer.handleAck(data, 0);
      break;
    case 'connect':
      this.synchronizer.handleConnect(data, 0);
      break;
    }
  }
  handleError(event) {
    this.error(event);
  }
  handleDisconnect() {
    this.synchronizer.handleDisconnect(0);
  }
}
