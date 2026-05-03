require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'accio', version: '1.0.0', time: new Date().toISOString() });
});

// ── KEEP ALIVE ────────────────────────────────────────────────────────────────
app.get('/ping', (req, res) => res.json({ pong: true }));

// ═════════════════════════════════════════════════════════════════════════════
// AUTH & ACCESS
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/validate-code
// Validates the access code entered on the landing screen.
// Returns: { valid, parentExists, parentId }
app.post('/api/validate-code', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });

console.log('Looking for code:', JSON.stringify(code.trim().toUpperCase()));
const { data, error } = await supabase
  .from('access_codes')
  .select('id, is_active, used_by_parent_id')
  .eq('code', code.trim().toUpperCase())
  .single();
console.log('Result:', data, 'Error:', error);

    if (error || !data) {
      return res.json({ valid: false });
    }

    if (!data.is_active) {
      return res.json({ valid: false, reason: 'inactive' });
    }

    const parentExists = !!data.used_by_parent_id;
    return res.json({
      valid: true,
      codeId: data.id,
      parentExists,
      parentId: data.used_by_parent_id || null
    });

  } catch (err) {
    console.error('validate-code error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/parent/setup
// Creates a new parent account linked to an access code.
// Body: { codeId, name, email, dashboardPin }
app.post('/api/parent/setup', async (req, res) => {
  try {
    const { codeId, name, dashboardPin, email } = req.body;

    if (!codeId || !name || !dashboardPin) {
      return res.status(400).json({ error: 'codeId, name and dashboardPin required' });
    }

    // Verify code is still valid and unclaimed
    const { data: codeRow, error: codeErr } = await supabase
      .from('access_codes')
      .select('id, is_active, used_by_parent_id')
      .eq('id', codeId)
      .single();

    if (codeErr || !codeRow || !codeRow.is_active) {
      return res.status(400).json({ error: 'Invalid access code' });
    }

    // Create parent
    const { data: parent, error: parentErr } = await supabase
      .from('parents')
      .insert({ access_code_id: codeId, name, email: email || null, dashboard_pin: dashboardPin })
      .select('id, name')
      .single();

    if (parentErr) {
      console.error('parent insert error:', parentErr);
      return res.status(500).json({ error: 'Failed to create parent account' });
    }

    // Mark code as used
    await supabase
      .from('access_codes')
      .update({ used_by_parent_id: parent.id, used_at: new Date().toISOString() })
      .eq('id', codeId);

    return res.json({ success: true, parentId: parent.id, parentName: parent.name });

  } catch (err) {
    console.error('parent setup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/parent/login
// Validates parent dashboard PIN.
// Body: { parentId, pin }
app.post('/api/parent/login', async (req, res) => {
  try {
    const { parentId, pin } = req.body;
    if (!parentId || !pin) return res.status(400).json({ error: 'parentId and pin required' });

    const { data, error } = await supabase
      .from('parents')
      .select('id, name, dashboard_pin')
      .eq('id', parentId)
      .single();

    if (error || !data) return res.json({ valid: false });
    if (data.dashboard_pin !== pin) return res.json({ valid: false });

    return res.json({ valid: true, parentId: data.id, parentName: data.name });

  } catch (err) {
    console.error('parent login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/child/create
// Creates a new child profile under a parent.
// Body: { parentId, name, age, grade, city, school, pin,
//         schoolYearStartMonth, schoolYearEndDate }
app.post('/api/child/create', async (req, res) => {
  try {
    const {
      parentId, name, age, grade, city, school, pin,
      schoolYearStartMonth, schoolYearEndDate
    } = req.body;

    if (!parentId || !name || !age || !grade || !pin) {
      return res.status(400).json({ error: 'parentId, name, age, grade and pin required' });
    }

    // Create child
    const { data: child, error: childErr } = await supabase
      .from('children')
      .insert({
        parent_id: parentId,
        name, age, grade,
        city: city || null,
        school: school || null,
        pin,
        school_year_start_month: schoolYearStartMonth || null,
        school_year_end_date: schoolYearEndDate || null,
        about_me_completed: false
      })
      .select('id, name')
      .single();

    if (childErr) {
      console.error('child insert error:', childErr);
      return res.status(500).json({ error: 'Failed to create child profile' });
    }

    // Create default preferences (all false / off)
    await supabase
      .from('child_preferences')
      .insert({ child_id: child.id });

    // Create empty child profile
    await supabase
      .from('child_profile')
      .insert({ child_id: child.id });

    return res.json({ success: true, childId: child.id, childName: child.name });

  } catch (err) {
    console.error('child create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/parent/:parentId/children
// Returns all children under a parent.
app.get('/api/parent/:parentId/children', async (req, res) => {
  try {
    const { parentId } = req.params;

    const { data, error } = await supabase
      .from('children')
      .select('id, name, age, grade, city, school, about_me_completed, last_active')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: 'Failed to fetch children' });

    return res.json({ children: data || [] });

  } catch (err) {
    console.error('fetch children error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/child/login
// Validates child PIN and returns their profile.
// Body: { parentId, pin }
app.post('/api/child/login', async (req, res) => {
  try {
    const { parentId, pin } = req.body;
    if (!parentId || !pin) return res.status(400).json({ error: 'parentId and pin required' });

    const { data, error } = await supabase
      .from('children')
      .select('id, name, age, grade, about_me_completed, last_active')
      .eq('parent_id', parentId)
      .eq('pin', pin)
      .single();

    if (error || !data) return res.json({ valid: false });

    // Update last active
    await supabase
      .from('children')
      .update({ last_active: new Date().toISOString() })
      .eq('id', data.id);

    return res.json({
      valid: true,
      childId: data.id,
      childName: data.name,
      age: data.age,
      grade: data.grade,
      aboutMeCompleted: data.about_me_completed
    });

  } catch (err) {
    console.error('child login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/child/about-me
// Saves the About Me card for a child.
// Body: { childId, favouriteSport, favouriteSubject, favouriteAnimal,
//         favouriteMusic, careerAspiration, favouriteBookOrMovie, freeText }
app.post('/api/child/about-me', async (req, res) => {
  try {
    const {
      childId, favouriteSport, favouriteSubject, favouriteAnimal,
      favouriteMusic, careerAspiration, favouriteBookOrMovie, freeText
    } = req.body;

    if (!childId) return res.status(400).json({ error: 'childId required' });

    // Build hobbies array from entered values for agent personalisation
    const hobbies = [
      favouriteSport, favouriteSubject, favouriteAnimal,
      favouriteMusic, careerAspiration
    ].filter(Boolean);

    // Update child_profile
    const { error: profileErr } = await supabase
      .from('child_profile')
      .update({
        favourite_sport: favouriteSport || null,
        favourite_subject: favouriteSubject || null,
        favourite_animal: favouriteAnimal || null,
        favourite_music: favouriteMusic || null,
        career_aspiration: careerAspiration || null,
        favourite_book_or_movie: favouriteBookOrMovie || null,
        free_text: freeText || null,
        hobbies,
        updated_at: new Date().toISOString()
      })
      .eq('child_id', childId);

    if (profileErr) {
      console.error('about-me update error:', profileErr);
      return res.status(500).json({ error: 'Failed to save About Me' });
    }

    // Also seed child_interests from About Me answers
    const interestRows = hobbies.map(interest => ({
      child_id: childId,
      interest,
      source: 'about_me',
      parent_approved: true
    }));

    if (interestRows.length > 0) {
      await supabase.from('child_interests').insert(interestRows);
    }

    // Mark about_me_completed on children table
    await supabase
      .from('children')
      .update({ about_me_completed: true })
      .eq('id', childId);

    return res.json({ success: true });

  } catch (err) {
    console.error('about-me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/child/:childId/profile
// Returns full child profile + preferences for agent context.
app.get('/api/child/:childId/profile', async (req, res) => {
  try {
    const { childId } = req.params;

    const [childRes, profileRes, prefsRes, interestsRes] = await Promise.all([
      supabase.from('children').select('*').eq('id', childId).single(),
      supabase.from('child_profile').select('*').eq('child_id', childId).single(),
      supabase.from('child_preferences').select('*').eq('child_id', childId).single(),
      supabase.from('child_interests').select('interest, source').eq('child_id', childId).eq('parent_approved', true)
    ]);

    if (childRes.error) return res.status(404).json({ error: 'Child not found' });

    return res.json({
      child: childRes.data,
      profile: profileRes.data || {},
      preferences: prefsRes.data || {},
      interests: (interestsRes.data || []).map(i => i.interest)
    });

  } catch (err) {
    console.error('child profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/child/:childId/preferences
// Updates sensitivity toggles. Parent action.
// Body: { reproduction, puberty, mental_health, ... }
app.put('/api/child/:childId/preferences', async (req, res) => {
  try {
    const { childId } = req.params;
    const updates = req.body;

    const { error } = await supabase
      .from('child_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('child_id', childId);

    if (error) return res.status(500).json({ error: 'Failed to update preferences' });

    return res.json({ success: true });

  } catch (err) {
    console.error('preferences update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── ADMIN: Generate access code ───────────────────────────────────────────────
// POST /api/admin/generate-code
// Simple admin endpoint to generate new access codes.
// Protected by admin secret in header.
app.post('/api/admin/generate-code', async (req, res) => {
  try {
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorised' });
    }

    const { notes } = req.body;
    const code = `ACCIO-${uuidv4().split('-')[0].toUpperCase()}`;

    const { data, error } = await supabase
      .from('access_codes')
      .insert({ code, notes: notes || '' })
      .select('id, code')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to generate code' });

    return res.json({ success: true, code: data.code, id: data.id });

  } catch (err) {
    console.error('generate code error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Accio backend running on port ${PORT}`);
});
