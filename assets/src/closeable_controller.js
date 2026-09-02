import {Controller} from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        autoClose: Number
    }
    static targets = ['progress']

    timeout
    animation

    connect() {
        if (this.autoCloseValue) {
            this.startProgress()

            this.timeout = setTimeout(() => {
                this.close()
            }, this.autoCloseValue)
        }
    }

    disconnect() {
        this.stop()
    }

    close() {
        this.stop()
        this.element.classList.replace('opacity-100', 'opacity-0-hidden')
    }

    // Shrink the progress target to zero for the duration of the auto close timeout
    startProgress() {
        if (!this.hasProgressTarget) return

        this.progressTarget.style.transformOrigin = 'left'
        this.animation = this.progressTarget.animate(
            [{transform: 'scaleX(1)'}, {transform: 'scaleX(0)'}],
            {duration: this.autoCloseValue, easing: 'linear', fill: 'forwards'}
        )
    }

    stop() {
        clearTimeout(this.timeout)

        // Pause instead of cancel to keep the progress target at its current scale
        if (this.animation) this.animation.pause()
    }
}
