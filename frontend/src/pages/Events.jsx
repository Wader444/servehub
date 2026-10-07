import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Search,
  HandHeart
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, [selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = '/events?status=UPCOMING';
      if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/events' } } });
      return;
    }

    setRegisteringId(eventId);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post(`/events/${eventId}/register`);
      if (res.data.success) {
        setMessage({ text: 'Registration confirmed! Check your dashboard for details.', type: 'success' });
        fetchEvents();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to register for this event',
        type: 'error'
      });
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Community Events & Drives
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Join hands in neighborhood tree plantations, medical camps, and food drives.
          </p>
        </div>

        {/* Global Toast Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events by title or location..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Events Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no community events scheduled in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isFull = event.available_slots <= 0;

              return (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between hover:shadow-card transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-50 text-accent-700 border border-accent-200">
                        {event.category_name}
                      </span>
                      <StatusBadge status={event.status} />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 mb-6 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      {/* Available slots progress bar */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>Available Seats</span>
                          <span className={isFull ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                            {event.available_slots} / {event.capacity}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isFull ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, ((event.capacity - event.available_slots) / event.capacity) * 100)
                              )}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={isFull || registeringId === event.id}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer text-center ${
                          isFull
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-accent-600 hover:bg-accent-700 text-white'
                        }`}
                      >
                        {registeringId === event.id ? 'Booking...' : isFull ? 'Event Full' : 'Register Now'}
                      </button>

                      <Link
                        to={`/events/${event.id}`}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
