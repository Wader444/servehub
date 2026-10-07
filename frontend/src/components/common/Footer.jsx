import React from 'react';
import { Heart, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">ServeHub</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering local citizens and dedicated volunteers to build stronger, healthier, and more compassionate neighborhoods.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/services" className="hover:text-white transition-colors">Community Services</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Upcoming Events</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Volunteer Opportunities</Link></li>
            </ul>
          </div>

          {/* Core Pillars */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Impact Areas</h4>
            <ul className="space-y-2 text-xs">
              <li>Healthcare & Wellness Camps</li>
              <li>Free Education & STEM Tutoring</li>
              <li>Environmental Cleanups</li>
              <li>Pantry & Food Distribution</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Civic Desk</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>Civic Center Plaza, Suite 400</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>support@servehub.org</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>+1 (555) 019-2834</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} ServeHub Community Management Portal. Academic Full-Stack Project.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Built with React 18 & Express.js</span>
            <span>•</span>
            <span>MySQL 8 RDBMS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
