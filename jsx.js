/* global acorn: false, acornJSX: false, acornJSXWalk: false, exports: false,
          define: false, module: false, require: false, tern: false */
(function (mod) {
  'use strict';
  if (typeof module === 'object' && module.exports) { // CommonJS
    exports.initialize = function (ternDir) {
      /* eslint-disable global-require */
      var path = require('path');
      mod(require(path.resolve(ternDir, 'lib/infer')),
          require(path.resolve(ternDir, 'lib/tern')),
          require(path.resolve(ternDir, 'node_modules/acorn/dist/acorn')),
          require(path.resolve(ternDir, 'node_modules/acorn/dist/walk')),
          require('acorn-jsx/inject'),
          require('./inject'));
      /* eslint-enable global-require */
    };
    return;
  }
  if (typeof define === 'function' && define.amd) { // AMD
    define(['tern/lib/infer',
            'tern/lib/tern',
            'acorn/dist/acorn',
            'acorn/dist/walk',
            'acorn-jsx/inject',
            './inject'], mod);
    return;
  }
  mod(tern, tern, acorn, acorn.walk, acornJSX, acornJSXWalk); // Global
}(function (infer, tern, acorn, walk, acornJSX, acornJSXWalk) {

  'use strict';

  var preParse = function (text, options) {
    if (!options.plugins) {
      options.plugins = {};
    }
    options.plugins.jsx = true;
  };

  tern.registerPlugin('jsx', function (server) {
    // Patch the modules Tern uses to tolerate JSX.
    acornJSX(acorn);
    acornJSXWalk(walk.base);

    // Patch the vistor objects Tern uses to tolerate JSX.
    acornJSXWalk(infer.scopeGatherer);
    acornJSXWalk(infer.inferWrapper);
    acornJSXWalk(infer.searchVisitor);
    acornJSXWalk(infer.fullVisitor);
    acornJSXWalk(infer.refFindWalker);
    acornJSXWalk(infer.simpleWalker);

    // Allow renaming variables used in JSX.
    infer.refFindWalker.JSXIdentifier = function () {
      // Identifier is defined ad-hoc, so call the latest instance.
      var walker = infer.refFindWalker;
      return walker.Identifier.apply(walker, arguments);
    };

    // Allow finding the definition, type and docs of a JSXIdentifier.
    infer.typeFinder.JSXIdentifier = infer.typeFinder.Identifier;

    // infer.propName, but treat JSXIdentifier like Identifier.
    var propName = function (node) {
      var key = node.property || node.key;
      if (!node.computed && key.type === 'JSXIdentifier') {
        return key.name;
      }
      // Delegate to original method.
      return infer.propName.apply(infer, arguments);
    };

    // Re-implement Tern's internal findType.
    var findType = function (node, scope) {
      var finder = infer.typeFinder[node.type];
      return finder ? finder(node, scope) : infer.ANull;
    };

    // typeFinder.MemberExpression, but use our propName.  Allow finding the
    // definition and docs of a JSXMemberExpression property.
    infer.typeFinder.JSXMemberExpression = function (node, scope) {
      var propN = propName(node);
      var obj = findType(node.object, scope).getType();
      if (obj) {
        return obj.getProp(propN);
      }
      return infer.ANull;
    };

    server.on('preParse', preParse);
  });

}));
