import {Controller} from '@hotwired/stimulus'
import TomSelect from 'tom-select'

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        // Tom Select settings as JSON. Its options and optgroups are pinned above the other options, its plugins are added to the default ones
        tomSelectOptions: {type: Object, default: {}},
        // Searches on the server: the url answers {items: [{value, text}], nextPageUrl?: string}
        tomSelectUrl: {type: String, default: ''},
        // Lets the user add an option: the url receives {name} as JSON and answers {id, name}
        tomSelectCreateUrl: {type: String, default: ''},
        searchParam: {type: String, default: 'query'},
        minQueryLength: {type: Number, default: 0},
        loadThrottle: {type: Number, default: 300},
        // 'body' keeps the list out of containers that would clip it, '' renders it inside the field
        dropdownParent: {type: String, default: 'body'},
        lock: {type: Boolean, default: false},
        noResultsText: {type: String, default: 'No results found'},
        loadingMoreText: {type: String, default: 'Loading more results...'},
        createText: {type: String, default: 'Add'},
    }

    connect() {
        this.resetCachedCopy()

        this.tomSelect = new TomSelect(this.element, this.settings())

        const {options = [], optgroups = []} = this.tomSelectOptionsValue
        this.pinOptions(options, optgroups)

        // Live does not always know the wrapper was added by JS, a re-render would then remove it and the field disappears
        this.tomSelect.wrapper.setAttribute('data-live-ignore', '')

        if ('body' === this.dropdownParentValue) {
            this.constrainDropdownToViewport()
        }

        if (this.lockValue) {
            this.tomSelect.lock()
        }
    }

    disconnect() {
        this.resizeObserver?.disconnect()

        if (this.tomSelect) {
            // destroy() puts back the options the select had when Tom Select was created, which drops the current selection
            // of a select that is only moved (e.g. a sorted collection row) or received new options since; keep the current ones.
            // The selection itself is not part of the markup, so it is set again afterwards
            const values = [...this.tomSelect.items]
            this.tomSelect.revertSettings.innerHTML = this.element.innerHTML
            this.tomSelect.destroy()
            this.tomSelect = null

            for (const option of this.element.options) {
                option.selected = values.includes(option.value)
            }
        }
    }

    // Settings for Tom Select; a project controller that extends this one can adjust them here
    settings() {
        // Options and optgroups are added after initialization, otherwise they would replace the options rendered in the DOM
        // (with choice_lazy only the selected ones are rendered), which would drop the current selection
        const {options, optgroups, plugins = [], ...custom} = this.tomSelectOptionsValue

        const settings = {
            dropdownParent: this.dropdownParentValue || null,
            maxOptions: null,
            // Keeps the order in which the form renders the choices
            sortField: [{field: '$order'}, {field: '$score'}],
            plugins: [...this.defaultPlugins(), ...plugins],
            render: {
                no_results: () => this.textElement('no-results', this.noResultsTextValue),
                // Only a labelled group gets a header, the others are separated by their border alone
                optgroup_header: (data) => data.label ? this.textElement('optgroup-header', data.label) : null,
            },
        }

        if (this.tomSelectUrlValue) {
            this.addRemoteSettings(settings)
        }

        if (this.tomSelectCreateUrlValue) {
            this.addCreateSettings(settings)
        }

        return Object.assign(settings, custom)
    }

    defaultPlugins() {
        if (this.element.multiple) {
            return ['remove_button']
        }

        // A required select cannot be left empty, so it gets no clear button
        return this.element.required ? [] : ['clear_button']
    }

    addRemoteSettings(settings) {
        settings.plugins.push('virtual_scroll')
        settings.loadThrottle = this.loadThrottleValue
        settings.firstUrl = (query) => {
            const url = new URL(this.tomSelectUrlValue, window.location.href)
            url.searchParams.set('page', '1')
            url.searchParams.set(this.searchParamValue, query)

            return url.toString()
        }
        settings.load = (query, callback) => this.load(query, callback)
        settings.render.loading_more = () => this.textElement('loading-more-results', this.loadingMoreTextValue)
        settings.render.no_more_results = null

        if (this.minQueryLengthValue > 0) {
            settings.shouldLoad = (query) => query.trim().length >= this.minQueryLengthValue
        } else {
            // Shows the first page as soon as the field gets focus
            settings.preload = 'focus'
        }
    }

    load(query, callback) {
        const tomSelect = this.tomSelect
        // getUrl() hands out the next page of a query that was loaded before, so it has to be read once, before fetching
        const url = tomSelect.getUrl(query)

        fetch(url, {headers: {Accept: 'application/json'}})
            .then((response) => response.ok ? response.json() : Promise.reject(response))
            .then((data) => {
                if ('nextPageUrl' in data) {
                    tomSelect.setNextUrl(query, data.nextPageUrl)
                }

                callback(data.items)

                // Tom Select only positions the list in open(), which it skips when the list is already open
                if (tomSelect.isOpen) {
                    tomSelect.positionDropdown()
                }
            })
            .catch(() => callback())
    }

    addCreateSettings(settings) {
        settings.create = (input, callback) => {
            fetch(this.tomSelectCreateUrlValue, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({name: input}),
            })
                .then((response) => response.ok ? response.json() : Promise.reject(response))
                .then((data) => callback({value: data.id, text: data.name}))
                .catch(() => callback())
        }
        // An option only exists once the server created it, so leaving the field must not create one
        settings.createOnBlur = false
        settings.persist = false
        settings.render.option_create = (data) => {
            const input = document.createElement('strong')
            input.textContent = data.input

            const create = document.createElement('div')
            create.className = 'create'
            create.append(`${this.createTextValue} `, input, '…')

            return create
        }
    }

    // Text from a value or from option data is always set as text, never parsed as markup
    textElement(className, text) {
        const element = document.createElement('div')
        element.className = className
        element.textContent = text

        return element
    }

    pinOptions(options, optgroups) {
        const tomSelect = this.tomSelect

        for (const optgroup of optgroups) {
            tomSelect.addOptionGroup(optgroup.value, optgroup)
        }

        if (!options.length) {
            return
        }

        // Options are sorted on $order first, so a negative one pins these above everything loaded later
        const pinnedOptions = options.map((option, index) => ({...option, $order: index - options.length}))

        // choice_lazy renders the current selection in the DOM and addOption() skips known values, so update those or they land outside their group
        for (const option of pinnedOptions) {
            const known = tomSelect.options[option.value]
            if (known) {
                tomSelect.updateOption(option.value, {...known, ...option})
            }
        }
        tomSelect.addOptions(pinnedOptions)

        // virtual_scroll clears every option it did not see at initialization, so keep these or the block vanishes on the first load
        const pinnedValues = pinnedOptions.map((option) => String(option.value))
        const clearOptions = tomSelect.clearOptions.bind(tomSelect)

        tomSelect.hook('instead', 'clearOptions', (filter) => {
            clearOptions((option, value) => pinnedValues.includes(value) || (filter ?? tomSelect.clearFilter).call(tomSelect, option, value))
        })
    }

    // A page restored from the Turbo cache holds a copy of the enhanced select, without the instance behind it; undo what Tom Select changed
    resetCachedCopy() {
        if (this.element.tomselect || !this.element.classList.contains('tomselected')) {
            return
        }

        if (this.element.nextElementSibling?.classList.contains('ts-wrapper')) {
            this.element.nextElementSibling.remove()
        }

        this.element.classList.remove('tomselected', 'ts-hidden-accessible')
        this.element.removeAttribute('tabindex')
    }

    // Rereads the options and selection of the select, e.g. after a Live Component changed them (select:change@document->select#sync)
    sync() {
        if (!this.tomSelect) {
            return
        }

        this.tomSelect.sync()

        // sync() enables the control again, which drops the lock
        if (this.lockValue) {
            this.tomSelect.lock()
        }
    }

    // Tom Select hides the select, so the browser cannot focus it when it blocks a submit; focus the control instead (invalid->select#invalid).
    // Tom Select marks an empty required select invalid from the start, .show-invalid limits the error style to after a submit attempt
    invalid() {
        if (!this.tomSelect) {
            return
        }

        this.tomSelect.wrapper.classList.add('show-invalid')

        const firstInvalid = Array.from(this.element.form?.elements ?? []).find((element) => element.willValidate && !element.validity.valid)
        if (firstInvalid === this.element) {
            this.tomSelect.focus()
        }
    }

    lockValueChanged(locked) {
        // Also called before connect(), which applies the initial lock itself
        if (!this.tomSelect) {
            return
        }

        locked ? this.tomSelect.lock() : this.tomSelect.unlock()
    }

    // Tom Select always drops its list downwards without checking the viewport, so a select near the bottom of the page runs off screen;
    // this keeps the list inside the viewport and flips it above the control when there is no room below.
    constrainDropdownToViewport() {
        const tomSelect = this.tomSelect
        const gutter = 8
        // The space between the control and the list
        const gap = 4
        // The height of an option, see the padding and line height of .option in select.css
        const itemHeight = 36
        const minItems = 4
        const maxItems = 7

        let lastLayout = ''

        tomSelect.positionDropdown = () => {
            const content = tomSelect.dropdown_content

            // All measuring happens up front: reading layout after writing styles below would force a synchronous reflow on every scroll event
            const rect = tomSelect.control.getBoundingClientRect()
            const borders = content.offsetHeight - content.clientHeight
            const contentHeight = content.scrollHeight + borders

            // The borders sit outside the scrolling rows, so both bounds are a whole number of options plus those
            const minHeight = minItems * itemHeight + borders
            const maxHeight = maxItems * itemHeight + borders

            const spaceBelow = window.innerHeight - rect.bottom - gap - gutter
            const spaceAbove = rect.top - gap - gutter
            const above = spaceBelow < minHeight && spaceAbove > spaceBelow

            // The minimum wins over the space on the roomier side, but never over the viewport itself
            let available = Math.min(Math.max(above ? spaceAbove : spaceBelow, minHeight), maxHeight, window.innerHeight - 2 * gutter)
            // Round down to a whole row, so a list that still scrolls does not end on a half cut off one
            available = this.snapToRowBoundary(content, available, borders)
            const height = Math.min(contentHeight, available)

            // If neither side could offer the minimum, the list overlaps the control rather than running off screen
            const top = Math.min(Math.max(above ? rect.top - gap - height : rect.bottom + gap, gutter), window.innerHeight - height - gutter)

            // Writing the same values again would needlessly invalidate layout, and skipping them keeps the resize observer below from looping
            const layout = `${rect.width}|${rect.left}|${top}|${available}|${height}|${above}`
            if (layout === lastLayout) {
                return
            }
            lastLayout = layout

            tomSelect.dropdown.style.setProperty('--ts-dropdown-max-height', `${Math.floor(available)}px`)
            tomSelect.dropdown.classList.toggle('dropdown-above', above)
            tomSelect.wrapper.classList.toggle('dropdown-above', above)
            tomSelect.dropdown.style.width = `${rect.width}px`
            tomSelect.dropdown.style.left = `${rect.left + window.scrollX}px`
            tomSelect.dropdown.style.top = `${top + window.scrollY}px`
        }

        // Options are rendered after the list opens and are refiltered or loaded while typing,
        // so a list flipped above the control has to be repositioned whenever its height changes
        this.resizeObserver = new ResizeObserver(() => {
            if (tomSelect.isOpen) {
                tomSelect.positionDropdown()
            }
        })
        this.resizeObserver.observe(tomSelect.dropdown_content)
    }

    // Not every row is as tall as an option: an optgroup header is smaller and the divider below a group adds its own padding, margin and border
    snapToRowBoundary(content, available, borders) {
        const rows = content.querySelectorAll('.create, .option, .optgroup-header, .no-results')
        if (!rows.length) {
            return available
        }

        // The first row sits against the inner top edge, so its offset is the origin every boundary is measured from
        const origin = rows[0].offsetTop
        let snapped = 0

        for (const row of rows) {
            const bottom = row.offsetTop - origin + row.offsetHeight + borders
            if (bottom > available) {
                break
            }

            snapped = bottom
        }

        // A row taller than the space available still has to be shown, cut off
        return snapped || available
    }
}
