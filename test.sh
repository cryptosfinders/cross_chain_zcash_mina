#!/usr/bin/env bash
set -e
echo "Test runner (mock). Starts mock Mina verifier and mock relayer in background."
(cd mina && npm install --silent && npm start &) 
sleep 1
(cd relayer && npm install --silent && npm start &)
echo "Started services. Watch logs in terminal or use curl to POST to Mina endpoint."
