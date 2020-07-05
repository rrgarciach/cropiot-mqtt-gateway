require('module-alias/register');
const _get = require('lodash/get');
const mqtt = require('mqtt');
const aedes = require('aedes');
const models = require('@models');

const PORT = 1883;

const proxyBroker = new aedes.Server();
const server = require('net').createServer(proxyBroker.handle);

// fired when a message is published
proxyBroker.on('publish', async function (packet, client) {
  console.log('Client \x1b[31m' + (client ? client.id : 'BROKER_' + proxyBroker.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker', proxyBroker.id);
  saveDate(packet, client);
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

function saveDate(packet, client) {
  const username = _get(client, 'username', null);
  const topic = _get(packet, 'topic');
  const message = _get(packet, 'payload').toString();
  return models.Telemetry.create({data: message})
    .then(() => pushMessage(username, topic, message))
    .catch(error => {
      console.error(error);
      return Promise.resolve();
    });
}

function pushMessage(username, topic, message) {
  const mainClient = mqtt.connect({
    protocol: 'mqtt',
    host: 'demo.thingsboard.io',
    port: '1883',
    username,
  });
  mainClient.on('connect', e => {
    console.log(`connected to main broker`);
    console.log(`Pushing message on behalf of ${username} message ${message} on topic ${topic}`);
    mainClient.publish(topic, message);
  });
  mainClient.on('publish', e => {
    console.log(`published to main broker`);
  });
  return Promise.resolve();
}
