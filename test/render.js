'use strict';

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

xdescribe('Renderable template', function () {

  var powerTemplate;
  var widget;

  it('should parse', function () {
    powerTemplate = new PowerTemplate({
      name: 'renderable_template',
      type: 'Ti.UI.View'
    });

    //widget = powerTemplate.renderWidget();
  });

  it('should have keept the type', function () {
    should(powerTemplate.template).have.a.property('type', 'Ti.UI.View');
  });

});
