import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  Gauge,
  History,
  Play,
  Swords,
  Trophy,
  User,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Compass },
    { to: '/compare', label: 'Compare', icon: Swords },
    { to: '/history', label: 'History', icon: History },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: User },
  ];


  return (
    <>
      {/* Top Desktop & Tablet Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-dark-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-apex-cyan via-apex-blue to-apex-violet flex items-center justify-center p-[2px] shadow-glow">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <Gauge className="w-5 h-5 text-apex-cyan group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-extrabold text-xl tracking-wider text-white">
                  APEX<span className="text-apex-cyan">TRACK</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-dark-800 text-apex-cyan/90 border border-apex-cyan/20">
                  v0.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
                Driving Telemetry & Leaderboards
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-dark-800 text-apex-cyan border border-apex-cyan/30 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-dark-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Action Button: Start Drive */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/drive')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-apex-cyan to-apex-blue text-dark-950 font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-glow"
            >
              <Play className="w-4 h-4 fill-dark-950" />
              <span className="tracking-wide">Start Drive</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-dark-700/80 px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                    isActive ? 'text-apex-cyan' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <NavLink
            to="/drive"
            className="flex flex-col items-center py-1 px-3 text-apex-cyan font-bold"
          >
            <div className="w-7 h-7 rounded-full bg-apex-cyan/20 flex items-center justify-center border border-apex-cyan mb-1">
              <Play className="w-3.5 h-3.5 fill-apex-cyan text-apex-cyan" />
            </div>
            <span className="text-[11px]">Drive</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
};
