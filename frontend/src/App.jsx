import { useCallback, useEffect, useMemo, useState } from 'react';
import API from './api.js';
import AppointmentModal from './AppointmentModal.jsx';

const TABS = [
  { key: 'all', label: 'All visits' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, completed: 0, cancelled: 0, today: 0 });
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async (activeTab) => {
    setLoading(true);
    setBackendError('');
    try {
      const [rows, summary] = await Promise.all([API.list(activeTab), API.stats()]);
      setAppointments(rows);
      setStats(summary);
    } catch (err) {
      setBackendError('Cannot reach the ClinicQ backend. Check the API service and /api proxy.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(tab); }, [tab, refresh]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter((a) =>
      [a.patient_name, a.doctor_name, a.department, a.reason]
        .some((f) => String(f ?? '').toLowerCase().includes(q)),
    );
  }, [appointments, search]);

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (modal?.mode === 'edit') await API.update(modal.item.id, payload);
      else await API.create(payload);
      setModal(null);
      await refresh(tab);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this appointment permanently?')) return;
    try {
      await API.remove(id);
      await refresh(tab);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  async function quickStatus(item, next) {
    try {
      await API.update(item.id, { status: next });
      await refresh(tab);
    } catch (err) {
      alert(`Status change failed: ${err.message}`);
    }
  }


  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-cross">+</span><span>ClinicQ</span></div>
        <p className="brand-sub">City Care Hospital</p>
        <nav>
          <button className="nav-item active">Appointments</button>
          <button className="nav-item" title="Doctors roster (demo)">Doctors</button>
          <button className="nav-item" title="Departments (demo)">Departments</button>
          <button className="nav-item" title="Reports (demo)">Reports</button>
        </nav>
        <div className="side-card">
          <strong>Today&apos;s load</strong>
          <span className="side-big">{stats.today}</span>
          <span>visits on the calendar</span>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h1>Appointment bookings</h1>
            <p>Schedule, track and complete patient visits across departments.</p>
          </div>
          <button className="btn primary" onClick={() => setModal({ mode: 'create' })}>+ New Appointment</button>
        </header>

        <section className="kpis">
          <Kpi label="Total appointments" value={stats.total} accent="teal" />
          <Kpi label="Scheduled" value={stats.scheduled} accent="blue" />
          <Kpi label="Completed" value={stats.completed} accent="green" />
          <Kpi label="Cancelled" value={stats.cancelled} accent="rose" />
        </section>

        <section className="toolbar">
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.key} className={tab === t.key ? 'tab active' : 'tab'} onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>
          <input className="search" placeholder="Search patient, doctor, department..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </section>

        <section className="table-card">
          {loading ? (
            <p className="state">Loading appointments...</p>
          ) : backendError ? (
            <div className="state error">
              <p>{backendError}</p>
              <button className="btn ghost" onClick={() => refresh(tab)}>Retry</button>
            </div>
          ) : visible.length === 0 ? (
            <p className="state">No appointments match this view yet. Book the first visit!</p>
          ) : (
            <table>
              <thead>
                <tr><th>Patient</th><th>Doctor</th><th>Department</th><th>Visit</th><th>Status</th><th>Priority</th><th className="actions">Actions</th></tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.patient_name}</strong><span className="muted">{a.reason || '-'}</span></td>
                    <td>{a.doctor_name}</td>
                    <td>{a.department}</td>
                    <td>{formatWhen(a.appointment_time)}</td>
                    <td><span className={`badge st-${a.status}`}>{a.status}</span></td>
                    <td><span className={`badge pr-${a.priority}`}>{a.priority}</span></td>
                    <td className="actions">
                      <button className="link" onClick={() => setModal({ mode: 'edit', item: a })}>Edit</button>
                      {a.status === 'scheduled' && <button className="link ok" onClick={() => quickStatus(a, 'completed')}>Complete</button>}
                      {a.status === 'scheduled' && <button className="link warn" onClick={() => quickStatus(a, 'cancelled')}>Cancel</button>}
                      <button className="link danger" onClick={() => handleDelete(a.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {modal && (
        <AppointmentModal
          initial={modal.mode === 'edit' ? modal.item : null}
          saving={saving}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function Kpi({ label, value, accent }) {
  return (
    <div className={`kpi kpi-${accent}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
    </div>
  );
}

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}
