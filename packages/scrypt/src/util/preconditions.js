

import errors from "../errors/index.js";
import _ from "../util/_.js";

const _export_checkState_ = function (condition, message) {
  if (!condition) {
    throw new errors.InvalidState(message);
  }
};
export { _export_checkState_ as checkState };
const _export_checkArgument_ = function (
  condition,
  argumentName,
  message,
  docsPath,
) {
  if (!condition) {
    throw new errors.InvalidArgument(argumentName, message, docsPath);
  }
};
export { _export_checkArgument_ as checkArgument };
const _export_checkArgumentType_ = function (argument, type, argumentName) {
  argumentName = argumentName || "(unknown name)";
  if (_.isString(type)) {
    if (type === "Buffer") {
      var buffer = require("buffer"); // './buffer' fails on cordova & RN
      if (!buffer.Buffer.isBuffer(argument)) {
        throw new errors.InvalidArgumentType(argument, type, argumentName);
      }
    } else if (typeof argument !== type) { // eslint-disable-line
      throw new errors.InvalidArgumentType(argument, type, argumentName);
    }
  } else {
    if (!(argument instanceof type)) {
      throw new errors.InvalidArgumentType(argument, type.name, argumentName);
    }
  }
};
export { _export_checkArgumentType_ as checkArgumentType };
