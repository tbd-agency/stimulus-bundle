import {Controller} from '@hotwired/stimulus'

/* stimulusFetch: 'eager' */
export default class extends Controller {
    static values = {
        path: String,
        type: String,
        token: {type: String, default: ''},
        minWidth: {type: Number, default: 100},
        resizerClass: {type: String, default: 'absolute top-0 z-10 w-2.5 cursor-col-resize hover:bg-gray-300/60 dark:hover:bg-gray-600/60'},
    }

    connect() {
        this.columns = Array.from(this.element.querySelectorAll('thead th[data-column]'))
        this.resizers = []
        this.dragging = false

        this.onMouseMove = this.mouseMove.bind(this)
        this.onMouseUp = this.mouseUp.bind(this)

        // Columns with a stored width may wrap, otherwise their content keeps them wider than that width
        this.columns
            .filter((th) => th.dataset.width)
            .forEach((th) => this.releaseColumn(th))

        this.createResizers()

        this.resizeObserver = new ResizeObserver(() => this.updateResizers())
        this.resizeObserver.observe(this.element.querySelector('table') ?? this.element)

        document.addEventListener('mousemove', this.onMouseMove)
        document.addEventListener('mouseup', this.onMouseUp)
    }

    disconnect() {
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('mouseup', this.onMouseUp)

        this.resizeObserver?.disconnect()
        this.resizers.forEach((resizer) => resizer.remove())
    }

    createResizers() {
        this.columns.forEach((th) => {
            const resizer = document.createElement('div')
            resizer.className = this.resizerClassValue
            resizer.th = th
            resizer.addEventListener('mousedown', this.mouseDown.bind(this))

            this.element.appendChild(resizer)
            this.resizers.push(resizer)
        })

        this.updateResizers()
    }

    updateResizers() {
        this.resizers.forEach((resizer) => {
            resizer.style.left = `${resizer.th.offsetLeft + resizer.th.offsetWidth - 5}px`
            resizer.style.height = `${resizer.th.offsetHeight}px`
        })
    }

    releaseColumn(th) {
        th.style.whiteSpace = 'normal'

        this.element.querySelectorAll('tbody tr').forEach((row) => {
            const cell = row.cells[th.cellIndex]
            if (!cell) {
                return
            }

            cell.style.whiteSpace = 'normal'
            cell.style.minWidth = '0px'
        })
    }

    mouseDown(event) {
        event.preventDefault()

        this.th = event.currentTarget.th
        this.startX = event.pageX
        this.startWidth = this.th.offsetWidth
        this.dragging = true

        this.releaseColumn(this.th)
    }

    mouseMove(event) {
        if (!this.dragging) {
            return
        }

        const width = Math.max(this.minWidthValue, this.startWidth + event.pageX - this.startX)

        this.th.style.width = `${width}px`
        this.th.style.minWidth = `${width}px`
        this.th.dataset.width = `${width}`

        this.updateResizers()
        window.getSelection().removeAllRanges()
    }

    async mouseUp() {
        if (!this.dragging) {
            return
        }

        this.dragging = false
        this.updateResizers()

        // Send every resizable column, so columns without a stored width keep their current width
        const columns = {}
        this.columns.forEach((th) => {
            columns[th.dataset.column] = th.offsetWidth
        })

        const body = {
            type: this.typeValue,
            columns: columns,
        }
        if (this.tokenValue) {
            body._token = this.tokenValue
        }

        await fetch(this.pathValue, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    }
}
