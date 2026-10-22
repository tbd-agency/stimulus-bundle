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
| `marker`          | lazy  | yes     |                    |
| `modal`           | lazy  | yes     |                    |
| `reset-search`    | lazy  | yes     |                    |
| `resizable-table` | eager | yes     |                    |
| `select-items`    | lazy  | yes     | `select-items.css` |
| `sidebar`         | lazy  | yes     |                    |
| `sortable`        | eager | yes     |                    |
| `theme`           | eager | yes     | `theme.css`        |
| `url`             | lazy  | yes     | `url.css`          |
| `visibility-change` | lazy | yes    |                    |

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
