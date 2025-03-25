const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json()); // Required for POST requests (if any)

// Health check endpoint (Render requires this)
app.get('/', (req, res) => {
  res.status(200).send('Medical API is live!');
});

// API endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query required' });
    
    const response = await axios.get(`https://api.fda.gov/drug/label.json?search=${encodeURIComponent(query)}&limit=10`);
    const medications = response.data.results.map(item => ({
      name: item.openfda?.brand_name?.[0] || 'Unknown',
      genericName: item.openfda?.generic_name?.[0] || 'Unknown',
      manufacturer: item.openfda?.manufacturer_name?.[0] || 'Unknown',
      dosage: item.dosage_and_administration?.[0] || 'Not available',
      warnings: item.warnings?.[0] || 'None listed',
      indications: item.indications_and_usage?.[0] || 'Not specified'
    }));
    res.json(medications);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Start server (critical for Render)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});