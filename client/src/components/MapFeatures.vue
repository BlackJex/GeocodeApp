<template>
    <div class="w-full md:w-auto absolute md:top-5 md:left-10 z-10 flex space-x-4 p-4 bg-transparent">
        <!-- search -->
        <div class="relative flex-1 min-w-max">
            <input 
                type="text" 
                placeholder="Cerca luogo..."
                class="py-3 pl-9 pr-4 rounded-md border text-sm focus:outline-none hover:border-blue-500 focus:border-blue-500 shadow-md"
                v-model="search_input"
                @input="search"
                @focus="$emit('toggleResults')">
            
            <div class="absolute top-0 left-2 h-full flex tems-cente rjustify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 fill-current"><path d="M21.71,20.29,18,16.61A9,9,0,1,0,16.61,18l3.68,3.68a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,20.29ZM11,18a7,7,0,1,1,7-7A7,7,0,0,1,11,18Z"/></svg>
            </div>
            <div  class="absolute mt-2 w-full">
                <!-- Results -->
                <div v-if="search_input && search_results" class="max-h-32 h-32 overflow-x-hidden overflow-y-auto overscroll-contain bg-white rounded-md">
                    <LoadingSpinner v-if="!search_data"/>
                    <div v-else>
                        <button 
                            v-for="data in search_data" :key="data.id"
                            class="w-full px-4 py-2 flex items-center justify-start text-left space-x-2 cursor-pointer hover:bg-gray-600 hover:text-white"
                            @click.prevent="selectResult(data)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="min-w-4 w-4 fill-current"><path d="M12,2a8,8,0,0,0-8,8c0,5.4,7.05,11.5,7.35,11.76a1,1,0,0,0,1.3,0C13,21.5,20,15.4,20,10A8,8,0,0,0,12,2Zm0,17.65c-2.13-2-6-6.31-6-9.65a6,6,0,0,1,12,0C18,13.34,14.13,17.66,12,19.65ZM12,6a4,4,0,1,0,4,4A4,4,0,0,0,12,6Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,12Z"/></svg>
                            <span class="text-xs">
                                {{ data.place_name }}
                            </span>
                        </button>
                    </div>
                </div>  
                <!-- Selected Result -->
                <div v-if="selected_result" class="mt-2 px-4 py-3 bg-white rounded-md">
                    <button 
                        @click.prevent="removeResult"
                        class="flex justify-end w-full text-gray-400 hover:text-gray-900 duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 fill-current"><path d="M13.41,12l4.3-4.29a1,1,0,1,0-1.42-1.42L12,10.59,7.71,6.29A1,1,0,0,0,6.29,7.71L10.59,12l-4.3,4.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l4.29,4.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z"/></svg>
                    </button>
                    <h1 class="text-lg">
                        {{ selected_result.text }}
                    </h1>
                    <p class="text-xs mb-1">
                        {{ selected_result.properties.address }}, {{ selected_result.properties.city }}, {{selected_result.properties.state }}
                    </p>
                    <p class="text-xs">
                        {{ selected_result.properties.category  }}
                    </p>
                </div>
            </div>
        </div>
        <!-- Geo Location -->
        <button @click.prevent="$emit('getGeoLocation')" class="py-2 px-3 flex items-center shadow-md rounded-md bg-white"
            :class="{'bg-gray-600 text-white': coords, 'animate-pulse' : fetchCoords}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="w-5 fill-current"><path d="M285.6 444.1C279.8 458.3 264.8 466.3 249.8 463.4C234.8 460.4 223.1 447.3 223.1 432V256H47.1C32.71 256 19.55 245.2 16.6 230.2C13.65 215.2 21.73 200.2 35.88 194.4L387.9 50.38C399.8 45.5 413.5 48.26 422.6 57.37C431.7 66.49 434.5 80.19 429.6 92.12L285.6 444.1z"/></svg>
        </button>
       
    </div>
</template>
<script>
import { ref } from '@vue/reactivity';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner.vue';
export default 
{
    components:{ LoadingSpinner },
    emits:['getGeoLocation', 'plotResult', 'toggleResults', 'removeResult'],
    props:{
        coords:{ required: true },
        fetchCoords:{ required: true },
        search_results: {required: true}
    },
    setup(props, {emit})
    {
        /**
         * 
         * Data 
         * 
         */
        const search_input = ref(null);
        const search_data = ref(null);
        const query_timeout = ref(null);
        const selected_result = ref(null);


        /**
         * 
         * Methods 
         * 
         */
        const search = (props) => 
        {
            clearTimeout(query_timeout.value);
            search_data.value = null;
            query_timeout.value = setTimeout( async () => 
            {
                if(search_input.value !== '')
                {
                    const params = new URLSearchParams({
                        fuzzyMatch: true,
                        language: 'en',
                        limit: 10,
                        proximity: props.coords ? `${props.coords.lng},${props.coords.lat}` : '0, 0'
                    });

                    const res = await axios.get(`http://localhost:3000/api/search/${search_input.value}?${params}`);
                    search_data.value = res.data.features;
                }
            }, 750);
        }

        const selectResult = (result) =>
        {
            selected_result.value = result;
            emit('plotResult', result.geometry);
        }

        const removeResult = () => 
        {
            selected_result.value = null;
            emit('removeResult')
        }

        return {
            search_input,
            search_data,
            query_timeout,
            selected_result,
            search,
            selectResult,
            removeResult
        }
    }
}
</script>