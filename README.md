# tbd/stimulus-bundle

A Symfony bundle containing a shared library of reusable Stimulus controllers
used across TBD projects.

This bundle is typically installed automatically as a dependency of
[`tbd/twig-component-bundle`](https://github.com/tbd-agency/twig-component-bundle),
which provides the matching Twig components. It can also be installed on its
own when you only need the Stimulus controllers.

## Installation

This bundle is distributed as a **private Composer package**. Because it is
hosted in a private GitHub repository, register it under `repositories` in
your project's `composer.json`:

```json
{
  "repositories": [
    {
      "type": "vcs",
      "url": "git@github.com:tbd-agency/stimulus-bundle.git"
    }
  ]
}
```

Then install it:

```bash
composer require tbd/stimulus-bundle
npm install
```

That's it — the controllers ship with a `symfony.controllers` manifest in
their `package.json`, so they are picked up automatically by the Symfony UX
Stimulus bridge and registered in your `assets/controllers.json`. After
`npm install` they are immediately available in your application.

## Controllers

The following controllers are exposed under the `@tbd/stimulus-bundle`
namespace:

| Controller     | Fetch | Enabled | Autoimports CSS    |
|----------------|-------|---------|--------------------|
| `ajax-submit`  | lazy  | yes     |                    |
| `app`          | eager | yes     |                    |
| `chart`        | lazy  | yes     |                    |
| `closeable`    | lazy  | yes     | `closeable.css`    |
| `confirm`      | lazy  | yes     |                    |
| `dashboard`    | lazy  | yes     |                    |
| `dropdown`     | lazy  | yes     |                    |
| `flatpickr`    | lazy  | yes     | `flatpickr.css`    |
| `inline-edit`  | lazy  | yes     |                    |
| `marker`       | lazy  | yes     |                    |
| `modal`        | lazy  | yes     |                    |
| `reset-search` | lazy  | yes     |                    |
| `select-items` | lazy  | yes     | `select-items.css` |
| `sidebar`      | lazy  | yes     |                    |
| `sortable`     | eager | yes     |                    |
| `theme`        | eager | yes     | `theme.css`        |
| `url`          | lazy  | yes     | `url.css`          |

You can flip individual controllers to `"enabled": false` in
`assets/controllers.json` if your application doesn't use them.

## Tailwind CSS

The controllers are built to work with **Tailwind CSS**, **Flowbite** and
**Hotwire Turbo**. Tell Tailwind where to find this bundle's sources:

**Tailwind v3** (`tailwind.config.js`):

```js
content: [
    './vendor/tbd/stimulus-bundle/assets/src/**/*.js',
]
```

**Tailwind v4** (`assets/styles/app.css`):

```css
@source '../../vendor/tbd/stimulus-bundle/assets/src/**/*.js';
```
