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
        let childClass = this.childClass(this.targetValue)

        this.ancestorIds().forEach(id => target.classList.add(this.childClass(id)))

        let options = {
            placement: this.placementValue,
            triggerType: 'click',
            offsetSkidding: this.offsetSkiddingValue,
            offsetDistance: this.offsetDistanceValue,
            delay: 300,
            ignoreClickOutsideClass: CSS.escape(childClass),
            onShow: () => {
                target.querySelector('[data-dropdown-autofocus]')?.focus()
                this.rotateIcon(true)
            },
            onHide: () => {
                this.rotateIcon(false)
                document.querySelectorAll(`.${CSS.escape(childClass)}`).forEach(child => {
                    let instance = window.FlowbiteInstances.getInstance('Dropdown', child.id)
                    if (instance?.isVisible()) instance.hide()
                })
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

    ancestorIds() {
        let ids = []
        let element = this.element
        let content

        while ((content = element.closest('[data-dropdown-target="content"]'))) {
            ids.push(content.id)
            element = document.querySelector(`[data-dropdown-target-value="${CSS.escape(content.id)}"]`)
            if (!element) break
        }

        return ids
    }

    childClass(id) {
        return `dropdown-child-of-${id}`
    }

    rotateIcon(open) {
        if (!this.hasIconTarget) return
        this.iconTarget.classList.toggle('rotate-180', open)
    }
}
