'use strict';

var _graphql = require('graphql');

module.exports = function () {
  return {
    limit: {
      type: _graphql.GraphQLInt
    },
    order: {
      type: _graphql.GraphQLString
    }
  };
};