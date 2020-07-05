require('module-alias/register');
const _get = require('lodash/get');
const mqtt = require('mqtt');
const aedes = require('aedes');
const models = require('@models');

const PORT = 1883;
let mainClientsMap = new Map();

const proxyBroker = new aedes.Server();
const server = require('net').createServer(proxyBroker.handle);

// fired when a message is published
proxyBroker.on('publish', async function (packet, client) {
  console.log('Client \x1b[31m' + (client ? client.id : 'BROKER_' + proxyBroker.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker', proxyBroker.id);
  saveData(packet, client);
});

proxyBroker.on('closed', () => {
  console.log('closed')
});

proxyBroker.on('client', client => {
  console.log(`client: ${client.id} connected`)
});

proxyBroker.authenticate = function (client, username, password, callback) {
  if (!username) {
    let error = new Error('Auth error');
    error.returnCode = 4;
    return callback(error, null);
  }
  client.username = username;
  return callback(null, true);
};

server.listen(PORT, function () {
  console.log('server started and listening on port ', PORT);
});

function saveData(packet, client) {
  const username = _get(client, 'username', null);
  const topic = _get(packet, 'topic');
  const message = _get(packet, 'payload').toString();
  if (!username) {
    console.log(`No username given. Topic: ${topic} Message: ${message}`);
    return;
  }
  return Promise.all([
    models.Telemetry.create({data: message}),
    pushMessage(username, topic, message),
  ])
    .catch(error => {
      console.error(error);
      return Promise.resolve();
    });
}

function pushMessage(username, topic, message) {
  const protocol = process.env.MAIN_BROKER_PROTOCOL || 'mqtt';
  const host = process.env.MAIN_BROKER_HOST || 'demo.thingsboard.io';
  const port = process.env.MAIN_BROKER_PORT || 1883;
  if (!mainClientsMap.has(username)) {
    const mainClient = mqtt.connect({
      protocol,
      host,
      port,
      username,
    });
    mainClient.on('connect', e => {
      console.log(`Client ${username} connected to main broker ${host}`);
    });
    mainClient.on('close', () => {
      console.log(`Client ${username} disconnected from main broker ${host}`);
    });
    mainClientsMap.set(username, mainClient);
  }
  console.log(`Pushing message on behalf of ${username} message ${message} on topic ${topic} to  main broker ${host}`);
  mainClientsMap.get(username).publish(topic, message);
  return Promise.resolve();
}
