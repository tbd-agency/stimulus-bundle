import {Controller} from '@hotwired/stimulus'
import {visit} from '@hotwired/turbo'
import * as leaflet from 'leaflet'

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = ['icon', 'popup', 'attribution']
    static values = {
        markers: {type: Array, default: []},
        center: {type: Array, default: [50.8387917, 4.3630185]},
        zoom: {type: Number, default: 16},
        minZoom: {type: Number, default: 2},
        maxZoom: {type: Number, default: 18},
        fitMaxZoom: {type: Number, default: 16},
        tileUrl: {type: String, default: 'https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png'},
        attribution: {type: String, default: '© Stadia Maps © OpenMapTiles © OpenStreetMap'},
        markerClick: {type: String, default: 'visit'}, // 'visit' | 'popup' | 'none'
    }

    connect() {
        this.map = leaflet.map(this.element, {
            minZoom: this.minZoomValue,
            maxZoom: this.maxZoomValue,
            worldCopyJump: true,
        })
        this.map.attributionControl.setPrefix(false)

        leaflet.tileLayer(this.tileUrlValue, {
            attribution: this.attribution(),
            maxZoom: this.maxZoomValue,
        }).addTo(this.map)

        this.layers = leaflet.layerGroup().addTo(this.map)
        this.markersValueChanged()
    }

    disconnect() {
        this.map?.remove()
        this.map = null
    }

    // Stimulus also calls this before connect(), when there is no map yet
    markersValueChanged() {
        if (!this.map) return

        this.layers.clearLayers()
        this.validMarkers.forEach(marker => this.addMarker(marker))
        this.fit()
    }

    // Call after the map was hidden or resized, Leaflet cannot detect that itself
    invalidateSize() {
        if (!this.map) return

        this.map.invalidateSize()
        this.fit()
    }

    get validMarkers() {
        return this.markersValue.filter(marker => Number.isFinite(parseFloat(marker.lat)) && Number.isFinite(parseFloat(marker.lng)))
    }

    fit() {
        const markers = this.validMarkers
        if (markers.length) {
            this.map.fitBounds(markers.map(marker => [marker.lat, marker.lng]), {maxZoom: this.fitMaxZoomValue})
        } else {
            this.map.setView(this.centerValue, this.zoomValue)
        }
    }

    addMarker(marker) {
        const latLng = [marker.lat, marker.lng]
        const layer = this.markerLayer(marker, latLng).addTo(this.layers)

        if (marker.name || this.hasPopupTarget) {
            layer.bindPopup(this.popup(marker))
        }
        // In 'popup' mode Leaflet opens the popup on click, otherwise it follows the mouse
        if (this.markerClickValue !== 'popup') {
            layer.on('mouseover', () => layer.openPopup())
            layer.on('mouseout', () => layer.closePopup())
        }
        layer.on('click', event => this.markerClicked(marker, event.originalEvent))

        if (marker.radius > 0) {
            leaflet.circle(latLng, {radius: marker.radius, fillOpacity: 0.2}).addTo(this.layers)
        }
    }

    // The icon is a clone of an icon <template>: the one named by marker.icon, or the first one
    markerLayer(marker, latLng) {
        const template = this.iconTargets.find(icon => icon.dataset.mapIcon === marker.icon) ?? this.iconTargets[0]
        const node = template?.content.firstElementChild?.cloneNode(true)
        if (!node) {
            return leaflet.circleMarker(latLng)
        }

        if (marker.color) {
            node.style.color = marker.color
        }

        return leaflet.marker(latLng, {icon: leaflet.divIcon({className: '', html: node})})
    }

    // Leaflet parses a popup string as HTML, so it only ever gets a node with text in it
    popup(marker) {
        if (!this.hasPopupTarget) {
            const node = document.createElement('span')
            node.textContent = marker.name

            return node
        }

        const node = this.popupTarget.content.firstElementChild.cloneNode(true)
        node.querySelectorAll('[data-map-field]').forEach(field => {
            field.textContent = marker[field.dataset.mapField] ?? ''
        })

        return node
    }

    markerClicked(marker, event) {
        const clicked = this.dispatch('marker-click', {detail: {marker}, cancelable: true})
        if (clicked.defaultPrevented || this.markerClickValue !== 'visit' || !marker.url) return

        const url = new URL(marker.url, document.baseURI)
        if (!['http:', 'https:'].includes(url.protocol)) return

        if (event?.metaKey || event?.ctrlKey) {
            window.open(url, '_blank')
        } else {
            visit(url)
        }
    }

    // Leaflet renders the attribution as HTML: links come from a Twig-rendered <template>, the value stays text
    attribution() {
        if (this.hasAttributionTarget) {
            return this.attributionTarget.innerHTML.trim()
        }

        const node = document.createElement('span')
        node.textContent = this.attributionValue

        return node.innerHTML
    }
}
