#!/usr/bin/env bash

MYDIR=$(cd $(dirname "$0") && pwd)
pushd "$MYDIR"
npm install
npm start
popd
