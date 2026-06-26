import { useParams } from 'react-router-dom';

export function GridShareView() {
  const { token } = useParams();
  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C8479' }}>
      <p>Client grid view — scaffold ({token})</p>
    </div>
  );
}
