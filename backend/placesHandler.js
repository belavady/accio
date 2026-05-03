// ── Google Places Autocomplete Handler ───────────────────────────────────────
// Proxies Google Places API calls through the backend so the API key
// is never exposed in the frontend.

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

// POST /api/autocomplete/cities
// Returns US city suggestions for a partial query
const autocompleteCities = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.length < 3) {
      return res.json({ suggestions: [] });
    }

    if (!PLACES_API_KEY) {
      return res.status(500).json({ error: 'Places API not configured' });
    }

    const params = new URLSearchParams({
      input: query,
      types: '(cities)',
      components: 'country:us',
      key: PLACES_API_KEY,
      language: 'en'
    });

    const response = await fetch(`${PLACES_BASE}/autocomplete/json?${params}`);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status, data.error_message);
      return res.json({ suggestions: [] });
    }

    const suggestions = (data.predictions || []).map(p => ({
      label: p.description,
      // Extract just city and state (remove ", USA")
      city: p.description.replace(', USA', '').replace(', United States', ''),
      placeId: p.place_id
    }));

    return res.json({ suggestions });
  } catch (err) {
    console.error('city autocomplete error:', err);
    return res.json({ suggestions: [] });
  }
};

// POST /api/autocomplete/schools
// Returns school suggestions filtered by city
const autocompleteSchools = async (req, res) => {
  try {
    const { query, city } = req.body;
    if (!query || query.length < 3) {
      return res.json({ suggestions: [] });
    }

    if (!PLACES_API_KEY) {
      return res.status(500).json({ error: 'Places API not configured' });
    }

    // First get the location coordinates for the city to bias results
    let locationBias = '';
    if (city) {
      try {
        const geoParams = new URLSearchParams({
          address: city + ', USA',
          key: PLACES_API_KEY
        });
        const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${geoParams}`);
        const geoData = await geoRes.json();
        if (geoData.results?.[0]?.geometry?.location) {
          const { lat, lng } = geoData.results[0].geometry.location;
          locationBias = `&location=${lat},${lng}&radius=50000`;
        }
      } catch {}
    }

    const params = new URLSearchParams({
      input: query,
      types: 'school',
      components: 'country:us',
      key: PLACES_API_KEY,
      language: 'en'
    });

    const response = await fetch(`${PLACES_BASE}/autocomplete/json?${params}${locationBias}`);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API school error:', data.status);
      return res.json({ suggestions: [] });
    }

    const suggestions = (data.predictions || []).map(p => ({
      label: p.description,
      // Extract just the school name (before the first comma)
      name: p.structured_formatting?.main_text || p.description.split(',')[0],
      placeId: p.place_id
    }));

    return res.json({ suggestions });
  } catch (err) {
    console.error('school autocomplete error:', err);
    return res.json({ suggestions: [] });
  }
};

module.exports = { autocompleteCities, autocompleteSchools };
