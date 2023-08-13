// export {_module_exports_ as default};

// _module_exports_.Stack = require('./stack')

import Stack from "./stack.js";

import Interpreter from "./interpreter.js";

import Script from "./script.js";

export { Stack };

export { Interpreter };

Script.Stack = Stack;
Script.Interpreter = Interpreter;

export default Script;

// export {Interpreter}
