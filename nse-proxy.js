// nse-proxy.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/circulars', async (req, res) => {
    try {
        const { from, to, keyword } = req.query;
        const apiUrl = `https://www.nseindia.com/api/circulars?from_date=${from}&to_date=${to}&segmentLink=all&circularType=all&search=${keyword || ''}&sort=desc&sortBy=Date`;

        const response = await fetch(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
                "Referer": "https://www.nseindia.com/"
            }
        });

        if (!response.ok) {
            throw new Error(`NSE API Error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
