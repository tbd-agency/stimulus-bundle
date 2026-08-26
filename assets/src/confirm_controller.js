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

        if (modal) {
            let confirm = modal.querySelector('.confirm')
            confirm.setAttribute('href', path)

            if (this.hasMethodValue) {
                confirm.setAttribute('data-turbo-method', this.methodValue)
            } else {
                confirm.removeAttribute('data-turbo-method')
            }
        }
    }
}
