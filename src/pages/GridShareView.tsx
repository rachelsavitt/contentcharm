import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Tile { type: string; bg?: string; solid?: string; quote?: string; color?: string; }
interface Grid {
  client_handle: string;
  client_bio: string;
  stat_posts: string;
  stat_followers: string;
  stat_following: string;
  note_to_client: string;
  tiles: Tile[];
}

export function GridShareView() {
  const { token } = useParams();
  const [grid, setGrid] = useState<Grid | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('grids')
          .select('*')
          .eq('share_token', token)
          .maybeSingle();
        if (error || !data) { setNotFound(true); }
        else {
          setGrid(data as Grid);
          supabase.from('grids').update({ last_viewed_at: new Date().toISOString() }).eq('share_token', token).then(() => {});
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const cream = '#FAF8F4', gold = '#C9A96E', ink = '#1A1612', border = '#E8E3DC', muted = '#8C8479';

  if (loading) {
    return <div style={{ minHeight: '100vh', background: cream, display: 'flex', alignItems: 'center', justifyContent: 'center', color: muted, fontFamily: 'DM Sans, sans-serif' }}>Loading…</div>;
  }
  if (notFound || !grid) {
    return (
      <div style={{ minHeight: '100vh', background: cream, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: muted, fontFamily: 'DM Sans, sans-serif', textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤍</div>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', color: ink, marginBottom: '6px' }}>This grid isn't available</h2>
        <p>The link may have expired or been removed.</p>
      </div>
    );
  }

  const tiles = Array.isArray(grid.tiles) ? grid.tiles : [];

  return (
    <div style={{ minHeight: '100vh', background: cream, padding: '32px 16px 50px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '.16em', textTransform: 'uppercase', color: gold, fontWeight: 600, marginBottom: '6px' }}>Your content plan</div>
        <p style={{ fontSize: '13px', color: muted, lineHeight: 1.5 }}>Here's the feed your social media manager planned for you. Take a look below.</p>
      </div>

      <div style={{ width: '390px', maxWidth: '100%', margin: '0 auto', background: '#1a1a1a', borderRadius: '44px', padding: '11px', boxShadow: '0 24px 70px rgba(26,22,18,.28)' }}>
        <div style={{ background: '#fff', borderRadius: '34px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '130px', height: '26px', background: '#1a1a1a', borderRadius: '0 0 16px 16px', zIndex: 5 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 22px 4px', fontSize: '12px', fontWeight: 600, color: '#262626' }}><span>9:41</span><span>🔋</span></div>

          <div style={{ background: 'linear-gradient(135deg,#FAF5EC,#fff)', borderBottom: '1px solid ' + border, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12px', color: muted }}>
            From your social media manager ·&nbsp;
            <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 400, color: '#c8a84b', fontSize: '14px' }}>Content</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#1a1a18', fontSize: '14px' }}>Charm</span>
          </div>

          {grid.note_to_client && (
            <div style={{ background: '#FAF5EC', padding: '14px 16px', borderBottom: '1px solid ' + border }}>
              <p style={{ fontSize: '13px', color: ink, lineHeight: 1.5, fontStyle: 'italic' }}>{grid.note_to_client}</p>
            </div>
          )}

          <div style={{ padding: '14px 16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#E8C9A0,#C9A96E)', border: '1px solid ' + border, flex: 'none' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 400, marginBottom: '8px', color: '#262626' }}>{grid.client_handle}</div>
                <div style={{ display: 'flex', gap: '18px', fontSize: '13px', color: '#262626' }}>
                  <div style={{ textAlign: 'center' }}><b>{grid.stat_posts}</b><div style={{ fontSize: '11px' }}>posts</div></div>
                  <div style={{ textAlign: 'center' }}><b>{grid.stat_followers}</b><div style={{ fontSize: '11px' }}>followers</div></div>
                  <div style={{ textAlign: 'center' }}><b>{grid.stat_following}</b><div style={{ fontSize: '11px' }}>following</div></div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#262626', marginTop: '10px', whiteSpace: 'pre-line' }}>{grid.client_bio}</div>
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid ' + border }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: '11px', letterSpacing: '.08em', fontWeight: 600, borderTop: '1px solid #262626', marginTop: '-1px' }}>▦ POSTS</div>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: '11px', letterSpacing: '.08em', fontWeight: 600, color: '#8e8e8e' }}>⊞ REELS</div>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: '11px', letterSpacing: '.08em', fontWeight: 600, color: '#8e8e8e' }}>♡ TAGGED</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px', padding: '2px' }}>
            {tiles.map((t, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: t.solid || t.bg || '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '8px' }}>
                {t.quote && <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '11px', lineHeight: 1.2, color: t.color }}>{t.quote}</span>}
                <span style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: '8px', padding: '1px 5px', borderRadius: '10px' }}>{t.type}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '14px 16px', background: cream, borderTop: '1px solid ' + border, textAlign: 'center' }}>
            {!approved ? (
              <>
                <p style={{ fontSize: '12px', color: muted, marginBottom: '8px' }}>Like what you see? Let your manager know.</p>
                <button onClick={() => setApproved(true)} style={{ background: gold, color: '#fff', fontWeight: 600, fontSize: '13px', padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>👍 Looks great</button>
              </>
            ) : (
              <p style={{ fontSize: '13px', color: ink, fontWeight: 600 }}>🎉 Thanks! Your manager will be notified.</p>
            )}
          </div>

          <div style={{ textAlign: 'center', padding: '16px', fontSize: '11px', color: muted, borderTop: '1px solid ' + border, background: cream }}>
            Made with&nbsp;
            <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 400, color: '#c8a84b', fontSize: '13px' }}>Content</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#1a1a18', fontSize: '13px' }}>Charm</span>
            &nbsp;🤎
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '22px' }}>
        <a href="/instagram-grid" style={{ fontSize: '13px', color: gold, fontWeight: 600, textDecoration: 'none' }}>Plan your own client's feed — free →</a>
      </div>
    </div>
  );
}
