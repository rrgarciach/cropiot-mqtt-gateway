module.exports = {
  development: {
    storage: 'db/cropiot-mqtt-gateway.sqlite',
    dialect: 'sqlite',
    logging: console.log,
  },
  test: {
    storage: 'db/cropiot-mqtt-gateway.sqlite',
    dialect: 'sqlite',
  },
  production: {
    storage: 'db/cropiot-mqtt-gateway.sqlite',
    dialect: 'sqlite',
    logging: console.log,
  },
};
