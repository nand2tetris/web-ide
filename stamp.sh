#!/usr/bin/bash

set -e # Exit on errors
set -x # Shell debugging

# CURRENT and NEXT have the format YYYY.WW.REV, where YYYY is the current year,
# WW is the current week, and REV is the number of releases this week.
# The next revision compares the two, in this way
# - If NEXT is later than CURRENT in any fields, accept NEXT.
# - Otherwise, return CURRENT, with one added to REV.
#
# THIS FUNCTION IS NOT TRANSITIVE! It must be called with
# `compare_versions CURRENT NEXT`
compare_versions() {
    if [[ "$1" < "$2" ]]; then
        echo "$2"
    else
        IFS='.' read -r y1 w1 r1 <<<"$1"
        r1=$((r1 + 1))
        echo "${y1}.${w1}.${r1}"
    fi
}

# compare_versions 2024.44.4 2024.44.0 # 2024.44.5
# compare_versions 2024.44.4 2024.45.0 # 2024.45.0
# compare_versions 2024.44.4 2025.1.0 # 2025.1.0

CURRENT=$(grep version package.json | awk -F\" '{print $4}')
NEXT=$(date +%Y.%W.0)
VERSION=$(compare_versions "$CURRENT" "$NEXT")
echo "Releasing $VERSION..."
npm version "$VERSION" -ws --include-workspace-root --no-git-tag-version
sed "/version/ s/$CURRENT/$VERSION/" web/public/index.html > web/public/index.html.out ; mv web/public/index.html.out web/public/index.html
git --no-pager diff
git add .
git commit --message "Release ${VERSION}"
