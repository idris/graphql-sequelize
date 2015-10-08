'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.idFetcher = idFetcher;
exports.isConnection = isConnection;
exports.handleConnection = handleConnection;
exports.sequelizeNodeInterface = sequelizeNodeInterface;

var _graphqlRelay = require('graphql-relay');

var NodeTypeMapper = (function () {
  function NodeTypeMapper(sequelize) {
    var _this = this;

    _classCallCheck(this, NodeTypeMapper);

    this.models = _Object$keys(sequelize.models);
    this.models.forEach(function (model) {
      _this[model] = null;
    });
  }

  _createClass(NodeTypeMapper, [{
    key: 'mapTypes',
    value: function mapTypes(types) {
      var _this2 = this;

      _Object$keys(types).forEach(function (type) {
        _this2[type] = types[type];
      });
    }
  }]);

  return NodeTypeMapper;
})();

function idFetcher(sequelize, nodeTypeMapper) {
  return function (globalId) {
    var _fromGlobalId = (0, _graphqlRelay.fromGlobalId)(globalId);

    var type = _fromGlobalId.type;
    var id = _fromGlobalId.id;

    var models = _Object$keys(sequelize.models);
    if (models.some(function (model) {
      return model === type;
    })) {
      return sequelize.models[type].findById(id);
    }
    if (nodeTypeMapper[type]) {
      return nodeTypeMapper[type];
    }
    return null;
  };
}

function isConnection(type) {
  return typeof type.name !== 'undefined' && type.name.endsWith('Connection');
}

function handleConnection(values, args) {
  return (0, _graphqlRelay.connectionFromArray)(values, args);
}

function sequelizeNodeInterface(sequelize) {
  var nodeTypeMapper = new NodeTypeMapper(sequelize);
  var nodeObjects = (0, _graphqlRelay.nodeDefinitions)(idFetcher(sequelize, nodeTypeMapper), function (obj) {
    var name = obj.Model ? obj.Model.options.name.singular : obj.name;
    return nodeTypeMapper[name];
  });
  return _extends({
    nodeTypeMapper: nodeTypeMapper
  }, nodeObjects);
}