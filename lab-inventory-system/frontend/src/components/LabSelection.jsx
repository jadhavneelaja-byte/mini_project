import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LabSelection = () => {
  const [labs, setLabs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const res = await axios.get('/api/labs');
      setLabs(res.data);
    } catch (error) {
      console.error('Error fetching labs:', error);
    }
  };

  const selectLab = (labName) => {
    navigate(`/student/lab/${encodeURIComponent(labName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-sm p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-bold">Student Access</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">Select a Lab to Begin</h1>
              <p className="mt-2 max-w-2xl text-slate-600">Choose the lab you want to explore, book equipment, and manage your student inventory requests</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 shadow-lg border border-blue-200">
              {labs.length > 0 ? (
                <span className="font-bold text-blue-800">{labs.length} labs available</span>
              ) : (
                <span className="font-bold text-slate-600">Finding labs...</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {labs.map((lab) => (
              <button
                key={lab.id}
                type="button"
                onClick={() => selectLab(lab.name)}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl hover:from-blue-50 hover:to-purple-50 transform"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-sky-100 rounded-lg">
                      <span className="text-sky-700 font-semibold">Lab</span>
                    </div>
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-600">Lab</p>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{lab.name}</h2>
                  <p className="text-sm leading-6 text-slate-600">Tap to enter {lab.name} Lab and view equipment, bookings, and QR scan features</p>
                </div>
                <div className="mt-6 inline-flex items-center gap-3 text-sm font-bold text-slate-700">
                  <span>Enter Lab</span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white transition group-hover:scale-110 shadow-lg">→</span>
                </div>
              </button>
            ))}

            {labs.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-12 text-center">
                <div className="text-6xl mb-4 font-bold text-slate-400">Lab</div>
                <p className="text-slate-600 font-medium">No labs found yet</p>
                <p className="text-sm text-slate-500 mt-2">Please refresh the page or contact your administrator if this persists</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabSelection;

