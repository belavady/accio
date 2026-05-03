// ── ADD THESE ROUTES TO server.js ────────────────────────────────────────────
// Also add this to the children table in Supabase:
// ALTER TABLE children ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT FALSE;
// ALTER TABLE children ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ;
// ALTER TABLE parents ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ;

// POST /api/parent/record-consent
// Records timestamp of informed consent during parent setup.
// Body: { parentId, childId }
const recordConsent = async (req, res, supabase) => {
  try {
    const { parentId, childId } = req.body;
    const now = new Date().toISOString();

    if (parentId) {
      await supabase
        .from('parents')
        .update({ consent_timestamp: now })
        .eq('id', parentId);
    }

    if (childId) {
      await supabase
        .from('children')
        .update({ consent_given: true, consent_timestamp: now })
        .eq('id', childId);
    }

    return res.json({ success: true, timestamp: now });
  } catch (err) {
    console.error('record-consent error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/child/:childId/delete
// Deletes all child data — COPPA right to deletion.
// Body: { parentId } — must match child's parent
const deleteChild = async (req, res, supabase) => {
  try {
    const { childId } = req.params;
    const { parentId } = req.body;

    // Verify this child belongs to this parent
    const { data: child, error: childErr } = await supabase
      .from('children')
      .select('id, parent_id, name')
      .eq('id', childId)
      .eq('parent_id', parentId)
      .single();

    if (childErr || !child) {
      return res.status(403).json({ error: 'Unauthorised' });
    }

    // Delete all child data in order (FK constraints)
    const tables = [
      'flags',
      'daily_summaries',
      'weekly_summaries',
      'session_questions',
      'sessions',
      'topic_progress',
      'pre_generation_queue',
      'jarvis_sessions',
      'jarvis_memory',
      'current_affairs_reads',
      'music_versions',
      'music_compositions',
      'child_interests',
      'child_profile',
      'child_preferences',
      'children'
    ];

    for (const table of tables) {
      const col = table === 'children' ? 'id' : 'child_id';
      const { error } = await supabase.from(table).delete().eq(col, childId);
      if (error) console.warn(`Delete from ${table}:`, error.message);
    }

    console.log(`Child ${child.name} (${childId}) deleted by parent ${parentId}`);
    return res.json({ success: true, message: `All data for ${child.name} has been deleted.` });

  } catch (err) {
    console.error('delete child error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { recordConsent, deleteChild };
