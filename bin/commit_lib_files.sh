#!/bin/bash
if [[ $TRAVIS_BRANCH = 'master' ]]
then
  git diff --exit-code --check lib/
  if [[ $? == 1 ]]
  then
    echo "Generating lib files"
    git add lib && git commit -m "Auto generated lib files"
    git push origin master
  fi
fi
