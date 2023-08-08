/// <reference lib="deno.ns" />
import { serve, serveStatic } from "https://deno.land/x/sift@0.6.0/mod.ts";

const intervene= (r: Request, res: Response) => {

    console.log(r.url)


    res.headers.set("Cross-Origin-Opener-Policy", "same-origin" )

    res.headers.set("Cross-Origin-Embedder-Policy", "require-corp" )

    console.log(res)

    // r.headers.set("Cross-Origin-Opener-Policy", "same-origin" )

    // r.headers.set("Cross-Origin-Embedder-Policy", "require-corp" )

    return res
  }

serve({
  // You can serve a single file.
  "/": serveStatic("dist/index.html", { baseUrl: import.meta.url, intervene }),
  // Or a directory of files.
  "/:filename+": serveStatic("dist", { baseUrl: import.meta.url, intervene }),


  // You can modify the fetched response before returning to the request
  // by using the intervene option.
//   "/style.css": serveStatic("style.css", {
//     baseUrl: import.meta.url,
//     // The intervene function is called after the resource is
//     // fetched from the source URL. The original request and the
//     // fetched response are passed as arguments and a response
//     // is expected from the function.
//     intervene: (request, response) => {
//       // Do some processing to the response.
//       return response;
//     },
//   }),
});