import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Layers, 
  Calendar, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  Award,
  BarChart3,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  APPROVED: '#0ea5e9',
  COMPLETED: '#10b981',
  REJECTED: '#f43f5e'
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({});
  const [chartData, setChartData] = useState({ requestsByStatus: [], servicesByCategory: [] });
  const [requests, setRequests] = useState([]);
  const [volunteerApps, setVolunteerApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  // Modal States
  const [newServiceModalOpen, setNewServiceModalOpen] = useState(false);
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [logHoursModalOpen, setLogHoursModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Service Form
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    category_id: 1,
    location: '',
    service_date: new Date().toISOString().split('T')[0],
    max_participants: 50
  });

  // New Event Form
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category_id: 1,
    location: '',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '13:00',
    capacity: 50,
    required_volunteers: 5
  });

  // Log Hours Form
  const [hoursForm, setHoursForm] = useState({
    volunteer_id: '',
    event_id: '',
    hours_logged: 4,
    activity_date: new Date().toISOString().split('T')[0],
    notes: 'Volunteered with excellence'
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [dashRes, reqRes, appsRes, catRes, eventsRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/requests'),
        api.get('/volunteer/admin/applications'),
        api.get('/services/categories'),
        api.get('/events'),
        api.get('/admin/users')
      ]);

      if (dashRes.data.success) {
        setMetrics(dashRes.data.metrics);
        setChartData(dashRes.data.charts);
      }
      if (reqRes.data.success) setRequests(reqRes.data.requests);
      if (appsRes.data.success) setVolunteerApps(appsRes.data.applications);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (eventsRes.data.success) setEvents(eventsRes.data.events);
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
        const firstVol = usersRes.data.users.find(u => u.role === 'VOLUNTEER');
        if (firstVol) setHoursForm(prev => ({ ...prev, volunteer_id: firstVol.id }));
      }
      if (eventsRes.data.events.length > 0) {
        setHoursForm(prev => ({ ...prev, event_id: eventsRes.data.events[0].id }));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      const res = await api.patch(`/requests/${requestId}/status`, {
        status,
        admin_feedback: `Status changed to ${status} by admin.`
      });
      if (res.data.success) {
        setActionMessage({ text: `Request #${requestId} marked as ${status}`, type: 'success' });
        fetchAdminData();
      }
    } catch (err) {
      setActionMessage({ text: 'Failed to update request status', type: 'error' });
    }
  };

  const handleUpdateAppStatus = async (appId, status) => {
    try {
      const res = await api.patch(`/volunteer/admin/applications/${appId}`, {
        status,
        admin_remarks: `Application ${status.toLowerCase()} by administration.`
      });
      if (res.data.success) {
        setActionMessage({ text: `Volunteer application #${appId} ${status}`, type: 'success' });
        fetchAdminData();
      }
    } catch (err) {
      setActionMessage({ text: 'Failed to update application status', type: 'error' });
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/services', serviceForm);
      if (res.data.success) {
        setActionMessage({ text: 'Community service created successfully!', type: 'success' });
        setNewServiceModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      setActionMessage({ text: err.response?.data?.message || 'Failed to create service', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/events', eventForm);
      if (res.data.success) {
        setActionMessage({ text: 'Community event created successfully!', type: 'success' });
        setNewEventModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      setActionMessage({ text: err.response?.data?.message || 'Failed to create event', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogHours = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/volunteer/admin/hours', hoursForm);
      if (res.data.success) {
        setActionMessage({
          text: `Hours logged! Volunteer's new Impact Score is ${res.data.stats.impact_score} pts.`,
          type: 'success'
        });
        setLogHoursModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      setActionMessage({ text: err.response?.data?.message || 'Failed to log hours', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading admin management console...</p>
      </div>
    );
  }

  // Format Recharts Pie Data
  const pieData = (chartData.requestsByStatus || []).map(item => ({
    name: item.status,
    value: parseInt(item.count, 10)
  }));

  // Format Recharts Bar Data
  const barData = (chartData.servicesByCategory || []).map(item => ({
    category: item.category,
    services: parseInt(item.count, 10)
  }));

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administration Management Console
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Oversee community services, events, requests moderation, and verified volunteer hours.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setNewServiceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Service</span>
            </button>

            <button
              onClick={() => setNewEventModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>New Event</span>
            </button>

            <button
              onClick={() => setLogHoursModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Log Volunteer Hours</span>
            </button>
          </div>
        </div>

        {/* Global Toast Alert */}
        {actionMessage.text && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold ${
            actionMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage({ text: '', type: '' })} className="hover:opacity-75">✕</button>
          </div>
        )}

        {/* 1. METRICS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total_users || 0}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volunteers</div>
            <div className="text-2xl font-black text-brand-600 mt-1">{metrics.total_volunteers || 0}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Services</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total_services || 0}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Events</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total_events || 0}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Requests</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{metrics.pending_requests || 0}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Hours Verified</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.total_hours_logged || 0}</div>
          </div>
        </div>

        {/* 2. RECHARTS ANALYTICS GRAPHS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* A. Bar Chart: Services by Category */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Services by Category</h3>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="services" fill="#0891b2" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* B. Donut Chart: Requests by Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Requests Breakdown by Status</h3>
              <ClipboardList className="w-4 h-4 text-slate-400" />
            </div>
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px' }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. MODERATION TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* A. Service Requests Moderation */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Service Requests Moderation</h3>
              <span className="text-xs text-slate-400 font-bold">{requests.length} total</span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Citizen</th>
                    <th className="py-2.5 px-4">Service</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {req.user_name}
                        <div className="text-[10px] font-normal text-slate-400">{req.user_email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[140px] truncate">
                        {req.service_title}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={req.status} size="xs" />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              className="px-2 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[10px] cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {req.status === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] cursor-pointer"
                          >
                            Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* B. Volunteer Applications Moderation */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Volunteer Applications</h3>
              <span className="text-xs text-slate-400 font-bold">{volunteerApps.length} total</span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Volunteer</th>
                    <th className="py-2.5 px-4">Event</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {volunteerApps.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {app.volunteer_name}
                        <div className="text-[10px] font-normal text-slate-400">{app.volunteer_email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[140px] truncate">
                        {app.event_title}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={app.status} size="xs" />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        {app.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'APPROVED')}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'REJECTED')}
                              className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE SERVICE MODAL */}
      <Modal isOpen={newServiceModalOpen} onClose={() => setNewServiceModalOpen(false)} title="Create Community Service">
        <form onSubmit={handleCreateService} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Service Title</label>
            <input
              type="text"
              required
              value={serviceForm.title}
              onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900"
              placeholder="e.g. Free Senior Health Checkup"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Category</label>
              <select
                value={serviceForm.category_id}
                onChange={e => setServiceForm({ ...serviceForm, category_id: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Service Date</label>
              <input
                type="date"
                required
                value={serviceForm.service_date}
                onChange={e => setServiceForm({ ...serviceForm, service_date: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Location</label>
            <input
              type="text"
              required
              value={serviceForm.location}
              onChange={e => setServiceForm({ ...serviceForm, location: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900"
              placeholder="e.g. Civic Center Room 204"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={serviceForm.description}
              onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900"
              placeholder="Provide service details and target participants..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setNewServiceModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl">Create</button>
          </div>
        </form>
      </Modal>

      {/* CREATE EVENT MODAL */}
      <Modal isOpen={newEventModalOpen} onClose={() => setNewEventModalOpen(false)} title="Create Community Event">
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900"
              placeholder="e.g. Neighborhood Cleanliness Drive"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Category</label>
              <select
                value={eventForm.category_id}
                onChange={e => setEventForm({ ...eventForm, category_id: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Event Date</label>
              <input
                type="date"
                required
                value={eventForm.event_date}
                onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={eventForm.start_time}
                onChange={e => setEventForm({ ...eventForm, start_time: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={eventForm.end_time}
                onChange={e => setEventForm({ ...eventForm, end_time: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Citizen Capacity</label>
              <input
                type="number"
                min="1"
                required
                value={eventForm.capacity}
                onChange={e => setEventForm({ ...eventForm, capacity: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Required Volunteers</label>
              <input
                type="number"
                min="1"
                required
                value={eventForm.required_volunteers}
                onChange={e => setEventForm({ ...eventForm, required_volunteers: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Location</label>
            <input
              type="text"
              required
              value={eventForm.location}
              onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900"
              placeholder="e.g. Westside Community Park"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={eventForm.description}
              onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setNewEventModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl">Publish Event</button>
          </div>
        </form>
      </Modal>

      {/* LOG VOLUNTEER HOURS MODAL */}
      <Modal isOpen={logHoursModalOpen} onClose={() => setLogHoursModalOpen(false)} title="Verify & Log Volunteer Hours">
        <form onSubmit={handleLogHours} className="space-y-4">
          <p className="text-xs text-slate-500">
            Logging hours triggers the automated formula: <span className="font-mono text-cyan-700 font-bold">Activities × 10 + Hours × 2</span>.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Volunteer</label>
            <select
              value={hoursForm.volunteer_id}
              onChange={e => setHoursForm({ ...hoursForm, volunteer_id: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
            >
              {usersList.filter(u => u.role === 'VOLUNTEER').map(v => (
                <option key={v.id} value={v.id}>{v.full_name} ({v.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Event / Activity</label>
            <select
              value={hoursForm.event_id}
              onChange={e => setHoursForm({ ...hoursForm, event_id: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Hours Completed</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={hoursForm.hours_logged}
                onChange={e => setHoursForm({ ...hoursForm, hours_logged: parseFloat(e.target.value) })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Activity Date</label>
              <input
                type="date"
                required
                value={hoursForm.activity_date}
                onChange={e => setHoursForm({ ...hoursForm, activity_date: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Notes / Verification Remarks</label>
            <input
              type="text"
              value={hoursForm.notes}
              onChange={e => setHoursForm({ ...hoursForm, notes: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setLogHoursModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-white bg-accent-600 rounded-xl">Verify & Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
