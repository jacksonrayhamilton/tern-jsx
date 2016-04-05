/* global define: false, module: false */
(function (mod) {
  'use strict';
  if (typeof module === 'object' && module.exports) { // CommonJS
    module.exports = mod();
    return;
  }
  if (typeof define === 'function' && define.amd) { // AMD
    define(mod);
    return;
  }
  var global = Function('return this;')(); // eslint-disable-line no-new-func
  global.acornJSXWalk = mod(); // Global
}(function () {

  'use strict';

  var ignore = function () {};

  var inject = function (visitor) {

    visitor.JSXIdentifier = ignore;

    visitor.JSXMemberExpression = function (node, st, c) {
      c(node.object, st);
      // JSX does not have computed properties, and the default MemberExpression
      // vistor only visits computed properties, so don't visit any JSX
      // properties either.
    };

    // I'm not entirely sure how to walk this, but traversing its children just
    // doesn't feel quite "right"...
    visitor.JSXNamespacedName = ignore;

    visitor.JSXEmptyExpression = ignore;

    visitor.JSXExpressionContainer = function (node, st, c) {
      c(node.expression, st);
    };

    visitor.JSXOpeningElement = function (node, st, c) {
      c(node.name, st);
      for (var i = 0; i < node.attributes.length; i += 1) {
        c(node.attributes[i], st);
      }
    };

    visitor.JSXClosingElement = function (node, st, c) {
      c(node.name, st);
    };

    visitor.JSXAttribute = function (node, st, c) {
      // The default Property visitor only visits computed Property key nodes,
      // so behave similarly here: There are no computed JSXAttribute name
      // nodes, so don't traverse them.
      if (node.value) {
        c(node.value, st);
      }
    };

    visitor.JSXSpreadAttribute = function (node, st, c) {
      c(node.argument, st);
    };

    visitor.JSXElement = function (node, st, c) {
      c(node.openingElement, st);
      for (var i = 0; i < node.children.length; i += 1) {
        c(node.children[i], st);
      }
      if (node.closingElement) {
        c(node.closingElement, st);
      }
    };

  };

  return inject;

}));
