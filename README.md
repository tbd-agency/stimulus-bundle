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

| Controller        | Fetch | Enabled | Autoimports CSS    |
|-------------------|-------|---------|--------------------|
| `ajax-submit`     | lazy  | yes     |                    |
| `app`             | eager | yes     |                    |
| `chart`           | lazy  | yes     |                    |
| `closeable`       | lazy  | yes     | `closeable.css`    |
| `confirm`         | lazy  | yes     |                    |
| `dashboard`       | lazy  | yes     |                    |
| `dropdown`        | lazy  | yes     |                    |
| `flatpickr`       | lazy  | yes     | `flatpickr.css`    |
| `inline-edit`     | lazy  | yes     |                    |
| `map`             | lazy  | no      | `leaflet.css`      |
| `marker`          | lazy  | yes     |                    |
| `modal`           | lazy  | yes     |                    |
| `reset-search`    | lazy  | yes     |                    |
| `resizable-table` | eager | yes     |                    |
| `select`          | lazy  | no      | `tom-select.css`, `select.css` |
| `select-items`    | lazy  | yes     | `select-items.css` |
| `sidebar`         | lazy  | yes     |                    |
| `sortable`        | eager | yes     |                    |
| `theme`           | eager | yes     | `theme.css`        |
| `tinymce`         | lazy  | no      | `tinymce.css`      |
| `url`             | lazy  | yes     | `url.css`          |
| `visibility-change` | lazy | yes    |                    |
| `visibility-click` | lazy | yes     |                    |

You can flip individual controllers to `"enabled": false` in
`assets/controllers.json` if your application doesn't use them.

### `visibility-click`

Shows or hides display targets with a group of toggle buttons, for example
the locale tabs of a translatable form. Clicking a control makes its `value`
the active value; a display is visible when its `data-visibility-values` list
contains that value.

```twig
<div data-controller="visibility-click">
    {% for locale in ['nl', 'fr'] %}
        <button type="button"
                value="{{ locale }}"
                aria-pressed="{{ loop.first ? 'true' : 'false' }}"
                data-visibility-click-target="control"
                data-action="visibility-click#select"
                class="aria-pressed:bg-primary-90 aria-pressed:text-white">
            {{ locale|upper }}
        </button>
    {% endfor %}

    {% for locale in ['nl', 'fr'] %}
        <div data-visibility-click-target="display"
             data-visibility-values="{{ [locale]|json_encode }}"
             class="{{ loop.first ? '' : 'hidden' }}">
            {# fields for this locale #}
        </div>
    {% endfor %}

    <input type="hidden" name="activeLocale" data-visibility-click-target="state">
</div>
```

| Target    | Markup |
|-----------|--------|
| `control` | A `<button type="button">` with a non-empty `value` and `aria-pressed`, plus `data-action="visibility-click#select"`. The controls with the active value get `aria-pressed="true"`, all others `"false"`. |
| `display` | Any element with `data-visibility-values`, a JSON list of values. It gets the `hidden` class unless the list contains the active value. Render the initial visibility server-side to avoid a flash. |
| `state`   | Optional. An input that receives the active value, so a form submit can restore the selection server-side (in a form type: `'attr' => ['data-visibility-click-target' => 'state']`). |

| Value           | Default                 | Description |
|-----------------|-------------------------|-------------|
| `active`        | `''`                    | The active value. When empty on connect, it is taken from the first control with `aria-pressed="true"`; when no control is pressed, the server-rendered visibility stays until a control is clicked. |
| `refresh-event` | `collection-item-added` | Document event after which the active value is re-applied to all targets, for example when a live collection renders a new item. |

Controls, displays and state inputs that are added later (a new collection
item) follow the active value without an event. Instead of an action on every
control, you can also put `data-action="click->visibility-click#select"` once
on the controller element. A nested `visibility-click` controller keeps its
own targets.

**Migrating from a project's `visibility--click`**: rename
`data-controller="visibility--click"` to `visibility-click` and add
`data-action="visibility-click#select"` to the controls. The
`data-visibility-click-target` and `data-visibility-values` attributes stay as
they are. The `control-selector`, `display-selector` and `state-selector`
values are gone: the targets replace them. Then remove
`assets/controllers/visibility/click_controller.js`.
## Map

