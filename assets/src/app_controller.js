import {Controller} from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    blur() {
        this.element.blur()
    }

    dropdownClose() {
        let dropdowns = window.FlowbiteInstances.getInstances('Dropdown')
        Object.entries(dropdowns).forEach((dropdown) => {
            if (!dropdown[1].isVisible()) return

            dropdown[1].hide()
        })
    }
}
