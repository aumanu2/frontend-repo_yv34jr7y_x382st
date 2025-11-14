import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Spline from '@splinetool/react-spline'
import { api, seed } from './lib/api'
import { Home, MessageSquare, User2, FolderOpen, LogOut, Sun, Moon, Search } from 'lucide-react'

const themePalette = {
  light: 'bg-gradient-to-br from-[#f9f6f1] to-[#ebe6de] text-neutral-800',
  dark: 'bg-neutral-900 text-neutral-100',
}

function useTheme() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])
  return { theme, setTheme }
}

const Nav = ({ user, onLogout, theme, setTheme }) => {
  const navItem = 'inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5'
  return (
    <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50 border-b border-black/10 dark:border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
        <Link to="/" className="font-semibold">Notion-Style Neutral Workspace</Link>
        <div className="flex items-center gap-1">
          <Link className={navItem} to="/"><Home size={18}/> Home</Link>
          <Link className={navItem} to="/my-projects"><FolderOpen size={18}/> My Projects</Link>
          <Link className={navItem} to="/projects"><Search size={18}/> Projects</Link>
          <Link className={navItem} to="/profile"><User2 size={18}/> Profile</Link>
          <button onClick={() => setTheme(theme === 'light' ? 'dark':'light')} className={navItem} aria-label="Toggle theme">
            {theme==='light'? <Moon size={18}/> : <Sun size={18}/>}
          </button>
          {user && <button onClick={onLogout} className={navItem}><LogOut size={18}/> Logout</button>}
        </div>
      </div>
    </div>
  )
}

