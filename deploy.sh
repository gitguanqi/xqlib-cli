#!/bin/bash
# author: gitguanqi
# date: 2022.09.29
# des: this is a auto submit shell script.

set -e

git add .
read -r -p "Please input your commit: " commit

if [ -z "$commit" ]; then
    echo "Commit message cannot be empty." >&2
    exit 1
fi

git commit -m "$commit"
git push origin main

exit 0
