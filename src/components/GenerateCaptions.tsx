import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Sparkles, Loader2, Plus, Check } from 'lucide-react';

interface GeneratedPost {
  title: string;
  caption: string;
  postType: string;
  imageConcepte: string;
  platform: string;
}

interface GenerateCaptionsProps {
  calendarId: string;
  calendarTitle: string;
  clientName: string;
  clientNotes?: string;
  platforms: string[];
  primaryColor: string;
  onClose: () => void;
  onPostsAdded: () => void;
}

export function GenerateCaptions({
  calendarId,
  calendarTitle,
  clientName,
  clientNotes,
  platforms,
  primaryColor,
  onClose,
  onPostsAdded,
}: GenerateCaptionsProps) {
  const [step, setStep] = useState<'setup' | 'generating' | 'review'>('setup');
  const [industry, setIndustry] = useState('');
  const [tone, setTone] = useState('professional yet approachable');
  const [postCount, setPostCount] = useState('12');
  const [additionalContext, setAdditionalContext] = useState('');
  const [postingDays, setPostingDays] = useState(['Monday', 'Wednesday', 'Friday']);
  const now2 = new Date();
  const [targetMonth, setTargetMonth] = useState(now2.getFullYear() + '-' + String(now2.getMonth() + 1).padStart(2, '0'));
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  const [addingPosts, setAddingPosts] = useState(false);
  const [error, setError] = useState('');

  const toneOptions = [
    'professional yet approachable',
    'fun and playful',
    'educational and informative',
    'inspirational and motivating',
    'casual and conversational',
    'luxurious and premium',
  ];

  const industryOptions = [
    'Wellness & Fitness',
    'Healthcare & Medical',
    'Beauty & Skincare',
    'Food & Restaurant',
    'Real Estate',
    'Retail & E-commerce',
    'Professional Services',
    'Education',
    'Home & Lifestyle',
    'Other',
  ];

  const handleGenerate = async () => {
    if (!industry) {
      setError('Please select an industry');
      return;
    }

    setStep('generating');
    setError('');

    const systemPrompt = `You are an expert social media content creator for freelance social media managers. You create engaging, platform-optimized captions that drive real engagement. Always respond with valid JSON only — no markdown, no backticks, no explanation.`;

    const message = `Generate ${postCount} social media posts for the following client:

Client Name: ${clientName}
Industry: ${industry}
Platforms: ${platforms.join(', ')}
Calendar: ${calendarTitle}
Brand Voice/Tone: ${tone}
${clientNotes ? `Additional Brand Notes: ${clientNotes}` : ''}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

You MUST return EXACTLY ${postCount} post objects, no more, no less. Return a JSON array of ${postCount} post objects. Each object must have exactly these fields:
- title: short post title (5 words max)
- caption: full social media caption with hashtags (platform-appropriate length)
- postType: one of "Reel", "Carousel", "Static Image", "Story"
- imageConcept: one sentence describing the ideal image or visual for this post
- platform: the best platform for this post from: ${platforms.join(', ')}

Make captions engaging, authentic, and optimized for each platform. Include relevant hashtags. Vary the post types. Return ONLY the JSON array, nothing else.`;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: { message, systemPrompt },
      });

      if (fnError) throw fnError;

      const text = data.text;
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const posts = JSON.parse(cleaned);

      setGeneratedPosts(posts);
      setSelectedPosts(new Set(posts.map((_: any, i: number) => i)));
      setStep('review');
    } catch (err: any) {
      console.error('Generation error:', err);
      setError('Failed to generate captions. Please try again.');
      setStep('setup');
    }
  };

  const handleAddToCalendar = async () => {
    setAddingPosts(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const filteredPosts = generatedPosts.filter((_, i) => selectedPosts.has(i));
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const interval = Math.floor(daysInMonth / filteredPosts.length);
      const postsToAdd = filteredPosts.map((post, idx) => {
          const day = Math.min((idx + 1) * interval, daysInMonth);
          const scheduledDate = new Date(year, month, day).toISOString().split('T')[0];
          return {
            calendar_id: calendarId,
            title: post.title,
            caption: post.caption,
            platform: post.platform,
            platforms: [post.platform],
            approval_status: 'pending',
            day_number: day,
            scheduled_date: scheduledDate,
          };
        });

      const { error: insertError } = await supabase
        .from('calendar_posts')
        .insert(postsToAdd);

      if (insertError) throw insertError;

      onPostsAdded();
      onClose();
    } catch (err: any) {
      console.error('Add posts error:', err);
      setError('Failed to add posts: ' + (err.message || JSON.stringify(err)));
    } finally {
      setAddingPosts(false);
    }
  };

  const togglePost = (index: number) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPosts(newSelected);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E3DC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor + '20' }}>
              <Sparkles className="w-5 h-5" style={{ color: primaryColor }} fill={primaryColor} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1612]" style={{ fontFamily: 'DM Serif Display, serif' }}>
                Generate Captions
              </h2>
              <p className="text-xs text-[#8C8479]">AI-powered captions for {clientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8C8479] hover:text-[#1A1612] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {step === 'setup' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A1612] mb-2">Industry *</label>
                <div className="grid grid-cols-2 gap-2">
                  {industryOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setIndustry(opt)}
                      className="text-left px-3 py-2 rounded-lg text-sm border transition"
                      style={{
                        borderColor: industry === opt ? primaryColor : '#E8E3DC',
                        backgroundColor: industry === opt ? primaryColor + '10' : 'white',
                        color: industry === opt ? primaryColor : '#1A1612',
                        fontWeight: industry === opt ? 600 : 400,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1612] mb-2">Brand Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {toneOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setTone(opt)}
                      className="text-left px-3 py-2 rounded-lg text-sm border transition capitalize"
                      style={{
                        borderColor: tone === opt ? primaryColor : '#E8E3DC',
                        backgroundColor: tone === opt ? primaryColor + '10' : 'white',
                        color: tone === opt ? primaryColor : '#1A1612',
                        fontWeight: tone === opt ? 600 : 400,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1612] mb-2">Number of posts</label>
                <select
                  value={postCount}
                  onChange={(e) => setPostCount(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E3DC] rounded-lg text-sm"
                >
                  {['8', '12', '16', '20'].map(n => (
                    <option key={n} value={n}>{n} posts</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1612] mb-2">Which days to post?</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        if (postingDays.includes(day)) {
                          setPostingDays(postingDays.filter(d => d !== day));
                        } else {
                          setPostingDays([...postingDays, day]);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm border transition"
                      style={{
                        borderColor: postingDays.includes(day) ? primaryColor : '#E8E3DC',
                        backgroundColor: postingDays.includes(day) ? primaryColor + '10' : 'white',
                        color: postingDays.includes(day) ? primaryColor : '#1A1612',
                        fontWeight: postingDays.includes(day) ? 600 : 400,
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1612] mb-2">Which month?</label>
                <input
                  type="month"
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E3DC] rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1612] mb-2">Which days to post?</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        if (postingDays.includes(day)) {
                          setPostingDays(postingDays.filter(d => d !== day));
                        } else {
                          setPostingDays([...postingDays, day]);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm border transition"
                      style={{
                        borderColor: postingDays.includes(day) ? primaryColor : '#E8E3DC',
                        backgroundColor: postingDays.includes(day) ? primaryColor + '10' : 'white',
                        color: postingDays.includes(day) ? primaryColor : '#1A1612',
                        fontWeight: postingDays.includes(day) ? 600 : 400,
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1612] mb-2">
                  Anything else AI should know? <span className="text-[#8C8479] font-normal">(optional)</span>
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="e.g. They have a summer sale running, focus on their new product line, avoid mentioning competitors..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E8E3DC] rounded-lg text-sm resize-none focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor + '20' }}>
                <Sparkles className="w-8 h-8 animate-pulse" style={{ color: primaryColor }} fill={primaryColor} />
              </div>
              <p className="text-lg font-medium text-[#1A1612]" style={{ fontFamily: 'DM Serif Display, serif' }}>
                Generating captions...
              </p>
              <p className="text-sm text-[#8C8479]">This takes about 10-15 seconds</p>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#8C8479]">{selectedPosts.size} of {generatedPosts.length} posts selected</p>
                <button
                  onClick={() => {
                    if (selectedPosts.size === generatedPosts.length) {
                      setSelectedPosts(new Set());
                    } else {
                      setSelectedPosts(new Set(generatedPosts.map((_, i) => i)));
                    }
                  }}
                  className="text-xs text-[#C9A96E] font-medium"
                >
                  {selectedPosts.size === generatedPosts.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              {generatedPosts.map((post, i) => (
                <div
                  key={i}
                  onClick={() => togglePost(i)}
                  className="p-4 rounded-xl border cursor-pointer transition"
                  style={{
                    borderColor: selectedPosts.has(i) ? primaryColor : '#E8E3DC',
                    backgroundColor: selectedPosts.has(i) ? primaryColor + '08' : 'white',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: selectedPosts.has(i) ? primaryColor : 'white',
                        border: `2px solid ${selectedPosts.has(i) ? primaryColor : '#E8E3DC'}`,
                      }}
                    >
                      {selectedPosts.has(i) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-[#1A1612]">{post.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: primaryColor + '20', color: primaryColor }}>
                          {post.postType}
                        </span>
                        <span className="text-xs text-[#8C8479]">{post.platform}</span>
                      </div>
                      <p className="text-sm text-[#1A1612] leading-relaxed mb-2">{post.caption}</p>
                      <p className="text-xs text-[#8C8479] italic">📸 {post.imageConcept}</p>
                    </div>
                  </div>
                </div>
              ))}

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E8E3DC] flex gap-3">
          {step === 'setup' && (
            <>
              <button onClick={onClose} className="flex-1 px-4 py-2 border border-[#E8E3DC] text-[#1A1612] rounded-lg hover:bg-[#FAF8F4] transition text-sm">
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 px-4 py-2 text-white rounded-lg transition text-sm font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <Sparkles className="w-4 h-4" fill="white" />
                Generate {postCount} captions
              </button>
            </>
          )}

          {step === 'review' && (
            <>
              <button
                onClick={() => setStep('setup')}
                className="flex-1 px-4 py-2 border border-[#E8E3DC] text-[#1A1612] rounded-lg hover:bg-[#FAF8F4] transition text-sm"
              >
                Regenerate
              </button>
              <button
                onClick={handleAddToCalendar}
                disabled={addingPosts || selectedPosts.size === 0}
                className="flex-1 px-4 py-2 text-white rounded-lg transition text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {addingPosts ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Add {selectedPosts.size} posts to calendar</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
