#!/bin/bash
# ===========================================================================
# Uptime heartbeat.
#
# Added 2026-09-03. The site has gone unreachable several times and every
# investigation started from nothing, so this records the evidence while it is
# happening rather than reconstructing it afterwards.
#
# Every run it appends one line: the time, the load, our process count, and
# whether the server can fetch its own home page over the local loopback.
#
# The point is the distinction that InMotion will ask about:
#
#   heartbeat kept writing, site unreachable from outside
#       -> the machine was alive. The fault is the proxy, the network or an
#          edge firewall, and it is theirs.
#
#   heartbeat has a gap covering the outage
#       -> the machine itself stalled. Also theirs, but a different team.
#
# Cost is one line of text every five minutes. It writes to a file, never to
# the database, and it will not add to whatever load is already there.
#
# Install as a cron job:
#   */5 * * * * /bin/bash /home/medpar6/public_html/dashboard/tools/heartbeat.sh
# ===========================================================================

LOG="$HOME/dashboard-data/heartbeat.log"
SITE="https://www.medparkhospitals.com/"
UA="MedPark-Heartbeat/1.0"

mkdir -p "$(dirname "$LOG")" 2>/dev/null

TS=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
LOAD=$(cut -d' ' -f1-3 /proc/loadavg 2>/dev/null | tr ' ' '/')
PROCS=$(ps -u "$(id -un)" --no-headers 2>/dev/null | wc -l | tr -d ' ')

# Can the server serve its own home page? A short timeout, because a heartbeat
# that hangs is worse than one that reports a failure.
CODE=$(curl -sk -o /dev/null -m 12 -A "$UA" -w '%{http_code}' "$SITE" 2>/dev/null)
TIME=$(curl -sk -o /dev/null -m 12 -A "$UA" -w '%{time_total}' "$SITE" 2>/dev/null)

printf '%s load=%s procs=%s self=%s in=%ss\n' "$TS" "$LOAD" "$PROCS" "${CODE:-000}" "${TIME:-0}" >> "$LOG"

# Keep the last 30 days at five minute intervals, roughly 8,600 lines, and
# never let this file become the disk problem it exists to diagnose.
LINES=$(wc -l < "$LOG" 2>/dev/null || echo 0)
if [ "$LINES" -gt 10000 ]; then
  tail -n 8600 "$LOG" > "$LOG.trim" && mv "$LOG.trim" "$LOG"
fi
chmod 600 "$LOG" 2>/dev/null
