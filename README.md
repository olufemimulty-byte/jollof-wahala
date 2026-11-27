# Jollof Wahala

A Nigerian word-guessing game with 900+ puzzles: food, places, slang, proverbs, music, Nollywood, football, history, books, languages and festivals. Guess letter by letter before the jollof pot burns. Puzzles never repeat until a category is used up.

**Play:** https://olufemimulty-byte.github.io/jollof-wahala/

## Install it as an app

- **Windows app:** download `Jollof-Wahala-Setup` from the Releases page and run it. It adds a desktop and Start menu shortcut.
- **From the browser (Windows, Mac, Android):** open the play link in Chrome or Edge and choose **Install** in the address bar or menu.
- **iPhone:** open the link in Safari, tap Share, then **Add to Home Screen**.

Every version loads the game from this site, so new puzzles and features reach installed apps automatically. An open app shows an "Update now" notice when a new version is published.

## Updating the game

1. Edit puzzles in `source/data/<category>.txt` (one `ANSWER|clue` per line) or the game in `source/game.html`.
2. Run `node source/build.js`. It checks for duplicates and bad characters, then rebuilds `index.html`, `version.json` and the app's offline copy.
3. Commit and push. GitHub Pages publishes it, and installed apps pick it up.

The Windows installer only needs rebuilding if `desktop/main.js` changes: `cd desktop`, `npm install`, `npm run dist`.
