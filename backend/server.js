require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');
const { aboutMePlayfulResponse } = require('./aboutMeHandler');
const { recordConsent, deleteChild } = require('./complianceHandlers');
const {
  generateParentToken, generateChildToken,
  requireParent, requireChild,
  requireParentOwnership, requireChildOwnership,
  authLimiter, apiLimiter, aiLimiter, adminLimiter
} = require('./auth');

const app = express();
app.set('trust proxy', 1); // Required for Render's proxy layer
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'https://belavady.github.io',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Apply standard rate limiter to all routes
app.use('/api/', apiLimiter);

// ── HEALTH & KEEP ALIVE ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'accio', version: '1.0.0', time: new Date().toISOString() });
});
app.get('/ping', (req, res) => res.json({ pong: true }));

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS (no auth required — access code and setup flow)
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/validate-code — rate limited, public
app.post('/api/validate-code', authLimiter, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });

    const { data, error } = await supabase
      .from('access_codes')
      .select('id, is_active, used_by_parent_id')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (error || !data) return res.json({ valid: false });
    if (!data.is_active) return res.json({ valid: false, reason: 'inactive' });

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

// POST /api/parent/setup — public, creates first parent account
app.post('/api/parent/setup', authLimiter, async (req, res) => {
  try {
    const { codeId, name, dashboardPin, email } = req.body;
    if (!codeId || !name || !dashboardPin) {
      return res.status(400).json({ error: 'codeId, name and dashboardPin required' });
    }

    const { data: codeRow, error: codeErr } = await supabase
      .from('access_codes')
      .select('id, is_active, used_by_parent_id')
      .eq('id', codeId)
      .single();

    if (codeErr || !codeRow || !codeRow.is_active) {
      return res.status(400).json({ error: 'Invalid access code' });
    }

    const { data: parent, error: parentErr } = await supabase
      .from('parents')
      .insert({ access_code_id: codeId, name, email: email || null, dashboard_pin: dashboardPin })
      .select('id, name')
      .single();

    if (parentErr) return res.status(500).json({ error: 'Failed to create parent account' });

    await supabase
      .from('access_codes')
      .update({ used_by_parent_id: parent.id, used_at: new Date().toISOString() })
      .eq('id', codeId);

    // Issue parent token immediately after setup
    const token = generateParentToken(parent.id);
    return res.json({ success: true, parentId: parent.id, parentName: parent.name, token });
  } catch (err) {
    console.error('parent setup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/parent/login — public, rate limited, issues JWT on success
app.post('/api/parent/login', authLimiter, async (req, res) => {
  try {
    const { parentId, pin } = req.body;
    if (!parentId || !pin) return res.status(400).json({ error: 'parentId and pin required' });

    const { data, error } = await supabase
      .from('parents')
      .select('id, name, dashboard_pin')
      .eq('id', parentId)
      .single();

    if (error || !data || data.dashboard_pin !== pin) {
      return res.json({ valid: false });
    }

    const token = generateParentToken(data.id);
    return res.json({ valid: true, parentId: data.id, parentName: data.name, token });
  } catch (err) {
    console.error('parent login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/child/login — public, rate limited, issues JWT on success
app.post('/api/child/login', authLimiter, async (req, res) => {
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

    await supabase
      .from('children')
      .update({ last_active: new Date().toISOString() })
      .eq('id', data.id);

    const token = generateChildToken(data.id, parentId, data.age, data.grade);
    return res.json({
      valid: true,
      childId: data.id,
      childName: data.name,
      age: data.age,
      grade: data.grade,
      aboutMeCompleted: data.about_me_completed,
      token
    });
  } catch (err) {
    console.error('child login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// PROTECTED PARENT ENDPOINTS (require valid parent JWT)
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/parent/record-consent
app.post('/api/parent/record-consent', requireParent, (req, res) =>
  recordConsent(req, res, supabase)
);

// GET /api/parent/:parentId/children
app.get('/api/parent/:parentId/children', requireParentOwnership, async (req, res) => {
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

// POST /api/child/create — parent creates a child profile
app.post('/api/child/create', requireParent, async (req, res) => {
  try {
    const {
      parentId, name, age, grade, gender, city, school, pin,
      schoolYearStartMonth, schoolYearEndDate
    } = req.body;

    if (!parentId || !name || !age || !grade || !pin) {
      return res.status(400).json({ error: 'parentId, name, age, grade and pin required' });
    }

    // Verify parentId in body matches token
    if (parentId !== req.auth.parentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: child, error: childErr } = await supabase
      .from('children')
      .insert({
        parent_id: parentId, name, age, grade,
        gender: gender || null,
        city: city || null, school: school || null, pin,
        school_year_start_month: schoolYearStartMonth || null,
        school_year_end_date: schoolYearEndDate || null,
        about_me_completed: false
      })
      .select('id, name')
      .single();

    if (childErr) return res.status(500).json({ error: 'Failed to create child profile' });

    await supabase.from('child_preferences').insert({ child_id: child.id });
    await supabase.from('child_profile').insert({ child_id: child.id });

    return res.json({ success: true, childId: child.id, childName: child.name });
  } catch (err) {
    console.error('child create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/child/:childId/preferences — parent updates sensitivity settings
app.put('/api/child/:childId/preferences', requireParent, async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify parent owns this child
    const { data: child } = await supabase
      .from('children')
      .select('parent_id')
      .eq('id', childId)
      .single();

    if (!child || child.parent_id !== req.auth.parentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

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

// DELETE /api/child/:childId/delete — COPPA right to deletion
app.delete('/api/child/:childId/delete', requireParent, async (req, res) => {
  // Verify parent owns this child before deleting
  const { childId } = req.params;
  const { data: child } = await supabase
    .from('children')
    .select('parent_id')
    .eq('id', childId)
    .single();

  if (!child || child.parent_id !== req.auth.parentId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  return deleteChild(req, res, supabase);
});

// ═════════════════════════════════════════════════════════════════════════════
// PROTECTED CHILD ENDPOINTS (require valid child JWT)
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/child/about-me
app.post('/api/child/about-me', requireChild, async (req, res) => {
  try {
    const {
      childId, favouriteSport, favouriteSubject, favouriteAnimal,
      favouriteMusic, careerAspiration, favouriteBookOrMovie, freeText
    } = req.body;

    if (!childId || childId !== req.auth.childId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const hobbies = [
      favouriteSport, favouriteSubject, favouriteAnimal,
      favouriteMusic, careerAspiration
    ].filter(Boolean);

    await supabase
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

    if (hobbies.length > 0) {
      const interestRows = hobbies.map(interest => ({
        child_id: childId, interest, source: 'about_me', parent_approved: true
      }));
      await supabase.from('child_interests').insert(interestRows);
    }

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
app.get('/api/child/:childId/profile', requireChild, async (req, res) => {
  try {
    const { childId } = req.params;

    if (childId !== req.auth.childId) {
      return res.status(403).json({ error: 'Access denied' });
    }

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

// ═════════════════════════════════════════════════════════════════════════════
// AI ENDPOINTS (rate limited + auth required)
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/about-me/response — Accio's playful response to About Me answers
app.post('/api/about-me/response', requireChild, aiLimiter, aboutMePlayfulResponse);

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/admin/generate-code
app.post('/api/admin/generate-code', adminLimiter, async (req, res) => {
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
