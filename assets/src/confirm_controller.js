import {Controller} from '@hotwired/stimulus'

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        id: {type: String, default: 'modal-confirm'},
        path: String,
        stream: Boolean,
    }

    modal() {
        let id = this.idValue
        let path = this.pathValue
        let modal = document.getElementById(id)

        if (modal) {
            let confirm = modal.querySelector('.confirm')
            confirm.setAttribute('href', path)

            if (this.streamValue) {
                confirm.setAttribute('data-turbo-stream', '')
            } else {
                confirm.removeAttribute('data-turbo-stream')
            }
        }
    }
}
