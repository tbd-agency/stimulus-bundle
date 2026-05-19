import { Controller } from '@hotwired/stimulus';
import Cookie from 'js-cookie';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = ['darkIcon', 'lightIcon']

    connect() {
        if (Cookie.get('color_theme') === 'dark') {
            this.darkIconTarget.classList.add('hidden')
            this.lightIconTarget.classList.remove('hidden')
        } else {
            this.darkIconTarget.classList.remove('hidden')
            this.lightIconTarget.classList.add('hidden')
        }
    }

    toggleDarkMode(event) {
        let currentTheme

        if (Cookie.get('color_theme') === 'dark') {
            document.documentElement.classList.remove('dark')
            Cookie.set('color_theme', 'light', {expires: 365})
            this.toggleButtons()
            currentTheme = 'light'
        } else {
            document.documentElement.classList.add('dark')
            Cookie.set('color_theme', 'dark', {expires: 365})
            this.toggleButtons()
            currentTheme = 'dark'
        }

        document.dispatchEvent(new CustomEvent('theme:changed', {
            detail: {
                theme: currentTheme,
            },
        }))

        event.currentTarget.blur()
    }

    toggleButtons() {
        this.darkIconTarget.classList.toggle('hidden')
        this.lightIconTarget.classList.toggle('hidden')
    }
}
