import {Controller} from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        route: String,
    }

    connect() {
        const controller = new AbortController()
        const signal = controller.signal

        fetch(this.routeValue, {signal})
            .then(response => response.text())
            .then(data => {
                this.element.innerHTML = data
            })
            .catch(error => {
                console.warn(error)
            })

        document.addEventListener('turbo:before-visit', () => {
            controller.abort('Dashboard data fetch aborted: user navigated to a new page.')
        })
    }
}
