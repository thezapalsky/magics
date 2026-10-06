# Cloudflare GitHub CI/CD

## Chosen approach

Use **Cloudflare Workers Builds connected to GitHub**, with Workers Static Assets.
After activation, pushes to `main` build and publish production; other branches build
previews when preview builds are enabled. The first public release comes from GitHub,
not an ad-hoc upload of a local checkout.

The GitHub workflow in `.github/workflows/viewer.yml` is an independent, read-only
validation check. Cloudflare runs the same `pnpm ci:build` before publishing, so a failed
validation or build stops deployment even if its separate GitHub check has not finished.
No Cloudflare token is needed in GitHub Actions for this native integration.
See [Git integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/).

**Current state: prepared locally, not connected or publicly deployed.**
Preparing these files does not authorize pushing, merging, granting GitHub access,
or activating automatic production deployments. Connecting the repository can start
a build/deployment immediately; obtain explicit activation approval first.

## Scope and cost

Only `web/dist/` is served. Deck sources, experiments and credentials are not website
assets. Images still load from recorded Scryfall/Wizards URLs; builds do not refresh metadata.
Keep `wrangler.jsonc` assets-only: no script entry point, SSR, database, paid binding,
`run_worker_first`, plan upgrade or purchased domain.

Static-asset requests/storage currently have no additional charge. Workers Builds on
the Free plan includes **3,000 build minutes/month**, one concurrent build, and a
20-minute timeout. Exhausting a free build allowance is not a reason to upgrade without
approval. [Static billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/),
[build limits](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/).

## Settings to enter in Cloudflare

These settings live in the Cloudflare dashboard; checking in this document does not
configure the remote Git connection. The checked-in Wrangler file supplies asset routing,
the project name and the `workers.dev` setting, not Workers Builds commands.

| Setting | Value |
| --- | --- |
| Git provider / repository | GitHub / `thezapalsky/magics` |
| Worker name | `magics-viewer` — must match `web/wrangler.jsonc` |
| Production branch | `main` |
| Production custom domain | `magics.zapalsky.com` — not a branch/version URL |
| Root directory | `web` |
| Build command | `pnpm install --frozen-lockfile && pnpm ci:build` |
| Deploy command | `pnpm exec wrangler deploy` |
| Preview command | `pnpm exec wrangler preview` |
| Preview builds | Enabled, once public preview activation is approved |
| Build variable `NODE_VERSION` | `24.21.0` |
| Build variable `PNPM_VERSION` | `10.17.1` |
| Build variable `SKIP_DEPENDENCY_INSTALL` | `1` — the build command installs explicitly |
| Build variable `WRANGLER_SEND_METRICS` | `false` |

Retain the full repository checkout: sources in `../decks/`, `../VERSION` and the
root validator are read from `web/`. Do not upload only the `web/` directory as the build source.
Build variables are not runtime bindings. Cloudflare can supply its managed build token;
keep it out of chat, source control and GitHub secrets. Review its permissions in the
approved account, without adding unrelated resources to this assets-only project.

[Build settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/),
[runtime overrides](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/),
[production/preview branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/).

## Activation order — requires user authorization

1. Validate the local `codex/deck-viewer` branch from `/Users/mikolaj/Developer/magics`.
2. With explicit permission, push that branch and open a pull request. Do not force-push.
3. Inspect GitHub's validation result and review the changes. Merge to `main` only with
   explicit approval. Confirm `main` actually contains `web/wrangler.jsonc`, this setup,
   the cache and tracked deck snapshots before connecting Cloudflare production.
4. In the user-confirmed Cloudflare account, check Workers & Pages for an existing
   `magics-viewer`. If an existing project's ownership/purpose is unclear, stop;
   creating this viewer must not overwrite an unrelated project. Also confirm the
   active `zapalsky.com` zone belongs to that account and recheck the exact hostname
   for DNS/Worker conflicts. Stop before activation if either check fails.
