import {Controller} from '@hotwired/stimulus'
import tinymce from 'tinymce/tinymce'

/*
 * Turns the textarea(s) of this controller into a TinyMCE editor.
 *
 * Only the TinyMCE core is bundled. Its theme, model, icons, skins and plugins load at runtime
 * from baseUrl, which is node_modules/tinymce copied into the build (see the README).
 */
/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = ['input']
    static values = {
        toolbar: {
            type: String,
            default: 'undo redo | blocks | bold italic underline strikethrough | '
                + 'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | '
                + 'link image anchor | table | removeformat code',
        },
        plugins: {type: String, default: 'autolink link lists image anchor table code wordcount'},
        height: {type: Number, default: 200},
        menubar: {type: Boolean, default: false},
        uploadPath: {type: String, default: ''},
        contentCss: {type: String, default: ''},
        contentStyle: {type: String, default: ''},
        bodyClass: {type: String, default: 'prose dark:prose-invert p-4'},
        skin: {type: String, default: 'tinymce-5'},
        baseUrl: {type: String, default: '/build/tinymce'},
        options: {type: Object, default: {}},
    }

    connect() {
        this.editors = new Map()
        this.dark = this.isDark()

        // The skin is fixed when an editor starts, so the editors restart when html.dark changes
        this.themeObserver = new MutationObserver(() => this.themeChanged())
        this.themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['class']})

        this.textareas.forEach((textarea) => this.open(textarea))
    }

    disconnect() {
        this.themeObserver.disconnect()

        Array.from(this.editors.values()).forEach((editor) => editor.remove())
        this.editors.clear()
    }

    // Reloads the editors from their textarea, e.g. after a live component changed its value
    sync() {
        this.editors.forEach((editor, textarea) => editor.setContent(textarea.value))
    }

    // Inserts the marker of the marker controller as text, at the cursor
    insertMarker(event) {
        const editor = this.editors.get(event.target) ?? this.editors.values().next().value

        editor?.insertContent(editor.dom.encode(event.detail.marker))
    }

    get textareas() {
        // Without input targets the controller sits on the textarea itself
        return this.hasInputTarget ? this.inputTargets : [this.element]
    }

    isDark() {
        return document.documentElement.classList.contains('dark')
    }

    themeChanged() {
        if (this.dark === this.isDark()) {
            return
        }

        this.dark = this.isDark()

        // A copy, as removing and opening an editor deletes and re-adds its entry
        Array.from(this.editors).forEach(([textarea, editor]) => {
            editor.remove()
            this.open(textarea)
        })
    }

    open(textarea) {
        // TinyMCE skips a textarea that still has an editor, e.g. one of a controller that has not disconnected yet
        tinymce.get(textarea.id)?.remove()

        tinymce.init({
            ...this.options(textarea),
            target: textarea,
            setup: (editor) => this.setup(editor, textarea),
        })
    }

    /*
     * The TinyMCE configuration. A project that extends this controller can add to it:
     *     options(textarea) { return {...super.options(textarea), urlconverter_callback: ...} }
     */
    options(textarea) {
        const options = {
            base_url: this.baseUrlValue,
            suffix: '.min',
            license_key: 'gpl',
            branding: false,
            promotion: false,
            menubar: this.menubarValue,
            plugins: this.pluginsValue,
            toolbar: this.toolbarValue,
            toolbar_mode: 'sliding',
            height: this.heightValue,
            skin: this.dark ? `${this.skinValue}-dark` : this.skinValue,
            content_css: this.contentCssValue || 'default',
            content_style: this.contentStyle(),
            body_class: this.bodyClassValue,
            document_base_url: window.location.origin,
            relative_urls: false,
            remove_script_host: false,
        }

        if (this.uploadPathValue) {
            options.file_picker_callback = (callback, value, meta) => this.pickFile(textarea, callback, meta)
        }

        return {...options, ...this.optionsValue}
    }

    setup(editor, textarea) {
        this.editors.set(textarea, editor)

        // The content sits in an iframe with its own <html>, which needs the dark class for the tbd-* tokens to switch
        editor.on('PreInit', () => editor.getDoc().documentElement.classList.toggle('dark', this.dark))

        editor.on('change', () => {
            editor.save()
            textarea.dispatchEvent(new Event('change', {bubbles: true}))
        })

        editor.on('remove', () => {
            if (this.editors.get(textarea) === editor) {
                this.editors.delete(textarea)
            }
        })
    }

    contentStyle() {
        return 'html { color-scheme: light; background-color: var(--color-tbd-surface, Canvas); }'
            + 'html.dark { color-scheme: dark; }'
            + 'body { background-color: transparent; color: var(--color-tbd-ink, CanvasText); }'
            // The skin gives the body its own font, over the one the content CSS sets on <html>
            + (this.contentCssValue ? 'body { font-family: inherit; }' : '')
            + 'body > :first-child { margin-top: 0; }'
            + 'body > :last-child { margin-bottom: 0; }'
            + this.contentStyleValue
    }

    pickFile(textarea, callback, meta) {
        if (meta.filetype !== 'image') {
            return
        }

        const picker = document.createElement('input')
        picker.type = 'file'
        picker.accept = 'image/*'
        picker.addEventListener('change', () => this.upload(textarea, picker.files[0], callback), {once: true})
        picker.click()
    }

    // The upload path takes the file as "upload" and answers {url} or {error: {message}}
    async upload(textarea, file, callback) {
        const body = new FormData()
        body.append('upload', file)

        let message = null

        try {
            const response = await fetch(this.uploadPathValue, {method: 'POST', body})
            const data = await response.json().catch(() => ({}))

            if (response.ok && data.url) {
                callback(data.url, {alt: file.name})

                return
            }

            message = data.error?.message
        } catch {
            // A network error gets the generic message below
        }

        const editor = this.editors.get(textarea)
        editor?.notificationManager.open({
            text: message || editor.translate('Upload failed.'),
            type: 'error',
            timeout: 5000,
        })
    }
}
