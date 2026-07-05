#!/usr/bin/env bash
# Deploy Aidara Mobile PWA to production server
# Usage: ./deploy/deploy.sh [user@host]
#
# Prerequisites:
#   - pnpm installed locally
#   - SSH access to server
#   - nginx configured (see deploy/nginx.conf)

set -euo pipefail

REMOTE="${1:-user@aidara-mobile.bogorkab.go.id}"
REMOTE_DIR="/var/www/aidara/mobile/dist"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Building production bundle..."
cd "$MOBILE_DIR"
pnpm build

echo "==> Uploading dist/ to $REMOTE:$REMOTE_DIR ..."
rsync -avz --delete \
  --exclude='.git' \
  "$MOBILE_DIR/dist/" \
  "$REMOTE:$REMOTE_DIR/"

echo "==> Deploy complete!"
echo "    Verify: https://aidara-mobile.bogorkab.go.id"
