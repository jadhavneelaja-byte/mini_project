import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await onLogin(username, password, selectedRole);
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Laboratory Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1581091012217-3c332b9b989c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')"
          }}
        ></div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-transparent to-sky-500/30"></div>

        <div className="max-w-md w-full space-y-8 p-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 via-purple-500 to-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-500">
              <svg className="h-10 w-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-3">
              Lab Inventory System
            </h2>
            <p className="text-slate-600 text-lg font-medium">Select your role to continue</p>
          </div>
          <div className="space-y-6">
            <button
              onClick={() => handleRoleSelect('admin')}
              className="w-full flex items-center justify-center py-5 px-8 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
            >
              <svg className="w-6 h-6 mr-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Admin Login</span>
              <svg className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => handleRoleSelect('teacher')}
              className="w-full flex items-center justify-center py-5 px-8 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
            >
              <svg className="w-6 h-6 mr-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Teacher Login</span>
              <svg className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => handleRoleSelect('student')}
              className="w-full flex items-center justify-center py-5 px-8 border border-transparent rounded-2xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-sky-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
            >
              <svg className="w-6 h-6 mr-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Student Login</span>
              <svg className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-16 left-16 w-12 h-12 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-32 right-24 w-8 h-8 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-700"></div>
      <div className="absolute bottom-24 left-20 w-16 h-16 bg-sky-200 rounded-full opacity-20 animate-pulse delay-300"></div>
      <div className="absolute bottom-16 right-16 w-10 h-10 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>

      <div className="max-w-md w-full space-y-8 p-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-sky-400 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login</h2>
          <p className="text-gray-600">Enter your credentials to continue</p>
        </div>
        <form className="mt-8 space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-sky-400 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 transform transition hover:scale-105"
            >
              Sign In →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

