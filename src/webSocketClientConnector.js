// Use web browser's native WebSocket if possible.

function parseJSON(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    return null;
  }
}

export default class WebSocketClientConnector {
  constructor(client) {
    this.client = client;
    this.clientId = 1;
    this.replacer = null;
  }
  setSynchronizer(synchronizer) {
    this.synchronizer = synchronizer;
  }
  // This is not used at all by clients for now, so we're sending a dummy value.
  getHostId() {
    return 0;
  }
  getClientId() {
    return this.clientId;
  }
  meta(data) {
    this.sendData({ type: 'meta', data });
  }
  push(data) {
    this.sendData({ type: 'push', data });
  }
  ack(data) {
    this.sendData({ type: 'ack', data });
  }
  sendData(data) {
    this.client.send(JSON.stringify(data, this.replacer));
  }
  connect(metadata) {
    this.client.onopen = () => {
      this.sendData({ type: 'connect', data: metadata });
    };
    this.client.onmessage = event => {
      this.handleMessage(event.data);
    };
    this.client.onerror = event => {
      this.handleError(event);
    };
    this.client.onclose = event => {
      this.handleDisconnect(event);
    };
    if (this.client &&
      (this.client.readyState === 0 || this.client.readyState === 1)
    ) {
      this.sendData({ type: 'connect', data: metadata });
      return;
    }
  }
  disconnect() {
    this.client.close();
    this.handleDisconnect();
  }
  error() {
    // Well, nothing to do here.
    this.disconnect();
  }
  start(metadata) {
    this.connect(metadata);
  }
  stop() {
    this.disconnect();
  }
  handleMessage(string) {
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
      this.synchronizer.handlePush(data.data, 0);
      break;
    case 'ack':
      this.synchronizer.handleAck(data.data, 0);
      break;
    case 'connect':
      this.clientId = data.data.id;
      this.synchronizer.handleConnect(data.data, 0);
      break;
    case 'error':
      this.synchronizer.handleError(data.data, 0);
    }
  }
  handleError(event) {
    this.synchronizer.handleError(event, 0);
  }
  handleDisconnect() {
    this.synchronizer.handleDisconnect(0);
  }
}
