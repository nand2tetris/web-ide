#!/usr/bin/env bash
# Feature test for .devcontainer/devcontainer.json.
#
# Drives @devcontainers/cli from the host, brings the container up from a
# clean state, and asserts that a contributor can run the repo's standard
# commands inside the container without further setup.
#
# Exit 0 means the user story in docs/developer/2026-04-23-A-dev-containers/feature-test.md holds.
# Any non-zero exit identifies the first broken step.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEVCONTAINER_CLI="npx --yes @devcontainers/cli@latest"

step() {
  printf "\n=== %s ===\n" "$1"
}

in_container() {
  $DEVCONTAINER_CLI exec --workspace-folder "$REPO_ROOT" "$@"
}

step "Bring the container up from a clean state"
$DEVCONTAINER_CLI up --workspace-folder "$REPO_ROOT" --remove-existing-container

step "npm run check inside the container"
in_container bash -lc "npm run check"

step "npm test inside the container"
in_container bash -lc "npm test"

step "npm run start serves port 5173 inside the container"
in_container bash -lc '
  set -e
  killtree() {
    local pid=$1
    for child in $(pgrep -P "$pid" 2>/dev/null); do
      killtree "$child"
    done
    kill "$pid" 2>/dev/null || true
  }
  npm run start >/tmp/vite.log 2>&1 &
  VITE_PID=$!
  trap "killtree $VITE_PID; true" EXIT
  for i in $(seq 1 60); do
    if curl --silent --fail --output /dev/null http://localhost:5173/; then
      echo "Vite responded on attempt $i"
      exit 0
    fi
    sleep 1
  done
  echo "Vite did not respond on port 5173 within 60 seconds" >&2
  tail -n 50 /tmp/vite.log >&2 || true
  exit 1
'

step "npm run test:e2e inside the container"
in_container bash -lc "npm run test:e2e"

step "All steps passed"
