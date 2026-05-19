import {Controller} from '@hotwired/stimulus'

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        property: String,
    }

    connect() {
        let element = this.element
        element.setAttribute('contenteditable', 'true')
        element.style.height = '100%'
        element.style.width = '100%'
        element.style.display = 'block'
        element.addEventListener("paste", (e) => {
            e.preventDefault()
            const paste = (e.clipboardData || window.clipboardData).getData("text")
            const selection = window.getSelection()
            if (!selection.rangeCount) return
            selection.deleteFromDocument()
            selection.getRangeAt(0).insertNode(document.createTextNode(paste))
            selection.collapseToEnd()
        })
        element.addEventListener('focus', (e) => {
            element.innerText.trim()
        })
        element.addEventListener('blur', (e) => {
            let value = encodeURI(element.innerText.trim())

            element.innerHTML = element.innerHTML + `<input type="hidden" name="value" value="${value}">`
            element.requestSubmit()
        })

        let svg = element.closest('turbo-frame').querySelector('svg')
        if (svg) {
            svg.classList.toggle('opacity-0')
        }
    }
}
