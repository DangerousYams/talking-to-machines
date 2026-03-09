import { useState, useEffect, useCallback } from 'react';

interface AccessCode {
  id: string;
  code: string;
  note: string | null;
  max_uses: number | null;
  times_used: number;
  expires_at: string | null;
  created_at: string;
}

export default function AccessCodesPanel() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [newCode, setNewCode] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newMaxUses, setNewMaxUses] = useState('');
  const [creating, setCreating] = useState(false);

  const adminPassword = typeof sessionStorage !== 'undefined'
    ? sessionStorage.getItem('admin_password') || ''
    : '';

  const headers = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    'x-admin-password': sessionStorage.getItem('admin_password') || '',
  });

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/access-codes', { headers: headers() });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCodes(data.codes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/access-codes', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          code: newCode || undefined,
          note: newNote || undefined,
          maxUses: newMaxUses ? parseInt(newMaxUses, 10) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      setCodes((prev) => [data.code, ...prev]);
      setNewCode('');
      setNewNote('');
      setNewMaxUses('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/admin/access-codes', {
        method: 'DELETE',
        headers: headers(),
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setCodes((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: '6px', border: '1px solid #374151',
    background: '#161830', color: '#fff', fontSize: '0.85rem', outline: 'none',
  };

  if (loading) {
    return <div style={{ color: '#6b7280', padding: '40px', textAlign: 'center' }}>Loading access codes...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Create form */}
      <div style={{
        background: '#1e2240', borderRadius: '12px', padding: '20px',
      }}>
        <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px' }}>
          Create Access Code
        </h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600 }}>Code (auto if empty)</label>
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="TEACH2024"
              style={{ ...inputStyle, width: 130 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600 }}>Note</label>
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="For reviewers"
              style={{ ...inputStyle, width: 160 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600 }}>Max uses</label>
            <input
              type="number"
              value={newMaxUses}
              onChange={(e) => setNewMaxUses(e.target.value)}
              placeholder="Unlimited"
              min={1}
              style={{ ...inputStyle, width: 90 }}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            style={{
              padding: '8px 20px', borderRadius: '6px', border: 'none',
              background: '#7B61FF', color: '#fff', fontSize: '0.85rem',
              fontWeight: 600, cursor: creating ? 'wait' : 'pointer',
              opacity: creating ? 0.6 : 1,
            }}
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '0.8rem',
        }}>
          {error}
        </div>
      )}

      {/* Codes table */}
      <div style={{ background: '#1e2240', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              {['Code', 'Note', 'Uses', 'Expires', 'Created', ''].map((h) => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left', color: '#9ca3af',
                  fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                  No access codes yet
                </td>
              </tr>
            ) : (
              codes.map((code) => (
                <tr key={code.id} style={{ borderBottom: '1px solid #374151' }}>
                  <td style={{ padding: '10px 14px', color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    {code.code}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#9ca3af' }}>
                    {code.note || '—'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#fff' }}>
                    {code.times_used}{code.max_uses !== null ? ` / ${code.max_uses}` : ' / ∞'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#9ca3af' }}>
                    {code.expires_at
                      ? new Date(code.expires_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>
                    {new Date(code.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 14px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleCopy(code.code)}
                      style={{
                        padding: '4px 10px', borderRadius: '4px', border: '1px solid #374151',
                        background: 'transparent', color: '#9ca3af', fontSize: '0.7rem',
                        cursor: 'pointer',
                      }}
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      style={{
                        padding: '4px 10px', borderRadius: '4px', border: '1px solid #f8717140',
                        background: 'transparent', color: '#f87171', fontSize: '0.7rem',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
