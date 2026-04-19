import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, QrCode, X, AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

const QRScanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState('');
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannerReady, setScannerReady] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Load html5-qrcode library
  useEffect(() => {
    // Check if library is already loaded
    if (window.Html5Qrcode) {
      setLibraryLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.onload = () => {
      console.log('QR scanner library loaded');
      setLibraryLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load QR scanner library');
      setError('Failed to load QR scanner library. Please check your internet connection.');
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Stop scanning and cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  const startScanning = useCallback(async () => {
    if (!libraryLoaded || !scannerRef.current) return;
    
    setError('');
    setScannedData(null);
    setEquipment(null);
    setCameraError('');
    
    try {
      const Html5Qrcode = window.Html5Qrcode;
      if (!Html5Qrcode) {
        throw new Error('QR scanner library not loaded');
      }

      const html5QrCode = new Html5Qrcode(scannerRef.current.id);
      html5QrCodeRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleScanSuccess(decodedText, html5QrCode);
        },
        (errorMessage) => {
          // Ignore scan errors, they're normal during scanning
        }
      );
      
      setScannerReady(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setCameraError('Failed to start camera. Please allow camera access and try again.');
      setError('Failed to start camera. Please allow camera access and try again.');
    }
  }, [libraryLoaded]);

  // Auto-start camera when library loads and scanner div is ready
  useEffect(() => {
    if (libraryLoaded && scannerRef.current && !scannerReady && !equipment && !cameraError && !html5QrCodeRef.current) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        startScanning();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [libraryLoaded, scannerReady, equipment, cameraError, startScanning]);

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop();
        setScannerReady(false);
        setScannedData(null);
        setEquipment(null);
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleScanSuccess = async (decodedText, html5QrCode) => {
    try {
      // Stop scanning immediately after successful scan
      await html5QrCode.stop();
      setScannerReady(false);
      html5QrCodeRef.current = null;
      
      setScannedData(decodedText);
      
      // Extract equipment ID from URL or use direct ID
      let equipmentId;
      if (decodedText.includes('equipment?id=')) {
        equipmentId = decodedText.split('equipment?id=')[1];
      } else if (decodedText.includes('/equipment/')) {
        equipmentId = decodedText.split('/equipment/')[1];
      } else {
        equipmentId = decodedText;
      }
      
      if (!equipmentId) {
        throw new Error('Invalid QR code format');
      }

      // Fetch equipment details
      setLoading(true);
      const response = await axios.get(`/api/equipment/${equipmentId}`);
      setEquipment(response.data);
      setLoading(false);
      
      showSuccess('Equipment found!');
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to fetch equipment details');
      showError('Failed to fetch equipment details');
    }
  };

  const handleRequestEquipment = async () => {
    if (!equipment) return;

    try {
      setLoading(true);
      const response = await axios.post('/api/request-equipment', {
        equipment_id: equipment.id,
        quantity: 1
      });
      
      showSuccess('Equipment request sent successfully!');
      setEquipment(null);
      setScannedData(null);
      setLoading(false);
    } catch (err) {
      console.error('Error requesting equipment:', err);
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to request equipment');
      showError(err.response?.data?.message || 'Failed to request equipment');
    }
  };

  const handleScanAnother = () => {
    setEquipment(null);
    setScannedData(null);
    setError('');
    setCameraError('');
    setScannerReady(false);
    // Auto-restart scanning
    setTimeout(() => {
      startScanning();
    }, 300);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'borrowed': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'damaged': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'borrowed': return <Clock className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      case 'damaged': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  // Show loading state while library is loading
  if (!libraryLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading QR Scanner...</p>
        </div>
      </div>
    );
  }

  // Show equipment details if equipment was found
  if (equipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl shadow-lg">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">QR Code Scanner</h1>
                <p className="text-slate-600">Scan equipment QR codes to view details and request items</p>
              </div>
            </div>
          </div>

          {/* Equipment Details */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Equipment Details</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(equipment.status)}`}>
                {getStatusIcon(equipment.status)}
                {equipment.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{equipment.name}</h3>
                <p className="text-slate-600 mb-4">{equipment.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-medium">{equipment.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Lab:</span>
                    <span className="font-medium">{equipment.lab_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Unique ID:</span>
                    <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{equipment.unique_id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Health Score:</span>
                    <span className={`font-medium ${equipment.health_score >= 70 ? 'text-green-600' : equipment.health_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {equipment.health_score}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Availability</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Quantity:</span>
                    <span className="font-semibold">{equipment.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Available:</span>
                    <span className="font-semibold text-green-600">{equipment.available_quantity}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(equipment.available_quantity / equipment.quantity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {equipment.status === 'available' && equipment.available_quantity > 0 ? (
                <button
                  onClick={handleRequestEquipment}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform transition hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Request Equipment
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-500 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Not Available
                </button>
              )}
              
              <button
                onClick={handleScanAnother}
                className="flex-1 px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors duration-200"
              >
                Scan Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main scanner UI - always render the scanner container
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl shadow-lg">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">QR Code Scanner</h1>
              <p className="text-slate-600">Scan equipment QR codes to view details and request items</p>
            </div>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-6">
          <div className="text-center">
            {scannerReady && (
              <div className="mb-4">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-600 mt-4">Scanning...</p>
              </div>
            )}
            
            <div className="relative w-full max-w-md mx-auto" style={{ height: '300px' }}>
              <div 
                ref={scannerRef} 
                id="qr-scanner" 
                className="w-full h-full rounded-xl overflow-hidden border-2 border-slate-300"
              ></div>
              {scannerReady && (
                <div className="absolute inset-0 pointer-events-none border-2 border-green-400 rounded-xl" style={{ boxShadow: 'inset 0 0 0 2px rgba(74, 222, 128, 0.5)' }}></div>
              )}
            </div>
            
            {scannerReady && (
              <button
                onClick={stopScanning}
                className="mt-6 px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <X className="w-4 h-4" />
                Stop Scanning
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && !cameraError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Camera Error / Permission Prompt */}
        {cameraError && !scannerReady && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Camera Access Required</h3>
            <p className="text-slate-600 mb-6">{cameraError}</p>
            <button
              onClick={startScanning}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-sky-600 transform transition hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
            >
              <Camera className="w-5 h-5" />
              Retry Camera Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;