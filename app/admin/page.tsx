'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginHref } from '@/lib/auth/redirect';
import { adminService, type AdminAuditLog, type AdminAuditLogPage, type AdminDashboardMetrics, type AdminUser } from '@/lib/services/adminService';
import { ApiRequestError } from '@/lib/api/apiClient';
import { useStore } from '@/lib/store';

type AdminSection = 'overview' | 'users' | 'audit';

const metricCards: { key: keyof AdminDashboardMetrics; label: string; icon: string; tone: string }[] = [
  { key: 'totalUsers', label: 'Registered users', icon: 'U', tone: 'plum' },
  { key: 'totalCustomers', label: 'Customers', icon: 'C', tone: 'sage' },
  { key: 'totalProducts', label: 'Products', icon: 'P', tone: 'sand' },
  { key: 'totalOrders', label: 'Orders', icon: 'O', tone: 'coral' },
  { key: 'pendingReviews', label: 'Reviews to moderate', icon: 'R', tone: 'rose' },
  { key: 'totalReturns', label: 'Returns', icon: '↩', tone: 'lilac' },
  { key: 'totalCoupons', label: 'Coupons', icon: '%', tone: 'sand' },
  { key: 'publishedCmsPages', label: 'Published CMS pages', icon: 'W', tone: 'sage' },
];

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function getUserName(user: AdminUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unnamed user';
}

