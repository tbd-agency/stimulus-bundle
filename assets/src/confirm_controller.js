import {Controller} from '@hotwired/stimulus'

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        id: {type: String, default: 'modal-confirm'},
        path: String,
        method: String,
    }

    modal() {
        let id = this.idValue
        let path = this.pathValue

        let modal = document.getElementById(id)
        if (!modal) {
            return
        }

        let confirm = modal.querySelector('.confirm')
        if (!confirm) {
            return
        }

        let form = confirm.closest('form')
        if (form) {
            form.setAttribute('action', path)

            return
        }

        confirm.setAttribute('href', path)

        if (this.hasMethodValue) {
            confirm.setAttribute('data-turbo-method', this.methodValue)
        } else {
            confirm.removeAttribute('data-turbo-method')
        }
    }
}
