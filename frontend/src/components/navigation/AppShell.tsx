import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/interview/setup", label: "Start interview" },
  { to: "/history", label: "History" },
  { to: "/progress", label: "Progress" },
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">I-RIS</span>
          <span className="brand-sub">Interview practice</span>
        </div>
        <nav className="side-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }: { isActive: boolean }) =>
                `side-nav-link${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">{user?.email}</div>
          <Button variant="ghost" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </aside>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
