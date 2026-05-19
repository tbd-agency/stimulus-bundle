import {Controller} from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
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

        form.requestSubmit()
    }
}