function hasAdminRole(roles?: string[]) {
  return roles?.some((role) => ['ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(role)) ?? false;
}

function ErrorPanel({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="admin-error" role="alert">
      <span>{message}</span>
      {retry && <button type="button" className="admin-retry" onClick={retry}>Try again</button>}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const authStatus = useStore((state) => state.authStatus);
  const user = useStore((state) => state.auth.user);
  const [section, setSection] = useState<AdminSection>('overview');
  const [dashboard, setDashboard] = useState<AdminDashboardMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [auditPage, setAuditPage] = useState<AdminAuditLogPage | null>(null);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const admin = hasAdminRole(user?.roles);
  const denied = forbidden || (authStatus === 'authenticated' && !admin);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace(loginHref('/admin'));
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !admin) return;

    let active = true;

    const loadSection = async () => {
      try {
        if (section === 'overview' && !dashboard) {
          setDashboard(await adminService.getDashboard());
        } else if (section === 'users' && !users) {
          setUsers(await adminService.getUsers());
        } else if (section === 'audit' && !auditPage) {
          setAuditPage(await adminService.getAuditLogs());
        }
      } catch (requestError) {
        if (!active) return;
        if (requestError instanceof ApiRequestError && requestError.status === 403) {
          setForbidden(true);
        } else {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load admin data.');
        }
      }
    };

    void loadSection();
    return () => {
      active = false;
    };
  }, [admin, auditPage, authStatus, dashboard, refreshKey, section, users]);

  const retry = () => {
    setError('');
    if (section === 'overview') setDashboard(null);
    if (section === 'users') setUsers(null);
    if (section === 'audit') setAuditPage(null);
    setRefreshKey((key) => key + 1);
  };

  if (authStatus === 'loading' || authStatus === 'error') {
    return (
      <section className="admin-gate" role={authStatus === 'error' ? 'alert' : 'status'}>
        <span className="admin-gate-mark">SM</span>
        <h1>{authStatus === 'error' ? 'Session check failed' : 'Verifying administrator access'}</h1>
        <p>{authStatus === 'error' ? 'Refresh the page or sign in again to continue.' : 'Please wait while we verify your session.'}</p>
        {authStatus === 'error' && <button className="admin-primary-button" onClick={() => window.location.reload()}>Retry</button>}
      </section>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <section className="admin-gate" role="status">
        <span className="admin-gate-mark">SM</span>
        <h1>Sign-in required</h1>
        <p>Taking you to sign in before opening the admin dashboard.</p>
      </section>
    );
  }

  if (denied) {
    return (
      <section className="admin-gate" role="alert">
        <span className="admin-gate-mark">SM</span>
        <h1>Administrator access required</h1>
        <p>Your account does not have permission to view the StyleMe admin dashboard.</p>
        <button className="admin-primary-button" onClick={() => router.replace('/')}>Return to storefront</button>
      </section>
    );
  }

  const openSection = (next: AdminSection) => {
    setSection(next);
    setError('');
  };
  const sectionDataLoaded = section === 'overview'
    ? dashboard !== null
    : section === 'users'
      ? users !== null
      : auditPage !== null;
  const loading = authStatus === 'authenticated' && admin && !denied && !error && !sectionDataLoaded;

  return (
    <div className="admin-shell">
      <div className="admin-topline">
        <div className="admin-brand">
          <span className="admin-brand-mark">SM</span>
          <span>StyleMe <small>ADMIN</small></span>
        </div>
        <div className="admin-identity">
          <span className="admin-avatar">{(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}</span>
          <span><strong>{user?.name || 'Administrator'}</strong><small>{user?.email}</small></span>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="admin-sidebar-label">WORKSPACE</p>
          <nav aria-label="Admin dashboard sections">
            {([
              ['overview', 'Overview', '⌂'],
              ['users', 'Users', '♙'],
              ['audit', 'Audit log', '≋'],
            ] as const).map(([id, label, icon]) => (
              <button
                key={id}
                type="button"
                className={`admin-nav-item${section === id ? ' is-active' : ''}`}
                onClick={() => openSection(id)}
                aria-current={section === id ? 'page' : undefined}
              >
                <span aria-hidden="true">{icon}</span>{label}
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-foot">
            <span className="admin-status-dot" />
            <span>Admin APIs connected</span>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-page-heading">
            <div>
              <p className="admin-eyebrow">STYLEME OPERATIONS</p>
              <h1>{section === 'overview' ? 'Dashboard' : section === 'users' ? 'User directory' : 'Audit log'}</h1>
              <p className="admin-subheading">
                {section === 'overview' && 'A live overview of your store and operations.'}
                {section === 'users' && 'Registered accounts and their access status.'}
                {section === 'audit' && 'Recent administrator actions recorded by the system.'}
              </p>
            </div>
            {dashboard?.generatedAt && <span className="admin-updated">Updated {formatDate(dashboard.generatedAt)}</span>}
          </header>

          {error && <ErrorPanel message={error} retry={retry} />}
          {loading && !dashboard && !users && !auditPage && (
            <div className="admin-loading" role="status">Loading secure admin data…</div>
          )}

          {section === 'overview' && dashboard && (
            <>
              <section className="admin-welcome">
                <div>
                  <p className="admin-eyebrow">WELCOME BACK</p>
                  <h2>{user?.firstName ? `Good to see you, ${user.firstName}.` : 'Your store at a glance.'}</h2>
                  <p>Monitor key catalog, customer, and commerce activity from one place.</p>
                </div>
                <div className="admin-health">
                  <span className="admin-status-dot" />
                  <span><small>System status</small><strong>{dashboard.systemStatus}</strong></span>
                </div>
              </section>

              <section className="admin-metric-grid" aria-label="Store metrics">
                {metricCards.map(({ key, label, icon, tone }) => (
                  <article className="admin-metric-card" key={key}>
                    <span className={`admin-metric-icon tone-${tone}`} aria-hidden="true">{icon}</span>
                    <p>{label}</p>
                    <strong>{dashboard[key].toLocaleString('en-IN')}</strong>
                  </article>
                ))}
              </section>

              <section className="admin-info-grid">
                <article className="admin-info-card">
                  <div className="admin-card-heading">
                    <div><p className="admin-eyebrow">MODERATION</p><h2>Reviews need attention</h2></div>
                    <span className="admin-count-badge">{dashboard.pendingReviews}</span>
                  </div>
                  <p>Pending reviews are included in the live dashboard totals. Review moderation actions are available through the protected backend API.</p>
                </article>
                <article className="admin-info-card">
                  <div className="admin-card-heading">
                    <div><p className="admin-eyebrow">CONTENT</p><h2>Published storefront pages</h2></div>
                    <span className="admin-count-badge">{dashboard.publishedCmsPages}</span>
                  </div>
                  <p>Published CMS pages currently available to customers.</p>
                </article>
              </section>
            </>
          )}

          {section === 'users' && users && <UsersTable users={users} />}
          {section === 'audit' && auditPage && <AuditTable logs={auditPage.content ?? []} />}
          {loading && (dashboard || users || auditPage) && (
            <div className="admin-inline-loading" role="status">Refreshing…</div>
          )}
        </main>
      </div>
    </div>
  );
}

function UsersTable({ users }: { users: AdminUser[] }) {
  if (!users.length) return <div className="admin-empty">No users were returned by the admin API.</div>;
  return (
    <div className="admin-table-card">
      <div className="admin-table-summary"><strong>{users.length.toLocaleString('en-IN')} accounts</strong><span>Live data from the admin API</span></div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead><tr><th>User</th><th>Role</th><th>Account</th><th>Email</th><th>Joined</th></tr></thead>
          <tbody>
            {users.map((account) => (
              <tr key={account.id}>
                <td><strong>{getUserName(account)}</strong><small>{account.email}</small></td>
                <td><div className="admin-role-list">{account.roles?.length ? account.roles.map((role) => <span className="admin-role" key={role}>{role.replace(/^ROLE_/, '')}</span>) : <span className="admin-muted">Customer</span>}</div></td>
                <td><span className={`admin-state ${account.active ? 'is-active' : 'is-inactive'}`}>{account.active ? 'Active' : 'Inactive'}</span></td>
                <td><span className={`admin-state ${account.emailVerified ? 'is-active' : 'is-pending'}`}>{account.emailVerified ? 'Verified' : 'Unverified'}</span></td>
                <td>{formatDate(account.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditTable({ logs }: { logs: AdminAuditLog[] }) {
  if (!logs.length) return <div className="admin-empty">No audit events have been recorded yet.</div>;
  return (
    <div className="admin-table-card">
      <div className="admin-table-summary"><strong>Recent activity</strong><span>Newest events first</span></div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead><tr><th>Action</th><th>Entity</th><th>Result</th><th>Details</th><th>Recorded</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td><strong>{log.action.replaceAll('_', ' ')}</strong><small>By {log.performedBy || 'System'}</small></td>
                <td>{log.entityType}<small>{log.entityId}</small></td>
                <td><span className={`admin-state ${log.result === 'SUCCESS' ? 'is-active' : 'is-inactive'}`}>{log.result}</span></td>
                <td className="admin-audit-details">{log.details || '—'}</td>
                <td>{formatDate(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
