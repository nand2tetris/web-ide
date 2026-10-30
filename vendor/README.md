# Ohm recovery dependency

`ohm-js-17.5.0-fallible.tgz` contains the Ohm recovery implementation
from <https://github.com/DavidSouther/ohm> at `c3518dca`, including recovery
reuse, `Node.recoveredFailures`, and the three semantic slots of `B ! C`:
the guarded result, an optional `_correction`, and the actual join result.
The packaged source at `632383fe` also preserves the `Failure#isLexical`
metadata overlay, which classifies an expected failure as inside a token
or at a token boundary. It retains the upstream
package version `17.5.0`; the SHA-256 below and the lockfile integrity identify
this unreleased build. Installing this repository requires no sibling checkout.

SHA-256: `916219d8fc0fff192441d1c107f196aff03430992eb13227698450ff0398bd02`.

The archive was produced with `npm pack` from `packages/ohm-js` after the source
checkout's build and declaration generation. The root `ohm-js` override keeps
all workspaces on the same runtime and declarations. Replace this artifact and
its lockfile entry together when changing the recovery implementation.
