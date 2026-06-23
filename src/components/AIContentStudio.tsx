import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { VISUAL_STYLES, VisualStyle } from '../lib/visualStyles';
import { CalendarDatePicker } from './CalendarDatePicker';
import { X, Sparkles, Loader2, Plus, Check, Image, Upload } from 'lucide-react';

interface GeneratedPost {
  title: string;
  caption: string;
  postType: string;
  imageConcepte: string;
  platform: string;
  imageUrl?: string;
  generatingImage?: boolean;
}

interface AIContentStudioProps {
  calendarId: string;
  calendarTitle: string;
  clientName: string;
  clientNotes?: string;
  clientDNA?: any;
  platforms: string[];
  primaryColor: string;
  onClose: () => void;
  onPostsAdded: () => void;
}

export function AIContentStudio({
  calendarId,
  calendarTitle,
  clientName,
  clientNotes,
  clientDNA,
  platforms,
  primaryColor,
  onClose,
  onPostsAdded,
}: AIContentStudioProps) {
  const [step, setStep] = useState<'url' | 'setup' | 'generating' | 'review'>(clientDNA ? 'setup' : 'url');
  const [industry, setIndustry] = useState(clientDNA?.industry || '');
  const [tone, setTone] = useState(clientDNA?.toneOfVoice || 'professional yet approachable');
  const [postCount, setPostCount] = useState('12');
  const [additionalContext, setAdditionalContext] = useState(clientDNA ? [clientDNA.brandSummary, clientDNA.targetAudience ? 'Target audience: ' + clientDNA.targetAudience : '', clientDNA.messagingThemes?.length ? 'Themes: ' + clientDNA.messagingThemes.join(', ') : '', clientDNA.keyServices?.length ? 'Services: ' + clientDNA.keyServices.join(', ') : '', clientDNA.vocabularyToUse?.length ? 'Use words like: ' + clientDNA.vocabularyToUse.join(', ') : '', clientDNA.vocabularyToAvoid?.length ? 'Avoid words like: ' + clientDNA.vocabularyToAvoid.join(', ') : ''].filter(Boolean).join('. ') : '');
  const [clientUrl, setClientUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [brandDNA, setBrandDNA] = useState<any>(clientDNA || null);
  const [scrapeError, setScrapeError] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>(VISUAL_STYLES[0]);
  const [uploadingRef, setUploadingRef] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingRef(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `reference/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('post-images').upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path);
        urls.push(publicUrl);
      }
      setReferenceImages(prev => [...prev, ...urls]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploadingRef(false);
    }
  };

  const handleGenerateImageAuto = async (posts: any[], index: number) => {
    setGeneratedPosts(prev => prev.map((p, i) => i === index ? { ...p, generatingImage: true } : p));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const post = posts[index];
      const response = await fetch('https://bvgkrotyvoungxmfvdnj.supabase.co/functions/v1/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          prompt: `Professional social media image for ${clientName}. Visual aesthetic: ${selectedStyle.prompt}. Brand tone: ${tone}. Image concept: ${post.imageConcept}. Platform: ${post.platform}. Make it scroll-stopping and on-trend. ${brandDNA ? `Brand context: ${brandDNA.brandSummary || ''}. Themes: ${(brandDNA.messagingThemes || []).join(', ')}.` : ''}`,
        }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedPosts(prev => prev.map((p, i) => i === index ? { ...p, imageUrl: data.imageUrl, generatingImage: false } : p));
      } else {
        setGeneratedPosts(prev => prev.map((p, i) => i === index ? { ...p, generatingImage: false } : p));
      }
    } catch (err) {
      setGeneratedPosts(prev => prev.map((p, i) => i === index ? { ...p, generatingImage: false } : p));
    }
  };

  const handleGenerateImage = async (index: number) => {
    const post = generatedPosts[index];
    setGeneratedPosts(prev => prev.map((p, i) => i === index ? { ...p, generatingImage: true } : p));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('https://bvgkrotyvoungxmfvdnj.supabase.co/functions/v1/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          prompt: `Professional social media image for ${clientName}, a ${industry} brand. Visual aesthetic: ${selectedStyle.prompt}. Brand tone: ${tone}. Image concept: ${post.imageConcept}. Platform: ${post.platform}. Make it scroll-stopping and on-trend. ${brandDNA ? `Brand context: ${brandDNA.brandSummary || ''}. Themes: ${(brandDNA.messagingThemes || []).join(', ')}.` : ''}`,
          referenceImages,
        }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedPosts(prev => prev.map((p, i) => i === index ? { ...p, imageUrl: data.imageUrl, generatingImage: false } : p));
      } else {
        throw new Error('No image returned');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setGeneratedPosts(prev => prev.map((p, i) => i === index ? { ...p, generatingImage: false } : p));
    }
  };

  const handleScrapeURL = async () => {
    if (!clientUrl.trim()) { setScrapeError('Please paste a website URL'); return; }
    setScraping(true);
    setScrapeError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch('https://bvgkrotyvoungxmfvdnj.supabase.co/functions/v1/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ url: clientUrl }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setBrandDNA(data);
      if (data.industry) setIndustry(data.industry);
      if (data.toneOfVoice) setTone(data.toneOfVoice);
      const ctxBits = [];
      if (data.brandSummary) ctxBits.push(data.brandSummary);
      if (data.targetAudience) ctxBits.push('Target audience: ' + data.targetAudience);
      if (data.messagingThemes?.length) ctxBits.push('Themes: ' + data.messagingThemes.join(', '));
      if (data.keyServices?.length) ctxBits.push('Services: ' + data.keyServices.join(', '));
      if (data.vocabularyToUse?.length) ctxBits.push('Use words like: ' + data.vocabularyToUse.join(', '));
      if (data.vocabularyToAvoid?.length) ctxBits.push('Avoid words like: ' + data.vocabularyToAvoid.join(', '));
      setAdditionalContext(ctxBits.join('. '));
      setStep('setup');
    } catch (err: any) {
      setScrapeError('Could not read that site. Try another URL or set up manually.');
    } finally {
      setScraping(false);
    }
  };

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
${brandDNA ? `

BRAND DNA (follow this closely so every post sounds like this brand):
- Industry: ${brandDNA.industry || ''}
- Target audience: ${brandDNA.targetAudience || ''}
- Tone of voice: ${brandDNA.toneOfVoice || ''}
- Key services: ${(brandDNA.keyServices || []).join(', ')}
- Messaging themes: ${(brandDNA.messagingThemes || []).join(', ')}
- Vocabulary to USE: ${(brandDNA.vocabularyToUse || []).join(', ')}
- Vocabulary to AVOID: ${(brandDNA.vocabularyToAvoid || []).join(', ')}` : ''}

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
      // Auto-generate images for all posts
      posts.forEach((_: any, i: number) => {
        setTimeout(() => handleGenerateImageAuto(posts, i), i * 500);
      });
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
      const availableDates = selectedDates.length > 0 ? selectedDates : [];
      const postsToAdd = filteredPosts.map((post, idx) => {
        const scheduledDate = availableDates.length > 0 ? availableDates[idx % availableDates.length] : new Date().toISOString().split('T')[0];
        const day = parseInt(scheduledDate.split('-')[2]);
        return {
          calendar_id: calendarId,
          title: post.title,
          caption: post.caption,
          platform: post.platform,
          platforms: [post.platform],
          approval_status: 'pending',
          day_number: day,
          scheduled_date: scheduledDate,
          image_url: post.imageUrl || null,
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
                AI Content Studio
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

          {step === 'url' && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <h3 className="text-lg font-semibold text-[#1A1612] mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  Paste your client's website
                </h3>
                <p className="text-sm text-[#8C8479]">We'll study their brand and pre-fill everything for you.</p>
              </div>

              <div>
                <input
                  type="text"
                  value={clientUrl}
                  onChange={(e) => setClientUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleScrapeURL(); }}
                  placeholder="glowandgrace.com"
                  className="w-full px-4 py-3 border border-[#E8E3DC] rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]"
                />
                {scrapeError && <p className="text-red-500 text-xs mt-2">{scrapeError}</p>}
              </div>

              <button
                onClick={handleScrapeURL}
                disabled={scraping}
                className="w-full px-4 py-3 text-white rounded-lg transition text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: primaryColor }}
              >
                {scraping ? <><Loader2 className="w-4 h-4 animate-spin" /> Studying the brand...</> : <><Sparkles className="w-4 h-4" fill="white" /> Generate Brand Profile</>}
              </button>

              <div className="text-center">
                <button onClick={() => setStep('setup')} className="text-xs text-[#8C8479] hover:text-[#1A1612] underline">
                  or set up manually
                </button>
              </div>
            </div>
          )}

          {step === 'setup' && (
            <div className="space-y-5">
              {brandDNA && (
                <div className="rounded-xl p-4" style={{ backgroundColor: primaryColor + '0D', border: `1px solid ${primaryColor}33` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4" style={{ color: primaryColor }} fill={primaryColor} />
                    <span className="text-sm font-semibold text-[#1A1612]">We studied {brandDNA.businessName || clientName}</span>
                  </div>
                  {brandDNA.brandSummary && <p className="text-xs text-[#5C564E] mb-2">{brandDNA.brandSummary}</p>}
                  {brandDNA.messagingThemes?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {brandDNA.messagingThemes.map((t: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: primaryColor + '1A', color: primaryColor }}>{t}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[#8C8479] mt-2">Everything below is pre-filled — tweak anything, then generate.</p>
                </div>
              )}
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
                <label className="block text-sm font-medium text-[#1A1612] mb-2">Visual Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {VISUAL_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className="text-left px-3 py-2 rounded-lg text-sm border transition"
                      style={{
                        borderColor: selectedStyle.id === style.id ? primaryColor : '#E8E3DC',
                        backgroundColor: selectedStyle.id === style.id ? primaryColor + '10' : 'white',
                        color: selectedStyle.id === style.id ? primaryColor : '#1A1612',
                        fontWeight: selectedStyle.id === style.id ? 600 : 400,
                      }}
                    >
                      <span className="mr-1">{style.emoji}</span>{style.name}
                      <p className="text-xs mt-0.5 font-normal" style={{ color: selectedStyle.id === style.id ? primaryColor : '#8C8479' }}>{style.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1612] mb-2">Select posting dates</label>
                <div className="flex justify-center">
                  <CalendarDatePicker
                    selectedDates={selectedDates}
                    onDatesChange={setSelectedDates}
                    primaryColor={primaryColor}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1612] mb-2">
                  Brand reference images <span className="text-[#8C8479] font-normal">(optional — helps AI match brand style)</span>
                </label>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleReferenceUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingRef}
                  className="w-full px-3 py-3 border-2 border-dashed border-[#E8E3DC] rounded-lg text-sm text-[#8C8479] hover:border-[#C9A96E] transition flex items-center justify-center gap-2">
                  {uploadingRef ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingRef ? 'Uploading...' : 'Upload brand images (logo, existing content, product shots)'}
                </button>
                {referenceImages.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {referenceImages.map((url, i) => (
                      <img key={i} src={url} alt="Reference" className="w-12 h-12 object-cover rounded-lg border border-[#E8E3DC]" />
                    ))}
                  </div>
                )}
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
                Generating your content...
              </p>
              <p className="text-sm text-[#8C8479]">Writing captions + generating images — hang tight!</p>
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
                      <p className="text-xs text-[#8C8479] italic mb-3">📸 {post.imageConcept}</p>
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt="Generated" className="w-full h-40 object-cover rounded-lg" />
                      ) : (
                        <button onClick={() => handleGenerateImage(i)} disabled={post.generatingImage}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition"
                          style={{ borderColor: primaryColor + '40', color: primaryColor, backgroundColor: primaryColor + '08' }}>
                          {post.generatingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Image className="w-3 h-3" />}
                          {post.generatingImage ? 'Generating...' : 'Generate image'}
                        </button>
                      )}
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
                Generate {postCount} posts
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
