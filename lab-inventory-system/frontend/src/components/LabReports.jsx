import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TeacherDashboard from './TeacherDashboard';

const LabReports = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Reports Access</h1>
            <p className="text-slate-600 text-lg mb-6">Reports are available only for Teachers and Admins</p>
            <p className="text-sm text-slate-500">Contact your administrator if you need access to reports</p>
          </div>
        </div>
      </div>
    );
  }

  return <TeacherDashboard />;
};

export default LabReports;

