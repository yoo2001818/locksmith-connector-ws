import Synchronizer from 'locksmith';
import readline from 'readline';

import WebSocketServerConnector from '../src/webSocketServerConnector';

import ReducerMachine from './reducerMachine';
import calculatorReducer from './calculatorReducer';

let machine = new ReducerMachine(calculatorReducer);
let connector = new WebSocketServerConnector({
  port: 23482
});

let synchronizer = new Synchronizer(machine, connector, {
  dynamic: true,
  dynamicPushWait: 100,
  dynamicTickWait: 100,
  fixedTick: 1000,
  fixedBuffer: 1,
  disconnectWait: 10000,
  freezeWait: 2000
});
connector.synchronizer = synchronizer;
connector.start();
synchronizer.host = true;
synchronizer.start();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const read = (msg = '> ') => {
  rl.question(msg, (answer) => {
    if (isNaN(parseFloat(answer))) {
      synchronizer.push(answer);
    } else {
      synchronizer.push(parseFloat(answer));
    }
    read();
  });
};

read();
