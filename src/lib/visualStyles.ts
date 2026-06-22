// Visual Style Library for AI Content Studio
// Update monthly with trending aesthetics

export interface VisualStyle {
  id: string;
  name: string;
  description: string;
  emoji: string;
  prompt: string;
  bestFor: string[];
}

export const VISUAL_STYLES: VisualStyle[] = [
  {
    id: 'clean-minimal',
    name: 'Clean & Minimal',
    description: 'White backgrounds, natural light, editorial feel',
    emoji: '🤍',
    prompt: 'Clean minimal aesthetic, pure white or cream background, soft natural lighting, editorial photography style, negative space, similar to Glossier or Aesop brand photography, high-end and sophisticated',
    bestFor: ['Beauty', 'Wellness', 'Lifestyle', 'Healthcare'],
  },
  {
    id: 'dark-moody',
    name: 'Dark & Moody',
    description: 'Rich dark tones, dramatic lighting, luxury feel',
    emoji: '🖤',
    prompt: 'Dark moody aesthetic, deep rich tones, dramatic chiaroscuro lighting, luxury editorial feel, dark backgrounds with warm accent lighting, similar to high-end fashion photography',
    bestFor: ['Luxury', 'Fashion', 'Food', 'Real Estate'],
  },
  {
    id: 'bright-airy',
    name: 'Bright & Airy',
    description: 'Light, fresh, pastel tones, summer vibes',
    emoji: '☀️',
    prompt: 'Bright airy aesthetic, light and fresh, soft pastel tones, overexposed natural light, airy and open feel, similar to lifestyle influencer photography, happy and optimistic mood',
    bestFor: ['Wellness', 'Food', 'Travel', 'Fitness'],
  },
  {
    id: 'bold-vibrant',
    name: 'Bold & Vibrant',
    description: 'High saturation, strong colors, energetic feel',
    emoji: '🎨',
    prompt: 'Bold vibrant aesthetic, high color saturation, strong graphic elements, energetic and dynamic composition, eye-catching colors, similar to Glossier Gen-Z or Oatly brand visuals',
    bestFor: ['Fitness', 'Food', 'Retail', 'Entertainment'],
  },
  {
    id: 'soft-organic',
    name: 'Soft & Organic',
    description: 'Earth tones, natural textures, warm and grounded',
    emoji: '🌿',
    prompt: 'Soft organic aesthetic, warm earth tones, natural textures like linen and wood, warm golden hour lighting, grounded and natural feel, similar to wellness and sustainable brand photography',
    bestFor: ['Wellness', 'Healthcare', 'Food', 'Home'],
  },
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean, corporate, trustworthy and polished',
    emoji: '💼',
    prompt: 'Modern professional aesthetic, clean and polished composition, neutral tones with brand color accents, trustworthy and authoritative feel, similar to LinkedIn thought leadership visuals or McKinsey brand photography',
    bestFor: ['Professional Services', 'Real Estate', 'Healthcare', 'Education'],
  },
  {
    id: 'aesthetic-film',
    name: 'Film & Vintage',
    description: 'Film grain, warm tones, nostalgic and authentic',
    emoji: '📷',
    prompt: 'Film photography aesthetic, subtle grain texture, warm faded tones, authentic and nostalgic mood, slightly desaturated with warm highlights, similar to vintage film photography or VSCO aesthetic',
    bestFor: ['Food', 'Lifestyle', 'Fashion', 'Travel'],
  },
  {
    id: 'luxury-editorial',
    name: 'Luxury Editorial',
    description: 'High fashion, aspirational, magazine quality',
    emoji: '✨',
    prompt: 'Luxury editorial aesthetic, high fashion photography quality, aspirational and sophisticated, perfect lighting and composition, similar to Vogue or Harper Bazaar editorial spreads, premium and exclusive feel',
    bestFor: ['Beauty', 'Fashion', 'Real Estate', 'Luxury'],
  },
  {
    id: 'ugc-authentic',
    name: 'UGC & Authentic',
    description: 'Real, raw, phone camera feel, relatable',
    emoji: '📱',
    prompt: 'UGC authentic aesthetic, real and unfiltered feel, phone camera quality, candid and genuine moments, relatable and approachable, similar to user-generated content or authentic lifestyle photography, no over-production',
    bestFor: ['Retail', 'Food', 'Fitness', 'Lifestyle'],
  },
  {
    id: 'bold-typography',
    name: 'Bold Typography',
    description: 'Text-forward, graphic design style, statement making',
    emoji: '🔤',
    prompt: 'Bold typography-forward design, strong graphic elements, text as the hero, high contrast backgrounds, statement-making composition, similar to modern graphic design or NYT magazine covers',
    bestFor: ['All industries'],
  },
];
