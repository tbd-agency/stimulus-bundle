import {Controller} from '@hotwired/stimulus'

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        action: String,
        csrfToken: String
    }

    modal(event) {
        const trigger = event?.currentTarget
        let action = trigger?.dataset?.deleteAction ?? this.actionValue
        let csrfToken = trigger?.dataset?.deleteCsrfToken ?? this.csrfTokenValue
        let modalTarget = document.getElementById('modal-delete')

        if (csrfToken && modalTarget) {
            let form = modalTarget.querySelector('form')
            let token = form.querySelector("input[name='_token']")
            form.setAttribute('action', action)
            token.value = csrfToken
            let modal = modalTarget.modalInstance ?? new Modal(modalTarget)
            modalTarget.modalInstance = modal
            modal.show()
        }
    }
}
