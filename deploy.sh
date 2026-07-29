#!/usr/bin/env bash
#
# Runs the backend and the frontend together.
#
# Target: Windows, via Git Bash (or any MSYS/Cygwin bash). Windows has no
# `sh`, so run it with bash explicitly:
#
#     bash deploy.sh
#
# Any port already in use is freed before the service starts, so a leftover
# process from a previous run never blocks a restart.
#
# Options:
#   --backend-port N    default 8000   (or $BACKEND_PORT)
#   --frontend-port N   default 5173   (or $FRONTEND_PORT)
#   --open              open the app in the browser once it is up
#   --help
#
# Stop everything with Ctrl+C.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
OPEN_BROWSER=0

BACKEND_PID=""
FRONTEND_PID=""
CLEANED=0

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
# Deliberately English: Persian text renders scrambled in most Windows
# terminals because of bidirectional reordering.

if [ -t 1 ]; then
  C_RESET=$'\033[0m'; C_DIM=$'\033[2m'; C_BLUE=$'\033[34m'
  C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_RED=$'\033[31m'
else
  C_RESET=""; C_DIM=""; C_BLUE=""; C_GREEN=""; C_YELLOW=""; C_RED=""
fi

log()  { printf '%s[ deploy ]%s %s\n' "$C_BLUE"  "$C_RESET" "$*"; }
ok()   { printf '%s[   ok   ]%s %s\n' "$C_GREEN" "$C_RESET" "$*"; }
warn() { printf '%s[  warn  ]%s %s\n' "$C_YELLOW" "$C_RESET" "$*"; }
die()  { printf '%s[ error  ]%s %s\n' "$C_RED"   "$C_RESET" "$*" >&2; exit 1; }

# Prints the comment header above, so the help text cannot drift from it.
usage() {
  awk 'NR>2 && /^#/ { sub(/^# ?/, ""); print; next } NR>2 { exit }' "${BASH_SOURCE[0]}"
  exit 0
}

while [ $# -gt 0 ]; do
  case "$1" in
    --backend-port)  BACKEND_PORT="${2:-}"; shift 2 ;;
    --frontend-port) FRONTEND_PORT="${2:-}"; shift 2 ;;
    --open)          OPEN_BROWSER=1; shift ;;
    -h|--help)       usage ;;
    *)               die "Unknown option: $1  (try --help)" ;;
  esac
done

case "$(uname -s 2>/dev/null)" in
  MINGW*|MSYS*|CYGWIN*) IS_WINDOWS=1 ;;
  *)                    IS_WINDOWS=0 ;;
esac

# ---------------------------------------------------------------------------
# Port handling
# ---------------------------------------------------------------------------

# Prints the PIDs listening on a port, one per line.
pids_on_port() {
  local port="$1"

  if [ "$IS_WINDOWS" -eq 1 ]; then
    # Match the *local* address column only — the foreign address can end in
    # the same port for outbound connections. The state column is localised on
    # non-English Windows, so it is not matched on.
    netstat -ano 2>/dev/null \
      | awk -v pattern=":${port}\$" '($1 == "TCP" || $1 == "UDP") && $2 ~ pattern { print $NF }' \
      | grep -E '^[0-9]+$' \
      | grep -vE '^(0|4)$' \
      | sort -u
  else
    lsof -ti "tcp:${port}" -sTCP:LISTEN 2>/dev/null | sort -u
  fi
}

kill_pid() {
  local pid="$1"

  if [ "$IS_WINDOWS" -eq 1 ]; then
    # Doubled slashes stop MSYS from rewriting the flags into paths.
    # //T also takes down the child processes uvicorn/node spawn.
    taskkill //F //T //PID "$pid" >/dev/null 2>&1
  else
    kill -9 "$pid" >/dev/null 2>&1
  fi
}

# Frees a port, waiting until the OS has actually released it.
free_port() {
  local port="$1" label="$2" quiet="${3:-}"
  local pids attempt

  pids="$(pids_on_port "$port")"
  [ -z "$pids" ] && return 0

  [ -z "$quiet" ] && warn "Port $port ($label) is busy — PID: $(echo "$pids" | tr '\n' ' ')"

  for pid in $pids; do
    kill_pid "$pid"
  done

  # Sockets linger briefly after the owner dies; binding too early fails.
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    sleep 0.3
    [ -z "$(pids_on_port "$port")" ] && {
      [ -z "$quiet" ] && ok "Port $port released"
      return 0
    }
  done

  [ -z "$quiet" ] && die "Could not free port $port. Close the process manually and retry."
  return 1
}

wait_until_up() {
  local url="$1" label="$2" attempt
  for attempt in $(seq 1 60); do
    if curl -sf -o /dev/null --max-time 2 "$url"; then
      ok "$label is up  →  $url"
      return 0
    fi
    # Bail out early if the process died instead of waiting the full timeout.
    if [ "$label" = "Backend" ] && [ -n "$BACKEND_PID" ] && ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      return 1
    fi
    sleep 0.5
  done
  return 1
}

