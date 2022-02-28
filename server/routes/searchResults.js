const express = require('express');
const axios = require('axios');
const url = require('url');

const router = express.Router();

router.get('/:query', async (req, res) => 
{
    try 
    {
        // add api_key & query strings
        const params = new URLSearchParams({ 
            access_token: process.env.GEOCODE_API_KEY,
            ...url.parse(req.url, true).query
        });
        const query = req.params.query;
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?${params}`);

        response.data.features.forEach( f => 
        {
            f.city = null;
            f.state = null;
            f.context.forEach( type => 
            {
                if(type.id.includes('palace')) f.city = type.text;
                if(type.id.includes('region')) f.state = type.text;
            })
        });
        const data = response.data;
        res.status(200).json(data);
    }
    catch(e)
    {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;