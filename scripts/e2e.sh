#!/bin/sh
# Run Maestro UI tests.
#
# Usage:
#   scripts/e2e.sh                      # all flows, first available device
#   scripts/e2e.sh --smoke              # only flows tagged "smoke"
#   scripts/e2e.sh --platform android   # all flows on Android target
#   scripts/e2e.sh --platform ios       # all flows on iOS target
#   scripts/e2e.sh --include-tags=auth  # any extra `maestro test` args pass through
#
# Credentials: loads .env.e2e (gitignored) if present. Shell variables prefixed
# with MAESTRO_ (e.g. MAESTRO_TEST_EMAIL) are automatically exposed to flows.

set -a
[ -f .env.e2e ] && . ./.env.e2e
set +a

PLATFORM=""
TEST_ARGS=""
while [ $# -gt 0 ]; do
  case "$1" in
    --platform)
      PLATFORM="$2"
      shift 2
      ;;
    --smoke)
      TEST_ARGS="$TEST_ARGS --include-tags=smoke"
      shift
      ;;
    *)
      TEST_ARGS="$TEST_ARGS $1"
      shift
      ;;
  esac
done

if [ -n "$PLATFORM" ]; then
  exec maestro --platform "$PLATFORM" test $TEST_ARGS .maestro
fi
exec maestro test $TEST_ARGS .maestro
