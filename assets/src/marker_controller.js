import {Controller} from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        target: String,
    }

    insert(event) {
        let target = document.querySelector(this.targetValue)
        if (target) {
            target.dispatchEvent(new CustomEvent('insert:marker', {
                detail: {marker: event.params.marker},
                bubbles: true,
            }))
        }
    }
}
