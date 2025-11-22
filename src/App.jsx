import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AuthAPI, StoresAPI, setToken, getToken } from './utils/api'
import './index.css'

function Header({ user, onLogout }) {
  return (
    <header className="bg-white/10 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-white font-semibold text-lg">StoreRate</Link>
        <nav className="flex items-center gap-4 text-sm text-blue-100">
          <Link to="/" className="hover:text-white">Home</Link>
          {user && <Link to="/profile" className="hover:text-white">Profile</Link>}
          {user?.role === 'owner' && <Link to="/owner" className="hover:text-white">Owner</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="hover:text-white">Admin</Link>}
          {!user ? (
            <>
              <Link to="/login" className="hover:text-white">Login</Link>
              <Link to="/register" className="hover:text-white">Register</Link>
            </>
          ) : (
            <button onClick={onLogout} className="px-3 py-1 rounded bg-blue-600 text-white">Logout</button>
          )}
        </nav>
      </div>
    </header>
  )
}

function ProtectedRoute({ children, user, roles }) {
  if (!user) return <Navigate to="/login" replace/>;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace/>;
  return children;
}

function RatingStars({ value }) {
  return (
    <div className="flex items-center">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-5 h-5 ${i <= value ? 'text-yellow-400' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.175 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

function StoreCard({ store }) {
  return (
    <Link to={`/stores/${store.id}`} className="block rounded-lg border border-white/10 bg-white/5 p-4 hover:border-blue-400/40 transition">
      <div className="font-semibold text-white">{store.name}</div>
      <div className="text-sm text-blue-200/80 line-clamp-2">{store.description}</div>
      <div className="mt-2 text-sm text-blue-200/80 flex items-center gap-2">
        <RatingStars value={Math.round(store.average_rating || 0)} />
        <span>({store.reviews_count || 0})</span>
      </div>
    </Link>
  )
}

function Home() {
  const [data, setData] = useState({ items: [], total: 0});
  const [q, setQ] = useState('');
  useEffect(() => {
    StoresAPI.list({ q }).then(setData).catch(console.error)
  }, [q])
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search stores" className="w-full px-3 py-2 rounded bg-white/10 text-white placeholder:text-blue-200/60"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items.map(s => <StoreCard key={s.id} store={s} />)}
      </div>
    </div>
  )
}

function RatingForm({ onSubmit, initial }) {
  const [rating, setRating] = useState(initial?.rating || 5)
  const [comment, setComment] = useState(initial?.comment || '')
  return (
    <form className="space-y-3" onSubmit={e=>{e.preventDefault(); onSubmit({ rating: Number(rating), comment })}}>
      <div>
        <label className="block text-sm text-blue-200 mb-1">Rating</label>
        <select value={rating} onChange={e=>setRating(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10 text-white">
          {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-blue-200 mb-1">Comment</label>
        <textarea value={comment} onChange={e=>setComment(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10 text-white"/>
      </div>
      <button className="px-3 py-2 bg-blue-600 rounded text-white">Save Review</button>
    </form>
  )
}

function StoreDetail({ user }) {
  const { id } = useParams()
  const [store, setStore] = useState(null)
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState(null)
  const reload = () => {
    StoresAPI.get(id).then(setStore)
    StoresAPI.reviews(id).then(r=>setReviews(r.items))
  }
  useEffect(()=>{ reload() }, [id])
  const submit = async (payload) => {
    try {
      await StoresAPI.addReview(id, payload)
      reload()
    } catch (e) { setError(e.message) }
  }
  if (!store) return <div className="p-4">Loading...</div>
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-2xl text-white font-semibold">{store.name}</div>
        <div className="text-blue-200/80">{store.description}</div>
        <div className="mt-2 flex items-center gap-2 text-blue-200/80">
          <RatingStars value={Math.round(store.average_rating || 0)} />
          <span>{store.reviews_count || 0} reviews</span>
        </div>
      </div>

      {user && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-white font-semibold mb-2">Leave a review</div>
          {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
          <RatingForm onSubmit={submit} />
        </div>
      )}

      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-white font-medium">{r.user_name || 'User'}</div>
              <RatingStars value={r.rating} />
            </div>
            <div className="text-blue-200/80 mt-1">{r.comment}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Login({ onAuth }) {
  const nav = useNavigate()
  const [email, setEmail] = useState('user@demo.local')
  const [password, setPassword] = useState('User@123')
  const [error, setError] = useState(null)
  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await AuthAPI.login(email, password)
      setToken(res.token)
      onAuth(res.user)
      nav('/')
    } catch (e) { setError(e.message) }
  }
  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={submit} className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-white font-semibold text-lg">Login</div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded bg-white/10 text-white"/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 rounded bg-white/10 text-white"/>
        <button className="w-full px-3 py-2 bg-blue-600 rounded text-white">Sign in</button>
      </form>
    </div>
  )
}

function Register({ onAuth }) {
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await AuthAPI.register(form)
      setToken(res.token)
      onAuth(res.user)
      nav('/')
    } catch (e) { setError(e.message) }
  }
  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={submit} className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-white font-semibold text-lg">Register</div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 rounded bg-white/10 text-white"/>
        <input value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 rounded bg-white/10 text-white"/>
        <input type="password" value={form.password} onChange={e=>setForm({ ...form, password: e.target.value })} placeholder="Password" className="w-full px-3 py-2 rounded bg-white/10 text-white"/>
        <button className="w-full px-3 py-2 bg-blue-600 rounded text-white">Create account</button>
      </form>
    </div>
  )
}

function Profile({ user }) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-white font-semibold text-lg">Your Profile</div>
        <div className="text-blue-200/80 text-sm mt-2">Name: {user.name}</div>
        <div className="text-blue-200/80 text-sm">Email: {user.email}</div>
        <div className="text-blue-200/80 text-sm">Role: {user.role}</div>
      </div>
    </div>
  )
}

