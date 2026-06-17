import {Controller} from '@hotwired/stimulus';
import {createPopper} from '@popperjs/core';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        target: String,
        placement: {type: String, default: 'top'},
        offsetDistance: {type: Number, default: 8},
    }

    connect() {
        this.tooltip = document.getElementById(this.targetValue)
        if (!this.tooltip) return

        this.show = this.show.bind(this)
        this.hide = this.hide.bind(this)

        this.element.addEventListener('mouseenter', this.show)
        this.element.addEventListener('mouseleave', this.hide)
        this.element.addEventListener('focus', this.show)
        this.element.addEventListener('blur', this.hide)
    }

    disconnect() {
        if (!this.tooltip) return

        this.element.removeEventListener('mouseenter', this.show)
        this.element.removeEventListener('mouseleave', this.hide)
        this.element.removeEventListener('focus', this.show)
        this.element.removeEventListener('blur', this.hide)
        this.popper?.destroy()
    }

    show() {
        this.popper = createPopper(this.element, this.tooltip, {
            placement: this.placementValue,
            modifiers: [
                {name: 'offset', options: {offset: [0, this.offsetDistanceValue]}},
                {name: 'flip'},
                {name: 'preventOverflow', options: {padding: 8}},
            ],
        })

        this.tooltip.classList.remove('invisible', 'opacity-0')
        this.tooltip.classList.add('visible', 'opacity-100')
    }

    hide() {
        this.tooltip.classList.add('invisible', 'opacity-0')
        this.tooltip.classList.remove('visible', 'opacity-100')
        this.popper?.destroy()
        this.popper = null
    }
}
