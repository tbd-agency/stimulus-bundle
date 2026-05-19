import {Controller} from '@hotwired/stimulus'

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        frameSelector: {type: String, default: '.source-frame'},
        redirectPath: {type: String, default: ''},
    }

    connect() {
        const form = this.element
        const frame = form.closest(this.frameSelectorValue)

        form.addEventListener('submit', async (event) => {
            event.preventDefault()

            let response = await fetch(form.action, {
                method: form.method,
                body: new FormData(form),
            })

            if (response.ok) {
                if (this.hasRedirectPathValue) {
                    window.location = this.redirectPathValue
                } else {
                    location.reload()
                }
            } else {
                let text = await response.text()
                let html = new DOMParser().parseFromString(text, 'text/html').querySelector(this.frameSelectorValue)

                frame.replaceWith(html)
            }
        })
    }
}
