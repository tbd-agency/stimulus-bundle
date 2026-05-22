import {Controller} from '@hotwired/stimulus'
import Cookie from 'js-cookie'

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = [
        'toggleButton',
        'dropdownButton',
        'dropdownContent',
        'sidebar',
        'mainContent',
        'collapseIcon',
        'expandIcon',
        'collapseHide',
        'collapseShow',
    ]
    static values = {
        hoverState: {type: Boolean, default: false},
    }

    connect() {
        Cookie.set('sidebar-hover-state', this.hoverStateValue, {expires: 365} )
        this.isTemporarilyExpanded = false
        this.initializeSidebarState()
    }

    dropdownToggle(event) {
        const sidebarState = Cookie.get('sidebar')

        if (sidebarState === 'false' || sidebarState === undefined) {
            this.expand()
            this.openClickedDropdown(event)
        } else {
            const dropdown = event.currentTarget
            const targetId = dropdown.getAttribute('aria-controls')
            const dropdownContent = document.getElementById(targetId)
            dropdownContent.classList.toggle('hidden')
            dropdown.setAttribute('aria-expanded', !dropdownContent.classList.contains('hidden'))
        }
    }

    openClickedDropdown(event) {
        const button = event.currentTarget
        button.setAttribute('aria-expanded', 'true')

        const targetId = button.getAttribute('aria-controls')
        if (!targetId) return

        const dropdown = document.getElementById(targetId)
        if (!dropdown) return
        dropdown.classList.remove('hidden')
    }

    toggle() {
        sessionStorage.setItem('sidebarHoverState', 'false')

        if (this.toggleButtonTarget.getAttribute('aria-expanded') === 'true') {
            this.collapse()
            return
        }

        this.expand()
    }

    onMouseEnter() {
        if (this.hoverStateValue && this.toggleButtonTarget.getAttribute('aria-expanded') === 'false') {
            this.isTemporarilyExpanded = true
            sessionStorage.setItem('sidebarHoverState', 'true')
            this.expand(false)
        }
    }

    onMouseLeave() {
        if (!this.isTemporarilyExpanded) {
            return
        }

        this.isTemporarilyExpanded = false
        sessionStorage.setItem('sidebarHoverState', 'false')
        this.collapse(false)
    }

    collapse(save = true, initial = false) {
        this.collapseShowTargets.forEach((element) => {
            element.classList.remove('hidden')
        })

        this.collapseHideTargets.forEach((element) => {
            element.classList.add('hidden')
            element.classList.add('opacity-0')

            if (initial) {
                element.classList.remove('opacity-0')
                return
            }

            setTimeout(() => {
                element.classList.remove('opacity-0')
            }, 75)
        })

        this.dropdownButtonTargets.forEach((element) => {
            element.setAttribute('aria-expanded', 'false')
        })

        this.dropdownContentTargets.forEach((element) => {
            element.classList.add('hidden')
        })

        this.sidebarTarget.classList.remove('w-64')
        this.sidebarTarget.classList.add('w-16')
        this.mainContentTarget.classList.remove('lg:ms-64')
        this.mainContentTarget.classList.add('lg:ms-16')
        this.toggleButtonTarget.setAttribute('aria-expanded', 'false')

        if (save) {
            if (this.hasCollapseIconTarget) {
                this.collapseIconTarget.classList.add('hidden')
            }
            if (this.hasExpandIconTarget) {
                this.expandIconTarget.classList.remove('hidden')
            }
            Cookie.set('sidebar', 'false', {expires: 365})
        }
    }

    expand(save = true, initial = false) {
        this.collapseShowTargets.forEach((element) => {
            element.classList.add('hidden')
        })

        this.collapseHideTargets.forEach((element) => {
            element.classList.remove('hidden')
            element.classList.add('opacity-0')

            if (initial) {
                element.classList.remove('opacity-0')
                return
            }

            setTimeout(() => {
                element.classList.remove('opacity-0')
            }, 75)
        })

        this.sidebarTarget.classList.remove('w-16')
        this.sidebarTarget.classList.add('w-64')
        this.mainContentTarget.classList.remove('lg:ms-16')
        this.mainContentTarget.classList.add('lg:ms-64')
        this.toggleButtonTarget.setAttribute('aria-expanded', 'true')

        if (save) {
            if (this.hasCollapseIconTarget) {
                this.collapseIconTarget.classList.remove('hidden')
            }
            if (this.hasExpandIconTarget) {
                this.expandIconTarget.classList.add('hidden')
            }
            Cookie.set('sidebar', 'true', {expires: 365})
        }
    }

    initializeSidebarState() {
        const sidebarState = Cookie.get('sidebar')
        const hoverState = sessionStorage.getItem('sidebarHoverState')

        if (hoverState === 'true' && sidebarState === 'false') {
            this.expand(false, true)
            this.collapseIconTarget.classList.remove('hidden')
            return
        }

        if (sidebarState === 'true') {
            this.expand(false, true)
            this.expandIconTarget.classList.add('hidden')
            this.collapseIconTarget.classList.remove('hidden')
            return
        }

        this.expandIconTarget.classList.remove('hidden')
        this.collapseIconTarget.classList.add('hidden')

        this.collapse(false, true)
    }
}
