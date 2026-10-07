import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Award,
  HandHeart
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [userState, setUserState] = useState({ isRegistered: false, hasAppliedAsVolunteer: false });
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Volunteer Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [applying, setApplying] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
        if (res.data.userState) setUserState(res.data.userState);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    setRegistering(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post(`/events/${id}/register`);
      if (res.data.success) {
        setMessage({ text: 'Registration confirmed! Your seat is secured.', type: 'success' });
        fetchEvent();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to register',
        type: 'error'
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleApplyVolunteer = async (e) => {
    e.preventDefault();
    setApplying(true);

    try {
      const res = await api.post(`/volunteer/opportunities/${id}/apply`, { motivation });
      if (res.data.success) {
        setMessage({ text: 'Volunteer application submitted successfully for review!', type: 'success' });
        setApplyModalOpen(false);
        fetchEvent();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to submit volunteer application',
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
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Event Not Found</h2>
        <Link to="/events" className="text-sm font-bold text-brand-600 hover:text-brand-700">
          ← Back to Community Events
        </Link>
      </div>
    );
  }

  const isFull = event.available_slots <= 0;

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Events</span>
        </Link>

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

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-10 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-50 text-accent-700 border border-accent-200">
              {event.category_name}
            </span>
            <StatusBadge status={event.status} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            {event.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 mb-8 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-800">Date & Time</div>
                <div>{new Date(event.event_date).toLocaleDateString()}</div>
                <div>{event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-accent-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-800">Location</div>
                <div className="truncate">{event.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-800">Available Seats</div>
                <div>{event.available_slots} / {event.capacity} left</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              Event Details & Agenda
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Volunteer slots badge */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <HandHeart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900">Volunteer Positions</h4>
                <p className="text-[11px] text-amber-700">
                  {event.available_volunteer_slots} of {event.required_volunteers} positions open
                </p>
              </div>
            </div>

            {user?.role === 'VOLUNTEER' && !userState.hasAppliedAsVolunteer && event.available_volunteer_slots > 0 && (
              <button
                onClick={() => setApplyModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Volunteer for Event
              </button>
            )}

            {userState.hasAppliedAsVolunteer && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Applied as Volunteer
              </span>
            )}
          </div>

          {/* Registration Action Bar */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Organized by <span className="font-bold text-slate-700">{event.created_by_name}</span>
            </div>

            {userState.isRegistered ? (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You are Registered for this Event</span>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isFull || registering}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                  isFull
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-accent-600 hover:bg-accent-700 text-white shadow-accent-600/20'
                }`}
              >
                {registering ? 'Booking...' : isFull ? 'Event Full' : 'Register for Event'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Volunteer Application Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply as Volunteer: ${event.title}`}
      >
        <form onSubmit={handleApplyVolunteer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Why would you like to volunteer for this event?
            </label>
            <textarea
              rows={4}
              required
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Tell us about your background or motivation..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-slate-900"
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
              {applying ? 'Submitting...' : 'Submit Volunteer Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
