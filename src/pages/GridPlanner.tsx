import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function GridPlanner() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', padding: '28px 18px 70px' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#C9A96E]" fill="#C9A96E" />
            <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 400, color: '#c8a84b', fontSize: '24px' }}>Content</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'normal', fontWeight: 700, color: '#1a1a18', fontSize: '24px' }}>Charm</span>
          </Link>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#8C8479' }}>
          <p>Grid Planner scaffold working.</p>
        </div>
      </div>
    </div>
  );
}
