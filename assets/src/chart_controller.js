import {Controller} from '@hotwired/stimulus'
import {visit} from '@hotwired/turbo'
import Chart from 'chart.js/auto'

export default class extends Controller {
    static targets = ['canvas', 'legendContainer', 'legendList', 'legendItemTemplate']
    static values = {
        routes: Array,
        settings: Object,
    }

    connect() {
        let settings = this.settingsValue

        if (this.hasRoutesValue) {
            settings.options.onClick = (event, item) => {
                let location = this.routesValue[item[0].datasetIndex][item[0].index]

                if (event.native.metaKey || event.native.ctrlKey) {
                    window.open(location, '_blank')
                } else {
                    visit(location, {})
                }
            }

            settings.options.onHover = (event, element) => {
                event.native.target.style.cursor = element[0] ? 'pointer' : 'default'
            }
        }

        let legendList = this.legendListTarget
        let itemTemplate = this.legendItemTemplateTarget
        let htmlLegend = {
            id: 'htmlLegend',
            afterUpdate(chart, _args, _options) {
                while (legendList.firstChild) {
                    legendList.firstChild.remove()
                }

                const items = chart.options.plugins.legend.labels.generateLabels(chart)

                items.forEach(item => {
                    const li = itemTemplate.content.firstElementChild.cloneNode(true)

                    const colorEl = li.querySelector('[data-legend-color]')
                    if (colorEl) colorEl.style.background = item.fillStyle

                    const textEl = li.querySelector('[data-legend-text]')
                    if (textEl) {
                        textEl.textContent = item.text
                        if (item.hidden) textEl.style.textDecoration = 'line-through'
                    }

                    li.addEventListener('click', () => {
                        chart.toggleDataVisibility(item.index)
                        chart.update()
                    })

                    legendList.appendChild(li)
                })
            }
        }

        settings.plugins = [htmlLegend]
        settings.options.plugins = {
            htmlLegend: {containerID: 'legend-container'},
            legend: {display: false},
        }

        new Chart(this.canvasTarget, settings)
    }
}
