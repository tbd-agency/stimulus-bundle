import {Controller} from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = ['alert', 'amount', 'total', 'selectAll', 'removeAll', 'checkbox', 'checkboxHeader']

    connect() {
        this.lastCheckedIndex = null;
        this.shiftPressed = false;


        this.trackShift = (event) => {
            this.shiftPressed = event.shiftKey;

            if (event.key === 'Escape') {
                document.activeElement?.blur();
            }
        };
        this.releaseShift = () => {
            this.shiftPressed = false;
        };

        this.clearAnchor = (event) => {
            if (!this.checkboxTargets.includes(event.relatedTarget)) {
                this.lastCheckedIndex = null;
            }
        };

        this.resetOnAction = (event) => {
            if (!event.detail?.success) {
                return;
            }

            if (!event.target.closest('[data-select-items-target="alert"]')) {
                return;
            }

            this.reset();
        };

        document.addEventListener('keydown', this.trackShift);
        document.addEventListener('keyup', this.trackShift);
        window.addEventListener('blur', this.releaseShift);
        this.element.addEventListener('focusout', this.clearAnchor);
        this.element.addEventListener('turbo:submit-end', this.resetOnAction);
    }

    disconnect() {
        document.removeEventListener('keydown', this.trackShift);
        document.removeEventListener('keyup', this.trackShift);
        window.removeEventListener('blur', this.releaseShift);
        this.element.removeEventListener('focusout', this.clearAnchor);
        this.element.removeEventListener('turbo:submit-end', this.resetOnAction);
    }

    reset() {
        if (!this.hasAlertTarget || this.alertTarget.classList.contains('hidden')) {
            return;
        }

        this.closeDropdown();

        if (this.hasCheckboxHeaderTarget) {
            this.checkboxHeaderTarget.checked = false;
        }

        this.checkboxTargets.forEach((input) => {
            input.checked = false;
        });

        if (this.hasAmountTarget) {
            this.amountTarget.innerHTML = 0;
            this.amountTarget.classList.remove('hidden');
        }
        if (this.hasTotalTarget) {
            this.totalTarget.classList.add('hidden');
        }
        if (this.hasSelectAllTarget) {
            this.selectAllTarget.classList.remove('hidden');
        }
        if (this.hasRemoveAllTarget) {
            this.removeAllTarget.classList.add('hidden');
        }

        this.alertTarget.classList.add('hidden');

        this.lastCheckedIndex = null;
    }

    closeDropdown() {
        let dropdown = this.alertTarget.querySelector('[data-controller~="dropdown"]');

        if (!dropdown) {
            return;
        }

        let content = document.getElementById(dropdown.dataset.dropdownTargetValue);
        let trigger = document.getElementById(dropdown.dataset.dropdownTriggerValue);

        if (content && trigger && !content.classList.contains('hidden')) {
            trigger.click();
        }
    }

    selectAllVisible(event) {
        this.checkboxTargets.forEach((input) => {
            input.checked = event.currentTarget.checked;
        });

        event.currentTarget.blur();

        this.lastCheckedIndex = null;
    }

    selectAll() {
        this.amountTarget.classList.toggle('hidden');
        this.totalTarget.classList.toggle('hidden');
        this.selectAllTarget.classList.toggle('hidden');
        this.removeAllTarget.classList.toggle('hidden');

        let isHidden = this.totalTarget.classList.contains('hidden');
        this.checkboxHeaderTarget.checked = !isHidden;
        this.checkboxTargets.forEach((input) => {
            input.checked = !isHidden;
        });

        this.lastCheckedIndex = null;
    }

    removeAll() {
        this.amountTarget.classList.toggle('hidden');
        this.totalTarget.classList.toggle('hidden');
        this.selectAllTarget.classList.toggle('hidden');
        this.removeAllTarget.classList.toggle('hidden');
        this.alertTarget.classList.toggle('hidden');

        this.checkboxHeaderTarget.checked = false;
        this.checkboxTargets.forEach((input) => {
            input.checked = false;
        });

        this.lastCheckedIndex = null;
    }

    setAmount(event) {
        // Range selection (shift click)
        if (event.currentTarget !== this.checkboxHeaderTarget) {
            const currentElement = event.currentTarget;
            const currentIndex = this.checkboxTargets.indexOf(currentElement);

            if (this.shiftPressed && this.lastCheckedIndex !== null && currentIndex !== -1) {
                const start = Math.min(this.lastCheckedIndex, currentIndex);
                const end = Math.max(this.lastCheckedIndex, currentIndex);
                for (let i = start; i <= end; i++) {
                    this.checkboxTargets[i].checked = currentElement.checked;
                }

                // Shift clicking also drags a text selection across the table
                document.getSelection()?.removeAllRanges();
            }

            this.lastCheckedIndex = currentIndex;
        }

        if (this.hasAmountTarget && this.alertTarget) {
            this.amountTarget.classList.remove('hidden');
            this.selectAllTarget.classList.remove('hidden');

            this.totalTarget.classList.add('hidden');
            this.removeAllTarget.classList.add('hidden');

            if (event.currentTarget !== this.checkboxHeaderTarget) {
                this.checkboxHeaderTarget.checked = false;
            }

            let amount = 0;

            this.checkboxTargets.forEach((input) => {
                if (input.checked) {
                    amount++;
                }
            });

            this.amountTarget.innerHTML = amount;

            if (amount > 0) {
                this.alertTarget.classList.remove('hidden');
            } else {
                this.alertTarget.classList.add('hidden');
            }
        }
    }

    handle(event) {
        let inFrame = false;
        let eventTarget = event.currentTarget;
        if (event.detail.frame) {
            inFrame = true;
            eventTarget = document.getElementById(event.detail.frame);
        }

        let form = eventTarget.querySelector('form');
        let inputs = eventTarget.querySelectorAll('.selectedItems');
        let selectAll = eventTarget.querySelectorAll('.selectAll');
        selectAll.forEach((input) => {
            input.value = this.totalTarget.classList.contains('hidden') ? 0 : 1;
        });

        if (form) {
            let confirm = form.dataset.confirm
            let values = [];

            this.checkboxTargets.forEach((input) => {
                if (input.checked) {
                    values.push(input.value);
                }
            });

            if (values.length > 0) {
                inputs.forEach((input) => {
                    input.value = values.join(',');
                    input.dispatchEvent(new Event('change', {bubbles: true}))
                })

                if (!inFrame) {
                    if (confirm) {
                        const targetValue = 'modal-confirm'
                        let target = document.getElementById(targetValue)

                        let modal = FlowbiteInstances.getInstance('Modal', targetValue)
                        if (modal && !document.body.contains(modal._targetEl)) {
                            FlowbiteInstances.removeInstance('Modal', targetValue)
                            modal = null
                        }

                        if (!modal) {
                            let options = {
                                closable: false,
                                backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-60',
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

                            let confirmButton = target.querySelector('.confirm')
                            if (confirmButton) {
                                confirmButton.removeEventListener('click', this.confirmHandler)
                                this.confirmHandler = () => form.requestSubmit()
                                confirmButton.addEventListener('click', this.confirmHandler)
                            }
                        }
                    } else {
                        form.requestSubmit();
                    }
                }
            }
        }
    }
}
