<template>
    <div class="h-screen absolute inset-0 z-20 flex justify-center items-center bg-black bg-opacity-50 w-full p-5">
        <div class="lg:w-2/3  bg-white flex flex-col rounded-md p-5">
            <h1 class="text-lg mb-1">
                Errore:
            </h1>
            <p class="text-sm mb-4">
                {{ errorMessage ? errorMessage : 'Per usufruire del servizio, assicurati di aver abilitato i permessi di geolocalizzazione.'}}
            </p>    
            <button 
                @click.prevent="$emit('closeGeoModal')"
                class="self-start px-4 py-2 rounded-md bg-red-500 text-white text-sm hover:bg-red-700 duration-300">
                Chiudi
            </button>
        </div>
    </div>
</template>
<script>
export default 
{
    emits:['closeGeoModal'],
    props:
    {
        errorMessage:{ required:false}
    },

}
</script>