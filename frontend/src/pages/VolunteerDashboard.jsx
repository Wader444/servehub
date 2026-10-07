import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Briefcase, 
  ArrowUpRight,
  Send,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import ImpactScoreCard from '../components/common/ImpactScoreCard';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ completed_activities: 0, total_hours: 0, impact_score: 0 });
  const [hoursHistory, setHoursHistory] = useState([]);
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const fetchVolunteerData = async () => {
    try {
      const [hoursRes, appsRes, oppsRes] = await Promise.all([
        api.get('/volunteer/hours'),
        api.get('/volunteer/applications'),
        api.get('/volunteer/opportunities')
      ]);

      if (hoursRes.data.success) {
        setStats(hoursRes.data.stats);
        setHoursHistory(hoursRes.data.hours);
      }
      if (appsRes.data.success) setApplications(appsRes.data.applications);
      if (oppsRes.data.success) setOpportunities(oppsRes.data.opportunities);
    } catch (err) {
      console.error('Failed to load volunteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = (opp) => {
    setSelectedOpportunity(opp);
    setMotivation('');
    setMessage({ text: '', type: '' });
    setApplyModalOpen(true);
  };

  const handleSubmitApply = async (e) => {
    e.preventDefault();
    if (!selectedOpportunity) return;
    setApplying(true);

    try {
      const res = await api.post(`/volunteer/opportunities/${selectedOpportunity.id}/apply`, { motivation });
      if (res.data.success) {
        setMessage({ text: 'Application submitted successfully!', type: 'success' });
        setTimeout(() => setApplyModalOpen(false), 1500);
        fetchVolunteerData();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to submit application',
        type: 'error'
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading volunteer profile & records...</p>
      </div>
    );
  }

  // Format hours data for Recharts
  const chartData = hoursHistory.map(h => ({
    date: new Date(h.activity_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    hours: parseFloat(h.hours_logged),
    event: h.event_title
  })).reverse();

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Volunteer Impact Desk
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Logged in as <span className="font-bold text-slate-800">{user?.full_name}</span>. Track your service hours and civic scores.
          </p>
        </div>

        {/* 1. STANDOUT COMMUNITY IMPACT SCORE BANNER */}
        <ImpactScoreCard
          score={stats.impact_score}
          completedActivities={stats.completed_activities}
          totalHours={stats.total_hours}
        />

        {/* 2. VOLUNTEER ACTIVITY CHART (Recharts) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Volunteer Hours Activity</h3>
              <p className="text-xs text-slate-500">History of verified civic hours per event</p>
            </div>
            <div className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
              {stats.total_hours} Total Hours
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              No verified volunteer hours recorded yet. Join upcoming opportunities below!
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="hours" fill="#0891b2" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 3. OPPORTUNITIES & MY APPLICATIONS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* A. Open Volunteer Opportunities */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent-600" />
                <h3 className="text-base font-bold text-slate-900">Open Volunteer Positions</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">{opportunities.length} open</span>
            </div>

            {opportunities.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No volunteer opportunities currently open.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent-50 text-accent-700">
                          {opp.category_name}
                        </span>
                        <span className="text-[11px] font-bold text-amber-700">
                          {opp.available_volunteer_slots} slots left
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{opp.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{new Date(opp.event_date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{opp.location}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenApply(opp)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                    >
                      <span>Apply</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* B. My Applications */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900">My Applications</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">{applications.length} submitted</span>
            </div>

            {applications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                You have not applied to any volunteer opportunities yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <div key={app.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={app.status} size="xs" />
                        <span className="text-[10px] text-slate-400">
                          Applied: {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{app.event_title}</h4>
                      {app.admin_remarks && (
                        <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded-lg">
                          Remarks: {app.admin_remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Volunteer Application Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply to Volunteer: ${selectedOpportunity?.title || ''}`}
      >
        {message.text ? (
          <div className={`p-4 rounded-xl text-center text-xs font-bold ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {message.text}
          </div>
        ) : (
          <form onSubmit={handleSubmitApply} className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-3">
                Let the event organizers know how your skills and availability fit this activity.
              </p>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Motivation / Experience
              </label>
              <textarea
                rows={4}
                required
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Share your motivation, relevant skills, or prior volunteering experience..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-600 text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={applying}
                className="px-5 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
