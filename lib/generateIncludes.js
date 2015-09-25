'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = generateIncludes;

var _argsToFindOptions = require('./argsToFindOptions');

var _argsToFindOptions2 = _interopRequireDefault(_argsToFindOptions);

var _relay = require('./relay');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function inList(list, attribute) {
  return ~list.indexOf(attribute);
}

function generateIncludes(simpleAST, type, root, options) {
  var result = { include: [], attributes: [], order: [] };

  type = type.ofType || type;
  options = options || {};

  _Object$keys(simpleAST.fields).forEach(function (key) {
    var association,
        name = simpleAST.fields[key].key || key,
        includeOptions,
        args = simpleAST.fields[key].args,
        includeResolver = type._fields[name].resolve,
        nestedResult,
        allowedAttributes,
        include;

    if (!includeResolver) return;

    if (includeResolver.$proxy) {
      while (includeResolver.$proxy) {
        includeResolver = includeResolver.$proxy;
      }
    }

    if (includeResolver.$passthrough) {
      var dummyResult = generateIncludes(simpleAST.fields[key], type._fields[key].type, root, options);

      result.include = result.include.concat(dummyResult.include);
      result.attributes = result.attributes.concat(dummyResult.attributes);
      result.order = result.order.concat(dummyResult.order);
      return;
    }

    association = includeResolver.$association;
    include = options.include && !(includeResolver.$options && includeResolver.$options.separate);

    if (association) {
      includeOptions = (0, _argsToFindOptions2['default'])(args, association.target);
      allowedAttributes = _Object$keys(association.target.rawAttributes);

      if (includeResolver.$before) {
        includeOptions = includeResolver.$before(includeOptions, args, root, {
          ast: simpleAST.fields[key],
          type: type
        });
      }

      if (association.associationType === 'BelongsTo') {
        result.attributes.push(association.foreignKey);
      } else {
        result.attributes.push(association.source.primaryKeyAttribute);
      }

      if (include && !includeOptions.limit) {
        if (includeOptions.order) {
          includeOptions.order.map(function (order) {
            order.unshift({
              model: association.target,
              as: association.options.as
            });

            return order;
          });

          result.order = (result.order || []).concat(includeOptions.order);
          delete includeOptions.order;
        }

        includeOptions.attributes = (includeOptions.attributes || []).concat(_Object$keys(simpleAST.fields[key].fields)).filter(inList.bind(null, allowedAttributes));

        includeOptions.attributes.push(association.target.primaryKeyAttribute);

        nestedResult = generateIncludes(simpleAST.fields[key], type._fields[key].type, root, includeResolver.$options);

        includeOptions.include = (includeOptions.include || []).concat(nestedResult.include);
        includeOptions.attributes = _lodash2['default'].unique(includeOptions.attributes.concat(nestedResult.attributes));

        result.include.push(_lodash2['default'].assign({ association: association }, includeOptions));
      }
    }
  });

  if ((0, _relay.isConnection)(type)) {
    (function () {
      var node = simpleAST.fields.edges.fields.node;
      var fields = [];
      _lodash2['default'].forIn(node.fields, function (field, key) {
        if (!field.fields.hasOwnProperty('edges')) {
          fields.push(key);
        }
      });
      result.attributes = result.attributes.concat(fields);
    })();
  }
  return result;
}

module.exports = exports['default'];