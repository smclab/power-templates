"use strict";

var should = require('should');

var PowerTemplate;

try {
  PowerTemplate = require('../lib');
}
catch (e) {
  PowerTemplate = require('power-templates');
}

if (typeof Ti === 'undefined') {
  global.Ti = {};
  global.Ti.UI = {};
  global.Ti.UI.createListView = function (cfg) {
    return cfg;
  };
}

describe("APIs", function () {

  it("should have `createListView`", function () {
    PowerTemplate.should.have.property('createListView');
    PowerTemplate.createListView.should.be.a.Function;
  });

  it("should have `createListSection`", function () {
    PowerTemplate.should.have.property('createListSection');
    PowerTemplate.createListSection.should.be.a.Function;
  });

  it("should have `createPowerTemplate`", function () {
    PowerTemplate.should.have.property('createPowerTemplate');
    PowerTemplate.createPowerTemplate.should.be.a.Function;
  });

});

describe("PowerTemplates", function () {

  it("should have a `name`", function () {
    new PowerTemplate({ name: "x" }).should.have.property('name', 'x');
  });

  it("should have a `template`", function () {
    new PowerTemplate({}).should.have.property('templates');
  });

  it("should support bracket notation (and filters)", function () {
    new PowerTemplate({
      "name": "x",
      "properties": {
        "itemId": "[ value ]",
        "color": "[ idontexist | or: 'red' ]"
      }
    }).parse({ value: 42 }).should.eql({
      template: 'x',
      properties: {
        itemId: 42,
        color: 'red'
      }
    });
  });

  it("should support function values", function () {
    new PowerTemplate({
      "name": "x",
      "properties": {
        "itemId": function (ctx) { return ctx.value; }
      }
    }).parse({ value: 42 }).should.eql({
      template: 'x',
      properties: {
        itemId: 42
      }
    });
  });

  it("should support function values (with arguments)", function () {
    new PowerTemplate({
      "name": "x",
      "properties": {
        "itemId": function (ctx, bindId, name, listDataItem) {
          return [ctx.value, bindId, name, listDataItem.template].join('/');
        }
      }
    }).parse({ value: 42 }).should.eql({
      template: 'x',
      properties: {
        itemId: "42/properties/itemId/x"
      }
    });
  });

  it("should parse even as a function [#1]", function () {
    var parse = new PowerTemplate({ "name": "x" }).parse;

    parse({ }).should.eql({ template: 'x' });
  });

  it("should parse `childTemplates`", function () {
    var powerTemplate = new PowerTemplate({
      "name": "x",
      "properties": {
        "itemId": "[ value ]"
      },
      "childTemplates": [
        {
          "type": "Ti.UI.Label",
          "properties": {
            "text": "[ value ]",
            "color": "[ productId | or: 'red' ]"
          }
        }
      ]
    });

    powerTemplate.templates[ "x" ].should.eql({
      name: 'x',
      properties: {},
      childTemplates: [
        {
          type: 'Ti.UI.Label',
          properties: {},
          bindId: 'bindId0'
        }
      ]
    });

    powerTemplate.parse({
      value: 42
    }).should.eql({
      template: 'x',
      properties: {
        itemId: 42
      },
      bindId0: {
        text: 42,
        color: 'red'
      }
    });
  });

  var powerTemplateWithIfs;

  it("should support `if` conditions", function () {
    powerTemplateWithIfs = new PowerTemplate({
      "name": "x",
      "properties": {
        "value": "[ x ]"
      },
      "childTemplates": [
        {
          "type": "Ti.UI.Label",
          "if": "[ bracket.notation ]",
          "properties": {
            "value": "[ x ]"
          },
          "childTemplates": [
            {
              "type": "Ti.UI.Label",
              "properties": {
                "value": "[ x ]"
              },
              "if": function (o) { return o && o.func && o.func.notation }
            }
          ]
        }
      ]
    });

    powerTemplateWithIfs.templates.should.have.property('x');
    powerTemplateWithIfs.templates.should.have.property('x_bindId0');
    powerTemplateWithIfs.templates.should.have.property('x_bindId0_bindId1');
  });

  it("should manage conditions during parse (1)", function () {
    powerTemplateWithIfs.parse({
      //
    }).should.eql({
      template: 'x',
      properties: { value: undefined }
    });
  });

  it("should manage conditions during parse (2)", function () {
    powerTemplateWithIfs.parse({
      bracket: { notation: true }
    }).should.eql({
      template: 'x_bindId0',
      properties: { value: undefined },
      bindId0: { value: undefined }
    });
  });

  it("should manage conditions during parse (3)", function () {
    powerTemplateWithIfs.parse({
      func: { notation: true }
    }).should.eql({
      template: 'x',
      properties: { value: undefined }
    });
  });

  it("should manage conditions during parse (4)", function () {
    powerTemplateWithIfs.parse({
      bracket: { notation: true },
      func: { notation: true }
    }).should.eql({
      template: 'x_bindId0_bindId1',
      properties: { value: undefined },
      bindId0: { value: undefined },
      bindId1: { value: undefined }
    });
  });

  it("should manage hard conditions", function () {
    function o(id) {
      var cfg = {};
      cfg.bindId = id;
      cfg.type = 'Ti.UI.Label';
      cfg.if = '[' + id + ']';
      cfg.childTemplates = [].slice.call(arguments, 1);
      return cfg;
    }

    var powerTemplate = new PowerTemplate({
      "name": "tmpl",
      "properties": {},
      "childTemplates": [
        o('a', o('b')),
        o('c', o('d')),
        o('e', o('f'))
      ]
    });

    powerTemplate.parse({ }).template.should.eql("tmpl");
    powerTemplate.parse({ a: 1 }).template.should.eql("tmpl_a");
    powerTemplate.parse({ c: 1 }).template.should.eql("tmpl_c");
    powerTemplate.parse({ e: 1 }).template.should.eql("tmpl_e");
    powerTemplate.parse({ a: 1, c: 1 }).template.should.eql("tmpl_a_c");
    powerTemplate.parse({ c: 1, e: 1 }).template.should.eql("tmpl_c_e");
    powerTemplate.parse({ a: 1, e: 1 }).template.should.eql("tmpl_a_e");
    powerTemplate.parse({ a: 1, c: 1, e: 1 })
      .template.should.eql("tmpl_a_c_e");

    powerTemplate.parse({ a: 1, b: 1, c: 1, e: 1 })
      .template.should.eql("tmpl_a_b_c_e");
  });

  it("should support `if` conditions in `createListView`", function () {
    var listView = PowerTemplate.createListView({
      templates: {
        "x": {
          childTemplates: [
            {
              type: 'Ti.UI.Label',
              bindId: 'y',
              if: "[ x ]",
              properties: {}
            }
          ]
        }
      }
    });

    listView.powerTemplates.should.have.property('x');
    listView.powerTemplates.x.should.have.property('templates');
    listView.powerTemplates.x.templates.should.have.property('x');
    listView.powerTemplates.x.templates.should.have.property('x_y');
  });
});
