const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Render will override this

// Enable CORS for all routes
app.use(cors());

// API endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));