`map` renders a [Leaflet](https://leafletjs.com) map with markers. It is
opt-in: install Leaflet and enable the controller in
`assets/controllers.json`. The Leaflet stylesheet comes in through
`autoimport`, so the project does not import it itself.

```bash
npm install leaflet
```

```json
"@tbd/stimulus-bundle": {
    "map": {
        "enabled": true,
        "fetch": "lazy",
        "autoimport": {
            "leaflet/dist/leaflet.css": true
        }
    }
}
```

A project that needs its own map behaviour keeps `"enabled": false` and
registers its own `assets/controllers/map_controller.js` under the same name.

```twig
<div class="h-[30vh]"
     data-controller="map"
     data-map-markers-value="{{ markers|json_encode }}">
    <template data-map-target="icon">
        {{ ux_icon('solid:location-dot', {class: 'size-5 text-tbd-accent'}) }}
    </template>
</div>
```

| Value          | Default                                       | Purpose                                                                                     |
|----------------|-----------------------------------------------|---------------------------------------------------------------------------------------------|
| `markers`      | `[]`                                          | The markers, see below                                                                      |
| `center`       | `[50.8387917, 4.3630185]` (Brussels)          | `[lat, lng]` shown when there are no markers                                                |
| `zoom`         | `16`                                          | Zoom level used with `center`                                                               |
| `fit-max-zoom` | `16`                                          | Highest zoom level when the map fits itself to the markers, e.g. for a single marker        |
| `min-zoom`     | `2`                                           |                                                                                             |
| `max-zoom`     | `18`                                          | Also the tile layer's maximum; lower it for tile servers that stop earlier                  |
| `tile-url`     | Stadia Maps "outdoors"                        | Leaflet tile URL template. Stadia needs the domain or an API key registered with them       |
| `attribution`  | `© Stadia Maps © OpenMapTiles © OpenStreetMap` | Plain text, never HTML. For links, use an `attribution` template instead                    |
| `marker-click` | `visit`                                       | `visit`, `popup` or `none`, see below                                                       |

Each marker is an object; only `lat` and `lng` are required:

```json
[
    {"lat": 50.8388, "lng": 4.3630, "name": "Head office", "url": "/offices/1", "icon": "office", "color": "var(--color-orange-400)", "radius": 250}
]
```

| Key          | Meaning                                                                                            |
|--------------|----------------------------------------------------------------------------------------------------|
| `lat`, `lng` | Numbers or numeric strings. Markers without valid coordinates are skipped                          |
| `name`       | Popup text, shown on hover (on click with `marker-click: popup`). Always text: HTML is shown as-is |
| `url`        | Where `marker-click: visit` goes. Only `http(s)` URLs are followed                                 |
| `icon`       | Name of the icon template to use (`data-map-icon`); defaults to the first icon template            |
| `color`      | CSS colour set as `color` on the cloned icon, for icons drawn in `currentColor`                    |
| `radius`     | Radius in metres; draws a circle around the marker when greater than 0                             |

Markup never comes from values. The controller clones it from `<template>`
targets that Twig rendered and escaped:

- `icon`: one root element, usually an icon. Add `data-map-icon="office"` to
  pick it per marker with `icon`. Without an icon template, markers are plain
  Leaflet circle markers.
- `popup`: one root element. Descendants with `data-map-field="name"` get that
  marker key as text. Without it, the popup is the `name` as text.
- `attribution`: the attribution with links, e.g.
  `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>`.

On a marker click, the controller dispatches a cancelable `map:marker-click`
event with the marker in `event.detail.marker`, then acts on `marker-click`:
`visit` makes a Turbo visit to the marker's `url` (ctrl/cmd-click opens a new
tab), `popup` only opens the popup, `none` leaves it to the event. Calling
`event.preventDefault()` in a `data-action="map:marker-click->…"` handler stops
the visit.

A map that was hidden while it connected has the wrong size. Call
`invalidateSize` after showing it: as an action on the event that shows it, or
from another controller through
`this.application.getControllerForElementAndIdentifier(element, 'map')`.

Despite the name, `marker` is unrelated to `map`: it inserts text placeholders
into an editor by dispatching `insert:marker` to the element its `target`
selector points to. Enabling one does not require the other.
## Select

