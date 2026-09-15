import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  X,
  Camera,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Award,
  RefreshCw,
} from 'lucide-react';
import { validateImageQuality } from '../utils/imageQualityChecker';

const ReverifyModal = ({ isOpen, onClose, listing, onSuccess }) => {
  const [photo, setPhoto] = useState('');
  const [validatingImage, setValidatingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  // Explicit Geolocation States:
  // 'IDLE' | 'DETECTING' | 'CAPTURED' | 'DENIED' | 'UNAVAILABLE' | 'INVALID'
  const [geoStatus, setGeoStatus] = useState('IDLE');
  const [coords, setCoords] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  // Automatically request device geolocation immediately when modal opens
  useEffect(() => {
    if (isOpen && listing && geoStatus === 'IDLE') {
      handleCaptureLocation();
    }
  }, [isOpen, listing]);

  if (!isOpen || !listing) return null;

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('UNAVAILABLE');
      setCoords(null);
      setSubmitError('Unable to verify device location. Please enable GPS/location services and try again.');
      return;
    }

    setGeoStatus('DETECTING');
    setSubmitError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos?.coords?.latitude;
        const lng = pos?.coords?.longitude;

        if (
          typeof lat !== 'number' ||
          typeof lng !== 'number' ||
          isNaN(lat) ||
          isNaN(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        ) {
          setGeoStatus('INVALID');
          setCoords(null);
          setSubmitError('Unable to verify device location. Please enable GPS/location services and try again.');
          return;
        }

        setCoords({
          latitude: lat,
          longitude: lng,
        });
        setGeoStatus('CAPTURED');
        setSubmitError('');
      },
      (err) => {
        console.warn('Geolocation capture failed:', err.code, err.message);
        setCoords(null);
        if (err.code === 1) {
          // GeolocationPositionError.PERMISSION_DENIED
          setGeoStatus('DENIED');
          setSubmitError('Location permission is required for geo-verification.');
        } else {
          // POSITION_UNAVAILABLE (2) or TIMEOUT (3)
          setGeoStatus('UNAVAILABLE');
          setSubmitError('Unable to verify device location. Please enable GPS/location services and try again.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // SECTION 2 HARD RULE:
    // If the user selects/uploads an image and there is no valid device GPS:
    // The action must be BLOCKED.
    if (geoStatus !== 'CAPTURED' || !coords) {
      e.target.value = '';
      setPhoto('');
      if (geoStatus === 'DENIED') {
        setSubmitError('Location permission is required for geo-verification. Enable location access to continue.');
      } else {
        setSubmitError(
          'Geo-verification required: Please allow location access and capture a fresh photo with device location enabled. This photo cannot be geo-verified without valid GPS coordinates.'
        );
      }
      return;
    }

    setImageError('');
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;
      setPhoto(dataUrl);

      // Validate image clarity
      setValidatingImage(true);
      const val = await validateImageQuality(dataUrl);
      setValidatingImage(false);

      if (!val.isAcceptable) {
        setImageError(val.reason || 'Image quality too low. Please upload a clearer photo.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReverification = async () => {
    // Strict Geolocation Gate
    if (geoStatus !== 'CAPTURED' || !coords) {
      if (geoStatus === 'DENIED') {
        setSubmitError('Location permission is required for geo-verification. Enable location access to continue.');
      } else {
        setSubmitError(
          'Geo-verification required: Please allow location access and capture a fresh photo with device location enabled. This photo cannot be geo-verified without valid GPS coordinates.'
        );
      }
      return;
    }

    if (!photo) {
      setSubmitError('Please capture a fresh photo of your produce.');
      return;
    }

    if (imageError) {
      setSubmitError('Please upload a clear photo that passes quality validation.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        produceId: listing._id,
        image: photo,
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: new Date().toISOString(),
      };

      const { data } = await API.post('/quality/reverify', payload);
      if (data.success) {
        setResult(data);
        if (onSuccess) {
          onSuccess(data.listing);
        }
      } else {
        setSubmitError(data.message || 'Re-verification could not be completed.');
      }
    } catch (err) {
      console.error('Re-verification error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit re-verification.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setPhoto('');
    setImageError('');
    setSubmitError('');
    setResult(null);
    setCoords(null);
    setGeoStatus('IDLE');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200/80 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                Produce Quality Re-Verification
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Re-verify {listing.cropName}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Reset your degradation baseline with a fresh geo-tagged farm-gate photo.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-slate-800">
          {!result ? (
            <>
              {/* Mandatory Geo-Verification Requirement Banner */}
              <div className="p-4 bg-emerald-900/10 rounded-2xl border border-emerald-500/30 text-xs text-emerald-950 space-y-1.5">
                <div className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  Geo-verification required
                </div>
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  Allow location access and capture a fresh photo to verify this produce. Real device GPS coordinates are strictly mandatory for geo-verification.
                </p>
              </div>

              {/* Geolocation Status Section (Visible states 1 to 5) */}
              <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    Step 1: Device Geolocation (Mandatory Gate)
                  </span>

                  {geoStatus === 'CAPTURED' && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Location captured
                    </span>
                  )}
                  {geoStatus === 'DETECTING' && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                      Detecting device location...
                    </span>
                  )}
                  {geoStatus === 'DENIED' && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                      Location permission denied
                    </span>
                  )}
                  {geoStatus === 'UNAVAILABLE' && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Location unavailable
                    </span>
                  )}
                  {geoStatus === 'INVALID' && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                      Invalid location
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 font-medium">
                  Actual GPS coordinates must originate from real device geolocation.
                  <b className="text-slate-900 block mt-0.5">
                    Buyer Privacy Guarantee: Raw coordinates are never displayed to buyers. Only "Geo-Verification: Verified" and district/state are shown.
                  </b>
                </p>

                {/* State: Permission Denied */}
                {geoStatus === 'DENIED' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-bold space-y-1">
                    <div className="flex items-center gap-2 text-rose-700">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Location permission denied</span>
                    </div>
                    <p className="text-[11px] text-rose-800 font-normal">
                      Location permission is required for geo-verification. Enable location access to continue.
                    </p>
                    <button
                      type="button"
                      onClick={handleCaptureLocation}
                      className="mt-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Retry Location Access
                    </button>
                  </div>
                )}

                {/* State: Location Unavailable or Invalid */}
                {(geoStatus === 'UNAVAILABLE' || geoStatus === 'INVALID') && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-bold space-y-1">
                    <div className="flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{geoStatus === 'INVALID' ? 'Invalid location' : 'Location unavailable'}</span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-normal">
                      Unable to verify device location. Please enable GPS/location services and try again.
                    </p>
                    <button
                      type="button"
                      onClick={handleCaptureLocation}
                      className="mt-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Retry Location Access
                    </button>
                  </div>
                )}

                {/* State: Detecting Location */}
                {geoStatus === 'DETECTING' && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 pt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Detecting device location...</span>
                  </div>
                )}

                {/* State: Idle */}
                {geoStatus === 'IDLE' && (
                  <button
                    type="button"
                    onClick={handleCaptureLocation}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer mt-1"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Acquire Device Location
                  </button>
                )}
              </div>

              {/* Photo Upload Box (Fresh Camera Photo Encouraged) */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-slate-900">
                  Step 2: Capture Fresh Camera Photo *
                </label>

                {photo ? (
                  <div className="relative rounded-2xl overflow-hidden h-48 border-2 border-emerald-500/50 bg-slate-900">
                    <img src={photo} alt="Fresh Crop Inspection" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto('');
                        setImageError('');
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                      Fresh Photo Attached
                    </span>
                  </div>
                ) : (
                  <label className={`h-44 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center space-y-2 p-4 text-center ${
                    geoStatus === 'CAPTURED'
                      ? 'border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 cursor-pointer'
                      : 'border-slate-200 bg-slate-100/70 opacity-75 cursor-not-allowed'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      geoStatus === 'CAPTURED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">
                        Capture Fresh Photo with Device Camera
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {geoStatus === 'CAPTURED'
                          ? 'Tap to open device camera or attach photo'
                          : 'Requires valid device location before capture'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {validatingImage && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Verifying image clarity and resolution...</span>
                  </div>
                )}

                {imageError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || !photo || Boolean(imageError) || geoStatus !== 'CAPTURED' || !coords}
                  onClick={handleSubmitReverification}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Photo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run AI Re-Verification
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success View */
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-500/60 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-3 py-1 rounded-full">
                    Geo-Verification: Verified
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">New Verified Baseline Established</h3>
                  <p className="text-xs text-slate-600 font-medium max-w-md mx-auto mt-1">
                    Your fresh photo has been geo-verified by the AI engine. Future quality degradation will now project from this new baseline.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 pt-3">
                  <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm text-center min-w-[110px]">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">New Score</span>
                    <span className="text-2xl font-black text-emerald-700">
                      {result.newBaseline?.score}%
                    </span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm text-center min-w-[110px]">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">New Grade</span>
                    <span className="text-2xl font-black text-emerald-700">
                      Grade {result.newBaseline?.grade}
                    </span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm text-center min-w-[110px]">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Quality Status</span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg inline-block mt-1">
                      VERIFIED
                    </span>
                  </div>
                </div>

                {result.newBaseline?.geoVerification?.status === 'VERIFIED' && (
                  <p className="text-[11px] text-emerald-800 font-bold">
                    ✓ Geo-Verification confirmed at farm origin.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Done & Return to My Produce
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReverifyModal;
