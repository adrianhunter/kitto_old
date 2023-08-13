import {
  h,
  json,
  jsx,
  serve,
  serveStatic,
} from "https://deno.land/x/sift@0.6.0/mod.ts";


import * as walk from "https://deno.land/std/fs/walk.ts";

import path from "node:path";
async function readDir(path: string) {
  const folders = [];

  const p = "/Users/X/Documents/GitHub/kitto/packages/" + path;
  console.log("-----", p);

  // for await (const dude of walk.walk(p, {"maxDepth": 1}))

  for await (
    const x of Deno.readDir(p)
  ) {
    if (x.isDirectory) {
      folders.push(x.name + "/");
    } else if (x.isFile) {
      folders.push(x.name);
    }
  }

  console.log(folders);

  return json({
    items: folders,

    isIncomplete: true,
  });
}

import * as xx from "https://deno.land/std/media_types/mod.ts";

serve({
  "/.well-known/deno-import-intellisense.json": async () => {
    const folders = [];
    console.log("-----");
    for await (
      const x of Deno.readDir("/Users/X/Documents/GitHub/kitto/packages")
    ) {
      if (x.isDirectory) {
        folders.push({
          "schema": `/${x.name}/:path*`,
          "variables": [{
            "key": "path",
            "documentation": "http://localhost:8000/completions/resolve/" +
              x.name + "/${path}",
            "url": "http://localhost:8000/completions/items/" + x.name +
              "/${path}",
          }],
        });
      } else if (x.isFile) {
        // folders.push(x.name);
      }
    }
    return json({
      version: 2,
      registries: folders,
    });
  },
  "/completions/resolve/*": async (req, connInfo, params) => {
    console.log("RESOLVE DOCS", req.url);

    const url = new URL(req.url);

    try {
      const txt = await Deno.readTextFile(
        "/Users/X/Documents/GitHub/kitto/packages" +
        url.pathname.replace("/completions/resolve", ""),
      );

      console.log(txt);

      return json({
        kind: "plaintext",
        value: txt,
      });
    } catch (e) {
      return json({ error: e.message.toString() });
    }
  },
  // "/completions/items/:pkg/": async (req, connInfo, params) => {
  //   console.log("RESOLVE FILE=---", req.url, params);

  //   return await readDir(params?.pkg || "");
  // },

  // "/:pkg/:filename++": serveStatic("../", {
  //   baseUrl: import.meta.url,
  // }),
  "/completions/items/:full_path+": async (req, connInfo, params) => {
    const ext = path.extname(params?.full_path || "");

    const meda = xx.contentType(ext) || "text";

    // const media = xx.extension()

    console.log(meda);

    console.log("RESOLVE FILE +++ ", req.url, params?.full_path);

    return await readDir(params?.full_path || "");
    // return new Response("", {
    //   headers: {
    //     "content-type": meda,
    //   },
    // });
  },

  // "/completions/resolve/__latest__/:path": async () => {
  //   const folders = [];

  //   console.log("-----");

  //   for await (
  //     const x of Deno.readDir("/Users/X/Documents/GitHub/kitto/packages")
  //   ) {
  //     if (x.isDirectory) {
  //       folders.push(x.name + "/");
  //     } else if (x.isFile) {
  //       folders.push(x.name);
  //     }
  //   }

  //   return json({
  //     "items": folders,
  //     "isIncomplete": true,
  //   });
  // },

  "*": async (req) => {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/completions/items/")) {
      return await readDir(url.pathname.replace("/completions/items/", ""));
    }
    console.log("default..", req.url);

    const ext = path.extname(url.pathname);

    let meda = "application/javascript";
    const tsExt = [".ctsx", ".tsx", ".mtsx"];

    if (tsExt.includes(ext)) {
      meda = "text/tsx";
    }

    const tsExt2 = [".ts", ".cts", ".mts"];

    if (tsExt2.includes(ext)) {
      meda = "application/typescript";
    }

    // const media = xx.extension()
    const code = await Deno.readTextFile(
      "/Users/X/Documents/GitHub/kitto/packages" + url.pathname,
    );

    // return jsx(<App />);

    console.log("SERVE ", code);

    return new Response(code, {
      headers: {
        "Content-Type": meda,
        // "X-TypeScript-Types": "./someT.d.ts",
      },
    });
  },

  404: (req) => {
    console.log("not found...", req.url);

    return new Response("not found");
  },
  // Or a directory of files.
  // "/:filename+": serveStatic("public", { baseUrl: import.meta.url }),
  // // You can modify the fetched response before returning to the request
  // // by using the intervene option.
  // "/style.css": serveStatic("style.css", {
  //   baseUrl: import.meta.url,
  //   // The intervene function is called after the resource is
  //   // fetched from the source URL. The original request and the
  //   // fetched response are passed as arguments and a response
  //   // is expected from the function.
  //   intervene: (request, response) => {
  //     // Do some processing to the response.
  //     return response;
  //   },
});

