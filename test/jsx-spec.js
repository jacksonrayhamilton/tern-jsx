'use strict';

var assert = require('assert');
var defaults = require('lodash/defaults');
var flatten = require('lodash/flatten');
var path = require('path');
var jsx = require('../jsx');
var tern = require('tern');

var ternDir = path.resolve(__dirname, '../node_modules/tern');

describe('jsx', function () {

  var createServer = function () {
    jsx.initialize(ternDir);
    return new tern.Server({
      plugins: {
        jsx: {}
      }
    });
  };

  var joinLines = function () {
    return flatten(Array.prototype.slice.call(arguments)).join('\n') + '\n';
  };

  var server;

  beforeEach(function () {
    server = createServer();
  });

  var fixtures = {
    selfClosing: (function () {
      var code = joinLines(
        'var Element = {};',
        'void <Element/>;'
      );
      return {
        code: code,
        definition: code.indexOf('var Element') + 'var '.length,
        refs: [code.indexOf('<Element/>') + '<'.length]
      };
    }()),
    closed: (function () {
      var code = joinLines(
        'var Element = {};',
        'void <Element></Element>;'
      );
      return {
        code: code,
        definition: code.indexOf('var Element') + 'var '.length,
        refs: [
          code.indexOf('<Element>') + '<'.length,
          code.indexOf('</Element>') + '</'.length
        ]
      };
    }()),
    member: (function () {
      var code = joinLines(
        'var Element = {Property: 0};',
        'void <Element.Property/>;'
      );
      return {
        code: code,
        definition: code.indexOf('{Property') + '{'.length,
        refs: [code.indexOf('<Element.Property/>') + '<Element.'.length]
      };
    }()),
    attribute: (function () {
      var code = joinLines(
        'var value;',
        'void <Element attribute={value}/>;'
      );
      return {
        code: code,
        definition: code.indexOf('var value') + 'var '.length,
        refs: [code.indexOf('{value}') + '{'.length]
      };
    }()),
    spread: (function () {
      var code = joinLines(
        'var value;',
        'void <Element {...value}/>;'
      );
      return {
        code: code,
        definition: code.indexOf('var value') + 'var '.length,
        refs: [code.indexOf('{...value}') + '{...'.length]
      };
    }())
  };

  describe('definition', function () {

    var assertDefinition = function (options) {
      var code = options.code;
      var definition = options.definition;
      var refs = options.refs;
      server.addFile('definition.js', code);
      refs.forEach(function (ref) {
        server.request({
          query: {
            type: 'definition',
            file: 'definition.js',
            end: ref
          }
        }, function (err, res) {
          if (err) {
            throw err;
          }
          assert.strictEqual(res.start, definition);
        });
      });
    };

    it('should find the definition of a self-closing JSXElement', function () {
      assertDefinition(fixtures.selfClosing);
    });

    it('should find the definition of a closed JSXElement', function () {
      assertDefinition(fixtures.closed);
    });

    it('should find the definition of a JSXMemberExpression property', function () {
      assertDefinition(fixtures.member);
    });

    it('should find the definition of a JSXAttribute value', function () {
      assertDefinition(fixtures.attribute);
    });

    it('should find the definition of a JSXSpreadAttribute value', function () {
      assertDefinition(fixtures.spread);
    });

  });

  describe('refs', function () {

    var assertRefs = function (options) {
      var code = options.code;
      var definition = options.definition;
      var refs = options.refs;
      var from = options.from;
      server.addFile('refs.js', code);
      var fromWhere =
          from === 'definition' ? [definition] :
          from === 'refs' ? refs :
          undefined;
      fromWhere.forEach(function (currentRef) {
        server.request({
          query: {
            type: 'refs',
            file: 'refs.js',
            end: currentRef
          }
        }, function (err, res) {
          if (err) {
            throw err;
          }
          assert.strictEqual(res.refs[0].start, definition);
          refs.forEach(function (ref, index) {
            assert.strictEqual(res.refs[1 + index].start, ref);
          });
        });
      });
    };

    describe('from definition', function () {

      var assertRefsFromDefinition = function (options) {
        assertRefs(defaults({from: 'definition'}, options));
      };

      it('should find the refs of a self-closing JSXElement', function () {
        assertRefsFromDefinition(fixtures.selfClosing);
      });

      it('should find the refs of a closed JSXElement', function () {
        assertRefsFromDefinition(fixtures.closed);
      });

      // To make this pass we probably need to re-implement infer.findPropRefs
      // to support JSXMemberExpression (or its walker needs to be made
      // extensible, somehow).
      it.skip('should find the refs of a JSXMemberExpression property', function () {
        assertRefsFromDefinition(fixtures.member);
      });

      it('should find the refs of a JSXAttribute value', function () {
        assertRefsFromDefinition(fixtures.attribute);
      });

      it('should find the refs of a JSXSpreadAttribute value', function () {
        assertRefsFromDefinition(fixtures.spread);
      });

    });

    describe('from refs', function () {

      var assertRefsFromRefs = function (options) {
        assertRefs(defaults({from: 'refs'}, options));
      };

      // To pass the next three tests we either need to patch Tern's refs query,
      // or (probably preferable) refactor Tern's findRefs function to dispatch
      // on expression node type instead.

      it.skip('should find the refs of a self-closing JSXElement', function () {
        assertRefsFromRefs(fixtures.selfClosing);
      });

      it.skip('should find the refs of a closed JSXElement', function () {
        assertRefsFromRefs(fixtures.closed);
      });

      it.skip('should find the refs of a JSXMemberExpression property', function () {
        assertRefsFromRefs(fixtures.member);
      });

      it('should find the refs of a JSXAttribute value', function () {
        assertRefsFromRefs(fixtures.attribute);
      });

      it('should find the refs of a JSXSpreadAttribute value', function () {
        assertRefsFromRefs(fixtures.spread);
      });

    });

  });

});
