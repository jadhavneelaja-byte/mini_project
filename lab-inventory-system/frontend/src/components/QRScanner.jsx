import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, QrCode, X, AlertCircle, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const QRScanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState('');
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannerReady, setScannerReady] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const { showSuccess, showError } = useNotification();

  // Check camera permission on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        if (navigator.permissions) {
          const status = await navigator.permissions.query({ name: 'camera' });
          setCameraPermission(status.state);
          status.onchange = () => {
            setCameraPermission(status.state);
          };
        }
      } catch (err) {
        console.log('Camera permission check not supported:', err);
      }
    };
    checkCameraPermission();
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
    if (!scannerRef.current) {
      console.log('Cannot start: scanner ref not available');
      return;
    }
    
    console.log('Starting camera...');
    setError('');
    setScannedData(null);
    setEquipment(null);
    setCameraError('');
    
    try {
      console.log('Creating Html5Qrcode instance...');
      const html5QrCode = new Html5Qrcode(scannerRef.current.id);
      html5QrCodeRef.current = html5QrCode;
      
      console.log('Attempting to start camera with facingMode: environment');
      
      // Start camera directly - simpler approach for mobile compatibility
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          console.log('QR Code scanned successfully:', decodedText);
          handleScanSuccess(decodedText, html5QrCode);
        },
        (errorMessage) => {
          // Normal during scanning - ignore
        }
      );
      
      console.log('Camera started successfully');
      setScannerReady(true);
      showSuccess('Camera started successfully! Point at a QR code.');
    } catch (err) {
      console.error('Error starting scanner:', err);
      console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to start camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another app. Please close other apps and try again.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera access not supported. Please use HTTPS or try a different browser.';
      } else {
        errorMessage = err.message || 'Failed to start camera. Please try again.';
      }
      
      setCameraError(errorMessage);
      setError(errorMessage);
    }
  }, [showSuccess]);

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
    console.log('QR Code detected:', decodedText);
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
        // Use the decoded text directly as equipment ID (unique_id)
        equipmentId = decodedText.trim();
      }
      
      console.log('Extracted equipment ID:', equipmentId);
      
      if (!equipmentId) {
        throw new Error('Invalid QR code format');
      }

      // Fetch equipment details
      setLoading(true);
      console.log('Fetching equipment:', `/api/equipment/${equipmentId}`);
      const response = await api.get(`/api/equipment/${equipmentId}`);
      console.log('Equipment response:', response.data);
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
      const response = await api.post('/api/request-equipment', {
        equipment_id: equipment.id,
        equipment_unique_id: equipment.unique_id,
        quantity: 1
      });
      
      showSuccess('Equipment request sent to admin for approval.');
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

  const handleReportDamage = async () => {
    if (!equipment) return;

    try {
      setLoading(true);
      await api.post('/api/report-damage', {
        itemId: equipment.id,
        description: `Damage reported via QR scanner for ${equipment.name}`
      });
      
      showSuccess('Damage report submitted successfully.');
      setEquipment(null);
      setScannedData(null);
      setLoading(false);
    } catch (err) {
      console.error('Error reporting damage:', err);
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to report damage');
      showError(err.response?.data?.message || 'Failed to report damage');
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {equipment.status === 'available' && equipment.available_quantity > 0 ? (
                <button
                  onClick={handleRequestEquipment}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform transition hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Request for Approval
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-3 bg-slate-200 text-slate-500 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Not Available
                </button>
              )}
              
              <button
                onClick={handleReportDamage}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transform transition hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Report Damage
              </button>
              
              <button
                onClick={handleScanAnother}
                className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
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
            {/* Scanning Active State */}
            {scannerReady && (
              <div className="mb-4">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-600 mt-4 font-medium">Scanning...</p>
                <p className="text-slate-500 text-sm mt-1">Point camera at QR code within the frame</p>
              </div>
            )}
            
            {/* Camera Viewfinder */}
            <div className="relative w-full max-w-md mx-auto" style={{ height: '360px' }}>
              <div 
                ref={scannerRef} 
                id="qr-scanner" 
                className="w-full h-full rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-100"
              ></div>
              {scannerReady && (
                <>
                  {/* Scanning overlay with corner markers */}
                  <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ boxShadow: 'inset 0 0 0 2px rgba(74, 222, 128, 0.5)' }}></div>
                  {/* Corner markers for better visibility */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                  {/* Scanning line animation */}
                  <div className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
                </>
              )}
              {!scannerReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-xl">
                  <div className="text-center p-6">
                    <Camera className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Camera is not active</p>
                    <p className="text-slate-400 text-sm mt-1">Tap the button below to start</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Control Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              {scannerReady ? (
                <button
                  onClick={stopScanning}
                  className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Stop Scanning
                </button>
              ) : (
                <button
                  onClick={startScanning}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-sky-600 transform transition hover:scale-105 shadow-lg flex items-center justify-center gap-3 mx-auto sm:mx-0"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Permission Status Info */}
        {!scannerReady && !cameraError && cameraPermission === 'denied' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <span className="text-yellow-700 font-medium">Camera permission denied</span>
                <p className="text-yellow-600 text-sm mt-1">Please allow camera access in your browser settings to use the QR scanner.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && cameraError && (
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
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Camera Access Issue</h3>
            <p className="text-slate-600 mb-6">{cameraError}</p>
            <button
              onClick={startScanning}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-sky-600 transform transition hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Camera Access
            </button>
          </div>
        )}

        {/* Instructions */}
        {!scannerReady && !cameraError && (
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl shadow-lg border border-blue-100 p-6 text-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">How to use the QR Scanner</h3>
            <ol className="text-sm text-slate-600 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Tap the "Start Camera" button above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Allow camera access when prompted by your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Point your camera at the equipment QR code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>View equipment details and request for approval</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;