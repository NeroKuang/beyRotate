#!/bin/sh
set -e

# 首次部署可設 RUN_DB_PUSH=1，之後關閉
if [ "$RUN_DB_PUSH" = "1" ]; then
  echo "[start] prisma db push..."
  node ./node_modules/prisma/build/index.js db push --skip-generate || true
fi

exec node server.js
