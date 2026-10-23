import {Controller} from '@hotwired/stimulus';
import {getComponent} from '@symfony/ux-live-component';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = ['control', 'display']
    static values = {
        wrapperSelector: {type: String, default: '[data-visibility-wrapper]'},
        refreshEvent: {type: String, default: 'collection-item-added'},
    }

    connect() {
        // Re-apply the controls when a collection renders a new item
        this.refreshEvent = this.refreshEventValue
        this.boundRefresh = this.refresh.bind(this)
        document.addEventListener(this.refreshEvent, this.boundRefresh)

        // Re-apply the controls after every Live Component re-render, so morphdom patching
        // doesn't restore the server-rendered 'hidden' class on display targets
        let components = this.liveComponents = []
        let liveElements = [...this.element.querySelectorAll('[data-controller~="live"]')]
        if (this.element.matches('[data-controller~="live"]')) liveElements.push(this.element)

        liveElements.forEach(element => {
            getComponent(element)
                .then(component => {
                    // The controller disconnected while the component was looked up
                    if (this.liveComponents !== components) return

                    component.on('render:finished', this.boundRefresh)
                    components.push(component)
                })
                // Not a registered Live Component, so there is no re-render to follow
                .catch(() => {})
        })
    }

    disconnect() {
        document.removeEventListener(this.refreshEvent, this.boundRefresh)
        this.liveComponents.forEach(component => component.off('render:finished', this.boundRefresh))
        this.liveComponents = null
    }

    // Called from data-action="change->visibility-change#update" on the controller element or on a control
    update(event) {
        if (this.controlTargets.includes(event.target)) {
            this.toggleDisplays(event.target)
        }
    }

    refresh() {
        this.controlTargets.forEach(control => this.controlTargetConnected(control))
    }

    // Also called for every control that is rendered after the controller connected
    controlTargetConnected(control) {
        // Only the checked radio of a group decides what is shown
        if (control.type === 'radio' && !control.checked) return

        this.toggleDisplays(control)
    }

    // A display in the wrapper of the control is visible when its data-visibility-values list contains the control's value
    toggleDisplays(control) {
        let wrapper = control.closest(this.wrapperSelectorValue)
        if (!wrapper) return

        let value = control.type === 'checkbox' ? control.checked : control.value

        this.displayTargets
            .filter(display => wrapper.contains(display))
            .forEach(display => {
                let values = JSON.parse(display.getAttribute('data-visibility-values') ?? '[]')
                display.classList.toggle('hidden', !values.includes(value))
            })
    }
}
