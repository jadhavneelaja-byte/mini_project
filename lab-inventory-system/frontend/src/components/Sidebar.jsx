import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ClipboardList, BarChart3, LogOut, AlertTriangle, Wrench, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  const menuItems = [
    ...(isStudent ? [{ icon: Home, label: 'Choose Lab', path: '/student' }] : []),
    ...(isAdmin ? [{ icon: Home, label: 'Dashboard', path: '/admin' }] : []),
    ...(isTeacher ? [{ icon: Home, label: 'Dashboard', path: '/teacher?view=dashboard' }] : []),
    ...(isAdmin ? [{ icon: Package, label: 'Inventory', path: '/admin?view=inventory' }] : []),
    ...(isAdmin ? [{ icon: ClipboardList, label: 'Pending Requests', path: '/admin?view=pending' }] : []),
    ...(isAdmin ? [{ icon: BarChart3, label: 'Usage Logs', path: '/admin?view=usage' }] : []),
    ...(isAdmin ? [{ icon: AlertTriangle, label: 'Damage Reports', path: '/admin?view=damage' }] : []),
    ...(isAdmin ? [{ icon: Wrench, label: 'Health Monitoring', path: '/admin?view=health' }] : []),
    ...(isAdmin ? [{ icon: TrendingUp, label: 'Demand Analytics', path: '/admin?view=demand' }] : []),
    ...(isTeacher ? [{ icon: BarChart3, label: 'Usage Logs', path: '/teacher?view=usage' }] : []),
    ...(isTeacher ? [{ icon: AlertTriangle, label: 'Damage Reports', path: '/teacher?view=damage' }] : []),
  ];

  return (
    <div className="w-72 bg-white h-screen p-6 flex flex-col shadow-xl border-r border-slate-200">
      {/* Logo Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Lab Inventory</h2>
            <p className="text-xs text-slate-500">Management System</p>
          </div>
        </div>
        
        {/* User Card */}
        <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 flex items-center justify-center text-white font-bold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                {user?.role || 'Role'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || location.search.includes(item.path.split('?')[1] || '');
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 font-medium border border-red-200"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-sm">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;

