import Synchronizer from 'locksmith';
import readline from 'readline';

import WebSocketClientConnector from '../src/webSocketClientConnector';

import ReducerMachine from './reducerMachine';
import calculatorReducer from './calculatorReducer';

let machine = new ReducerMachine(calculatorReducer);
let connector = new WebSocketClientConnector('ws://localhost:23482');

let synchronizer = new Synchronizer(machine, connector);
connector.synchronizer = synchronizer;
connector.start();

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
