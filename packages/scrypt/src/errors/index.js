let _module_exports_ = {};
export { _module_exports_ as default };


import _ from "../util/_.js";

function format(message, args) {
  return message
    .replace("{0}", args[0])
    .replace("{1}", args[1])
    .replace("{2}", args[2]);
}
var traverseNode = function (parent, errorDefinition) {
  class NodeError extends parent {
    constructor() {
      if (_.isString(errorDefinition.message)) {
        this.message = format(errorDefinition.message, arguments);
      } else if (_.isFunction(errorDefinition.message)) {
        this.message = errorDefinition.message.apply(null, arguments);
      } else {
        throw new Error("Invalid error definition for " + errorDefinition.name);
      }
      this.stack = this.message + "\n" + (new Error()).stack;
    }
  }

  NodeError.prototype.name = parent.prototype.name + errorDefinition.name;
  parent[errorDefinition.name] = NodeError;
  if (errorDefinition.errors) {
    childDefinitions(NodeError, errorDefinition.errors);
  }
  return NodeError;
};

var childDefinitions = function (parent, childDefinitions) {
  _.each(childDefinitions, function (childDefinition) {
    traverseNode(parent, childDefinition);
  });
};

var traverseRoot = function (parent, errorsDefinition) {
  childDefinitions(parent, errorsDefinition);
  return parent;
};

var bsv = {};
bsv.Error = function () {
  this.message = "Internal error";
  this.stack = this.message + "\n" + (new Error()).stack;
};
bsv.Error.prototype = Object.create(Error.prototype);
bsv.Error.prototype.name = "bsv.Error";

import data from "./spec.js";
// traverseRoot(bsv.Error, data)

_module_exports_ = bsv.Error;

_module_exports_.extend = function (spec) {
  return traverseNode(bsv.Error, spec);
};
