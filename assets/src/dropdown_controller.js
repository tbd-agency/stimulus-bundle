import {Controller} from '@hotwired/stimulus';
import {Dropdown} from 'flowbite';
import {createPopper} from "@popperjs/core";

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        target: String,
        trigger: String,
        placement: String,
        offsetSkidding: {Number, default: 0},
        offsetDistance: {Number, default: 10},
    }
    static targets = ['button', 'content', 'icon']

    connect() {
        let target = document.getElementById(this.targetValue)
        let trigger = document.getElementById(this.triggerValue)
        let options = {
            placement: this.placementValue,
            triggerType: 'click',
            offsetSkidding: this.offsetSkiddingValue,
            offsetDistance: this.offsetDistanceValue,
            delay: 300,
            ignoreClickOutsideClass: false,
            onShow: () => {
                target.querySelector('[data-dropdown-autofocus]')?.focus()
                this.rotateIcon(true)
            },
            onHide: () => {
                this.rotateIcon(false)
            },
        }
        let instanceOptions = {
            id: this.targetValue,
            override: true
        };

        new Dropdown(target, trigger, options, instanceOptions);

        if (this.hasContentTarget) {
            createPopper(this.buttonTarget, this.contentTarget, {
                placement: this.placementValue,
                strategy: 'fixed',
                modifiers: [
                    {name: 'flip'},
                    {name: 'preventOverflow', options: {padding: 8, altAxis: true, tether: true}},
                ]
            })

            document.body.appendChild(this.contentTarget)
        }
    }

    toggle() {
        if (!this.hasContentTarget) return
        this.contentTarget.hidden = !this.contentTarget.hidden
        this.rotateIcon(!this.contentTarget.hidden)
    }

    rotateIcon(open) {
        if (!this.hasIconTarget) return
        this.iconTarget.classList.toggle('rotate-180', open)
    }
}
