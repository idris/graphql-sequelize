'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.toGraphQL = toGraphQL;

var _graphql = require('graphql');

/**
 * Checks the type of the sequelize data type and
 * returns the corresponding type in GraphQL
 * @param  {Object} sequelizeType
 * @param  {Object} sequelizeTypes
 * @return {Function} GraphQL type declaration
 */

function toGraphQL(sequelizeType, sequelizeTypes) {
  var BOOLEAN = sequelizeTypes.BOOLEAN;
  var ENUM = sequelizeTypes.ENUM;
  var FLOAT = sequelizeTypes.FLOAT;
  var INTEGER = sequelizeTypes.INTEGER;
  var BIGINT = sequelizeTypes.BIGINT;
  var STRING = sequelizeTypes.STRING;
  var TEXT = sequelizeTypes.TEXT;
  var UUID = sequelizeTypes.UUID;
  var DATE = sequelizeTypes.DATE;
  var DATEONLY = sequelizeTypes.DATEONLY;
  var ARRAY = sequelizeTypes.ARRAY;
  var VIRTUAL = sequelizeTypes.VIRTUAL;
  var JSONB = sequelizeTypes.JSONB;

  // Regex for finding special characters
  var specialChars = /[^a-z\d]/i;

  if (sequelizeType instanceof BOOLEAN) return _graphql.GraphQLBoolean;
  if (sequelizeType instanceof FLOAT) return _graphql.GraphQLFloat;

  if (sequelizeType instanceof INTEGER || sequelizeType instanceof BIGINT) {
    return _graphql.GraphQLInt;
  }

  if (sequelizeType instanceof STRING || sequelizeType instanceof TEXT || sequelizeType instanceof UUID || sequelizeType instanceof DATE || sequelizeType instanceof DATEONLY || sequelizeType instanceof JSONB) {
    return _graphql.GraphQLString;
  }

  if (sequelizeType instanceof ARRAY) {
    var elementType = toGraphQL(sequelizeType.type, sequelizeTypes);
    return new _graphql.GraphQLList(elementType);
  }

  if (sequelizeType instanceof ENUM) {
    return new _graphql.GraphQLEnumType({
      values: sequelizeType.values.reduce(function (obj, value) {
        var sanitizedValue = value;
        if (specialChars.test(value)) {
          sanitizedValue = value.split(specialChars).reduce(function (reduced, val, idx) {
            var newVal = val;
            if (idx > 0) {
              newVal = '' + val[0].toUpperCase() + val.slice(1);
            }
            return '' + reduced + newVal;
          });
        }
        obj[sanitizedValue] = { value: value };
        return obj;
      }, {})
    });
  }

  if (sequelizeType instanceof VIRTUAL) {
    var returnType = sequelizeType.returnType ? toGraphQL(sequelizeType.returnType, sequelizeTypes) : _graphql.GraphQLString;
    return returnType;
  }

  throw new Error('Unable to convert ' + (sequelizeType.key || sequelizeType.toSql()) + ' to a GraphQL type');
}