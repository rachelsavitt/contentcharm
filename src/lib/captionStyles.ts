export interface CaptionStyle {
  id: string;
  name: string;
  emoji: string;
  description: string;
  voiceSpec: string;
}

export const CAPTION_STYLES: CaptionStyle[] = [
  {
    id: 'casual-bff',
    name: 'Casual BFF',
    emoji: '☕',
    description: 'Like texting your best friend. Warm, real, unpolished.',
    voiceSpec: `Write like you're talking to your best friend over coffee. Open mid-thought, no "hey guys." Conversational, a little messy, deeply human. Short punchy lines. No corporate polish. Use "you" and "i" naturally. It should feel like a real person typed it on their phone, not a brand. Permission to be vulnerable, funny, or random. Never salesy.`,
  },
  {
    id: 'punchy-bold',
    name: 'Punchy & Bold',
    emoji: '⚡',
    description: 'Short, confident, scroll-stopping. Every line hits.',
    voiceSpec: `Write with bold confidence. Very short lines, lots of white space. Each sentence is a punch. Strong declarative statements. No hedging, no "maybe" or "kind of." Start with a hook that stops the scroll cold. Think high-energy founder voice. Make people feel something in the first 3 words.`,
  },
  {
    id: 'warm-storyteller',
    name: 'Warm Storyteller',
    emoji: '📖',
    description: 'Narrative cold-open that pulls you in to an emotional payoff.',
    voiceSpec: `Open with a story cold-open — drop the reader into a moment ("I almost lost a client because..."). Build a little tension, then deliver an emotional or insightful payoff that ties back to the brand. Warm, human, specific. Use sensory detail. The lesson should feel earned, not preachy.`,
  },
  {
    id: 'authority',
    name: 'Authority',
    emoji: '🎓',
    description: "Educational, save-worthy insights worth bookmarking.",
    voiceSpec: `Write as a trusted expert dropping genuine value. Open with a knowledge gap ("Most people get this wrong:"). Deliver a clear, specific, actionable insight the reader will want to SAVE. Structured and skimmable. Confident but not arrogant. The kind of post that makes someone hit bookmark and follow for more.`,
  },
  {
    id: 'contrarian',
    name: 'Contrarian Hot-Take',
    emoji: '🔥',
    description: 'Challenges conventional wisdom. Sparks comments.',
    voiceSpec: `Open with a contrarian hook ("Unpopular opinion:" or "Everyone tells you X. They're wrong."). Take a clear, defensible stance that challenges what the audience assumes. Back it up with a sharp point. Designed to spark debate and comments — but stay credible and on-brand, never just edgy for its own sake.`,
  },
  {
    id: 'hype-launch',
    name: 'Hype / Launch',
    emoji: '🚀',
    description: 'High-energy urgency for promos, drops, and announcements.',
    voiceSpec: `Write with infectious energy for a launch or promo. Build excitement and urgency without sounding desperate or spammy. Clear value, clear reason to act now. Use momentum and anticipation. Make the reader feel they'd miss out by scrolling past.`,
  },
];
