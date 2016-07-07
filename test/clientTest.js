import { Synchronizer } from 'locksmith';
import readline from 'readline';

import DelayClientConnector from './delayClientConnector';

import ReducerMachine from './reducerMachine';
import calculatorReducer from './calculatorReducer';

let machine = new ReducerMachine(calculatorReducer);
let connector = new DelayClientConnector('ws://localhost:23482');

let synchronizer = new Synchronizer(machine, connector);
connector.synchronizer = synchronizer;
connector.start({
  name: 'Bananananananana'
});

synchronizer.on('connect', () => {
  console.log('Connected!');
});
synchronizer.on('disconnect', () => {
  console.log('Disconnected!');
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
    if (/^delay ([0-9]+)$/.test(answer)) {
      connector.delay = parseInt(/^delay ([0-9]+)$/.exec(answer)[1]);
      console.log('Delay set to ' + connector.delay);
      read();
      return;
    }
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
