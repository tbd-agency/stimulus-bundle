import {Controller} from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        sortParam: {type: String, default: ''},
    }

    reset() {
        let element = this.element
        let form = element.closest('form')
        let inputs = form.querySelectorAll('input, select, textarea')

        inputs.forEach(input => {
            if (input.id !== 'search__token') {
                input.value = ''
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = false
                }
                if (input.tagName === 'SELECT') {
                    input.selectedIndex = -1

                    let clearButton = input.nextElementSibling.querySelector('.clear-button')
                    if (clearButton) clearButton.click()

                    let removeButtons = input.nextElementSibling.querySelectorAll('.remove')
                    if (removeButtons) {
                        removeButtons.forEach(removeButton => {
                            removeButton.click()
                        })
                    }
                }
            }
        });

       if (this.sortParamValue) {
            let sortInput = form.querySelector(`input[name="${this.sortParamValue}"]`)
            if (!sortInput) {
                sortInput = document.createElement('input')
                sortInput.type = 'hidden'
                sortInput.name = this.sortParamValue
                form.appendChild(sortInput)
            }
            sortInput.value = '1'
        }

        form.requestSubmit()
    }
}
