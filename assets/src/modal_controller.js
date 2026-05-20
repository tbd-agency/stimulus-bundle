import {Controller} from '@hotwired/stimulus'

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    setSrc(event) {
        const trigger = event?.currentTarget
        const targetValue = trigger?.dataset?.target
        const sizeValue = trigger?.dataset?.size ?? 'md'
        const titleValue = trigger?.dataset?.title
        const srcValue = trigger?.dataset?.src
        const frameValue = trigger?.dataset?.frame ?? 'source-frame'

        let target = document.getElementById(targetValue)
        let options = {
            closable: false,
            backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-[50]',
        }

        let modal = new Modal(target, options)
        if (modal) {
            let wrapper = target.querySelector('#modal-wrapper')
            wrapper.classList.remove('max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl')
            if (sizeValue === 'sm') wrapper.classList.add('max-w-sm')
            if (sizeValue === 'md') wrapper.classList.add('max-w-md')
            if (sizeValue === 'lg') wrapper.classList.add('max-w-lg')
            if (sizeValue === 'xl') wrapper.classList.add('max-w-xl')
            if (sizeValue === '2xl') wrapper.classList.add('max-w-2xl')
            if (sizeValue === '3xl') wrapper.classList.add('max-w-3xl')
            if (sizeValue === '4xl') wrapper.classList.add('max-w-4xl')
            if (sizeValue === '5xl') wrapper.classList.add('max-w-5xl')
            if (sizeValue === '6xl') wrapper.classList.add('max-w-6xl')
            if (sizeValue === '7xl') wrapper.classList.add('max-w-7xl')

            let title = target.querySelector('#modal-title')
            title.innerHTML = titleValue

            let frame = document.getElementById(frameValue)
            frame.setAttribute('src', srcValue)
            frame.loaded.then(function () {
                modal.updateOnShow(function () {
                    if (modal._backdropEl) {
                        target.parentNode.insertBefore(modal._backdropEl, target)
                    }

                    let autofocus = frame.querySelector('[autofocus]:not([readonly])')
                    if (autofocus) autofocus.focus()
                })

                modal.show()

                // Dispatch an event, in case we need to do something else when the src is set
                document.dispatchEvent(new CustomEvent('modal:setSrc', {
                    bubbles: true,
                    detail: {
                        frame: targetValue
                    }
                }));
            })
        }
    }

    connect() {
        document.addEventListener('close:modal', this.close.bind(this))
    }

    disconnect() {
        document.removeEventListener('close:modal', this.close.bind(this))
    }

    open(event) {
        const trigger = event?.currentTarget
        const targetValue = trigger?.dataset?.target
        const actionValue = trigger?.dataset?.formAction
        let target = document.getElementById(targetValue)

        if (target && actionValue) {
            let form = target.querySelector('form')
            if (form) form.setAttribute('action', actionValue)
        }

        let modal = FlowbiteInstances.getInstance('Modal', targetValue)
        if (modal && !document.body.contains(modal._targetEl)) {
            FlowbiteInstances.removeInstance('Modal', targetValue)
            modal = null
        }

        if (!modal) {
            let options = {
                backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-[50]',
            }

            modal = new Modal(target, options)
            modal.updateOnShow(function () {
                if (modal._backdropEl) {
                    target.parentNode.insertBefore(modal._backdropEl, target)
                }
            })
        }

        if (modal) {
            modal.show()
        }
    }

    close(event) {
        const targetValue = event?.detail?.target ?? event?.currentTarget?.dataset?.target
        let modal = FlowbiteInstances.getInstance('Modal', targetValue)

        if (modal && !document.body.contains(modal._targetEl)) {
            FlowbiteInstances.removeInstance('Modal', targetValue)
            modal = null
        }

        if (!modal) {
            const target = document.getElementById(targetValue)
            modal = new Modal(target)
        }

        if (modal) {
            modal.hide()
        }
    }
}
