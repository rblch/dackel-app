# Dackel website

The static website for Dackel, a native Markdown editor for macOS.

- Website: https://dackelapp.com/
- Support: https://dackelapp.com/support.html

## Local preview

```sh
python3 -m http.server 8080
```

Open <http://localhost:8080/>. No build or dependency installation is needed.

## Publishing

GitHub Pages publishes the root of `main`. Push updates to `main` to deploy.
The `CNAME` file preserves the `dackelapp.com` custom domain on deployment.
Relative URLs also support the original `/dackel-app/` project path.

## Assets and interaction

The app screenshot was supplied by the developer. The header uses the app's
existing pixel-art walk atlas for both its resting pose and optional animation.
Click the Dackel, or use Enter/Space, for a short walk; Escape cancels it. Reduce
Motion uses a static bone instead. Core content remains available without
JavaScript. There are no analytics or external font dependencies.

## Privacy notice

The privacy notice covers the Dackel macOS app and this website, including local
storage, external content, hosting, support correspondence, and deletion.

## Indexing preferences

Impressum, Support, and Privacy include `noindex`, `nofollow`, `noarchive`,
`nosnippet`, and `noimageindex` meta directives. Googlebot, Bingbot, and Applebot
can fetch these pages to read the directives. Other crawlers, including AI
crawlers, are asked not to fetch these paths by the root `robots.txt` file.
Google-Extended and Applebot-Extended also have explicit exclusions.
The homepage remains indexable and the footer links remain available to visitors.

These are voluntary crawler directives, not access control. They cannot force
removal of existing copies or prevent crawlers that ignore them from collecting
public content. Existing search results may take time to disappear after a recrawl.
