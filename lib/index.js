"use strict";

var expressions = require("angular-expressions");

// Expressions setup

expressions.filters.or = function (input, def) {
  return (input == null) ? def : input;
};

// Public API

PowerTemplate.BINDINGS_RE = /^\s*\[([\s\S]*)\]\s*$/;

// Factories

module.exports = PowerTemplate;

PowerTemplate.createListView = function (cfg) {
  var powerTemplates = function () {};

  forEachOwnProperty(cfg.templates, function (template, name) {
    powerTemplates[ name ] = new PowerTemplate(template, name);
    cfg.templates[ name ] = powerTemplates[ name ].template;
  });

  var listView = Ti.UI.createListView(cfg);

  listView.powerTemplates = powerTemplates;

  return listView;
};

PowerTemplate.createListSection = function (cfg) {
  return Ti.UI.createListSection(cfg);
};

PowerTemplate.createPowerTemplate = function (template) {
  return new PowerTemplate(template, template.name);
};

// Utilities

function forEachOwnProperty(obj, iterator, ctx) {
  if (obj != null) Object.getOwnPropertyNames(obj).forEach(function (name) {
    iterator.call(this, obj[ name ], name, obj);
  }, ctx);
}

// Classes

module.exports.PowerTemplate = PowerTemplate;

function PowerTemplate(template, name) {
  this.counter = 0;
  this.source = template;
  this.name = name || template.name;
  this.bindings = {};
  this.template = this.parseTemplate(this.source, 'properties');
}

PowerTemplate.prototype.parse = function (obj) {
  var listDataItem = {
    template: this.name
  };

  forEachOwnProperty(this.bindings, function (properties, bindId) {
    listDataItem[ bindId ] = {};
    forEachOwnProperty(properties, function (fn, name) {
      listDataItem[ bindId ][ name ] = fn(obj, bindId, name, listDataItem);
    });
  });

  return listDataItem;
};

PowerTemplate.prototype.parseTemplate = function (source, bindId) {
  var tmpl = {};

  bindId = bindId || source.bindId || this.generateBindId();

  forEachOwnProperty(source, function (value, name) {
    tmpl[ name ] = value;
  }, this);

  if (bindId !== 'properties') tmpl.bindId = bindId;

  if (tmpl.properties) {
    tmpl.properties = this.parseProperties(tmpl.properties, bindId);
  }

  if (tmpl.childTemplates) {
    tmpl.childTemplates = tmpl.childTemplates.map(function (child) {
      return this.parseTemplate(child);
    }, this);
  }

  return tmpl;
};

PowerTemplate.prototype.parseProperties = function (properties, bindId) {
  var result = {};
  var regexp = module.exports.BINDINGS_RE;

  forEachOwnProperty(properties, function (value, name) {
    var type = typeof value;
    var match = null;

    if (type === 'function') {
      this.store(bindId, name, value);
    }
    else if ((type === 'string') && (match = value.match(regexp))) {
      this.store(bindId, name, expressions.compile(match[ 1 ]));
    }
    else {
      result[ name ] = value;
    }
  }, this);

  return result;
};

PowerTemplate.prototype.store = function (bindId, name, fn) {
  if (this.bindings[ bindId ] == null) {
    this.bindings[ bindId ] = {};
  }

  this.bindings[ bindId ][ name ] = fn;
};

PowerTemplate.prototype.generateBindId = function () {
  return '__bindId' + (this.counter++);
};
