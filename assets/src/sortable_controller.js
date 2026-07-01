import {Controller} from '@hotwired/stimulus'
import Sortable from 'sortablejs'
import {getComponent} from '@symfony/ux-live-component';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    sortable
    static values = {
        componentSelector: {type: String, default: '[data-live-name-value]'},
        sortableItemSelector: {type: String, default: '[data-sortable-item]'},
        collectionIndex: {type: Number, default: null},
    }
    static targets = ['collection']

    async connect() {
        let element = this.element

        let component = null
        let componentElement = element.closest(this.componentSelectorValue)
        if (componentElement) component = await getComponent(componentElement)

        let collection = this.hasCollectionTarget ? this.collectionTarget : element

        this.sortable = Sortable.create(this.element, {
            animation: 150,
            direction: 'vertical',
            ghostClass: 'border-yellow!',
            filter: '.no-drag',
            onEnd: () => {
                let values = []
                collection.querySelectorAll(this.sortableItemSelectorValue).forEach((item, index) => {
                    let key = item.getAttribute('data-key')
                    let weight = item.querySelector('input[id$="_weight"]')

                    weight.value = index
                    values[key] = {
                        weight: index,
                    }
                })

                if (component) component.action('updateWeight', {index: this.collectionIndexValue, values})
            },
        });
    }

    disconnect() {
        this.sortable.destroy()
    }
}
