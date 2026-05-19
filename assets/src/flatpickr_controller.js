import {Controller} from '@hotwired/stimulus'
import flatpickr from 'flatpickr'

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static values = {
        dateFormat: {type: String, default: 'd-m-Y'},
        enableTime: {type: Boolean, default: false},
        minDateToday: {type: Boolean, default: false},
        maxDateToday: {type: Boolean, default: false},
        mode: {type: String, default: 'single'}, // 'single' | 'range'
        enablePredefinedRanges: {type: Boolean, default: false},
        predefinedRanges: {type: Array, default: []},
        timeframe: {type: String, default: 'past'},
        defaultDate: {type: String, default: null},
        rangeSeparator: {type: String, default: ' to '},
        firstDayOfWeek: {type: Number, default: 1},
    }

    get defaultPredefinedRanges() {
        const now = new Date()
        const day = now.getDay()
        const diffToMonday = (day === 0 ? -6 : 1) - day
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0))
        const endOfToday = new Date(new Date().setHours(23, 59, 59, 999))

        const y = now.getFullYear()
        const m = now.getMonth()

        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() + diffToMonday)

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        const startOfThisMonth = new Date(y, m, 1)
        const endOfThisMonth = new Date(y, m + 1, 0)

        const startOfThisYear = new Date(y, 0, 1)
        const endOfThisYear = new Date(y, 11, 31)

        const thisMonthStart = this.minDateTodayValue ? startOfToday : startOfThisMonth
        const thisMonthEnd = this.maxDateTodayValue ? endOfToday : endOfThisMonth
        const thisYearStart = this.minDateTodayValue ? startOfToday : startOfThisYear
        const thisYearEnd = this.maxDateTodayValue ? endOfToday : endOfThisYear

        const daysFromNow = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000)

        // Future ranges
        const startOfNextWeek = new Date(startOfWeek)
        startOfNextWeek.setDate(startOfWeek.getDate() + 7)
        const endOfNextWeek = new Date(startOfNextWeek)
        endOfNextWeek.setDate(startOfNextWeek.getDate() + 6)

        const startOfNextMonth = new Date(y, m + 1, 1)
        const endOfNextMonth = new Date(y, m + 2, 0)
        const endOfThreeMonthsFromNow = new Date(y, m + 4, 0)
        const endOfSixMonthsFromNow = new Date(y, m + 7, 0)

        const startOfNextYear = new Date(y + 1, 0, 1)
        const endOfNextYear = new Date(y + 1, 11, 31)

        // Past ranges
        const startOfYesterday = new Date(startOfToday)
        startOfYesterday.setDate(startOfYesterday.getDate() - 1)
        const endOfYesterday = new Date(startOfYesterday)
        endOfYesterday.setHours(23, 59, 59, 999)

        const startOfLastWeek = new Date(startOfWeek)
        startOfLastWeek.setDate(startOfWeek.getDate() - 7)
        const endOfLastWeek = new Date(startOfLastWeek)
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)

        const startOfLastMonth = new Date(y, m - 1, 1)
        const endOfLastMonth = new Date(y, m, 0)
        const startOfThreeMonthsAgo = new Date(y, m - 3, 1)
        const startOfSixMonthsAgo = new Date(y, m - 6, 1)

        const startOfLastYear = new Date(y - 1, 0, 1)
        const endOfLastYear = new Date(y - 1, 11, 31)

        if ('future' === this.timeframeValue) {
            return [
                {id: 'today', label: 'Today', range: [startOfToday, endOfToday]},
                {id: 'this_week', label: 'This week', range: [startOfWeek, endOfWeek]},
                {id: 'next_week', label: 'Next week', range: [startOfNextWeek, endOfNextWeek]},
                {id: 'next_7_days', label: 'Next 7 days', range: [now, daysFromNow(7)]},
                {id: 'this_month', label: 'This month', range: [thisMonthStart, thisMonthEnd]},
                {id: 'next_month', label: 'Next month', range: [startOfNextMonth, endOfNextMonth]},
                {id: 'next_30_days', label: 'Next 30 days', range: [now, daysFromNow(30)]},
                {id: 'next_3_months', label: 'Next 3 months', range: [startOfNextMonth, endOfThreeMonthsFromNow]},
                {id: 'next_6_months', label: 'Next 6 months', range: [startOfNextMonth, endOfSixMonthsFromNow]},
                {id: 'this_year', label: 'This year', range: [thisYearStart, thisYearEnd]},
                {id: 'next_year', label: 'Next year', range: [startOfNextYear, endOfNextYear]},
            ]
        }

        return [
            {id: 'today', label: 'Today', range: [startOfToday, endOfToday]},
            {id: 'yesterday', label: 'Yesterday', range: [startOfYesterday, endOfYesterday]},
            {id: 'this_week', label: 'This week', range: [startOfWeek, endOfWeek]},
            {id: 'last_week', label: 'Last week', range: [startOfLastWeek, endOfLastWeek]},
            {id: 'last_7_days', label: 'Last 7 days', range: [daysFromNow(-7), endOfToday]},
            {id: 'this_month', label: 'This month', range: [thisMonthStart, thisMonthEnd]},
            {id: 'last_month', label: 'Last month', range: [startOfLastMonth, endOfLastMonth]},
            {id: 'last_30_days', label: 'Last 30 days', range: [daysFromNow(-30), endOfToday]},
            {id: 'last_3_months', label: 'Last 3 months', range: [startOfThreeMonthsAgo, endOfLastMonth]},
            {id: 'last_6_months', label: 'Last 6 months', range: [startOfSixMonthsAgo, endOfLastMonth]},
            {id: 'this_year', label: 'This year', range: [thisYearStart, thisYearEnd]},
            {id: 'last_year', label: 'Last year', range: [startOfLastYear, endOfLastYear]},
        ]
    }

    connect() {
        this.create()
    }

    disconnect() {
        if (this.fp) {
            this.fp.destroy()
            this.fp = null
        }
    }

    resolvedPredefinedRanges() {
        const predefinedRanges = this.predefinedRangesValue || []
        const defaultRanges = this.defaultPredefinedRanges
        const selectedRanges = []

        if (predefinedRanges.length === 0 && this.enablePredefinedRangesValue) {
            return defaultRanges
        }

        defaultRanges.forEach(defaultRange => {
            if (predefinedRanges.includes(defaultRange.id)) {
                selectedRanges.push(defaultRange)
            }
        })

        return selectedRanges
    }

    generateRangeButtonsHtml(ranges) {
        if (!ranges.length) return ''
        const isMobile = window.innerWidth < 768

        if (isMobile) {
           const options = ranges.map(({range, label}) => {
                const data = range.map(d => d instanceof Date ? d.toISOString() : d).join(',')
                return `<option value="${data}">${label}</option>`
            }).join('')

            return `
                 <div class="flatpickr-predefined-ranges">
                    <select data-range-select>
                        <option>Select a range</option>
                        ${options}
                    </select>
                </div>
            `
        }

        const items = ranges.map(({range, label}) => {
            const data = range.map(d => d instanceof Date ? d.toISOString() : d).join(',')
            return `
                 <button type="button" data-range="${data}">
                    ${label}
                </button>
            `
        }).join('')

        return `
            <div class="flatpickr-predefined-ranges">
            ${items}
          </div>
        `
    }

    ensureRangeButtons(instance, ranges) {
        const container = instance.calendarContainer
        if (!container) return
        if (!container.querySelector('.flatpickr-predefined-ranges')) {
            container.insertAdjacentHTML('afterbegin', this.generateRangeButtonsHtml(ranges))
        }
    }

    addRangeButtonListeners(instance) {
        const container = instance.calendarContainer
        if (!container) return

        const applyRange = (value) => {
            if (!value) return
            const [startIso, endIso] = value.split(',')
            const startDate = new Date(startIso)
            const endDate = new Date(endIso)

            instance.setDate([startDate, endDate], true)
            instance.redraw()
            instance.close()
        }

        container.querySelectorAll('[data-range]').forEach(btn => {
            btn.addEventListener('click', () => applyRange(btn.dataset.range))
        })

        const select = container.querySelector('[data-range-select]')
        if (select) {
            select.addEventListener('change', (e) => applyRange(e.target.value))
        }
    }

    onOpen = (selectedDates, dateStr, instance) => {
        const ranges = this.resolvedPredefinedRanges()
        const container = instance.calendarContainer

        if (ranges.length) {
            container.classList.add('has-ranges')
            this.ensureRangeButtons(instance, ranges)
            this.addRangeButtonListeners(instance)
        } else {
            container.classList.remove('has-ranges')
        }
    }

    onChange(selectedDates, dateStr, instance) {
        if (selectedDates.length !== 2) return

        const [start, end] = selectedDates

        const needsSync = start.getHours() !== end.getHours() || start.getMinutes() !== end.getMinutes()

        if (!needsSync) return

        const newStart = new Date(start)
        newStart.setHours(end.getHours(), end.getMinutes(), 0, 0)

        instance.setDate([newStart, end], false)
    }

    create() {
        if (this.fp) {
            this.fp.destroy()
            this.fp = null
        }

        const ranges = this.resolvedPredefinedRanges()
        const effectiveMode = ranges.length ? 'range' : this.modeValue
        const plugins = [];

        this.fp = flatpickr(this.element, {
            time_24hr: true,
            locale: {
                firstDayOfWeek: this.firstDayOfWeekValue,
                rangeSeparator: this.rangeSeparatorValue,
            },
            allowInput: !ranges.length,
            dateFormat: this.dateFormatValue,
            defaultDate: this.defaultDateValue,
            enableTime: this.enableTimeValue,
            minDate: this.minDateTodayValue ? 'today' : false,
            maxDate: this.maxDateTodayValue ? 'today' : false,
            mode: effectiveMode,
            plugins,
            onOpen: this.onOpen,
            onChange: this.onChange,
            onPreCalendarPosition(selectedDates, dateStr, instance) {
                const predefinedRanges = instance.calendarContainer.querySelector('.flatpickr-predefined-ranges');
                if (!predefinedRanges) return;
                predefinedRanges.style.display = 'none';
                requestAnimationFrame(() => {
                    predefinedRanges.style.display = '';
                });
            },
        })
    }
}