//   if (url.pathname === "/completions/items/std/__latest__/") {

//     const r = JSON.stringify({
//       "items": folders,
//       "isIncomplete": true,
//     });
//     return new Response(r, {
//       headers: {
//         "content-type": "application/json",
//       },
//     });
//   }

//   return new Response("wow");
// });

// Deno.serve(async (req) => {
//   const url = new URL(req.url);
//   console.log(url);

//   if (url.pathname === "/.well-known/deno-import-intellisense.json") {
//     return new Response(
//       JSON.stringify({
//         "version": 2,
//         "registries": [{
//         //   "schema": "/x/:module([a-z0-9_]+)@:version?/:path*",
//         //   "variables": [{
//         //     "key": "module",
//         //     "documentation":
//         //       "http://localhost:8000/completions/resolve/${module}",
//         //     "url": "http://localhost:8000/completions/items/${module}",
//         //   }, {
//         //     "key": "version",
//         //     "documentation":
//         //       "http://localhost:8000/completions/resolve/${module}/${{version}}",
//         //     "url":
//         //       "http://localhost:8000/completions/items/${module}/${{version}}",
//         //   }, {
//         //     "key": "path",
//         //     "documentation":
//         //       "http://localhost:8000/completions/resolve/${module}/${{version}}/${path}",
//         //     "url":
//         //       "http://localhost:8000/completions/items/${module}/${{version}}/${path}",
//         //   }],
//         // }, {
//         //   "schema": "/x/:module([a-z0-9_]*)/:path*",
//         //   "variables": [{
//         //     "key": "module",
//         //     "documentation":
//         //       "http://localhost:8000/completions/resolve/${module}",
//         //     "url": "http://localhost:8000/completions/items/${module}",
//         //   }, {
//         //     "key": "path",
//         //     "documentation":
//         //       "http://localhost:8000/completions/resolve/${module}/__latest__/${path}",
//         //     "url":
//         //       "http://localhost:8000/completions/items/${module}/__latest__/${path}",
//         //   }],
//         // }, {
//         //   "schema": "/std@:version?/:path*",
//         //   "variables": [{
//         //     "key": "version",
//         //     "documentation":
//         //       "http://localhost:8000/completions/resolve/std/${{version}}",
//         //     "url": "http://localhost:8000/completions/items/std/${{version}}",
//         //   }, {
//         //     "key": "path",
//         //     "documentation":
//         //       "http://localhost:8000/completions/resolve/std/${{version}}/${path}",
//         //     "url":
//         //       "http://localhost:8000/completions/items/std/${{version}}/${path}",
//         //   }],
//         }, {
//           "schema": "/:path*",
//           "variables": [{
//             "key": "path",
//             "documentation":
//               "http://localhost:8000/completions/resolve/__latest__/${path}",
//             "url":
//               "http://localhost:8000/completions/items/__latest__/${path}",
//           }],
//         }],
//       }),
//       {
//         "headers": {
//           "content-type": "application/json",
//         },
//       },
//     );
//   }
