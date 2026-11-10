import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const nav = [
  { to: '/report', label: 'Report' },
  { to: '/products', label: 'Check a product' },
  { to: '/track', label: 'Track' },
  { to: '/learn', label: 'Learn' },
]

export default function Layout() {
  // The reviewer workspace is a working tool and gets a wider column than the public forms.
  const wide = useLocation().pathname.startsWith('/reviewer')
  const column = `mx-auto w-full px-5 ${wide ? 'max-w-4xl' : 'max-w-xl'}`
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className={`${column} flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-4`}>
          <Link to="/" className="font-display text-xl font-bold tracking-tight text-ink">
            HerbSafe<span className="text-brand"> Ghana</span>
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-1">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `py-1 ${isActive ? 'font-bold text-ink shadow-[0_2px_0_var(--color-brand)]' : 'text-muted hover:text-ink'}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className={`${column} flex-1 py-8`}>
        <Outlet />
      </main>
      <footer className="border-t border-line">
        <div className={`${column} space-y-1 py-5 text-[0.9375rem] text-muted`}>
          <p>
            In an emergency call <a href="tel:112" className="font-bold text-ink">112</a> or go to the nearest hospital.
          </p>
          <p>Prototype with sample data. Reports stay on this device and are not sent to anyone.</p>
          <p>
            <Link to="/reviewer" className="underline underline-offset-4 hover:text-ink">
              Reviewer workspace
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
