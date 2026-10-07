import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Heart, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Calendar, 
  Clock, 
  Layers, 
  CheckCircle, 
  Award,
  Search,
  HandHeart,
  Shield,
  MapPin
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

export default function Home() {
  const [stats, setStats] = useState({
    total_volunteers: 0,
    total_services: 0,
    total_events: 0,
    total_hours: 0
  });
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, servicesRes, eventsRes] = await Promise.all([
          api.get('/stats/summary'),
          api.get('/services?status=ACTIVE'),
          api.get('/events?status=UPCOMING')
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (servicesRes.data.success) setFeaturedServices(servicesRes.data.services.slice(0, 3));
        if (eventsRes.data.success) setFeaturedEvents(eventsRes.data.events.slice(0, 3));
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-slate-50 pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200/60">
        {/* Soft background ambient gradient lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-400/15 via-accent-500/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-accent-600" />
            <span>Civic Engagement & Impact Portal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Serve Your Community. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 bg-clip-text text-transparent">
              Create an Impact.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover community services, request assistance, join volunteer activities, and track your verified civic participation with real-time impact scores.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/25 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Explore Services</span>
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <HandHeart className="w-4 h-4 text-accent-600" />
              <span>Become a Volunteer</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME IMPACT STATISTICS (Database-Driven) */}
      <section className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.total_volunteers}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Active Volunteers
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center text-accent-700 mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.total_services}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Community Services
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.total_events}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Events Conducted
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.total_hours} <span className="text-sm font-normal text-slate-500">hrs</span>
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Volunteer Hours Logged
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              Simple 3-Step Process
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How ServeHub Works
            </h3>
            <p className="text-slate-600 text-sm mt-3">
              Designed to connect neighborhood needs directly with motivated volunteers and organized civic resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 font-black text-lg flex items-center justify-center mb-6">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Find a Cause or Need</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Browse localized health drives, academic tutoring, environment restorations, or elderly companion programs with simple category filters.
              </p>
            </div>

            <div className="relative bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent-50 border border-accent-200 text-accent-700 font-black text-lg flex items-center justify-center mb-6">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Participate & Volunteer</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Request a service for your family or apply to volunteer. Secure transactions guarantee seat availability and prevent duplicate bookings.
              </p>
            </div>

            <div className="relative bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-lg flex items-center justify-center mb-6">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Make an Impact</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Log completed hours, receive administrative verifications, and earn rule-based Community Impact Scores celebrating your civic service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED COMMUNITY SERVICES */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
                Active Programs
              </h2>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Community Services
              </h3>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              <span>View all services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between hover:shadow-card transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                      {service.category_name}
                    </span>
                    <StatusBadge status={service.status} />
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-2">
                    {service.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[150px]">{service.location}</span>
                  </div>

                  <Link
                    to={`/services/${service.id}`}
                    className="font-bold text-brand-600 hover:text-brand-700"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-16 bg-gradient-to-r from-brand-700 via-brand-600 to-accent-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to Make a Difference in Your Neighborhood?
          </h2>
          <p className="text-brand-100 text-base max-w-2xl mx-auto mb-8">
            Join hundreds of local residents and volunteers making tangible community progress every single day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-white text-brand-700 hover:bg-brand-50 font-bold text-sm shadow-lg shadow-black/10 transition-all hover:scale-105"
            >
              Sign Up as Volunteer
            </Link>
            <Link
              to="/events"
              className="px-8 py-3.5 rounded-xl bg-brand-800/60 hover:bg-brand-800 text-white font-bold text-sm border border-brand-400/30 transition-all"
            >
              View Community Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