// ---------------- Auth & Survey ----------------
const Login = ({ onAuth }) => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', username:'', role:'student', interests:[], companyName:'', linkedIn:'' })
  const interests = ['Computer Science','Physics','Design','Business','Research','Arts','Electronics','Robotics','AI','Chemistry','Social Media']

  const toggle = (v) => setForm(f => ({...f, interests: f.interests.includes(v) ? f.interests.filter(x=>x!==v) : [...f.interests, v]}))
  const submit = async (e) => {
    e.preventDefault()
    const u = await api.post('/api/users', { ...form, emailVerified: true })
    onAuth(u)
    await seed()
    navigate('/')
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:block">
        <Spline scene="https://prod.spline.design/qQUip0dJPqrrPryE/scene.splinecode" style={{ width:'100%', height:'100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/20"></div>
      </div>
      <div className="flex items-center justify-center p-8 bg-[#f6f1e7]">
        <form onSubmit={submit} className="w-full max-w-md space-y-5">
          <h1 className="text-2xl font-semibold">Welcome</h1>
          <p className="text-sm text-neutral-600">Log in and tell us what you love to work on. We’ll personalize your workspace.</p>
          <div className="grid gap-3">
            <input className="px-3 py-2 rounded-md border border-black/10 bg-white" placeholder="Email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            <input className="px-3 py-2 rounded-md border border-black/10 bg-white" placeholder="Username" required value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <select className="px-3 py-2 rounded-md border border-black/10 bg-white" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                <option value="student">Student</option>
                <option value="working">Working Professional</option>
              </select>
              <input className="px-3 py-2 rounded-md border border-black/10 bg-white" placeholder="Company / Institution" value={form.companyName} onChange={e=>setForm({...form, companyName:e.target.value})} />
            </div>
            <input className="px-3 py-2 rounded-md border border-black/10 bg-white" placeholder="LinkedIn URL" value={form.linkedIn} onChange={e=>setForm({...form, linkedIn:e.target.value})} />
          </div>
          <div>
            <div className="text-sm font-medium mb-2">What topics are you most likely to work on?</div>
            <div className="flex flex-wrap gap-2">
              {interests.map(v=> (
                <button type="button" key={v} onClick={()=>toggle(v)} className={`px-3 py-1.5 rounded-full border ${form.interests.includes(v)?'bg-neutral-900 text-white border-neutral-900':'border-black/20 bg-white'}`}>{v}</button>
              ))}
            </div>
          </div>
          <button className="w-full bg-neutral-900 text-white rounded-md py-2">Enter Workspace</button>
        </form>
      </div>
    </div>
  )
}

// ---------------- Pages ----------------
const HomePage = ({ user }) => {
  const [recent, setRecent] = useState([])
  const [recs, setRecs] = useState([])
  const navigate = useNavigate()
  useEffect(() => {
    if (!user) return
    api.get(`/api/projects?creator=${user.id}`).then(setRecent)
    api.get(`/api/recommendations/${user.id}`).then(setRecs)
  }, [user])
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur rounded-xl p-5 border border-black/10 dark:border-white/10">
            <h2 className="font-semibold mb-3">Recent Collaborations</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {recent.map(p => (
                <div key={p.id} className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white dark:bg-neutral-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">{iconFor(p.category)} {p.title}</div>
                      <div className="text-xs text-neutral-500">Updated {new Date(p.updated_at || p.updatedAt || Date.now()).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>navigate(`/projects/${p.id}`)} className="text-sm px-2 py-1 rounded bg-neutral-900 text-white">Continue</button>
                      <button onClick={()=>navigate(`/projects/${p.id}`)} className="text-sm px-2 py-1 rounded border">View Details</button>
                      <button onClick={()=>navigate(`/projects/${p.id}#chat`)} className="text-sm px-2 py-1 rounded border"><MessageSquare size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur rounded-xl p-5 border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Recommended Projects</h2>
              <Link to="/projects" className="text-sm underline">Explore</Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {recs.map(p => (
                <div key={p.id} className="rounded-lg border p-4 bg-white dark:bg-neutral-900">
                  <div className="font-medium flex items-center gap-2">{iconFor(p.category)} {p.title}</div>
                  <div className="text-xs text-neutral-500 mb-3">{p.category}</div>
                  <button onClick={()=>navigate(`/projects/${p.id}`)} className="text-sm px-2 py-1 rounded bg-neutral-900 text-white w-full">Open</button>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-6">
          <div className="rounded-xl p-5 border bg-white dark:bg-neutral-900">
            <h3 className="font-semibold mb-2">Quick Explore</h3>
            <Link to="/projects" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-900 text-white">Explore Projects</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

const iconFor = (category) => {
  const map = {
    'Computer Science': '💻', Physics:'🧪', Design:'🎨', Business:'📈', Research:'🔬', Arts:'🎭', Electronics:'🔩', Robotics:'🤖', AI:'🧠', Chemistry:'⚗️', 'Social Media':'📣'
  }
  return <span className="text-lg" aria-hidden>{map[category] || '📁'}</span>
}

const MyProjectsPage = ({ user }) => {
  const [own, setOwn] = useState([])
  const [collab, setCollab] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', category:'Computer Science', attachments:[], tags:[], type:'combined' })
  const categories = ['Computer Science','Physics','Design','Business','Research','Arts','Electronics','Robotics','AI','Chemistry','Social Media']

  const load = async () => {
    const mine = await api.get(`/api/projects?creator=${user.id}`)
    setOwn(mine)
    const all = await api.get('/api/projects')
    setCollab(all.filter(p=> p.members?.includes(user.id) && p.createdBy !== user.id))
  }
  useEffect(()=>{ if(user) load() }, [user])

  const create = async (e) => {
    e.preventDefault()
    const payload = { ...form, createdBy: user.id, members: [user.id] }
    const p = await api.post('/api/projects', payload)
    setShowNew(false)
    setForm({ title:'', description:'', category:'Computer Science', attachments:[], tags:[], type:'combined' })
    await load()
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Own Projects</h2>
        <button onClick={()=>setShowNew(true)} className="px-3 py-2 rounded-md bg-neutral-900 text-white">Create Project</button>
      </div>
      {showNew && (
        <form onSubmit={create} className="bg-white dark:bg-neutral-900 border rounded-xl p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="px-3 py-2 border rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
            <select className="px-3 py-2 border rounded" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
              {categories.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea className="w-full px-3 py-2 border rounded" placeholder="Description" rows={3} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="px-3 py-2 border rounded" placeholder="Attachment URL (image/doc)" value={form.attachments[0]||''} onChange={e=>setForm({...form, attachments: e.target.value? [e.target.value]: []})} />
            <input className="px-3 py-2 border rounded" placeholder="Add categories (type to add)" onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); if(e.currentTarget.value.trim()) { setForm(f=>({...f, tags:[...new Set([...(f.tags||[]), e.currentTarget.value.trim()])] })); e.currentTarget.value=''; } } }} />
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2"><input type="radio" name="type" checked={form.type==='solo'} onChange={()=>setForm({...form, type:'solo'})}/> Solo</label>
            <label className="inline-flex items-center gap-2"><input type="radio" name="type" checked={form.type==='combined'} onChange={()=>setForm({...form, type:'combined'})}/> Combined</label>
          </div>
          <button className="px-3 py-2 rounded-md bg-neutral-900 text-white">Save</button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {own.map(p => (
          <ProjectCard key={p.id} p={p} owner user={user} onChange={load} />
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-10">Collaborating Projects</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {collab.map(p => (
          <ProjectCard key={p.id} p={p} user={user} onChange={load} />
        ))}
      </div>
    </div>
  )
}

const ProjectsPage = ({ user }) => {
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const categories = ['', 'Computer Science','Physics','Design','Business','Research','Arts','Electronics','Robotics','AI','Chemistry','Social Media']
  useEffect(()=>{ api.get('/api/projects').then(setList) }, [])
  const search = async () => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    const res = await api.get(`/api/projects?${params.toString()}`)
    setList(res)
  }
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by topic, keyword, username" className="px-3 py-2 border rounded w-full sm:w-80" />
        <select value={category} onChange={e=>setCategory(e.target.value)} className="px-3 py-2 border rounded">
          {categories.map(c=> <option key={c} value={c}>{c||'All'}</option>)}
        </select>
        <button onClick={search} className="px-3 py-2 rounded bg-neutral-900 text-white">Search</button>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {list.map(p=> (
          <div key={p.id} className="border rounded-xl p-4 bg-white dark:bg-neutral-900">
            <div className="font-medium flex items-center gap-2 mb-1">{iconFor(p.category)} {p.title}</div>
            <div className="text-xs text-neutral-500 mb-2">{p.category}</div>
            <div className="text-sm line-clamp-3 mb-3">{p.description}</div>
            <Link to={`/projects/${p.id}`} className="text-sm underline">Open</Link>
          </div>
        ))}
      </div>
    </div>
  )
}

const ProfilePage = ({ user, setUser }) => {
  const [form, setForm] = useState(user||{})
  useEffect(()=> setForm(user||{}), [user])
  const save = async () => {
    const updated = await api.put(`/api/users/${user.id}`, form)
    setUser(updated)
  }
  return (
    <div className="max-w-4xl mx-auto p-4 grid md:grid-cols-[220px,1fr] gap-6">
      <div className="space-y-3">
        <div className="w-52 h-52 bg-neutral-200 dark:bg-neutral-800 rounded-xl overflow-hidden">
          {form.profilePic ? <img src={form.profilePic} alt="avatar" className="w-full h-full object-cover"/> : <div className="w-full h-full grid place-items-center text-neutral-500">Upload</div>}
        </div>
        <input className="px-3 py-2 border rounded w-full" placeholder="Profile picture URL" value={form.profilePic||''} onChange={e=>setForm({...form, profilePic:e.target.value})}/>
      </div>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="px-3 py-2 border rounded" placeholder="Username" value={form.username||''} onChange={e=>setForm({...form, username:e.target.value})} />
          <input className="px-3 py-2 border rounded" disabled value={form.email||''} />
          <input className="px-3 py-2 border rounded" placeholder="Company / Institution" value={form.companyName||''} onChange={e=>setForm({...form, companyName:e.target.value})} />
          <select className="px-3 py-2 border rounded" value={form.role||''} onChange={e=>setForm({...form, role:e.target.value})}>
            <option value="">Role</option>
            <option value="student">Student</option>
            <option value="working">Working Professional</option>
          </select>
          <input className="px-3 py-2 border rounded col-span-2" placeholder="LinkedIn" value={form.linkedIn||''} onChange={e=>setForm({...form, linkedIn:e.target.value})} />
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Interests</div>
          <InterestsChips value={form.interests||[]} onChange={(v)=>setForm({...form, interests:v})} />
        </div>
        <button onClick={save} className="px-3 py-2 rounded bg-neutral-900 text-white">Save Changes</button>
      </div>
    </div>
  )
}

const InterestsChips = ({ value, onChange }) => {
  const all = ['Computer Science','Physics','Design','Business','Research','Arts','Electronics','Robotics','AI','Chemistry','Social Media']
  const toggle = (v) => onChange(value.includes(v) ? value.filter(x=>x!==v) : [...value, v])
  return (
    <div className="flex flex-wrap gap-2">
      {all.map(v=> (
        <button type="button" key={v} onClick={()=>toggle(v)} className={`px-3 py-1.5 rounded-full border ${value.includes(v)?'bg-neutral-900 text-white border-neutral-900':'border-black/20 bg-white'}`}>{v}</button>
      ))}
    </div>
  )
}

const ProjectCard = ({ p, onChange, owner, user }) => {
  const navigate = useNavigate()
  const remove = async () => { if(!confirm('Delete project?')) return; await api.del(`/api/projects/${p.id}`); onChange&&onChange() }
  return (
    <div className="border rounded-xl p-4 bg-white dark:bg-neutral-900 space-y-3">
      <div className="font-medium flex items-center gap-2">{iconFor(p.category)} {p.title}</div>
      <div className="text-xs text-neutral-500">{p.category}</div>
      {p.attachments?.[0] && <a href={p.attachments[0]} target="_blank" className="text-sm underline">View attachment</a>}
      <div className="flex gap-2">
        <button onClick={()=>navigate(`/projects/${p.id}`)} className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm">Open</button>
        {!owner && <button onClick={()=>navigate(`/projects/${p.id}`)} className="px-3 py-1.5 rounded border text-sm">Chat</button>}
        {owner && <button onClick={remove} className="px-3 py-1.5 rounded border text-sm">Delete</button>}
      </div>
    </div>
  )
}

const ProjectDetail = ({ user }) => {
  const id = window.location.pathname.split('/').pop()
  const [p, setP] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [requests, setRequests] = useState([])
  const load = async () => {
    const pr = await api.get(`/api/projects/${id}`); setP(pr)
    const ch = await api.get(`/api/projects/${id}/chat`); setMsgs(ch)
    const reqs = await api.get(`/api/projects/${id}/requests`); setRequests(reqs)
  }
  useEffect(()=>{ load(); const t=setInterval(load, 3000); return ()=>clearInterval(t) }, [id])
  if (!p) return null
  const isMember = p.members?.includes(user.id)
  const send = async () => { if(!text.trim()) return; await api.post(`/api/projects/${id}/chat`, { content:text, senderId: user.id }); setText(''); await load() }
  const request = async () => { await api.post(`/api/projects/${id}/requests`, { projectId:id, senderUserId:user.id }); await load() }
  const accept = async (rid) => { await api.post(`/api/requests/${rid}/respond`, { decision:'accepted' }); await load() }
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="border rounded-xl p-4 bg-white dark:bg-neutral-900">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-semibold flex items-center gap-2">{iconFor(p.category)} {p.title}</div>
            <div className="text-xs text-neutral-500">{p.category}</div>
          </div>
          {!isMember && <button onClick={request} className="px-3 py-2 rounded bg-neutral-900 text-white">Request to Collaborate</button>}
        </div>
        {p.attachments?.[0] && <a href={p.attachments[0]} target="_blank" className="text-sm underline mt-3 inline-block">View attachment</a>}
        <div className="mt-3 text-sm whitespace-pre-wrap">{p.description}</div>
        <div className="mt-4 text-sm">
          <div className="font-medium mb-1">Members</div>
          <div className="flex flex-wrap gap-2">
            {p.members?.map(mid => <MemberBadge key={mid} id={mid} />)}
          </div>
        </div>
      </div>

      <div id="chat" className="border rounded-xl p-4 bg-white dark:bg-neutral-900">
        <div className="font-semibold mb-2">Project Chat</div>
        <div className="space-y-2 max-h-80 overflow-auto p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
          {msgs.map(m => (
            <div key={m.id} className={`text-sm ${m.senderId===user.id? 'text-right':''}`}>
              <div className={`inline-block px-3 py-2 rounded-lg ${m.senderId===user.id? 'bg-neutral-900 text-white':'bg-white dark:bg-neutral-700 border'}`}>{m.content}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" className="flex-1 px-3 py-2 border rounded" />
          <button onClick={send} className="px-3 py-2 rounded bg-neutral-900 text-white">Send</button>
        </div>
      </div>

      {requests.length>0 && (
        <div className="border rounded-xl p-4 bg-white dark:bg-neutral-900">
          <div className="font-semibold mb-2">Collaboration Requests</div>
          <div className="space-y-2">
            {requests.map(r=> (
              <div key={r.id} className="flex items-center justify-between border p-2 rounded">
                <div className="text-sm">{r.senderUserId}</div>
                <button onClick={()=>accept(r.id)} className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm">Accept</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MemberBadge = ({ id }) => {
  const [u, setU] = useState(null)
  useEffect(()=>{ api.get(`/api/users/${id}`).then(setU).catch(()=>{}) }, [id])
  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full border">
      <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-200">
        {u?.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover"/> : <div className="w-full h-full grid place-items-center">👤</div>}
      </div>
      <span className="text-sm">{u?.username || id.slice(-4)}</span>
    </div>
  )
}

// --------------- App Shell ---------------
function Shell() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState(()=>{
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  useEffect(()=>{ if(user) localStorage.setItem('user', JSON.stringify(user)) }, [user])

  const onLogout = () => { localStorage.removeItem('user'); setUser(null) }
  if (!user) return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Login onAuth={(u)=>setUser(u)} />} />
      </Routes>
    </BrowserRouter>
  )

  return (
    <div className={`${theme==='light'? themePalette.light: themePalette.dark} min-h-screen`}>
      <BrowserRouter>
        <Nav user={user} onLogout={onLogout} theme={theme} setTheme={setTheme} />
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/my-projects" element={<MyProjectsPage user={user} />} />
          <Route path="/projects" element={<ProjectsPage user={user} />} />
          <Route path="/projects/:id" element={<ProjectDetail user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default Shell
