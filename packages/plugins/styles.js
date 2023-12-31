
import { HTMLResponse, css } from 'npm:@worker-tools/html';

export function stylesHandler() { 
  return new HTMLResponse(css`
:root {
  color-scheme: dark light;
}

* {
  box-sizing: border-box;
}

html {
  --font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif;
  --font-family-mono: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
  --gray: rgb(142, 142, 147);
  --gray2: rgb(174, 174, 178);
  --gray3: rgb(199, 199, 204);
  --gray4: rgb(209, 209, 214);
  --gray5: rgb(229, 229, 234);
  --gray6: rgb(242, 242, 247);
  --red: rgb(255, 59, 48);
  --blue: rgb(0, 122, 255);
  --green: rgb(52, 199, 89);
  --cyan: rgb(50, 173, 230);
  --magenta: rgb(255, 45, 85);
  --yellow: rgb(255, 204, 0);
  --purple: rgba(175, 82, 222);
  --color: #000;
  --background: #fefefe;
}

@media (prefers-color-scheme: dark) {
  html {
    --gray: rgb(142, 142, 147);
    --gray2: rgb(99, 99, 102);
    --gray3: rgb(72, 72, 74);
    --gray4: rgb(58, 58, 60);
    --gray5: rgb(44, 44, 46);
    --gray6: rgb(28, 28, 30);
    --red: rgb(255, 69, 58);
    --blue: rgb(10, 132, 255);
    --green: rgb(48, 209, 88);
    --cyan: rgb(100, 210, 255);
    --magenta: rgb(255, 55, 95);
    --yellow: rgb(255, 214, 10);
    --purple: rgba(191, 90, 242);
    --color: #c8c8c8;
    --background: rgb(22, 22, 24);
  }
}

body {
  font-family: var(--font-family);
  color: var(--color);
  background-color: var(--background);
  overflow-x: hidden;
}

pre {
  overflow-x: auto;
}
@media screen and (min-width:800px) {
  pre {
    width: calc(800px + (100vw - 800px));
    margin-left: calc((100vw - 800px) / -2);
    padding-left: calc((100vw - 800px) / 2); 
  }
}
pre,
code {
  font-family: var(--font-family-mono);
  font-size: 0.85rem;
}

a {
  color: var(--blue)
}

hr {
  border:none;
  border-bottom: 1px solid var(--gray2);
  margin: 1rem 0;
}

li { margin-bottom: 0.25rem; }

.muted {
  color: var(--gray);
}
`, { headers: [['content-type', 'text/css']] });
}
