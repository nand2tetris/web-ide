# Ohm recovery dependency

`ohm-js-17.5.0-fallible.tgz` contains the Ohm recovery implementation
from the `feat/fallible` branch of <https://github.com/DavidSouther/ohm>,
including recovery reuse and `Node.recoveredFailures`. It retains the upstream
package version `17.5.0`; the SHA-256 below and the lockfile integrity identify
this unreleased build. Installing this repository requires no sibling checkout.

SHA-256: `d03199fd8d76d10a2ce554cce6dffb21708a188f93a3631e1cae06d3f1c0f3ec`.

The archive was produced with `npm pack` from `packages/ohm-js` after the source
checkout's build and declaration generation. The root `ohm-js` override keeps
all workspaces on the same runtime and declarations. Replace this artifact and
its lockfile entry together when changing the recovery implementation.