# Stops one launched service and the processes it spawned.
#
# It must kill *only* our own process tree. Freeing the port instead would be
# simpler but is actively wrong: if a second copy of this script is started
# while this one is running, the second one takes over the ports, and this
# one's shutdown would then kill the new instance's server.
stop_tree() {
  local pid="$1" winpid
  [ -z "$pid" ] && return 0
  kill -0 "$pid" 2>/dev/null || return 0

  if [ "$IS_WINDOWS" -eq 1 ]; then
    # MSYS pids are not Windows pids; /proc exposes the real one.
    winpid="$(cat "/proc/$pid/winpid" 2>/dev/null)"
    if [ -n "$winpid" ]; then
      taskkill //F //T //PID "$winpid" >/dev/null 2>&1
      return 0
    fi
  fi

  # `npm run dev` spawns vite as a child, so the child goes first.
  pkill -P "$pid" >/dev/null 2>&1
  kill "$pid" >/dev/null 2>&1
  sleep 0.5
  kill -9 "$pid" >/dev/null 2>&1
}

cleanup() {
  [ "$CLEANED" -eq 1 ] && return
  CLEANED=1

  printf '\n'
  log "Shutting down..."

  stop_tree "$FRONTEND_PID"
  stop_tree "$BACKEND_PID"

  ok "Stopped."
}

trap cleanup EXIT
trap 'exit 130' INT TERM

# ---------------------------------------------------------------------------
# Toolchain discovery
# ---------------------------------------------------------------------------

find_python() {
  local candidates=(
    "$BACKEND_DIR/venv/Scripts/python.exe"    # the committed Windows venv
    "$BACKEND_DIR/.venv/Scripts/python.exe"
    "$BACKEND_DIR/venv/bin/python"
    "$BACKEND_DIR/.venv/bin/python"
  )

  # Actually run each candidate rather than trusting the executable bit: a
  # half-created venv, or a Windows venv/ copied onto another OS, passes -x
  # but cannot run.
  for candidate in "${candidates[@]}" python python3 py; do
    "$candidate" --version >/dev/null 2>&1 && { printf '%s' "$candidate"; return 0; }
  done

  return 1
}

find_npm() {
  for candidate in npm npm.cmd; do
    command -v "$candidate" >/dev/null 2>&1 && { printf '%s' "$candidate"; return 0; }
  done
  return 1
}

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

[ -d "$BACKEND_DIR" ]  || die "backend/ not found next to this script."
[ -d "$FRONTEND_DIR" ] || die "frontend/ not found next to this script."

log "Project: $ROOT"
log "Backend port $BACKEND_PORT · Frontend port $FRONTEND_PORT"

PYTHON="$(find_python)" || die "Python not found. Install it, or create backend/venv."
NPM="$(find_npm)"       || die "npm not found. Install Node.js and reopen the terminal."

log "Python: $PYTHON"

# --- backend ---------------------------------------------------------------

if ! "$PYTHON" -c "import uvicorn, fastapi, jdatetime" >/dev/null 2>&1; then
  warn "Backend dependencies missing — installing from requirements.txt"
  ( cd "$BACKEND_DIR" && "$PYTHON" -m pip install -q -r requirements.txt ) \
    || die "pip install failed."
  ok "Dependencies installed"
fi

free_port "$BACKEND_PORT" "backend"

log "Starting backend..."
# `cd` matters: main.py imports config/models/processing as flat modules.
( cd "$BACKEND_DIR" && exec "$PYTHON" -m uvicorn main:app --host 127.0.0.1 --port "$BACKEND_PORT" --reload ) &
BACKEND_PID=$!

wait_until_up "http://127.0.0.1:$BACKEND_PORT/swagger" "Backend" \
  || die "Backend did not start. Run it manually in backend/ to see the error."

# --- frontend --------------------------------------------------------------

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  warn "node_modules missing — running npm install (this takes a minute)"
  ( cd "$FRONTEND_DIR" && "$NPM" install ) || die "npm install failed."
  ok "Packages installed"
fi

free_port "$FRONTEND_PORT" "frontend"

log "Starting frontend..."
# --strictPort so Vite fails loudly instead of silently moving to 5174, which
# would break the CORS origin the backend allows.
( cd "$FRONTEND_DIR" && exec "$NPM" run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" --strictPort ) &
FRONTEND_PID=$!

wait_until_up "http://127.0.0.1:$FRONTEND_PORT/" "Frontend" \
  || die "Frontend did not start. Run npm run dev in frontend/ to see the error."

# --- ready -----------------------------------------------------------------

printf '\n'
ok "Everything is running."
printf '  %sApp     %s http://localhost:%s\n' "$C_DIM" "$C_RESET" "$FRONTEND_PORT"
printf '  %sAPI     %s http://127.0.0.1:%s\n' "$C_DIM" "$C_RESET" "$BACKEND_PORT"
printf '  %sSwagger %s http://127.0.0.1:%s/swagger\n' "$C_DIM" "$C_RESET" "$BACKEND_PORT"
printf '\n%sPress Ctrl+C to stop both.%s\n\n' "$C_DIM" "$C_RESET"

if [ "$OPEN_BROWSER" -eq 1 ]; then
  if [ "$IS_WINDOWS" -eq 1 ]; then
    start "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1 || true
  else
    open "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1 || true
  fi
fi

# Keep the script alive so the trap can clean up on Ctrl+C.
wait
