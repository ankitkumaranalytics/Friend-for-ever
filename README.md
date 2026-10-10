# A Little Place for You

A responsive single-page diary and digital letter, built with HTML, CSS and vanilla JavaScript.

## Run locally
Open `index.html` in a browser. The page uses Google Fonts when a network connection is available and falls back to system fonts otherwise.

## Interactions
- The opening note reveals the page after the visitor chooses to enter.
- The cinematic proposal can be opened from the promise or closing section; it reuses the existing photos and includes a gentle, no-pressure response.
- The provided song in `assets/music/new_song.mp4` is the page's single soundtrack. Autoplay is attempted at a low volume; if the browser blocks it, choose “▶ शुरू करें”. The floating control pauses and resumes the same playback position.
- Sweet selections and the final question only update the page; no response is sent or stored.
- The handwritten memory image opens in an accessible lightbox.
- Scroll effects respect the visitor's reduced-motion preference.

## Deploy
GitHub Actions deploys the site to GitHub Pages whenever changes are pushed to `main`.
Visit:
https://ankitkumaranalytics.github.io/Friend-for-ever/

## Important
The deployed page and this public repository are publicly accessible. The page includes a person's name, personal note and handwritten photo.
