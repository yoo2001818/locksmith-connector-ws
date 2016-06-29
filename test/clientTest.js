import Synchronizer from 'locksmith';
import readline from 'readline';

import DelayClientConnector from './delayClientConnector';

import ReducerMachine from './reducerMachine';
import calculatorReducer from './calculatorReducer';

let machine = new ReducerMachine(calculatorReducer);
let connector = new DelayClientConnector('ws://localhost:23482');

let synchronizer = new Synchronizer(machine, connector);
connector.synchronizer = synchronizer;
connector.start();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const read = (msg = '> ') => {
  rl.question(msg, (answer) => {
    if (/^delay ([0-9]+)$/.test(answer)) {
      connector.delay = parseInt(/^delay ([0-9]+)$/.exec(answer)[1]);
      console.log('Delay set to ' + connector.delay);
    } else if (isNaN(parseFloat(answer))) {
      synchronizer.push(answer);
    } else {
      synchronizer.push(parseFloat(answer));
    }
    read();
  });
};

read();
