import 'npm:urlpattern-polyfill'; // only for local dev
import * as shed from "https://raw.githubusercontent.com/worker-tools/shed/master/index.ts"



const { html, HTMLResponse } = shed;
const { ok, badRequest, temporaryRedirect, forbidden } = shed;
const { WorkerRouter } = shed;
const { provides } = shed;
const { StorageArea } = shed;
import { dedent } from 'npm:ts-dedent'



import { stylesHandler } from './styles.js';

const navigator = self.navigator || { userAgent: 'Cloudflare Workers' } // only for local dev

const defaultBranchStorage = new shed.StorageArea('default-branches');
const defaultPathStorage = new StorageArea('default-path');

const layout = (title: string, content: shed.HTML) => html`<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${title}</title>
  <link rel="stylesheet" href="/_public/index.css">
</head>

<body>
  <main style="width:800px;margin:auto">
    <h1>GHUC.CC</h1>
    <span>ghuc.cc = GitHub User Content Carbon Copy<br>
      Your friendly neighborhood redirection service for <strong>Deno 🦕</strong> to import code directly from GitHub.</span>
    <br />
    <br />
    ${content}
  </main>
  <footer style="width:800px;margin:auto">
    <hr/>
    <div style="display:flex;justify-content:space-between">
      <div>
        Build:
        <span class="muted">${(self.GITHUB_SHA || '123456789').substring(0, 7)}</span>
      </div>
      <div class="muted"> 
        <a href="/">Home</a>
        |
        <a href="https://github.com/worker-tools/ghuc.cc">GitHub</a>
        <!-- <a href="mailto:ghuc@workers.tools">Contact</a> -->
      </div>
    </div>
  </footer>
</body>

</html>`

const mkGHUC_href = ({ user, repo, branchOrTag, path }) => 
  `https://raw.githubusercontent.com/${user}/${repo}/${branchOrTag}/${path}`

const mkPage = ({ user, repo, branchOrTag, path }: { user: string|undefined; repo: string|undefined; branchOrTag: any; path: any; }, url: string|URL) => {
  return new HTMLResponse(layout('ghuc.cc', html`<div>
  <div style="display:flex; justify-content:space-between">
    <div>
      📦 ${new URL(new URL(url).pathname, 'https://ghuc.cc')}<br/>
      ➡️ <span class="muted">${mkGHUC_href({ user, repo, branchOrTag, path })}</span>
    </div>
    <div class="muted">
      <a href="${mkGHUC_href({ user, repo, branchOrTag, path })}">Raw</a>
      |
      <a href="https://github.com/${user}/${repo}/blob/${branchOrTag}/${path}">Repository</a>
    </div>
  </div>
  <hr />
  <pre><code id="code"><noscript>JS required to load remote content.</noscript></code></pre>
  <script>
    (async () => {
      const codeEl = document.getElementById('code');
      codeEl.textContent = 'Fetching...'
      const gh = await fetch('${mkGHUC_href({ user, repo, branchOrTag, path })}')
      if (gh.ok)
        if ((gh.headers.get('content-type') || '').startsWith('text/'))
          if (Number(gh.headers.get('content-length')) <= 524_288) codeEl.textContent = await gh.text();
          else codeEl.textContent = 'Large file content hidden';
        else codeEl.textContent = 'Non-textual content hidden';
      else codeEl.textContent = 'Response from GitHub not ok: ' + gh.status;
    })()
  </script>
</div>`))
}

const mkInfo = (response: Response|ResponseInit|undefined) => {
  const ghucV = (self.GITHUB_SHA || '2c877da').substring(0, 7);
  return new HTMLResponse(layout('ghuc.cc',
    html`<div>
      Needs to match pattern <code>/:user/:repo{\@:version}?{/:path(.*)}?</code>. Examples:
      <ul>
        <li><a href="/worker-tools/router/index.ts">${new URL('/worker-tools/router/index.ts', 'https://ghuc.cc')}</a></li>
        <li><a href="/worker-tools/html@2.0.0-pre.6/html-response.ts">${new URL('/worker-tools/html@2.0.0-pre.6/html-response.ts', 'https://ghuc.cc')}</a></li>
        <li><a href="/worker-tools/ghuc.cc@${ghucV}/index.js">${new URL(`/worker-tools/ghuc.cc@${ghucV}/index.js`, 'https://ghuc.cc')}</a></li>
      </ul>

    </div>`), response)
}

const mkError = (response: Response|ResponseInit|undefined) => {
  return new HTMLResponse(layout('ghuc.cc',
    html`<div>
      Something went wrong: <code>${response.text().then((x: any) => `${response.status}: ${x}`)}</code>.
    </div>`), response)
}

const ghAPI = (href: string|URL, request: { headers: { has: (arg0: string) => any; get: (arg0: string) => any; }; }) => {
  return fetch(new URL(href, 'https://api.github.com').href, {
    headers: { 
      'Accept': 'application/vnd.github.v3+json', 
      'User-Agent': navigator.userAgent, 
      ...request.headers.has('authorization') 
        ? { 'Authorization': request.headers.get('authorization') } : {},
    },
  })
}

