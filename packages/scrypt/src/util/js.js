import _ from "../util/_.js";
import * as $ from "./preconditions.js";
import { Buffer } from "buffer";

/**
 * Determines whether a string contains only hexadecimal values
 *
 * @name JSUtil.isHexa
 * @param {string} value
 * @return {boolean} true if the string is the hexa representation of a number
 */
var isHexa = function isHexa(value) {
  if (!_.isString(value)) {
    return false;
  }
  return /^[0-9a-fA-F]+$/.test(value);
};

/**
 * @namespace JSUtil
 */
const _export_isValidJSON_ = function isValidJSON(arg) {
  var parsed;
  if (!_.isString(arg)) {
    return false;
  }
  try {
    parsed = JSON.parse(arg);
  } catch (e) {
    return false;
  }
  if (typeof (parsed) === "object") {
    return true;
  }
  return false;
};
export { _export_isValidJSON_ as isValidJSON };
export { isHexa };
export { isHexa as isHexaString };
const _export_defineImmutable_ = function defineImmutable(target, values) {
  Object.keys(values).forEach(function (key) {
    Object.defineProperty(target, key, {
      configurable: false,
      enumerable: true,
      value: values[key],
    });
  });
  return target;
};
export { _export_defineImmutable_ as defineImmutable };
const _export_isNaturalNumber_ = function isNaturalNumber(value) {
  return typeof value === "number" &&
    isFinite(value) &&
    Math.floor(value) === value &&
    value >= 0;
};
export { _export_isNaturalNumber_ as isNaturalNumber };
const _export_integerAsBuffer_ = function integerAsBuffer(integer) {
  $.checkArgumentType(integer, "number", "integer");
  const buf = Buffer.allocUnsafe(4);

  console.log(buf);
  // buf.writeUInt32BE(integer, 0);
  return buf;
};
export { _export_integerAsBuffer_ as integerAsBuffer };
