#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="127.0.0.1"
PORT="3000"

cd "$ROOT_DIR"

find_listening_pids() {
  lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true
}

stop_existing_processes() {
  local pids
  pids="$(find_listening_pids)"

  if [[ -z "$pids" ]]; then
    echo "No process is listening on port $PORT."
    return
  fi

  echo "Stopping processes on port $PORT..."

  while IFS= read -r pid; do
    [[ -n "$pid" ]] || continue
    echo "  -> Sending SIGTERM to PID $pid"
    kill "$pid" 2>/dev/null || true
  done <<< "$pids"

  for _ in {1..10}; do
    if [[ -z "$(find_listening_pids)" ]]; then
      echo "Port $PORT is now free."
      return
    fi

    sleep 0.5
  done

  pids="$(find_listening_pids)"

  if [[ -n "$pids" ]]; then
    echo "Processes are still running on port $PORT. Sending SIGKILL..."

    while IFS= read -r pid; do
      [[ -n "$pid" ]] || continue
      echo "  -> Sending SIGKILL to PID $pid"
      kill -9 "$pid" 2>/dev/null || true
    done <<< "$pids"
  fi
}

stop_existing_processes

echo "Running production build..."
npm run build

echo "Starting app on http://$HOST:$PORT ..."
exec npm run start -- --hostname "$HOST" --port "$PORT"
