'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _typeMapper = require('./typeMapper');

var typeMapper = _interopRequireWildcard(_typeMapper);

var _graphql = require('graphql');

module.exports = function (Model, options) {
  options = options || {};

  var result = _Object$keys(Model.rawAttributes).reduce(function (memo, key) {
    if (options.exclude && ~options.exclude.indexOf(key)) return memo;

    var attribute = Model.rawAttributes[key],
        type = attribute.type;

    memo[key] = {
      type: typeMapper.toGraphQL(type, Model.sequelize.constructor)
    };

    if (memo[key].type instanceof _graphql.GraphQLEnumType) {
      memo[key].type.name = '' + Model.name + key + 'EnumType';
    }

    if (attribute.allowNull === false || attribute.primaryKey === true) {
      memo[key].type = new _graphql.GraphQLNonNull(memo[key].type);
    }

    return memo;
  }, {});

  return result;
};