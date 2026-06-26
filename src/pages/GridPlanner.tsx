import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const TILES = [
  { type: 'Reel', bg: 'linear-gradient(150deg,#F0D9C2,#E3B98F)' },
  { type: 'Quote', quote: '"Your skin hears everything you tell it."', solid: '#7C9E8A', color: '#fff' },
  { type: 'Carousel', bg: 'linear-gradient(150deg,#EFE7DA,#D9C5A8)' },
  { type: 'Post', bg: 'linear-gradient(150deg,#E8CBB4,#CDA17E)' },
  { type: 'Reel', bg: 'linear-gradient(150deg,#F4EEE5,#E6D7C2)' },
  { type: 'Quote', quote: 'Sunday reset ritual', solid: '#8B1F2F', color: '#fff' },
  { type: 'Carousel', bg: 'linear-gradient(150deg,#E2BE9A,#C99B73)' },
  { type: 'Post', bg: 'linear-gradient(150deg,#EFE7DA,#DCC9AE)' },
  { type: 'Reel', bg: 'linear-gradient(150deg,#E9D2BC,#D2AE89)' },
];

export function GridPlanner() {
  const [handle, setHandle] = useState('glowandgrace');
  const [bio, setBio] = useState('Skincare \u00b7 Wellness \u00b7 Self-care rituals');
  const [posts, setPosts] = useState('248');
  const [followers, setFollowers] = useState('14.2k');
  const [following, setFollowing] = useState('312');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [note, setNote] = useState('Hi! Here\u2019s your content plan for the month \u2014 take a look and let me know what you love \ud83e\udd0e');
  const [images, setImages] = useState<(string | null)[]>(Array(9).fill(null));
  const avaRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLInputElement>(null);

  const onAva = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) setAvatar(URL.createObjectURL(f));
  };
  const onGrid = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => {
      const next = [...prev]; let fi = 0;
      for (let i = 0; i < next.length && fi < files.length; i++) { next[i] = URL.createObjectURL(files[fi]); fi++; }
      return next;
    });
  };

  const cream = '#FAF8F4', gold = '#C9A96E', ink = '#1A1612', border = '#E8E3DC', muted = '#8C8479';

  return (
    <div style={{ minHeight: '100vh', background: cream, padding: '28px 18px 70px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" style={{ color: gold }} fill={gold} />
            <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 400, color: '#c8a84b', fontSize: '24px' }}>Content</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#1a1a18', fontSize: '24px' }}>Charm</span>
          </Link>
          <div style={{ fontSize: '12px', color: muted }}>Free Instagram grid planner</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px', alignItems: 'start' }} className="grid-layout">
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: gold, fontWeight: 600, marginBottom: '8px' }}>Plan your client's feed</div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '27px', lineHeight: 1.12, fontWeight: 400, marginBottom: '18px', color: ink }}>Build it. Send them the link.</h1>

            <div style={{ background: '#fff', border: '1px solid #dbdbdb', borderRadius: '10px', overflow: 'hidden', color: '#262626' }}>
              <div style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="prof-row">
                  <div style={{ position: 'relative', flex: 'none' }}>
                    <div onClick={() => avaRef.current?.click()} style={{ width: '84px', height: '84px', borderRadius: '50%', cursor: 'pointer', background: avatar ? `url(${avatar}) center/cover` : 'linear-gradient(135deg,#E8C9A0,#C9A96E)', border: '1px solid #dbdbdb' }} />
                    <div onClick={() => avaRef.current?.click()} style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '26px', height: '26px', borderRadius: '50%', background: gold, border: '2px solid #fff', color: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#9998;</div>
                    <input ref={avaRef} type="file" accept="image/*" onChange={onAva} style={{ display: 'none' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <input value={handle} onChange={e => setHandle(e.target.value)} style={{ fontSize: '19px', border: 'none', borderBottom: '1.5px dashed ' + border, outline: 'none', background: 'transparent', color: '#262626', minWidth: '80px', maxWidth: '160px' }} />
                      <button style={{ background: '#efefef', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '13px', fontWeight: 600 }}>Following</button>
                    </div>
                    <div style={{ display: 'flex', gap: '28px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '14px', textAlign: 'center' }}><input value={posts} onChange={e => setPosts(e.target.value)} style={{ width: '46px', fontWeight: 700, border: 'none', borderBottom: '1.5px dashed ' + border, outline: 'none', textAlign: 'center', background: 'transparent' }} /><div>posts</div></div>
                      <div style={{ fontSize: '14px', textAlign: 'center' }}><input value={followers} onChange={e => setFollowers(e.target.value)} style={{ width: '54px', fontWeight: 700, border: 'none', borderBottom: '1.5px dashed ' + border, outline: 'none', textAlign: 'center', background: 'transparent' }} /><div>followers</div></div>
                      <div style={{ fontSize: '14px', textAlign: 'center' }}><input value={following} onChange={e => setFollowing(e.target.value)} style={{ width: '46px', fontWeight: 700, border: 'none', borderBottom: '1.5px dashed ' + border, outline: 'none', textAlign: 'center', background: 'transparent' }} /><div>following</div></div>
                    </div>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} style={{ width: '100%', fontSize: '14px', border: 'none', borderBottom: '1.5px dashed ' + border, outline: 'none', resize: 'none', background: 'transparent', fontFamily: 'DM Sans' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', borderTop: '1px solid #dbdbdb' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', fontSize: '11px', letterSpacing: '.08em', fontWeight: 600, borderTop: '1px solid #262626', marginTop: '-1px' }}>&#9638; POSTS</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', fontSize: '11px', letterSpacing: '.08em', fontWeight: 600, color: '#8e8e8e' }}>&#8862; REELS</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', fontSize: '11px', letterSpacing: '.08em', fontWeight: 600, color: '#8e8e8e' }}>&#9825; TAGGED</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '3px', padding: '3px' }}>
                {TILES.map((t, i) => (
                  <div key={i} onClick={() => gridRef.current?.click()} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', cursor: 'pointer', background: images[i] ? `url(${images[i]}) center/cover` : (t.solid || t.bg), display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '10px' }}>
                    {!images[i] && t.quote && <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '12px', lineHeight: 1.25, color: t.color }}>{t.quote}</span>}
                    <span style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: '9px', padding: '1px 5px', borderRadius: '10px' }}>{t.type}</span>
                  </div>
                ))}
              </div>
            </div>
            <input ref={gridRef} type="file" accept="image/*" multiple onChange={onGrid} style={{ display: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#fff', border: '1px solid ' + border, borderRadius: '15px', padding: '17px' }}>
              <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '16px', fontWeight: 400, marginBottom: '5px', color: ink }}>Note to your client</h3>
              <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={200} rows={4} placeholder="Add a friendly note they'll see at the top..." style={{ width: '100%', fontSize: '13px', border: '1px solid ' + border, borderRadius: '10px', padding: '10px', outline: 'none', resize: 'none', fontFamily: 'DM Sans', color: ink }} />
              <div style={{ fontSize: '11px', color: muted, textAlign: 'right', marginTop: '4px' }}>{note.length}/200</div>
            </div>

            <div style={{ background: 'linear-gradient(160deg,#fff,#FAF5EC)', border: '1px solid ' + border, borderRadius: '15px', padding: '17px' }}>
              <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '16px', fontWeight: 400, marginBottom: '5px', color: ink }}>Ready to send?</h3>
              <p style={{ fontSize: '12.5px', color: muted, lineHeight: 1.45 }}>Save your grid and get a link your client can view.</p>
              <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '10px', background: gold, color: '#fff', fontFamily: 'DM Sans' }}>&#128156; Save &amp; send to client</button>
              <button onClick={() => gridRef.current?.click()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 600, border: '1px solid ' + border, cursor: 'pointer', marginTop: '10px', background: '#fff', color: ink, fontFamily: 'DM Sans' }}>&#11014; Upload grid photos</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:860px){.grid-layout{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}
