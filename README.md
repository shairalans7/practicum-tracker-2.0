# PracticumFlow UI

A static GitHub Pages copy of the PracticumFlow interface, based on the live PracticumFlow build. The bundled UI and styles are kept as delivered by the reference site.

## Publish

The `Deploy to GitHub Pages` workflow publishes the site from the `main` branch. Enable GitHub Pages with **Build and deployment → GitHub Actions** in the repository settings if it has not been enabled yet.

## Backend

GitHub Pages only serves static files. The reference app sends account and practicum record requests to its Netlify `/api/tracker` endpoint; those backend requests are not hosted by GitHub Pages. The interface can be viewed there, but data and sign-in features require a backend endpoint configured for this deployment.
