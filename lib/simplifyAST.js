'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function deepMerge(a, b) {
  return _lodash2['default'].merge(a, b, function (a, b) {
    if (a && a.fields && b && b.fields) {
      a.fields = deepMerge(a.fields, b.fields);
      return a;
    }
    return a && a.fields && a || b && b.fields && b;
  });
}

function hasFragments(info) {
  return info.fragments && _Object$keys(info.fragments).length > 0;
}

function isFragment(info, ast) {
  return hasFragments(info) && info.fragments[ast.name.value] && ast.kind !== 'FragmentDefinition';
}

module.exports = function simplyAST(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var ast = _x,
        info = _x2,
        parent = _x3;
    selections = undefined;
    _again = false;

    var selections;
    info = info || {};

    if (ast.selectionSet) selections = ast.selectionSet.selections;
    if (Array.isArray(ast)) selections = ast;

    if (isFragment(info, ast)) {
      _x = info.fragments[ast.name.value];
      _x2 = info;
      _x3 = undefined;
      _again = true;
      continue _function;
    }

    if (!selections) return {
      fields: {},
      args: {}
    };

    return selections.reduce(function (simpleAST, selection) {
      var name = selection.name.value,
          alias = selection.alias && selection.alias.value,
          key = alias || name;

      if (selection.kind === 'FragmentSpread') {
        simpleAST = deepMerge(simpleAST, simplyAST(selection, info));
        return simpleAST;
      }

      simpleAST.fields[key] = simpleAST.fields[key] || {};
      simpleAST.fields[key] = deepMerge(simpleAST.fields[key], simplyAST(selection, info, simpleAST.fields[key]));

      if (alias) {
        simpleAST.fields[key].key = name;
      }

      simpleAST.fields[key].args = selection.arguments.reduce(function (args, arg) {
        args[arg.name.value] = arg.value.value;
        return args;
      }, {});

      if (parent) {
        Object.defineProperty(simpleAST.fields[key], '$parent', { value: parent, enumerable: false });
      }

      return simpleAST;
    }, {
      fields: {},
      args: {}
    });
  }
};