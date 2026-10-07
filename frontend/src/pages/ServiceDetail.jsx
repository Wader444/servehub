import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Calendar, 
  Users, 
  UserCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await api.get(`/services/${id}`);
      if (res.data.success) {
        setService(res.data.service);
      }
    } catch (err) {
      console.error('Failed to fetch service detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/services/${id}` } } });
      return;
    }
    setRequestNotes('');
    setRequestSuccess('');
    setRequestError('');
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    setRequestError('');

    try {
      const res = await api.post(`/requests/service/${id}`, {
        request_notes: requestNotes
      });
      if (res.data.success) {
        setRequestSuccess('Service request submitted successfully! An administrator will review your application.');
        setTimeout(() => {
          setRequestModalOpen(false);
        }, 2000);
      }
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Service Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The requested service does not exist or has been removed.</p>
        <Link to="/services" className="text-sm font-bold text-brand-600 hover:text-brand-700">
          ← Back to Community Services
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Services</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-10 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              {service.category_name}
            </span>
            <StatusBadge status={service.status} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            {service.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 mb-8 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-800">Date</div>
                <div>{new Date(service.service_date).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-accent-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-800">Location</div>
                <div className="truncate">{service.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-800">Capacity</div>
                <div>Max {service.max_participants} Participants</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              Description & Objectives
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {service.description}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Coordinated by <span className="font-bold text-slate-700">{service.created_by_name}</span>
            </div>

            <button
              onClick={handleOpenRequest}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all cursor-pointer"
            >
              Request This Service
            </button>
          </div>
        </div>
      </div>

      {/* Service Request Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title={`Request Service: ${service.title}`}
      >
        {requestSuccess ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900 mb-1">Request Submitted!</h4>
            <p className="text-xs text-slate-600">{requestSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            {requestError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-3">
                Please provide any specific requirements or notes for the organizing team.
              </p>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Notes / Special Requirements
              </label>
              <textarea
                rows={4}
                required
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="Describe why you need this service or any specifics..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRequest}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submittingRequest ? 'Submitting...' : 'Confirm Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
