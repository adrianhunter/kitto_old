
import "./style.css";

import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/idea.css";
// ShowHint addon is required for completion capability.
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/runmode/runmode";

import { marked } from "marked";

import { Workspace } from "@qualified/codemirror-workspace";
import "@qualified/codemirror-workspace/css/default.css";

import addTs from "../workspace/add.ts?raw";
import sourceTs from "../workspace/source.ts?raw";
import projectHtml from "../workspace/project.html?raw";
import styleCss from "../workspace/style.css?raw";

const modeMap: { [k: string]: string } = {
  typescript: "text/typescript",
  // javascript: "text/javascript",
  // html: "text/html",
  // css: "text/css",
};

const highlight = (code: string, language: string) => {
  const mode = modeMap[language] || "text/plain";
  const tmp = document.createElement("div");
  CodeMirror.runMode(code, mode, tmp, { tabSize: 4 });
  return tmp.innerHTML;
};

marked.use({
  // @ts-ignore renderer can be object literal
  renderer: {
    code(code: string, language: string | undefined) {
      if (!language) language = "text";
      code = highlight(code, language);
      // We need to add a class for the theme (e.g., `cm-s-idea`) on the wrapper.
      // If we're using a custom theme, it can apply its styles to `code[class^="language-"]`
      // and use Marked's default `code` with `highlight` option.
      return `<pre><code class="cm-s-idea language-${language}">${code}</code></pre>`;
    },
  },
});

const createEditor = (id: string, value: string, mode: string) =>
  CodeMirror(document.getElementById(id)!, {
    theme: "idea",
    gutters: ["cmw-gutter"],
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    mode,
    value,
  });

  const JSON_WORKER = "json-worker";
const workspace = new Workspace({

  // rootUri: "source://",
  // getLanguageAssociation: (uri: string) => {
  //   // javascript, javascriptreact, typescript, typescriptreact
  //   if (/\.(?:[jt]sx?)$/.test(uri)) {
  //     const languageId = /\.tsx?$/.test(uri) ? "typescript" : "javascript";
  //     return {
  //       languageId: languageId + (uri.endsWith("x") ? "react" : ""),
  //       languageServerIds: ["typescript-language-server"],
  //     };
  //   }

  //   const styles = uri.match(/\.(css|less|s[ac]ss)$/);
  //   if (styles !== null) {
  //     return {
  //       languageId: styles[1],
  //       languageServerIds: ["css-languageserver"],
  //     };
  //   }

  //   if (uri.endsWith(".html")) {
  //     return {
  //       languageId: "html",
  //       languageServerIds: ["html-languageserver"],
  //     };
  //   }

  //   // Workspace will ignore the file if null is returned.
  //   return null;
  // },
  rootUri: "inmemory://workspace/",
  getLanguageAssociation: (uri: string) => {
    if (uri.endsWith(".json")) {
      return { languageId: "json", languageServerIds: [JSON_WORKER] };
    }
    return null;
  },
  getConnectionString: async (id: string) => {
    return id ? `ws://localhost:1337?name=${id}` : "";

    // return `ws://0.0.0.0:1337?name=${id}`
  },
  // Support Markdown documentation
  renderMarkdown: (markdown) => marked(markdown),
});

// `source.ts` imports `add.ts`
// The files are in the same workspace and shares the same connection.
workspace.openTextDocument(
  "source.ts",
  createEditor("ts-editor-1", sourceTs, "text/typescript")
);

const enablePopupsButton = document.getElementById("enablePopups")!;
enablePopupsButton.addEventListener("click", () => {
  workspace.enablePopups(true);
});
const disablePopupsButton = document.getElementById("disablePopups")!;
disablePopupsButton.addEventListener("click", () => {
  workspace.enablePopups(false);
});
// workspace.openTextDocument(
//   "add.ts",
//   createEditor("ts-editor-2", addTs, "text/typescript")
// );
// workspace.openTextDocument(
//   "project.html",
//   createEditor("html-editor", projectHtml, "text/html")
// );
// workspace.openTextDocument(
//   "style.css",
//   createEditor("css-editor", styleCss, "text/css")
// );

// const enablePopupsButton = document.getElementById("enablePopups")!;
// enablePopupsButton.addEventListener("click", () => {
//   workspace.enablePopups(true);
// });
// const disablePopupsButton = document.getElementById("disablePopups")!;
// disablePopupsButton.addEventListener("click", () => {
//   workspace.enablePopups(false);
// });
// import { Workspace } from "@qualified/codemirror-workspace";

// const workspace = new Workspace({
//   // Project root. Required.
//   rootUri: "file:///workspace/",

//   // Provide language associaton (language id and server ids) for URI. Required.
//   getLanguageAssociation: (uri: string) => {
//     // javascript, javascriptreact, typescript, typescriptreact
//     if (/\.(?:[jt]sx?)$/.test(uri)) {
//       const languageId = /\.tsx?$/.test(uri) ? "typescript" : "javascript";
//       return {
//         languageId: languageId + (uri.endsWith("x") ? "react" : ""),
//         languageServerIds: ["typescript-language-server"],
//       };
//     }

//     const styles = uri.match(/\.(css|less|s[ac]ss)$/);
//     if (styles !== null) {
//       return {
//         languageId: styles[1],
//         languageServerIds: ["css-language-server"],
//       };
//     }

//     if (uri.endsWith(".html")) {
//       return {
//         languageId: "html",
//         languageServerIds: ["html-language-server"],
//       };
//     }

//     if (uri.endsWith(".json")) {
//       return {
//         languageId: "json",
//         languageServerIds: ["json-worker"],
//       };
//     }

//     // Return null to let the workspace ignore this file.
//     return null;
//   },

