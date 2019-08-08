#!/bin/bash

git checkout development
npm run test
npm run minify
git commit -am "Autobuild and minify"
git push github development
git checkout master
git merge development
git push github master
git checkout gh-pages
git merge master
git push github gh-pages
git checkout development