import { Link, NavLink, Outlet } from 'react-router-dom'

const nav = [
  { to: '/report', label: 'Report' },
  { to: '/products', label: 'Check a product' },
  { to: '/track', label: 'Track' },
  { to: '/learn', label: 'Learn' },
]

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="bg-amber-200 px-4 py-1.5 text-center text-sm font-medium text-amber-950">
        Prototype with sample data. Reports stay on this device and are not sent to anyone.
      </div>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-leaf-900">
            <img src="./favicon.svg" alt="" className="h-8 w-8" />
            HerbSafe Ghana
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-base">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'font-bold text-leaf-800 underline underline-offset-4' : 'text-stone-700')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-stone-600">
          <span>In an emergency call 112 or go to the nearest hospital.</span>
          <Link to="/reviewer" className="underline">
            Reviewer workspace
          </Link>
        </div>
      </footer>
    </div>
  )
}
