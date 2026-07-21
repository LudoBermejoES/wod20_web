#!/usr/bin/env bash
# Upload the local LanceDB search index (derived/lancedb) to the server.
#
# The index is gitignored, ~74MB, and rebuilt offline (Python + BGE-M3, ~40 min), so it
# never travels through GitHub Actions. It lives on the server as persistent data that
# the deploy workflow preserves. Run this ONCE after the first deploy, and again whenever
# you re-index (pipeline/index.py). rsync only sends what changed.
#
# Usage:
#   SSH_HOST=... SSH_USERNAME=... SSH_PORT=22 SSH_KEY=~/.ssh/id_ed25519 \
#     scripts/upload-index.sh
#
#   # or pass the ssh target directly:
#   scripts/upload-index.sh user@host [port]
#
# Env (match the GitHub secrets used by the deploy):
#   SSH_HOST, SSH_USERNAME, SSH_PORT (default 22), SSH_KEY (path to private key; optional)
#   WOD20_LANCEDB_DIR  override the local index path (default: <repo>/derived/lancedb)
#   REMOTE_INDEX_DIR   override the server path (default: /var/www/wod20/derived/lancedb)
set -euo pipefail

# repo root = two levels up from this script (wod20_web/scripts -> wod20_web -> mago20)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="${WOD20_LANCEDB_DIR:-$REPO_ROOT/derived/lancedb}"
REMOTE_DIR="${REMOTE_INDEX_DIR:-/var/www/wod20/derived/lancedb}"

if [ ! -d "$SRC" ] || [ -z "$(ls -A "$SRC" 2>/dev/null)" ]; then
  echo "ERROR: local index not found or empty at: $SRC" >&2
  echo "       Build it first: (cd pipeline && export TORCH_DEVICE=mps && python index.py)" >&2
  exit 1
fi

# Resolve ssh target: positional 'user@host [port]' or SSH_* env vars.
if [ "${1:-}" != "" ]; then
  TARGET="$1"
  PORT="${2:-${SSH_PORT:-22}}"
else
  : "${SSH_HOST:?set SSH_HOST or pass user@host}"
  : "${SSH_USERNAME:?set SSH_USERNAME or pass user@host}"
  TARGET="${SSH_USERNAME}@${SSH_HOST}"
  PORT="${SSH_PORT:-22}"
fi

SSH_OPTS="-p ${PORT}"
[ -n "${SSH_KEY:-}" ] && SSH_OPTS="$SSH_OPTS -i ${SSH_KEY}"

echo "Uploading index:"
echo "  from: $SRC/"
echo "  to:   ${TARGET}:${REMOTE_DIR}/  (port ${PORT})"

# Make sure the remote dir exists, then mirror the index (delete stale files).
ssh $SSH_OPTS "$TARGET" "mkdir -p '$REMOTE_DIR'"
rsync -avz --delete -e "ssh $SSH_OPTS" "$SRC/" "${TARGET}:${REMOTE_DIR}/"

echo ""
echo "Done. Restart the app so it re-opens the table:"
echo "  ssh $SSH_OPTS $TARGET 'pm2 restart wod20-web'"
