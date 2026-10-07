import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Heart, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  ClipboardList,
  Award
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? 'text-brand-600 font-bold border-b-2 border-brand-600 pb-1'
        : 'text-slate-600 hover:text-brand-600 pb-1'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                ServeHub
              </span>
              <span className="text-[10px] font-medium text-slate-400 -mt-1 tracking-wider uppercase">
                Community Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/services" className={navLinkClass}>
              Services
            </NavLink>
            <NavLink to="/events" className={navLinkClass}>
              Events
            </NavLink>

            {isAuthenticated && (
              <>
                {user.role === 'ADMIN' && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                      Admin Portal
                    </span>
                  </NavLink>
                )}

                {user.role === 'VOLUNTEER' && (
                  <NavLink to="/volunteer" className={navLinkClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-accent-600" />
                      Volunteer Desk
                    </span>
                  </NavLink>
                )}

                {user.role === 'USER' && (
                  <NavLink to="/dashboard" className={navLinkClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-brand-600" />
                      My Requests
                    </span>
                  </NavLink>
                )}
              </>
            )}
          </nav>

          {/* User Auth Buttons / Profile Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">{user.full_name}</p>
                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'VOLUNTEER' ? 'bg-accent-100 text-accent-700' :
                      'bg-brand-100 text-brand-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs shadow-brand-600/20 transition-all hover:shadow-md cursor-pointer"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-brand-600 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-3">
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-brand-600"
          >
            Services
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-brand-600"
          >
            Events
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs font-semibold text-slate-500 mb-1">
                Signed in as <span className="text-slate-800 font-bold">{user.full_name} ({user.role})</span>
              </div>
              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-brand-600">
                  Admin Dashboard
                </Link>
              )}
              {user.role === 'VOLUNTEER' && (
                <Link to="/volunteer" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-brand-600">
                  Volunteer Dashboard
                </Link>
              )}
              {user.role === 'USER' && (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-brand-600">
                  User Dashboard
                </Link>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left py-2 text-sm font-semibold text-rose-600 flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold border border-slate-200 rounded-xl text-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold bg-brand-600 text-white rounded-xl shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
