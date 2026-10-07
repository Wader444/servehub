import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardList, 
  Calendar, 
  Bell, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

export default function UserDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reqRes, regRes, notifRes] = await Promise.all([
        api.get('/requests/my'),
        api.get('/events/user/my-registrations'),
        api.get('/notifications')
      ]);

      if (reqRes.data.success) setRequests(reqRes.data.requests);
      if (regRes.data.success) setRegistrations(regRes.data.registrations);
      if (notifRes.data.success) setNotifications(notifRes.data.notifications);
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading your civic records...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const completedRequests = requests.filter(r => r.status === 'COMPLETED' || r.status === 'APPROVED');

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Track your requested services, registered community events, and latest updates.
          </p>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{pendingRequests.length}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Requests</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{completedRequests.length}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved / Completed</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{registrations.length}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Events</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Requests History & Events */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Service Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-brand-600" />
                  <h2 className="text-base font-bold text-slate-900">My Service Requests</h2>
                </div>
                <span className="text-xs font-bold text-slate-400">{requests.length} total</span>
              </div>

              {requests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  You haven't submitted any service requests yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-6">Service</th>
                        <th className="py-3 px-4">Requested On</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-6">Admin Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-semibold text-slate-900">
                            {req.service_title}
                            <div className="text-[11px] font-normal text-slate-400">{req.category_name}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {new Date(req.requested_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <StatusBadge status={req.status} size="xs" />
                          </td>
                          <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                            {req.admin_feedback || 'Under review'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2. Registered Events */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent-600" />
                  <h2 className="text-base font-bold text-slate-900">My Registered Events</h2>
                </div>
                <span className="text-xs font-bold text-slate-400">{registrations.length} total</span>
              </div>

              {registrations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  You have not registered for any upcoming events yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {registrations.map((reg) => (
                    <div key={reg.registration_id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {reg.category_name}
                          </span>
                          <StatusBadge status={reg.registration_status} size="xs" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{reg.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(reg.event_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{reg.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Notifications */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-brand-600" />
                  <h2 className="text-base font-bold text-slate-900">Notifications</h2>
                </div>
                <span className="text-xs font-bold text-slate-400">{notifications.length}</span>
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No notifications yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => !notif.is_read && handleMarkNotificationRead(notif.id)}
                      className={`p-4 transition-colors cursor-pointer ${
                        notif.is_read ? 'bg-white opacity-70' : 'bg-brand-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-1.5">{notif.message}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
