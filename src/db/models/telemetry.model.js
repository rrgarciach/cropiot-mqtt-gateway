const _omit = require('lodash/omit');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    'Telemetry',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: 'telemetries',
      timestamps: true,
      underscored: true,
      charset: 'utf8',
      collate: 'utf8_unicode_ci',
    }
  );

  Model.associate = (models) => {};

  Model.prototype.toJSON = function () {
    const toDelete = ['created_at', 'updated_at', 'deleted_at'];
    return _omit(this.get(), toDelete);
  };

  return Model;
};
