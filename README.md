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
connector.start('metadata');
```

### Client
```js
import { WebSocketClientConnector } from 'locksmith-connector-ws';
let connector = new WebSocketClientConnector(new WebSocket('ws://localhost:23482'));
connector.start('metadata'); // Metadata can be any JSON object
```
