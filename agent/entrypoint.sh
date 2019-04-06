#!/bin/sh

while sleep ${t:-60}; do
    go run .
    t=$(cat sleep.txt 2>/dev/null)
done
