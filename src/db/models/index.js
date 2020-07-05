const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const ENV = process.env.NODE_ENV || 'development';
const config = require('@src/config/sequelize/config.js')[ENV];
const db = {};
let sequelize;

if (config.use_env_variable)
  sequelize = new Sequelize(config.use_env_variable, config);
else
  sequelize = new Sequelize(config);

fs.readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function (file) {
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

Sequelize.Validator.notNull = function (item) {
  return !this.isNull(item);
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
