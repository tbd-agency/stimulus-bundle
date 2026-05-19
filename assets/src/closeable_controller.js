import {Controller} from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        autoClose: Number
    }

    connect() {
        if (this.autoCloseValue) {
            setTimeout(() => {
                this.close()
            }, this.autoCloseValue)
        }
    }

    close() {
        this.element.remove()
    }
}
