# Ohm recovery dependency

`ohm-js-17.5.0-fallible.tgz` contains the Ohm recovery implementation
from the `feat/fallible` branch of <https://github.com/DavidSouther/ohm>,
including recovery reuse and `Node.recoveredFailures`, plus
`Failure#isLexical` from the `feat/unified-diagnostics-metadata` branch
(commit `c68eb7cc`), which classifies an expected failure as inside a token
or at a token boundary. It retains the upstream
package version `17.5.0`; the SHA-256 below and the lockfile integrity identify
this unreleased build. Installing this repository requires no sibling checkout.

SHA-256: `b7e3780f3d093366854fe79c20383cd8a3bdbbaa5626d331b818000f91ff287b`.

The archive was produced with `npm pack` from `packages/ohm-js` after the source
checkout's build and declaration generation. The root `ohm-js` override keeps
all workspaces on the same runtime and declarations. Replace this artifact and
its lockfile entry together when changing the recovery implementation.
