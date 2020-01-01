#!/usr/bin/env bash

git log --pretty=format:"%B" | sed '/^$/d'
