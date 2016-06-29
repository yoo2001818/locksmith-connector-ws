import WebSocketClientConnector from '../src/webSocketClientConnector';

export default class DelayClientConnector extends WebSocketClientConnector {
  constructor(address, protocols, options) {
    super(address, protocols, options);
    this.delay = 0;
  }
  sendData(data) {
    setTimeout(() => super.sendData(data), this.delay);
  }
  handleMessage(string) {
    setTimeout(() => super.handleMessage(string), this.delay);
  }
  handleError(event) {
    setTimeout(() => super.handleError(event), this.delay);
  }
  handleDisconnect() {
    setTimeout(() => super.handleDisconnect(), this.delay);
  }
}
