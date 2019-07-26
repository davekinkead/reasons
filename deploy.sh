#!/bin/bash

git checkout master
git pull github master
git merge development
npm run minify
git commit -am "Autobuild and minify"
git push github master
git checkout gh-pages
git merge master
git push github gh-pages
git checkout master