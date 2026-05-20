import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Add product form
  
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', stock: '', image_url: '', category: '' });

  // Edit modal
  const [editProduct, setEditProduct] = useState(null); // null = closed, object = open

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [newImageFile, setNewImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  // ── Fetch data ──
  const fetchProducts = () => {
    api.get('/products/', { params: { no_page: true } })
      .then(r => setProducts(Array.isArray(r.data) ? r.data : r.data.results || []))
      .catch(() => setProducts([]));
  };

  const fetchOrders = () => {
    api.get('/admin/orders/')
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/products/', { params: { no_page: true } }).then(r => setProducts(Array.isArray(r.data) ? r.data : r.data.results || [])),
      api.get('/admin/orders/').then(r => setOrders(Array.isArray(r.data) ? r.data : [])),
      api.get('/categories/').then(r => setCategories(r.data)).catch(() => setCategories([]))
    ]).finally(() => setLoading(false));
      
  }, []);

  // ── Product actions ──
  const handleAdd = async () => {
    if (!newProduct.name || !newProduct.price) return alert('Name and price are required.');
    const payload = new FormData();
    payload.append('name', newProduct.name);
    payload.append('price', newProduct.price);
    payload.append('stock', newProduct.stock || 0);
    payload.append('description', newProduct.description || '');
    if (newProduct.category) payload.append('category', newProduct.category);
    if (newProduct.image_url) payload.append('image_url', newProduct.image_url);
    if (newImageFile) payload.append('image', newImageFile);
    await api.post('/admin/products/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setNewProduct({ name: '', price: '', description: '', stock: '', image_url: '', category: '' });
    setNewImageFile(null);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/admin/products/${id}/`);
    setProducts(products.filter(p => p.id !== id));
  };

  const handleEditSave = async () => {
    try {
      const payload = new FormData();
      payload.append('name', editProduct.name);
      payload.append('price', editProduct.price);
      payload.append('stock', editProduct.stock || 0);
      payload.append('description', editProduct.description || '');
      if (editProduct.category) payload.append('category', editProduct.category);
      if (editProduct.image_url) payload.append('image_url', editProduct.image_url);
      if (editImageFile) payload.append('image', editImageFile);
      
      const res = await api.put(`/admin/products/${editProduct.id}/`, payload, {
        headers: {}
      });
      console.log('SAVE RESPONSE:', res.data);
      setEditProduct(null);
      setEditImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error('Edit save error:', err.response?.data || err.message);
      alert('Error: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  // ── Order actions ──
  const handleStatusChange = async (orderId, newStatus) => {
    await api.patch(`/admin/orders/${orderId}/status/`, { status: newStatus });
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const statusColor = (s) => ({
    pending:   { background: '#fef9c3', color: '#854d0e' },
    confirmed: { background: '#dbeafe', color: '#1e40af' },
    shipped:   { background: '#ede9fe', color: '#5b21b6' },
    delivered: { background: '#dcfce7', color: '#166534' },
  }[s] || {});

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '1.5rem' }}>Admin Dashboard</h1>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
        {['products', 'orders'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: '600', fontSize: '15px', textTransform: 'capitalize',
            borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === tab ? '#2563eb' : '#6b7280', marginBottom: '-2px'
          }}>
            {tab} ({tab === 'products' ? products.length : orders.length})
          </button>
        ))}
      </div>

      {/* ══════════════ PRODUCTS TAB ══════════════ */}
      {activeTab === 'products' && (
        <>
          {/* Add product form */}
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>Add new product</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input placeholder="Name" value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                style={inputStyle} />
              <input placeholder="Price (₹)" type="number" value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                style={{ ...inputStyle, width: '120px' }} />
              <input placeholder="Stock" type="number" value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                style={{ ...inputStyle, width: '100px' }} />
              <input placeholder="Description" value={newProduct.description}
                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                style={{ ...inputStyle, width: '240px' }} />
          
              <input placeholder="Image URL" value={newProduct.image_url}
                onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                style={{ ...inputStyle, width: '200px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>or upload image:</span>
                <input type="file" accept="image/*"
                  onChange={e => setNewImageFile(e.target.files[0])}
                  style={{ fontSize: '13px' }} />
              </div>
              <select value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                style={inputStyle}>
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button onClick={handleAdd} style={primaryBtn}>Add product</button>
            </div>
          </div>

          {/* Products table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Stock</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={tdStyle}>#{p.id}</td>
                    <td style={tdStyle}>{p.name}</td>
                    <td style={tdStyle}>₹{p.price}</td>
                    <td style={tdStyle}>{p.stock ?? '—'}</td>
                    <td style={tdStyle}>{p.category_name || '—'}</td>
                    <td style={tdStyle}>
                      <button onClick={() => setEditProduct({ ...p })} style={editBtn}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} style={deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════════ ORDERS TAB ══════════════ */}
      {activeTab === 'orders' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={thStyle}>Order ID</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>#{o.id}</td>
                  <td style={tdStyle}>{o.user}</td>
                  <td style={tdStyle}>₹{o.total_price}</td>
                  <td style={tdStyle}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <select
                      value={o.status}
                      onChange={e => handleStatusChange(o.id, e.target.value)}
                      style={{ ...inputStyle, width: 'auto', padding: '5px 10px',
                        fontWeight: '600', ...statusColor(o.status) }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════ EDIT MODAL ══════════════ */}
      {editProduct && (
        <div style={modalOverlay}>
          
          <div style={modalBox} onClick={e => e.stopPropagation()}>
          
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Edit product</h2>
              <button onClick={() => { setEditProduct(null); setEditImageFile(null); }}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={labelStyle}>Name
                <input value={editProduct.name}
                  onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                  style={modalInput} />
              </label>
              <label style={labelStyle}>Price (₹)
                <input type="number" value={editProduct.price}
                  onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                  style={modalInput} />
              </label>
              <label style={labelStyle}>Stock
                <input type="number" value={editProduct.stock}
                  onChange={e => setEditProduct({ ...editProduct, stock: e.target.value })}
                  style={modalInput} />
              </label>
              <label style={labelStyle}>Description
                <textarea value={editProduct.description}
                  onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                  style={{ ...modalInput, height: '80px', resize: 'vertical' }} />
              </label>
              <label style={labelStyle}>Image URL
                <input value={editProduct.image_url || ''}
                  onChange={e => setEditProduct({ ...editProduct, image_url: e.target.value })}
                  style={modalInput} />
              </label>
              <label style={labelStyle}>Upload new image (replaces URL)
                <input type="file" accept="image/*"
                  onChange={e => setEditImageFile(e.target.files[0])}
                  style={{ marginTop: '4px', fontSize: '13px' }} />
                {editImageFile && <span style={{ fontSize: '12px', color: '#6b7280' }}>Selected: {editImageFile.name}</span>}
                {editProduct.image && !editImageFile && (
                  <img src={editProduct.image_display || editProduct.image} alt="current"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', marginTop: '6px' }} />
                )}
              </label>
              <label style={labelStyle}>Category
                <select value={editProduct.category || ''}
                  onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}
                  style={modalInput}>
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setEditProduct(null); setEditImageFile(null); }} style={cancelBtn}>Cancel</button>
              
              <button onClick={handleEditSave} style={primaryBtn}>Save changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ──
const inputStyle = { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '180px' };
const primaryBtn = { padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' };
const editBtn = { padding: '5px 12px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginRight: '8px' };
const deleteBtn = { padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' };
const cancelBtn = { padding: '9px 18px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '14px' };
const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' };
const tdStyle = { padding: '12px 16px', color: '#111827', verticalAlign: 'middle' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };

const modalBox = { background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' };
const modalInput = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#374151', display: 'flex', flexDirection: 'column' };