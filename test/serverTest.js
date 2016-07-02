import { HostSynchronizer } from 'locksmith';
import readline from 'readline';

import WebSocketServerConnector from '../src/webSocketServerConnector';

import ReducerMachine from './reducerMachine';
import calculatorReducer from './calculatorReducer';

let machine = new ReducerMachine(calculatorReducer);
let connector = new WebSocketServerConnector({
  port: 23482
});

let synchronizer = new HostSynchronizer(machine, connector, {
  dynamic: true,
  dynamicPushWait: 100,
  dynamicTickWait: 100,
  fixedTick: 1000,
  fixedBuffer: 0,
  disconnectWait: 10000,
  freezeWait: 2000
});
connector.synchronizer = synchronizer;
connector.start();
synchronizer.start();

synchronizer.on('connect', clientId => {
  console.log('Client ' + clientId + ' connected');
});
synchronizer.on('disconnect', clientId => {
  console.log('Client ' + clientId + ' disconnected');
});
synchronizer.on('freeze', () => {
  console.log('Synchronizer frozen');
});
synchronizer.on('unfreeze', () => {
  console.log('Synchronizer unfrozen');
});
synchronizer.on('error', error => {
  console.log(error);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const read = () => {
  rl.question(synchronizer.rtt + 'ms > ', (answer) => {
    let action;
    if (isNaN(parseFloat(answer))) {
      action = { data: answer };
    } else {
      action = { data: parseFloat(answer) };
    }
    synchronizer.push(action, true)
    .then(() => read(), () => read());
  });
};

read();
