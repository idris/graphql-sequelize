'use strict';

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _typeMapper = require('./typeMapper');

var typeMapper = _interopRequireWildcard(_typeMapper);

var _graphql = require('graphql');

module.exports = function (Model) {
  var result = {},
      key = Model.primaryKeyAttribute,
      attribute = Model.rawAttributes[key],
      type;

  type = new _graphql.GraphQLNonNull(typeMapper.toGraphQL(attribute.type, Model.sequelize.constructor));

  result[key] = {
    type: type
  };

  return result;
};