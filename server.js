re('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ============================================
// KONFIGURASI DARI ENVIRONMENT
// ============================================
const ANIMEKOMPI_BASE = process.env.ANIMEKOMPI_BASE || 'https://indocast.site/api/animekompi';
const ANIMEKOMPI_KEY = process.env.ANIMEKOMPI_KEY;

// ============================================
// PROXY ANIMEKOMPI - SEMUA ENDPOINT
// ============================================
app.get('/api/animekompi/:endpoint', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const query = new URLSearchParams(req.query).toString();
        const url = `${ANIMEKOMPI_BASE}/${endpoint}${query ? `?${query}` : ''}`;
        
        console.log('➡️ Animekompi:', url);
        
        const response = await axios.get(url, {
            headers: {
                'x-api-key': ANIMEKOMPI_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000
        });
        
        console.log('✅ Status:', response.status);
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.message,
            detail: error.response?.data || null
        });
    }
});

// ============================================
// ROUTE: Health Check
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'EclipesVerse Backend running!',
        endpoints: [
            '/api/animekompi/home',
            '/api/animekompi/schedule',
            '/api/animekompi/genres',
            '/api/animekompi/genre-detail',
            '/api/animekompi/list',
            '/api/animekompi/detail',
            '/api/animekompi/play'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🚀 EclipesVerse Backend running on http://localhost:${PORT}`);
    console.log(`📡 Animekompi: ${ANIMEKOMPI_BASE}`);
});
EOF
