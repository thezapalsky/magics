#!/bin/sh
set -eu

deck_file="${1:-decks/lathril/decklist.txt}"

awk '
  /^\/\/ COMMANDER$/ { section = "commander"; next }
  /^\/\/ DECK$/ { section = "deck"; next }
  /^[0-9]+ / {
    quantity = $1
    name = $0
    sub(/^[0-9]+ /, "", name)

    total += quantity
    if (section == "commander") commander += quantity
    if (section == "deck") main += quantity

    is_basic = (name == "Forest" || name == "Swamp" || name == "Plains" || name == "Island" || name == "Mountain" || name == "Wastes")
    if (!is_basic) {
      copies[name] += quantity
      if (copies[name] > 1) {
        printf "Duplicate nonbasic card: %s (%d copies)\n", name, copies[name] > "/dev/stderr"
        invalid = 1
      }
    }
  }
  END {
    printf "Commander: %d\nMain deck: %d\nTotal: %d\n", commander, main, total
    if (commander != 1 || main != 99 || total != 100 || invalid) exit 1
  }
' "$deck_file"