5. Start a GitHub-connected Worker, authorize Cloudflare's GitHub integration for **only
   this repository**, and enter the settings above. Let the user handle sign-in, 2FA and
   access consent. Review the selected account/repository/branch before the final activation.
6. After explicit approval covering the public build and requested hostname, activate
   the connection and first public build. Verify the
   build log, deployed commit, asset-only configuration and actual returned `workers.dev` URL.
   Do not guess the account-specific address or report an in-progress build as deployed.

## Production domain

The top-level `routes` declaration in `wrangler.jsonc` attaches **only
`magics.zapalsky.com`** as a Worker Custom Domain when an authorized deployment runs.
Cloudflare manages its DNS record and HTTPS certificate; do not add a CNAME to an
individual branch preview or version address. The stable hostname follows the production
Worker's latest successful deployment from `main`, not a failed build or an unmerged branch.

The required empty `previews` block is checked in. Native `wrangler preview` uploads
branch assets separately and does not apply the top-level production route. Do not add
the production hostname to preview settings. No extra domain or certificate subscription
is required for this existing domain.

On 6 October 2026, public authoritative DNS returned NXDOMAIN for this exact hostname;
`zapalsky.com` used Cloudflare nameservers. That is not proof of zone ownership in the
selected account. Recheck live dashboard records/domain assignments immediately before
deployment, and never remove or override an existing record without approval.

After the first successful build, verify `https://magics.zapalsky.com` over HTTPS and
its deep links/exports. Wait for certificate/DNS readiness before calling it live.
Confirm the domain remains attached to `magics-viewer` on the next approved `main` build;
no DNS edits should be needed for subsequent releases.
[Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/),
[preview configuration](https://developers.cloudflare.com/workers/previews/configuration/).

The local Wrangler OAuth login is **not** the credential used by this Git-connected build.
Do not refresh or narrow the user's existing Pages login just to enable native CI/CD.
Automatic deployment is an ongoing policy: once enabled, authorized changes landing on
`main` will publish without another manual upload. Future agents still need permission
to push/merge; selecting CI/CD is not blanket authorization for repository writes.

## Local preflight (does not publish)

Run from `web/`, using isolated Node 24.21.0 / pnpm 10.17.1. Do not repair unrelated
global tools or use the abandoned Documents/ChatGPT copy.

```sh
pnpm install --frozen-lockfile
pnpm deploy:check
```

This validates, tests, builds, checks the paper list and performs Wrangler's non-uploading
dry run. It needs no deployment permissions; generated files remain in ignored directories.
To verify Cloudflare routing/headers, run `pnpm preview:cloudflare` in one terminal and
`pnpm test:cloudflare` in another. The local-only preview is `http://127.0.0.1:8787`;
stop it with Ctrl+C. Browser checks are recorded in [QA.md](QA.md).

## Verify production and previews

- Confirm the deployed source commit and the home page's intended deck/version defaults
  on both the actual `workers.dev` address and `https://magics.zapalsky.com`.
- Check direct version URLs, reloads, trailing slashes and true 404s.
- Check search, stacks, reader arrows/both faces and version navigation on desktop/mobile.
- Compare downloaded exports with their tracked source; check clipboard in a normal HTTPS browser.
- Confirm artwork loads under CSP, no runtime card-data API calls, no application errors,
  security headers, and immutable caching for hashed bundles.
- On the next approved feature-branch push, verify a separate preview URL/check without
  replacing production. Do not create a dummy public push solely to test this without approval.

## Recovery and optional manual fallback

If an authorized release fails, restore a known-good deployment through Cloudflare's
history with approval. Correct/revert the source via a reviewed Git commit so a later
automatic build does not reintroduce the fault. Never reset this checkout or rewrite history.

`pnpm deploy` is available only as an explicitly authorized manual fallback, not the normal
CI/CD workflow. It requires a confirmed destination and Workers-capable local authorization.
Check `pnpm exec wrangler whoami`; if Workers permissions are missing, ask before changing
the active login or its scopes. Never expose tokens or commit account identities/credentials.