`select` turns a `<select>` into a [Tom Select](https://tom-select.js.org)
field: searchable, with remove buttons for a multiple select, options loaded
page by page from the server, and optionally a way to add new options.

It is opt-in. Every TBD project still has its own `select` controller, and the
Stimulus bridge registers this bundle's controllers after the ones in
`assets/controllers/`. Enabled by default, it would replace the project's own
controller on the next `composer update`. Enable it in
`assets/controllers.json` once the project's copy is gone:

```json
"@tbd/stimulus-bundle": {
    "select": {
        "enabled": true,
        "fetch": "lazy",
        "autoimport": {
            "tom-select/dist/css/tom-select.css": true,
            "@tbd/stimulus-bundle/styles/select.css": true
        }
    }
}
```

`tom-select` is a peer dependency, so Symfony Flex adds it to the project's
`package.json`; run `npm install` after updating the bundle.

`select.css` styles the field with the `tbd-*` colour tokens of
`tbd/twig-component-bundle` v2, so light and dark mode follow the theme. A
project without those tokens (still on v1 of that bundle) sets the
`select.css` autoimport to `false` and keeps its own Tom Select styles.

### Values

| Value                   | Default                   | Purpose                                                                                                                                               |
|-------------------------|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `tom-select-options`    | `{}`                      | Tom Select settings as JSON, applied over the defaults. `options` and `optgroups` in it are pinned above the other options, `plugins` are added to the default plugins |
| `tom-select-url`        | `''`                      | Loads the options from the server, see below                                                                                                          |
| `tom-select-create-url` | `''`                      | Lets the user add an option: the controller posts `{"name": "…"}` as JSON and expects `{"id": …, "name": "…"}` back                                    |
| `search-param`          | `query`                   | Query parameter that carries the search text to `tom-select-url`                                                                                      |
| `min-query-length`      | `0`                       | Characters to type before the server is asked. With `0` the first page loads as soon as the field gets focus                                          |
| `load-throttle`         | `300`                     | Milliseconds after the last keystroke before the server is asked                                                                                      |
| `dropdown-parent`       | `body`                    | `body` renders the list in `<body>`, kept inside the viewport and flipped above the field when there is no room below. `''` renders it inside the field |
| `lock`                  | `false`                   | Shows the value without letting the user change it. Follows changes of the attribute                                                                  |
| `no-results-text`       | `No results found`        | Texts in the list; pass translations from the form extension                                                                                         |
| `loading-more-text`     | `Loading more results...` |                                                                                                                                                       |
| `create-text`           | `Add`                     | Shown before the typed text on the row that adds an option                                                                                            |

Without any values, the field shows every option in the order the form
renders them, with a clear button on a single select that is not required and
remove buttons on a multiple select. The texts are always set as text, never
as HTML.

The controller has two actions for the form extension to wire up:

| Action   | Wire it as                             | Purpose                                                                                                                  |
|----------|----------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `sync`   | `select:change@document->select#sync`  | Rereads the options and selection, e.g. after a Live Component changed them and called `dispatchBrowserEvent('select:change')` |
| `invalid` | `invalid->select#invalid`             | When browser validation blocks a submit, focuses the field and shows its error state, which the hidden select cannot     |

### Remote options

With `tom-select-url`, the controller asks
`{url}?page=1&query={text}` and expects:

```json
{"items": [{"value": "12", "text": "Alpha"}], "nextPageUrl": "/users/search?page=2&query=al"}
```

`nextPageUrl` is loaded when the user scrolls to the end of the list; leave
it out or `null` on the last page. Give the field `choice_lazy` (the form
extension below does), so the page only renders the selected choices.
`choice_lazy` accepts any choice the field's choice loader knows, so limit
the field's `query_builder` to what the endpoint may return.

### Hooking it to every select

The form extension stays in the project for now. Based on element-cts:

```php
<?php

namespace App\Form\Extension;

use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\Options;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Contracts\Translation\TranslatorInterface;

final class ChoiceTypeExtension extends AbstractTypeExtension
{
    public function __construct(private readonly TranslatorInterface $translator)
    {
    }

    // EntityType, EnumType, CountryType … extend ChoiceType and get this extension through it;
    // listing them here as well would run it twice for those fields
    public static function getExtendedTypes(): iterable
    {
        return [ChoiceType::class];
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'tom_select' => true,
            'tom_select_options' => [],
            'tom_select_url' => null,
            'tom_select_create_url' => null,
        ]);
        $resolver->setAllowedTypes('tom_select', 'bool');
        $resolver->setAllowedTypes('tom_select_options', 'array');
        $resolver->setAllowedTypes('tom_select_url', ['null', 'string']);
        $resolver->setAllowedTypes('tom_select_create_url', ['null', 'string']);

        // A remote select only renders the selected choices, the others are searched through tom_select_url
        $resolver->addNormalizer('choice_lazy', static fn (Options $options, bool $value): bool => null !== $options['tom_select_url'] || $value);
    }

    public function finishView(FormView $view, FormInterface $form, array $options): void
    {
        if ($view->vars['expanded'] || !$options['tom_select']) {
            return;
        }

        $attr = $view->vars['attr'];
        $attr['autocomplete'] = 'off';
        // A Live Component re-render replaces the options instead of morphing them; select:change then syncs Tom Select
        $attr['data-skip-morph'] = true;
        $attr['data-controller'] = trim(($attr['data-controller'] ?? '').' select');
        $attr['data-action'] = trim(($attr['data-action'] ?? '').' select:change@document->select#sync invalid->select#invalid');

        if ([] !== $options['tom_select_options']) {
            $attr['data-select-tom-select-options-value'] = json_encode($options['tom_select_options'], \JSON_THROW_ON_ERROR);
        }

        if (null !== $options['tom_select_url']) {
            $attr['data-select-tom-select-url-value'] = $options['tom_select_url'];
        }

        if (null !== $options['tom_select_create_url']) {
            $attr['data-select-tom-select-create-url-value'] = $options['tom_select_create_url'];
        }

        // Tom Select shows the empty option as its placeholder, also on a multiple select
        if (empty($view->vars['placeholder'])) {
            $view->vars['placeholder'] = $this->translator->trans('label.select');
        }

        $view->vars['attr'] = $attr;
    }
}
```

A form then only sets what differs for a field:

```php
$builder->add('owner', EntityType::class, [
    'class' => User::class,
    'tom_select_url' => $this->urlGenerator->generate('user_search'),
    'tom_select_options' => ['plugins' => ['dropdown_input']],
    'attr' => ['data-select-min-query-length-value' => 2],
]);
```

Settings that hold for every select of a project, such as translated texts
or `data-select-search-param-value`, go in the extension's `finishView()`.

### Overriding it in a project

A project that needs its own behaviour keeps `"enabled": false` for `select`
and registers its own `assets/controllers/select_controller.js`. That file can
extend this controller and change only what differs, through `settings()`:

```js
import SelectController from '@tbd/stimulus-bundle/src/select_controller.js'

/* stimulusFetch: 'lazy' */
export default class extends SelectController {
    settings() {
        const settings = super.settings()

        // Option data is set as text, never as HTML
        settings.render.option = (item) => {
            const option = document.createElement('div')
            option.append(this.textElement('font-semibold', item.text), this.textElement('text-xs', item.city ?? ''))

            return option
        }

        return settings
    }
}
```

A disabled controller brings no autoimports, so that project imports the
styles itself, e.g. in `assets/app.js`:

```js
import 'tom-select/dist/css/tom-select.css';
import '@tbd/stimulus-bundle/styles/select.css';
```

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

## `visibility-change`

Shows or hides elements depending on the value of a form field, e.g. the
fields that belong to the chosen content block type.

| Part       | Markup                                                                                 |
|------------|----------------------------------------------------------------------------------------|
| Controller | `data-controller="visibility-change"` and `data-action="change->visibility-change#update"` |
| Wrapper    | `data-visibility-wrapper`: groups a control with the displays it drives                |
| Control    | `data-visibility-change-target="control"` on a select, input, checkbox or radio        |
| Display    | `data-visibility-change-target="display"` and `data-visibility-values`: a JSON list    |

A display is visible (no `hidden` class) when its `data-visibility-values`
list contains the value of the control in the same wrapper. A checkbox counts
as `true` or `false`; for radios, the checked one decides. A control only
drives the displays inside its own closest wrapper, so a collection can repeat
the wrapper per item. The `data-action` can also sit on each control instead
of on the controller element.

| Value              | Default                   | Description                                         |
|--------------------|---------------------------|-----------------------------------------------------|
| `wrapper-selector` | `[data-visibility-wrapper]` | Selector of the element around a control and its displays |
| `refresh-event`    | `collection-item-added`   | Event on `document` after which all controls are applied again |

The controls are applied when the controller connects, when a control is
added, on every `change`, after the refresh event, and after every re-render
of a Live Component on or inside the controller element.

```twig
<div data-controller="visibility-change" data-action="change->visibility-change#update">
    <div data-visibility-wrapper>
        {{ form_row(form.type, {attr: {'data-visibility-change-target': 'control'}}) }}

        <div class="hidden"
             data-visibility-change-target="display"
             data-visibility-values="{{ ['image', 'text-with-image']|json_encode }}">
            {{ form_row(form.image) }}
        </div>
    </div>
</div>
```

In a form type, set the control on `attr` and the display on `row_attr`:

```php
$builder
    ->add('type', EnumType::class, [
        'class' => ContentBlockTypeEnum::class,
        'attr' => ['data-visibility-change-target' => 'control'],
    ])
    ->add('image', AttachmentType::class, [
        'row_attr' => [
            'class' => 'hidden',
            'data-visibility-change-target' => 'display',
            'data-visibility-values' => json_encode([ContentBlockTypeEnum::IMAGE->value]),
        ],
    ]);
```

### Migrating from a project's `visibility/change_controller.js`

The identifier changes from `visibility--change` to `visibility-change`. The
targets, `data-visibility-wrapper` and `data-visibility-values` keep their
names, so form types don't change.

1. Replace `data-controller="visibility--change"` with `visibility-change`,
   also inside `attributes.defaults({...})`.
2. Add `data-action="change->visibility-change#update"` to that same element.
   The project copy listened for `change` on `document`; the bundle controller
   only handles controls inside its own element.
3. Delete `assets/controllers/visibility/change_controller.js`.
4. Check that `visibility-change` is enabled in `assets/controllers.json`.

The `control-selector` and `display-selector` values are gone: use the
targets. A project that needs its own version sets `visibility-change` to
`"enabled": false` in `assets/controllers.json` and adds
`assets/controllers/visibility_change_controller.js`.
## TinyMCE

The `tinymce` controller turns a textarea into a [TinyMCE](https://www.tiny.cloud/docs/tinymce/latest/)
editor. TinyMCE is a heavy dependency, so the controller is **off by default**.

### Turning it on and off

Turn the controller on in `assets/controllers.json`:

```json
"@tbd/stimulus-bundle": {
    "tinymce": {
        "enabled": true,
        "fetch": "lazy",
        "autoimport": {
            "@tbd/stimulus-bundle/styles/tinymce.css": true
        }
    }
}
```

- `tinymce.css` styles the editor with the `tbd-*` colour tokens of
  `tbd/twig-component-bundle` v2. Set the autoimport to `false` in a project
  without those tokens.
- A project that needs more than the values below keeps `"enabled": false`
  and adds its own `assets/controllers/tinymce_controller.js`. That file can
  extend the bundle controller instead of copying it:

```js
import TinymceController from '@tbd/stimulus-bundle/src/tinymce_controller.js'
import '../tinymce/plugins/editorroute/plugin'

/* stimulusFetch: 'lazy' */
export default class extends TinymceController {
    static values = {documentsRoute: String}

    options(textarea) {
        return {...super.options(textarea), editorroute_documents_route: this.documentsRouteValue}
    }
}
```

### Loading TinyMCE

The controller uses the `tinymce` npm package, self-hosted. Flex adds it to
your `package.json`, because it is a peer dependency of this bundle. It ends
up in the build only when the controller is turned on.

Only the TinyMCE core is bundled with the controller. TinyMCE loads its
theme, icons, skins and plugins itself at runtime from `baseUrl`
(`/build/tinymce` by default), so Encore has to copy the package there:

```js
// webpack.config.js
Encore
    .copyFiles({
        from: 'node_modules/tinymce',
        to: 'tinymce/[path][name].[ext]',
    })
```

This is how the TBD projects already load TinyMCE, so they need no webpack
changes. The approach also keeps the controller flexible:

- any plugin named in `plugins` works without an extra `import`;
- the dark skin is only downloaded in dark mode;
- the lazy controller chunk only contains the core;
- nothing goes through Tiny Cloud, so no API key is needed (`license_key: 'gpl'`).

AssetMapper is not supported out of the box: TinyMCE needs its whole package
served, which `importmap:require` does not do.

### Values

| Value          | Default                                                  | Description                                                                                         |
|----------------|----------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| `toolbar`      | `undo redo \| blocks \| bold italic … \| removeformat code` | The TinyMCE toolbar.                                                                                |
| `plugins`      | `autolink link lists image anchor table code wordcount`  | Space-separated plugin names, loaded from `baseUrl`.                                                |
| `height`       | `200`                                                    | Editor height in pixels.                                                                            |
| `menubar`      | `false`                                                  | Show the menu bar.                                                                                  |
| `uploadPath`   | (empty)                                                  | URL the image dialog uploads to. Empty hides the upload button.                                     |
| `contentCss`   | (empty)                                                  | Stylesheet for the editor content, usually `asset('build/app.css')`. Empty uses TinyMCE's own.      |
| `contentStyle` | (empty)                                                  | Extra CSS for the editor content, e.g. a font `@import`.                                            |
| `bodyClass`    | `prose dark:prose-invert p-4`                            | Classes on the content body. `prose` needs `@tailwindcss/typography` in the content CSS.             |
| `skin`         | `tinymce-5`                                              | TinyMCE skin. Dark mode uses `<skin>-dark`.                                                         |
| `baseUrl`      | `/build/tinymce`                                         | Where the copied TinyMCE package is served.                                                         |
| `options`      | `{}`                                                     | Any other [TinyMCE option](https://www.tiny.cloud/docs/tinymce/latest/editor-important-options/), as JSON. Wins over the values above. |

Besides these values, the controller always sets what the projects shared:
`toolbar_mode: 'sliding'`, no branding, and absolute URLs including the host
(`relative_urls: false`, `remove_script_host: false`), so links keep working
in e-mails.

The controller writes the content back to the textarea and dispatches a
bubbling `change` event on it at every TinyMCE change, for Live Components.
It also has two actions:

- `sync` reloads the editors from their textarea, e.g. on
  `tinymce:change@document` after a Live Component changed the value;
- `insertMarker` inserts `event.detail.marker` from the `marker` controller as
  text, on `insert:marker`.

**Upload.** The image is posted as the `upload` field to `uploadPath`, which
answers `{"url": "…"}`, or `{"error": {"message": "…"}}` with an error status.
The message is shown in the editor.

**Dark mode.** The editors follow the `dark` class on `<html>`: when it
changes, they restart with the dark skin, and the content iframe gets the
`dark` class on its own `<html>` too, so the `tbd-*` tokens and `dark:`
variants work inside the content.

### Attaching it to a `TextareaType`

For one field, put the controller on the textarea itself:

```php
use Symfony\Component\Asset\Packages;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;

public function __construct(private readonly Packages $packages)
{
}

public function buildForm(FormBuilderInterface $builder, array $options): void
{
    $builder->add('body', TextareaType::class, [
        'attr' => [
            'data-controller' => 'tinymce',
            'data-tinymce-content-css-value' => $this->packages->getUrl('build/app.css'),
            'data-tinymce-height-value' => 400,
        ],
    ]);
}
```

For every textarea, use a form theme. Inside a Live Component, the wrapper
needs `data-live-ignore`, so that a re-render does not remove the editor.
A field opts out with `'attr' => ['tinymce' => false]`:

```twig
{%- block textarea_widget -%}
    {%- if attr.tinymce is defined and attr.tinymce is same as(false) -%}
        {{- parent() -}}
    {%- else -%}
        <div data-live-ignore
             data-controller="tinymce"
             data-tinymce-content-css-value="{{ asset('build/app.css') }}"
             data-tinymce-upload-path-value="{{ path('tinymce_upload') }}"
             data-action="tinymce:change@document->tinymce#sync insert:marker->tinymce#insertMarker">
            {%- set attr = attr|merge({'data-tinymce-target': 'input'}) -%}
            {{- parent() -}}
        </div>
    {%- endif -%}
{%- endblock textarea_widget -%}
```