//   // Provide the server's connection string. Required.
//   // The returned string can be a URI of WebSocket proxy or
//   // a location of Worker script to start Language Server.
//   getConnectionString: async (langserverId: string) => {
//     switch (langserverId) {
//       case "typescript-language-server":
//         // Use some API to start remote Language Server and return a string.
//         const res = await fetch("/start", { method: "POST" });
//         return res.json().uri;

//       case "css-language-server":
//         // Return an endpoint of already running proxy.
//         return "ws://localhost:9991";

//       case "html-language-server":
//         return "ws://localhost:9992";

//       case "json-worker":
//         // Return a location of a script to start Language Server in Web Worker.
//         return "js/json-worker.js";

//       default:
//         return "";
//     }
//   },

//   // Optional function to return HTML string from Markdown.
//   renderMarkdown: (markdown: string): string => markdown,
// });
// // Open text document in workspace to enable code intelligence.
// // `cm` is CodeMirror.Editor instance with contents of the file.
// // workspace.openTextDocument("example.js", cm);
// // import "./style.css";

// // import CodeMirror from "codemirror";
// // import "codemirror/mode/javascript/javascript";
// // import "codemirror/mode/htmlmixed/htmlmixed";
// // import "codemirror/mode/css/css";
// // import "codemirror/lib/codemirror.css";
// // import "codemirror/theme/idea.css";
// // // ShowHint addon is required for completion capability.
// // import "codemirror/addon/hint/show-hint.css";
// // import "codemirror/addon/hint/show-hint";
// // import "codemirror/addon/edit/matchbrackets";
// // import "codemirror/addon/edit/closebrackets";
// // import "codemirror/addon/runmode/runmode";

// // import { marked } from "marked";

// // import { Workspace } from "@qualified/codemirror-workspace";
// // import "@qualified/codemirror-workspace/css/default.css";

// // // import addTs from "../workspace/add.ts?raw";
// // import sourceTs from "../workspace/source.ts?raw";
// // // import projectHtml from "../workspace/project.html?raw";
// // // import styleCss from "../workspace/style.css?raw";

// // const modeMap: { [k: string]: string } = {
// //   typescript: "text/typescript",
// //   // javascript: "text/javascript",
// //   // html: "text/html",
// //   // css: "text/css",
// // };

// // const highlight = (code: string, language: string) => {
// //   const mode = modeMap[language] || "text/plain";
// //   const tmp = document.createElement("div");
// //   CodeMirror.runMode(code, mode, tmp, { tabSize: 4 });
// //   return tmp.innerHTML;
// // };

// // marked.use({
// //   // @ts-ignore renderer can be object literal
// //   renderer: {
// //     code(code: string, language: string | undefined) {
// //       if (!language) language = "text";
// //       code = highlight(code, language);
// //       // We need to add a class for the theme (e.g., `cm-s-idea`) on the wrapper.
// //       // If we're using a custom theme, it can apply its styles to `code[class^="language-"]`
// //       // and use Marked's default `code` with `highlight` option.
// //       return `<pre><code class="cm-s-idea language-${language}">${code}</code></pre>`;
// //     },
// //   },
// // });

// // const createEditor = (id: string, value: string, mode: string) =>
// //   CodeMirror(document.getElementById(id)!, {
// //     theme: "idea",
// //     gutters: ["cmw-gutter"],
// //     lineNumbers: true,
// //     matchBrackets: true,
// //     autoCloseBrackets: true,
// //     mode,
// //     value,
// //   });

// // const workspace = new Workspace({
// //   rootUri: "source://",
// //   getLanguageAssociation: (uri: string) => {
// //     // javascript, javascriptreact, typescript, typescriptreact
// //     if (/\.(?:[jt]sx?)$/.test(uri)) {
// //       const languageId = /\.tsx?$/.test(uri) ? "typescript" : "javascript";
// //       return {
// //         languageId: languageId + (uri.endsWith("x") ? "react" : ""),
// //         languageServerIds: ["typescript-language-server"],
// //       };
// //     }

// //     const styles = uri.match(/\.(css|less|s[ac]ss)$/);
// //     // if (styles !== null) {
// //     //   return {
// //     //     languageId: styles[1],
// //     //     languageServerIds: ["css-languageserver"],
// //     //   };
// //     // }

// //     // if (uri.endsWith(".html")) {
// //     //   return {
// //     //     languageId: "html",
// //     //     languageServerIds: ["html-languageserver"],
// //     //   };
// //     // }

// //     // Workspace will ignore the file if null is returned.
// //     return null;
// //   },
// //   getConnectionString: async (id: string) => {
// //     return id ? `ws://localhost:9990?name=${id}` : "";
// //   },
// //   // Support Markdown documentation
// //   renderMarkdown: (markdown) => marked(markdown),
// // });

// // // `source.ts` imports `add.ts`
// // // The files are in the same workspace and shares the same connection.
// // workspace.openTextDocument(
// //   "source.ts",
// //   createEditor("ts-editor-1", sourceTs, "text/typescript")
// // );
// // // workspace.openTextDocument(
// // //   "add.ts",
// // //   createEditor("ts-editor-2", addTs, "text/typescript")
// // // );
// // // workspace.openTextDocument(
// // //   "project.html",
// // //   createEditor("html-editor", projectHtml, "text/html")
// // // );
// // // workspace.openTextDocument(
// // //   "style.css",
// // //   createEditor("css-editor", styleCss, "text/css")
// // // );

// // const enablePopupsButton = document.getElementById("enablePopups")!;
// // enablePopupsButton.addEventListener("click", () => {
// //   workspace.enablePopups(true);
// // });
// // const disablePopupsButton = document.getElementById("disablePopups")!;
// // disablePopupsButton.addEventListener("click", () => {
// //   workspace.enablePopups(false);
// // });