function OwnerDashboard() {
  const [stores, setStores] = useState([])
  const [form, setForm] = useState({ name: '', description: '', address: '' })
  const load = () => StoresAPI.list({ limit: 100 }).then(r=>setStores(r.items))
  useEffect(()=>{ load() }, [])
  const create = async (e) => {
    e.preventDefault()
    await StoresAPI.create(form)
    setForm({ name: '', description: '', address: '' })
    load()
  }
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <form onSubmit={create} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
        <div className="text-white font-semibold">Add Store</div>
        <input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 rounded bg-white/10 text-white"/>
        <input value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 rounded bg-white/10 text-white"/>
        <input value={form.address} onChange={e=>setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full px-3 py-2 rounded bg-white/10 text-white"/>
        <button className="px-3 py-2 bg-blue-600 rounded text-white">Create</button>
      </form>

      <div className="grid gap-3">
        {stores.map(s => (
          <div key={s.id} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-semibold">{s.name}</div>
              <div className="text-blue-200/80 text-sm">{s.address}</div>
            </div>
            <Link to={`/stores/${s.id}`} className="text-blue-300 hover:text-white">View</Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [users, setUsers] = useState([])
  useEffect(()=> { import('./utils/api').then(({ AdminAPI }) => AdminAPI.users().then(setUsers).catch(()=>{})) }, [])
  const changeRole = async (id, role) => {
    const { AdminAPI } = await import('./utils/api')
    await AdminAPI.setRole(id, role)
    setUsers(users.map(u=>u.id===id?{...u, role}:u))
  }
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-white font-semibold text-lg mb-3">Manage Users</div>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between">
            <div>
              <div className="text-white">{u.name}</div>
              <div className="text-xs text-blue-200/70">{u.email}</div>
            </div>
            <div className="flex items-center gap-2">
              {['user','owner','admin'].map(r => (
                <button key={r} onClick={()=>changeRole(u.id, r)} className={`px-2 py-1 rounded text-sm ${u.role===r?'bg-blue-600 text-white':'bg-white/10 text-blue-200'}`}>{r}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AppShell() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  useEffect(()=>{
    const t = getToken(); if (!t) return;
    AuthAPI.me().then(u=>setUser(u)).catch(()=>setToken(null))
  }, [])
  const logout = () => { setToken(null); setUser(null); navigate('/') }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-blue-100">
      <Header user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stores/:id" element={<StoreDetail user={user} />} />
        <Route path="/login" element={<Login onAuth={setUser} />} />
        <Route path="/register" element={<Register onAuth={setUser} />} />
        <Route path="/profile" element={<ProtectedRoute user={user}><Profile user={user}/></ProtectedRoute>} />
        <Route path="/owner" element={<ProtectedRoute user={user} roles={['owner','admin']}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute user={user} roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace/>} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
