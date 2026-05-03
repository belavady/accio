// ── ABOUT ME PLAYFUL RESPONSE ─────────────────────────────────────────────────
// POST /api/about-me/response
// Calls Claude to generate Accio's playful response to a child's About Me answer.
// Body: { question, answer, childName, age }

const aboutMePlayfulResponse = async (req, res) => {
  try {
    const { question, answer, childName, age } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'question and answer required' });

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      system: `You are Accio, a warm, playful, enthusiastic AI learning companion for children aged 8-16. 
You are responding to a child's answer during their first setup. Your response must be:
- Maximum 1-2 sentences, very short
- Warm, encouraging, never judgemental
- Playful and fun with 1 relevant emoji
- Age appropriate for a ${age || 12} year old
- Reference their specific answer when possible
- If they say "I don't know" or similar, respond positively about keeping options open
- Never ask follow up questions - just react warmly
- Examples of tone: "That's SO cool!", "Brilliant choice!", "I love that!", "Amazing taste!"`,
      messages: [{
        role: 'user',
        content: `The child's name is ${childName || 'there'}. They were asked: "${question}" and answered: "${answer}". Give your playful reaction.`
      }]
    });

    const text = response.content[0]?.text || "Love it! You're amazing! ✨";
    return res.json({ response: text });

  } catch (err) {
    console.error('about-me response error:', err);
    // Fallback responses if API fails
    const fallbacks = [
      "Love that answer! You're incredible! ✨",
      "Amazing! I knew we'd get along great! 🌟",
      "Fantastic choice! I'm so glad you told me! 🎉",
      "That's brilliant! Can't wait to learn together! 🚀",
      "Wow, great taste! We're going to have so much fun! ⭐"
    ];
    const random = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return res.json({ response: random });
  }
};

module.exports = { aboutMePlayfulResponse };
