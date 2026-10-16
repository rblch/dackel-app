# Dackel website

The static website for Dackel, a native Markdown editor for macOS.

- Website: https://rblch.github.io/dackel-app/
- Support: https://rblch.github.io/dackel-app/support.html

## Local preview

```sh
python3 -m http.server 8080
```

Open <http://localhost:8080/>. No build or dependency installation is needed.

## Publishing

GitHub Pages publishes the root of `main`. Push updates to `main` to deploy.
Relative URLs support the `/dackel-app/` project path.

## Assets and interaction

The app screenshot was supplied by the developer. The header uses the app's
existing pixel-art walk atlas for both its resting pose and optional animation.
Click the Dackel, or use Enter/Space, for a short walk; Escape cancels it. Reduce
Motion uses a static bone instead. Core content remains available without
JavaScript. There are no analytics or external font dependencies.

## Privacy notice

The privacy notice covers this website, not data handling inside the Dackel app.
