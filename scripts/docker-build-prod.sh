#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

IMAGE="${1:-unilyse-admin}"
BUILD_ARGS="$(eval "$(node scripts/firebase-build-args.mjs)" | tr '\n' ' ')"

# shellcheck disable=SC2086
docker build ${BUILD_ARGS} -t "${IMAGE}" .

echo "Image ${IMAGE} prête."
