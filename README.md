# locksmith-connector-ws
WebSocket connector for locksmith

## Usage

`npm install locksmith-connector-ws --save`

### Server
```js
import { WebSocketServerConnector } from 'locksmith-connector-ws';
let connector = new WebSocketServerConnector({
  port: 23482
});
connector.start();
```

### Client
```js
import { WebSocketClientConnector } from 'locksmith-connector-ws';
let connector = new WebSocketClientConnector('ws://localhost:23482');
connector.start();
```
