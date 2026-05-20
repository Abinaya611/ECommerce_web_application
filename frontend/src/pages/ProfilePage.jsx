import { useState, useEffect } from 'react';
import api from '../api'; // ← use your existing api instance, not raw axios

export default function ProfilePage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // api instance already attaches access_token automatically
    api.get('/profile/')
      .then(res => {
        setForm({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          email: res.data.email || '',
          password: ''
        });
        setLoading(false);
      })
      .catch(() => {
        setMessage('❌ Failed to load profile. Are you logged in?');
        setLoading(false);
      });
  }, []);

  const handleUpdate = async () => {
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
      };
      // Only send password if user typed something
      if (form.password) payload.password = form.password;

      await api.put('/profile/', payload);
      setMessage('✅ Profile updated successfully!');
    } catch {
      setMessage('❌ Update failed. Please try again.');
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading profile...</p>;

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto', padding: '2rem',
      border: '1px solid #e5e7eb', borderRadius: '12px', fontFamily: 'sans-serif' }}>
      
      <h2 style={{ marginBottom: '1.5rem', fontSize: '22px', fontWeight: '700' }}>
        👤 My Profile
      </h2>

      {message && (
        <div style={{
          padding: '12px', borderRadius: '8px', marginBottom: '1rem',
          background: message.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
          color: message.startsWith('✅') ? '#166534' : '#991b1b',
          border: `1px solid ${message.startsWith('✅') ? '#86efac' : '#fca5a5'}`
        }}>
          {message}
        </div>
      )}

      <label style={labelStyle}>First Name</label>
      <input style={inputStyle}
        value={form.first_name}
        onChange={e => setForm({ ...form, first_name: e.target.value })}
        placeholder="First name" />

      <label style={labelStyle}>Last Name</label>
      <input style={inputStyle}
        value={form.last_name}
        onChange={e => setForm({ ...form, last_name: e.target.value })}
        placeholder="Last name" />

      <label style={labelStyle}>Email</label>
      <input style={inputStyle} type="email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        placeholder="Email" />

      <label style={labelStyle}>New Password <span style={{ color: '#9ca3af', fontWeight: 400 }}>(leave blank to keep current)</span></label>
      <input style={inputStyle} type="password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        placeholder="New password (optional)" />

      <button onClick={handleUpdate} style={btnStyle}>
        Save Changes
      </button>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600',
  color: '#374151', marginBottom: '4px', marginTop: '1rem' };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
  borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
const btnStyle = { marginTop: '1.5rem', width: '100%', padding: '11px',
  background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px',
  fontSize: '15px', fontWeight: '600', cursor: 'pointer' };