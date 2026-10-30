#!/usr/bin/env bash
# Go-live swap for healthcareig.com (SFTP only, the account has no shell). Run ONLY after the owner writes "publish live".
#   bash scripts/golive-swap.sh swap       move the old site out of public_html (kept whole in ~/old_site_<date>), move
#                                          the staged v6 (~/v6_stage) in; writes the exact rollback batch first
#   bash scripts/golive-swap.sh rollback   undo: the v6 files go to ~/v6_rolledback, the old site moves back
# Nothing is deleted. Each rename is instant; the site is mixed for a few seconds at most.
set -e
MODE="${1:-}"; OLD="old_site_2026-10-30"; LOG="$(dirname "$0")/../../.playwright-mcp/live"; mkdir -p "$LOG"
list() { printf 'ls -1a %s\n' "$1" | sftp -q -b - hcig 2>/dev/null | grep -v '^sftp>' | sed 's#.*/##' | grep -v -x -e '.' -e '..' ; }
if [ "$MODE" = swap ]; then
  OLDLIST=$(list public_html | grep -v -x -e '.ftpquota' -e '.well-known' -e 'cgi-bin')
  NEWLIST=$(list v6_stage)
  [ -n "$NEWLIST" ] || { echo "stage is empty"; exit 1; }
  echo "$NEWLIST" | grep -qx index.html || { echo "stage has no index.html"; exit 1; }
  # rollback batch, written before anything moves
  { echo "-mkdir v6_rolledback"; for x in $NEWLIST; do echo "-rename public_html/$x v6_rolledback/$x"; done
    for x in $OLDLIST; do echo "-rename $OLD/$x public_html/$x"; done; } > "$LOG/rollback.batch"
  { echo "mkdir $OLD"; for x in $OLDLIST; do echo "rename public_html/$x $OLD/$x"; done
    for x in $NEWLIST; do echo "rename v6_stage/$x public_html/$x"; done; } > "$LOG/swap.batch"
  echo "old items: $(echo "$OLDLIST" | wc -l), new items: $(echo "$NEWLIST" | wc -l)"
  sftp -q -b "$LOG/swap.batch" hcig && echo "swap done"
elif [ "$MODE" = rollback ]; then
  [ -f "$LOG/rollback.batch" ] || { echo "no rollback batch"; exit 1; }
  sftp -q -b "$LOG/rollback.batch" hcig && echo "rollback done"
else
  echo "usage: golive-swap.sh swap|rollback"; exit 1
fi
