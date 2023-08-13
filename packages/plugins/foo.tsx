import { jsx, serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

const App = () => (
  <div>
    <h1>Hello world!</h1>
  </div>
);

serve({
  "/": () => jsx(<App />),
});
