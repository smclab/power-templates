"use strict";

var assign = Object.assign || require('object.assign');
var explodeTree = require('combinatorial-explosion').explodeTree;
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

// Classes

module.exports.PowerTemplate = PowerTemplate;

function PowerTemplate(template, name) {
  this.counter = 0;
  this.source = template;
  this.name = name || template.name;
  this.bindings = {};

  assign(this, this.parseSource(this.source));

  this.parse = bind(this.parse, this);
}

PowerTemplate.prototype.parse = function (obj) {
  if (this.conditions.length) {
    return this.parseWithConditions(obj);
  }
  else {
    return this.parseWithoutConditions(obj);
  }
};

PowerTemplate.prototype.parseWithoutConditions = function (obj) {
  var listDataItem = {
    template: this.name
  };

  forEachOwnProperty(this.bindings, function (properties, bindId) {
    evaluateBindIds(obj, listDataItem, bindId, properties);
  });

  return listDataItem;
};

PowerTemplate.prototype.parseWithConditions = function (obj) {
  var that = this;
  var i = this.conditions.length;
  var condition;

  var listDataItem = null;

  while (!listDataItem && (--i) >= 0) {
    condition = this.conditions[ i ];
    if (condition.marker.every(tester)) {
      listDataItem = {
        template: condition.name
      };
    }
  }

  condition.bindIds.forEach(function (bindId) {
    var properties = that.bindings[ bindId ];
    if (!properties) return;
    evaluateBindIds(obj, listDataItem, bindId, properties);
  });

  return listDataItem;

  function tester(bindId) {
    return that.markers[ bindId ](obj);
  }
};

function evaluateBindIds(obj, listDataItem, bindId, properties) {
  listDataItem[ bindId ] = {};
  forEachOwnProperty(properties, function (fn, name) {
    listDataItem[ bindId ][ name ] = fn(obj, bindId, name, listDataItem);
  });
}

PowerTemplate.prototype.parseSource = function (source) {
  var template = this.parseTemplate(source, 'properties');

  return this.parseConditions(template);
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

  if (tmpl.if) {
    tmpl.if = this.getValue(tmpl.if);
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
  var markers = {};
  var conditions = [];

  var name = this.name;

  templates[ name ] = template;

  var trees = explodeTree(template, {
    fork: forkNode,
    extract: extractNodeChildren,
    compose: function (node, children) {
      if (!node) return null;

      node = clone(node);

      if (node.if) {
        markers[ node.marker ] = getBooleanMarker(node.bindId, node.if);
      }

      delete node.if;

      children = children.filter(Boolean);

      node.marker ? (node.marker = [ node.marker ]) : (node.marker = []);
      node.marker = children.reduce(markerReducer, node.marker).sort();

      node.bindIds || (node.bindIds = [ node.bindId || 'properties' ]);
      node.bindIds = children.reduce(bindIdsReducer, node.bindIds);

      if (!node.marker.length) {
        delete node.marker;
      }

      if (children.length) {
        node.childTemplates = children;
      }
      else {
        delete node.childTemplates;
      }

      return node;
    }
  });

  if (trees.length === 1) {
    templates[ name ] = trees[ 0 ];
    delete templates[ name ].marker;
    delete templates[ name ].bindIds;
    conditions = [];
  }
  else {
    trees.forEach(function (tree) {
      var marker = tree.marker;
      var bindIds = tree.bindIds;
      var treeName = !marker ? name : [ name ].concat(marker).join('_');

      delete tree.marker;
      delete tree.bindIds;

      templates[ treeName ] = tree;
      conditions[ conditions.length ] = {
        name: treeName,
        bindIds: bindIds || [],
        marker: marker || []
      };
    });
  }

  return { templates: templates, conditions: conditions, markers: markers };
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

// Extracted functions (perf)

function forkNode(node) {
  if (node.if) {
    return [ null, assign({ marker: node.bindId }, node) ];
  }
  else {
    return [ node ];
  }
}

function extractNodeChildren(node) {
  return (node && node.childTemplates) || [];
}

function markerReducer(memo, child) {
  return child.marker ? memo.concat(child.marker) : memo;
}

function bindIdsReducer(memo, child) {
  var bindIds = child.bindIds;
  delete child.bindIds;
  return bindIds ? memo.concat(bindIds) : memo.concat(child.bindId);
}

// Generic Utils

function getBooleanMarker(bindId, fn) {
  return function () {
    return fn.apply(this, arguments) ? bindId : '';
  };
}

function clone(o) {
  return assign({}, o);
}

function forEachOwnProperty(obj, iterator, ctx) {
  if (obj != null) Object.getOwnPropertyNames(obj).forEach(function (name) {
    iterator.call(this, obj[ name ], name, obj);
  }, ctx);
}

function bind(fn, ctx) {
  if (fn.bind) return fn.bind(ctx);
  else return function () {
    return fn.apply(ctx, arguments);
  };
}
