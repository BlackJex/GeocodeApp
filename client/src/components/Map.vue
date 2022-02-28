<template>
    <GeoErrorModal 
        v-if="geoError"
        :errorMessage="geoErrorMsg"
        @closeGeoModal="clearGeoError"
    />
    <MapFeatures 
        :coords="coords"
        :fetchCoords="fetchCoords"
        :search_results="search_results"
        @getGeoLocation="getGeoLocation"
        @plotResult="plotResult"
        @toggleResults="toggleResults"
        @removeResult="removeResult"
    />
    <div id="map" class="h-full w-full z-0"></div>
</template>
<script>
import leaflet from 'leaflet';
import { onMounted, ref } from '@vue/runtime-core';
import GeoErrorModal from './GeoErrorModal.vue';
import MapFeatures from './MapFeatures.vue';

export default {
    components: { GeoErrorModal, MapFeatures },
    setup()
    {
        /**
         * 
         * Data
         */
        let map;
        const coords = ref(null);
        const geoMarker = ref(null);
        const fetchCoords = ref(null);
        const geoError = ref(null);
        const resultMarker = ref(null);
        const search_results = ref(null);

        const geoErrorMsg = ref('Per usufruire del servizio, assicurati di aver abilitato i permessi di geolocalizzazione.');

        /**
         * 
         * Methods
         */
        const getGeoLocation = () => 
        {
            if(coords.value)
            {
                coords.value = null;
                sessionStorage.removeItem('coords');
                return map.removeLayer(geoMarker.value);
            }
            //check sessionStorage for coords
            if(sessionStorage.getItem('coords'))
            {
                coords.value = JSON.parse(sessionStorage.getItem('coords'));
                return plotGeoLocation(coords.value);
            }

            fetchCoords.value = true;
            navigator.geolocation.getCurrentPosition(setCoords, getLocError);
        };

        const setCoords = (position) => 
        {
            //stop fetching coords
            fetchCoords.value = null;

            //set coords in session storage
            const sessionCoords = 
            {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            sessionStorage.setItem('coords', JSON.stringify(sessionCoords));

            //set ref coorde value
            coords.value = sessionCoords;

            plotGeoLocation(coords.value);
        };

        const plotGeoLocation = (coords) => 
        {
            //create custom marker
            const customMarker = leaflet.icon({ 
                iconUrl: require('../assets/img/map-marker-red.svg'),
                iconSize: [35, 35]
            });

            // create new marker with coords
            geoMarker.value = leaflet.marker([coords.lat, coords.lng], { icon: customMarker }).addTo(map);

            //set map view location
            map.setView([coords.lat, coords.lng], 10);
        }

        const plotResult = (coords) => 
        {
            // check if resultMarker exists
            if(resultMarker.value) map.removeLayer(resultMarker.value);
            
            //create marker
            const customMarker = leaflet.icon({ 
                iconUrl: require('../assets/img/map-marker-blue.svg'),
                iconSize: [35, 35]
            });

            // create new marker with coords
            resultMarker.value = leaflet.marker([coords.coordinates[1], coords.coordinates[0]], { icon: customMarker }).addTo(map);

            //set map view location
            map.setView([coords.coordinates[1], coords.coordinates[0]], 13);

            closeResults();
        }
        
        const getLocError = (err) => 
        {
            fetchCoords.value = null;
            geoError.value = true;
            geoErrorMsg.value = err.message;
        }

        const clearGeoError = () => 
        {
            geoError.value = null;
            geoErrorMsg.value = null;
        }

        const toggleResults = () => 
        {
            //search_results.value = !search_results.value;
            search_results.value = true;
        }
        const closeResults = () => 
        {
            search_results.value = false;
        }

        const removeResult = () => 
        {
            map.removeLayer(resultMarker.value);
        }

        /**
         * 
         * Hooks
         */
        onMounted( () => 
        {
            //init map
            map = leaflet.map('map').setView([43.31641982144536, 13.638335172770955], 10);
            // add title layer
            leaflet.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.VUE_APP_MAP_API_KEY}`, {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: process.env.VUE_APP_MAP_API_KEY
            }).addTo(map);
            
            map.on('moveend', () => 
            {
                closeResults();
            });
            getGeoLocation();
        });
    

        return {
            coords, 
            search_results,
            fetchCoords,
            geoMarker,
            geoError,
            geoErrorMsg,
            clearGeoError,
            getGeoLocation,
            plotResult,
            toggleResults,
            closeResults,
            removeResult
        }
    }
}
</script>