const fetchHEAD = (href: string|URL|Request, request: { headers: { has: (arg0: string) => any; get: (arg0: string) => any; }; }) => {
  return fetch(href, { 
    method: 'HEAD',
    headers: {
      'User-Agent': navigator.userAgent, 
      ...request.headers.has('authorization') 
        ? { 'Authorization': request.headers.get('authorization') } : {},
    }
  });
}

async function inferDefaultBranch({ user, repo, maybePath }, { request }): Promise<string> {
  // In case there's also no path we use .gitignore as a last resort to test for a file that is likely to be present.
  const path = maybePath && !maybePath.endsWith('/') ? maybePath : '.gitignore' 

  for (const maybeBranch of ['master', 'main']) {
    const res = await fetchHEAD(mkGHUC_href({ user, repo, branchOrTag: maybeBranch, path }), request);
    if (res.ok) return maybeBranch
  }

  throw forbidden(dedent`ghuc.cc reached GitHub API's rate limit and cannot infer the default branch via heuristics. 
    You can provide the default branch via @ specifier after the repository name, or
    you can draw from your own rate limit by providing a 'Authorization' headers with a GitHub personal access token. 
    In Deno this is achieved via the DENO_AUTH_TOKENS environment variable.
    For more, see: https://deno.land/manual/linking_to_external_code/private#deno_auth_tokens`)
}

async function getBranchOrTag({ user, repo, version, maybePath }, { request, waitUntil }) {
  if (version) {
    return version.match(/^\d+\.\d+\.\d+/) 
      ? version.endsWith('!') ? version.substring(0, version.length - 1) : `v${version}` 
      : version;
  } else {
    let defaultBranch = await defaultBranchStorage.get([user, repo])
    if (!defaultBranch) {
      const gh = await ghAPI(`/repos/${user}/${repo}`, request)
      if (gh.ok) {
        defaultBranch = (await gh.json()).default_branch;
      } else {
        if (gh.status === 403 && gh.headers.get('x-ratelimit-remaining') === '0') {
          defaultBranch = await inferDefaultBranch({ user, repo, maybePath }, { request })
        } else {
          throw new Response(`Response from GitHub not ok: ${gh.status}`, gh)
        }
      }
      waitUntil(defaultBranchStorage.set([user, repo], defaultBranch, { expirationTtl: 60 * 60 * 24 * 30 * 3 }))
    }
    return defaultBranch;
  }
}

const stripLast = (s: string) => s.substring(0, s.length - 1)

async function getPath({ user, repo, branchOrTag, maybePath }, { request, waitUntil }) {
  if (maybePath && !maybePath.endsWith('/')) return maybePath;
  const storageKey = [user, repo, ...maybePath ? [stripLast(maybePath)] : []];
  let path = await defaultPathStorage.get(storageKey)
  if (!path) {
    const dir = maybePath || '';
    for (path of ['index.ts', 'mod.ts', 'index.js', 'mod.js'].map(p => dir + p)) {
      const res = await fetchHEAD(mkGHUC_href({ user, repo, branchOrTag, path }), request);
      if (res.ok) {
        waitUntil(defaultPathStorage.set(storageKey, path, { expirationTtl: 60 * 60 * 24 * 30 * 3 }))
        return path
      }
    }
    throw badRequest('Couldn\'t determine file path. Provide a full path or ensure index.ts/mod.ts exists in the root')
  }
  return path;
}

const mw = provides(['text/html', '*/*']);

const assetsRouter = new WorkerRouter()
  .get('/index.css', stylesHandler)
  .recover('*', mw, (_, { type, response }) => {
    if (type === 'text/html') return mkError(response)
    return response;
  })

const router = new WorkerRouter(mw)
  .get('/favicon.ico', () => ok()) // TODO
  .use('/_public/*', assetsRouter)
  .get('/:handle/:repo(@?[^@/]+){@:version([^/]+)}?{/:path(.*)}?', async (request, { match, type, waitUntil }) => {
    const { pathname: { groups: { handle, repo, version, path: maybePath } } } = match;

    const user = handle.startsWith('@') ? handle.substring(1) : handle
    const branchOrTag = await getBranchOrTag({ user, repo, version, maybePath }, { request, waitUntil })
    const path = await getPath({ user, repo, branchOrTag, maybePath }, { request, waitUntil })

    if (type === 'text/html') return mkPage({ user, repo, branchOrTag, path }, request.url)
    return temporaryRedirect(mkGHUC_href({ user, repo, branchOrTag, path }));
  })
  .get('/', (_, { type }) => {
    if (type === 'text/html') return mkInfo()
    return ok("Needs to match pattern '/:user/:repo{\@:version}?{/:path(.*)}?'")
  })
  .any('*', (_, { type }) => {
    if (type === 'text/html') return mkInfo(badRequest())
    return badRequest("Needs to match pattern '/:user/:repo{\@:version}?{/:path(.*)}?'")
  })
  .recover('*', mw, (_, { type, response }) => {
    if (type === 'text/html') return mkError(response)
    return response;
  })

self.addEventListener('fetch', router);
