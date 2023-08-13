import { transform } from "npm:lebab";
async function modernice(src: string) {
  // console.log(src);

  const r = transform(
    src,
    [
      "class",
      // "obj-method",

      // "let",
      // "arrow",
      // "arrow-return",

      // "for-of",
      // "for-each",
      // "arg-rest",
      // "arg-spread",
      // "obj-shorthand",
      // "no-strict",
      // "exponent",
      // "multi-var",
      // "let",
      // "commonjs",
      // "template",
      // "default-param",
      // "destruct-param",
      // "includes",
    ], // transforms to apply
  );
  // console.log(code); // -> "const f = a => a;"

  return r.code;
}

import { walk } from "https://deno.land/std@0.198.0/fs/walk.ts";

import path from "node:path";
async function fromTo(from: string, to: string | null) {
  for await (const x of walk(from, { "exts": [".js"] })) {
    console.log(x.path);

    if (x.isFile) {
      const code = await Deno.readTextFile(x.path);
      // const r = await modernice(code)
      const r = await modernice(code);

      if (!to) {
        await Deno.writeTextFile(x.path, r);
      } else {
        const tt = to + "/" + x.path;
        const dir = path.dirname(tt);
        try {
          await Deno.mkdir(dir, { recursive: true });
        } catch (e) {}

        await Deno.writeTextFile(tt, r);
      }
    }

    //
  }
}

await fromTo("src", null);

// await fromTo("./test", "./2")
