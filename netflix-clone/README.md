# Netflix Clone

A Netflix-style front end in plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run it

Open `index.html` (the landing page) in a browser, or use Live Server in VS Code. An internet connection is needed for the artwork and sample videos. The five featured titles use curated Pexels photos; the remaining sample titles use deterministic Picsum artwork.

## Structure

```
netflix-clone/
├── index.html
├── css/
│   ├── theme.css        design tokens, three themes, liquid glass
│   ├── components.css   neumorphic buttons, sliders, toggles
│   ├── style.css        navbar, hero, carousels, poster cards
│   ├── overlays.css     details view, video player, toast
│   └── studio.css       personalization panel
├── js/
│   ├── utils.js         helpers and icons
│   ├── data.js          movie data
│   ├── store.js         saved settings, watchlist, progress
│   ├── effects.js       pointer light, tilt, magnetic buttons, parallax, reveals
│   ├── studio.js        theme, accent, glass, presets
│   ├── details.js       card-to-details transition
│   ├── player.js        video player
│   └── app.js           hero, rows, search, shortcuts
└── assets/
```

## Keyboard shortcuts

`/` search, `S` studio, `P` play, `L` my list, `Esc` close.
In the player: `Space` play/pause, arrows seek and volume, `M` mute, `F` fullscreen.

## Notes

- Everything you change in the studio is saved in localStorage, along with My List and watch progress.
- The videos are Blender Foundation open movies hosted by Google's sample bucket.
- Replace `js/data.js` with a TMDB fetch when you are ready for real posters.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Landing page with email sign-up, leads to profiles |
| `profiles.html` | Who's watching: pick, add, rename and delete profiles |
| `browse.html` | Home: hero, rows, details view, player |
| `search.html` | Live search with genre filters (`?q=` supported) |
| `movie.html?id=N` | Title page with play, My List and similar titles |
| `my-list.html` | Continue watching and saved titles |
| `watch.html?id=N` | Full-page player that resumes your progress |
| `settings.html` | Profile name, playback defaults, studio, data reset |

Shared by the new pages: `js/chrome.js` (navbar, studio, profiles), `js/pages.js` (page logic), `css/pages.css`.
