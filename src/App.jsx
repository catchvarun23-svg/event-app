import React, { useEffect, useMemo, useState } from 'react';

const EVENT_API_URL = "/api/event";
const RSVP_API_URL = "/api/rsvp";
const ADMIN_API_URL = "/api/admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'change-me';

const emptyMember = () => ({ name: '', relation: '', food: 'No Preference', notes: '' });

const initialEvent = {
  event_id: 'EVT001',
  event_name: 'Eid Celebration',
  event_date: '',
  event_time: '',
  venue: '68 Macarthur St',
  menu: '',
  event_status: 'Active',
  created_by: '',
  created_at: ''
};

export default function App() {
  const [eventData, setEventData] = useState(initialEvent);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminSaving, setAdminSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    attendance: 'Yes',
    suggestion: '',
    family_members: [emptyMember()]
  });

  useEffect(() => {
    fetchEvent();
  }, []);

  async function fetchEvent() {
    setLoadingEvent(true);
    try {
      const res = await fetch(EVENT_API_URL);

      if (!res.ok) {
        throw new Error('Failed to fetch event');
      }

      const data = await res.json();
      setEventData((prev) => ({ ...prev, ...data }));
      setError('');
    } catch (err) {
      setError('Could not load event details.');
    } finally {
      setLoadingEvent(false);
    }
  }

  const duplicateIndexes = useMemo(() => {
    const seen = new Map();
    const duplicates = new Set();

    form.family_members.forEach((member, index) => {
      const key = member.name.trim().toLowerCase();
      if (!key) return;

      if (seen.has(key)) {
        duplicates.add(index);
        duplicates.add(seen.get(key));
      } else {
        seen.set(key, index);
      }
    });

    return duplicates;
  }, [form.family_members]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateMember(index, field, value) {
    setForm((prev) => ({
      ...prev,
      family_members: prev.family_members.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
    }));
  }

  function addMember() {
    setForm((prev) => ({
      ...prev,
      family_members: [...prev.family_members, emptyMember()]
    }));
  }

  function removeMember(index) {
    setForm((prev) => ({
      ...prev,
      family_members:
        prev.family_members.length === 1
          ? prev.family_members
          : prev.family_members.filter((_, i) => i !== index)
    }));
  }

  async function submitRSVP(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (duplicateIndexes.size > 0) {
      setError('Duplicate family member names found. Please fix them first.');
      return;
    }

    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      attendance: form.attendance,
      suggestion: form.suggestion,
      family_members: form.family_members.filter((m) => m.name.trim())
    };

    try {
      const res = await fetch(RSVP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('RSVP request failed');
      }

      const parsed = await res.json();

      if (parsed.status === 'duplicate') {
        setError(`Duplicate found: ${parsed.duplicates.join(', ')}`);
        return;
      }

      if (parsed.status !== 'success') {
        setError(parsed.message || 'Could not submit RSVP.');
        return;
      }

      setMessage('RSVP submitted successfully.');
      setForm({
        name: '',
        phone: '',
        email: '',
        attendance: 'Yes',
        suggestion: '',
        family_members: [emptyMember()]
      });
    } catch (err) {
      setError('Could not submit RSVP.');
    }
  }

  async function updateEvent(e) {
    e.preventDefault();
    setAdminSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateEvent',
          admin_password: adminPass,
          event: eventData
        })
      });

      if (!res.ok) {
        throw new Error('Admin update failed');
      }

      const parsed = await res.json();

      if (parsed.status !== 'success') {
        setError(parsed.message || 'Could not update event.');
        return;
      }

      setMessage('Event updated successfully.');
      await fetchEvent();
    } catch (err) {
      setError('Could not update event.');
    } finally {
      setAdminSaving(false);
    }
  }

  function unlockAdmin(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (adminPass === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setError('');
      setMessage('Admin unlocked.');
    } else {
      setError('Wrong admin password.');
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <span className="tag">One Event RSVP App</span>
        <h1>{loadingEvent ? 'Loading event...' : (eventData.event_name || 'Eid Celebration')}</h1>
        <p><strong>Venue:</strong> {eventData.venue || '68 Macarthur St'}</p>
        <p>
          <strong>Date:</strong> {eventData.event_date || 'Add in admin page'}
          &nbsp;&nbsp;
          <strong>Time:</strong> {eventData.event_time || 'Add in admin page'}
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <h2 className="section-title">Guest RSVP Form</h2>

          {message ? <div className="success">{message}</div> : null}
          {error ? <div className="error">{error}</div> : null}

          <div className="menu-box">
            <strong>Food Menu</strong>
            <div className="muted" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
              {eventData.menu || 'Menu will be updated by admin.'}
            </div>
          </div>

          <form onSubmit={submitRSVP}>
            <div className="field">
              <label>Main Guest Name</label>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>

            <div className="row">
              <div className="field">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Attendance</label>
              <select
                value={form.attendance}
                onChange={(e) => updateField('attendance', e.target.value)}
              >
                <option>Yes</option>
                <option>No</option>
                <option>Maybe</option>
              </select>
            </div>

            <div className="status-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <strong>Family Members</strong>
                <button type="button" className="secondary small" onClick={addMember}>
                  + Add member
                </button>
              </div>

              <div className="note">Duplicate names in this submission will be highlighted.</div>

              {form.family_members.map((member, index) => (
                <div
                  key={index}
                  className={`member ${duplicateIndexes.has(index) ? 'duplicate' : ''}`}
                >
                  <div className="member-head">
                    <strong>Member {index + 1}</strong>
                    <button
                      type="button"
                      className="ghost small"
                      onClick={() => removeMember(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="row">
                    <div className="field">
                      <label>Name</label>
                      <input
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Relation</label>
                      <input
                        value={member.relation}
                        onChange={(e) => updateMember(index, 'relation', e.target.value)}
                        placeholder="Self / Spouse / Child"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="field">
                      <label>Food Preference</label>
                      <select
                        value={member.food}
                        onChange={(e) => updateMember(index, 'food', e.target.value)}
                      >
                        <option>Veg</option>
                        <option>Non-Veg</option>
                        <option>Vegan</option>
                        <option>Jain</option>
                        <option>Kids Meal</option>
                        <option>No Preference</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Notes</label>
                      <input
                        value={member.notes}
                        onChange={(e) => updateMember(index, 'notes', e.target.value)}
                        placeholder="Allergy / special note"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="field">
              <label>Suggestions</label>
              <textarea
                value={form.suggestion}
                onChange={(e) => updateField('suggestion', e.target.value)}
              />
            </div>

            <button className="primary" type="submit">Submit RSVP</button>
          </form>
        </div>

        <div>
          <div className="card">
            <h2 className="section-title">Event Details</h2>
            <p><strong>Event:</strong> {eventData.event_name || 'Eid Celebration'}</p>
            <p><strong>Venue:</strong> {eventData.venue || '68 Macarthur St'}</p>
            <p><strong>Date:</strong> {eventData.event_date || '-'}</p>
            <p><strong>Time:</strong> {eventData.event_time || '-'}</p>
            <p><strong>Status:</strong> {eventData.event_status || '-'}</p>
          </div>

          <div className="admin-toggle">
            <button className="ghost" onClick={() => setShowAdmin((v) => !v)}>
              {showAdmin ? 'Hide Admin' : 'Open Admin'}
            </button>
          </div>

          {showAdmin && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="section-title">Admin Event Update</h2>

              {!adminUnlocked ? (
                <form onSubmit={unlockAdmin}>
                  <div className="field">
                    <label>Admin Password</label>
                    <input
                      type="password"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                    />
                  </div>
                  <button className="primary" type="submit">Unlock</button>
                </form>
              ) : (
                <form onSubmit={updateEvent}>
                  <div className="field">
                    <label>Event Name</label>
                    <input
                      value={eventData.event_name || ''}
                      onChange={(e) => setEventData((p) => ({ ...p, event_name: e.target.value }))}
                    />
                  </div>

                  <div className="row">
                    <div className="field">
                      <label>Event Date</label>
                      <input
                        value={eventData.event_date || ''}
                        onChange={(e) => setEventData((p) => ({ ...p, event_date: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label>Event Time</label>
                      <input
                        value={eventData.event_time || ''}
                        onChange={(e) => setEventData((p) => ({ ...p, event_time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Venue</label>
                    <input
                      value={eventData.venue || ''}
                      onChange={(e) => setEventData((p) => ({ ...p, venue: e.target.value }))}
                    />
                  </div>

                  <div className="field">
                    <label>Menu</label>
                    <textarea
                      value={eventData.menu || ''}
                      onChange={(e) => setEventData((p) => ({ ...p, menu: e.target.value }))}
                    />
                  </div>

                  <div className="field">
                    <label>Status</label>
                    <select
                      value={eventData.event_status || 'Active'}
                      onChange={(e) => setEventData((p) => ({ ...p, event_status: e.target.value }))}
                    >
                      <option>Active</option>
                      <option>Closed</option>
                    </select>
                  </div>

                  <button className="primary" type="submit" disabled={adminSaving}>
                    {adminSaving ? 'Saving...' : 'Update Event'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="footer-space" />
    </div>
  );
}
