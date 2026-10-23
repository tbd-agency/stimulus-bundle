import {Controller} from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = ['control', 'display', 'state']
    static values = {
        active: {type: String, default: ''},
        refreshEvent: {type: String, default: 'collection-item-added'},
    }

    connect() {
        // Without an active value, start from the first control that is rendered as pressed
        if (!this.activeValue) {
            let pressed = this.controlTargets.find(control => control.getAttribute('aria-pressed') === 'true')
            if (pressed) {
                this.activeValue = pressed.value
            }
        }
        this.refresh()

        // Re-apply the active value when a live collection renders a new item
        this.refreshEvent = this.refreshEventValue
        this.boundRefresh = this.refresh.bind(this)
        document.addEventListener(this.refreshEvent, this.boundRefresh)
    }

    disconnect() {
        document.removeEventListener(this.refreshEvent, this.boundRefresh)
    }

    // Called from data-action="visibility-click#select" on a control, or "click->visibility-click#select" on the controller element
    select(event) {
        let control = this.controlTargets.find(control => control.contains(event.target))
        if (!control) return

        this.activeValue = control.value
        this.refresh()
    }

    refresh() {
        this.controlTargets.forEach(control => this.controlTargetConnected(control))
        this.displayTargets.forEach(display => this.displayTargetConnected(display))
        this.stateTargets.forEach(state => this.stateTargetConnected(state))
    }

    // Only the controls with the active value are pressed
    controlTargetConnected(control) {
        if (!this.activeValue) return

        control.setAttribute('aria-pressed', String(control.value === this.activeValue))
    }

    // A display is visible when its data-visibility-values list contains the active value
    displayTargetConnected(display) {
        if (!this.activeValue) return

        let values = JSON.parse(display.getAttribute('data-visibility-values') ?? '[]')
        display.classList.toggle('hidden', !values.includes(this.activeValue))
    }

    // Persist the active value so a form submit can restore it server-side
    stateTargetConnected(state) {
        if (!this.activeValue) return

        state.value = this.activeValue
    }
}
