"use strict";

var assign = Object.assign || require('object.assign');
//var explodeTree = require('combinatorial-explosion').explodeTree;
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
    assign(cfg.templates, powerTemplates[ name ].templates);
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
  this.templates = this.parseSource(this.source);
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

PowerTemplate.prototype.parseSource = function (source) {
  var template = this.parseTemplate(source, 'properties');

  var templates = this.parseConditions(template);

  return templates;
};

// Simple parsing

PowerTemplate.prototype.parseTemplate = function (source, bindId) {
  var tmpl = {};

  bindId || (bindId = this.generateBindId());

  forEachOwnProperty(source, function (value, name) {
    tmpl[ name ] = value;
  }, this);

  if (bindId !== 'properties') tmpl.bindId = bindId;

  if (tmpl.properties) {
    tmpl.properties = this.parseProperties(tmpl.properties, bindId);
  }

  if (tmpl.childTemplates) {
    tmpl.childTemplates = tmpl.childTemplates.map(function (child) {
      return this.parseTemplate(child, child.bindId);
    }, this);
  }

  return tmpl;
};

PowerTemplate.prototype.parseProperties = function (properties, bindId) {
  var result = {};

  forEachOwnProperty(properties, function (value, name) {
    value = this.getValue(value);

    if (typeof value === 'function') {
      this.store(bindId, name, value);
    }
    else {
      result[ name ] = value;
    }
  }, this);

  return result;
};

// Condition Parsing

PowerTemplate.prototype.parseConditions = function (template) {
  var templates = {};
  /*var conditions = [];*/

  this.walkChildrenConditions(template.childTemplates);

  templates[ template.name ] = template;

  return templates;
};

PowerTemplate.prototype.walkChildrenConditions = function (children) {
  if (!children) {
    return;
  }

  children.forEach(function (child) {

    // Extracting the condition from `if` attribute
    var condition = this.getValue(child.if);

    // Removing the condition
    delete child.if;

    // We accept only functions (or expressions)
    if (typeof condition !== 'function') {
      return;
    }

    // XXX

  }, this);
};

// Local Utils

PowerTemplate.prototype.getValue = function (value) {
  var regexp = module.exports.BINDINGS_RE;
  var type = typeof value;
  var match = null;

  if (type === 'function') {
    return value;
  }
  else if ((type === 'string') && (match = value.match(regexp))) {
    return expressions.compile(match[ 1 ]);
  }
  else {
    return value;
  }
};

PowerTemplate.prototype.store = function (bindId, name, fn) {
  if (this.bindings[ bindId ] == null) {
    this.bindings[ bindId ] = {};
  }

  this.bindings[ bindId ][ name ] = fn;
};

PowerTemplate.prototype.generateBindId = function () {
  return 'bindId' + (this.counter++);
};
