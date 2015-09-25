'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = argsToFindOptions;

function argsToFindOptions(args, target) {
  var result = {},
      targetAttributes = _Object$keys(target.rawAttributes);

  if (args) {
    _Object$keys(args).forEach(function (key) {
      if (~targetAttributes.indexOf(key)) {
        result.where = result.where || {};
        result.where[key] = args[key];
      }

      if (key === 'limit' && args[key]) {
        result.limit = args[key];
      }

      if (key === 'offset' && args[key]) {
        result.offset = args[key];
      }

      if (key === 'order' && args[key]) {
        result.order = [[args[key]]];
      }
    });
  }

  return result;
}

module.exports = exports['default'];