// Real Location & Pincode Lookup Service using official India Post API & OpenStreetMap Geocoding

// 1. Fetch Real Location Details by any 6-digit Indian Pincode
export const fetchLocationByPincode = async (pincode) => {
  const cleanPincode = String(pincode).trim();
  if (!cleanPincode || cleanPincode.length !== 6 || isNaN(Number(cleanPincode))) {
    return { success: false, message: 'Please enter a valid 6-digit Indian Pincode' };
  }

  try {
    // Call Official India Post Pincode API
    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`);
    const data = await response.json();

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const postOffices = data[0].PostOffice;
      const primary = postOffices[0];

      const district = primary.District || primary.Division || 'Delhi';
      const state = primary.State || primary.Circle || 'Delhi';
      const areaOptions = postOffices.map((po) => ({
        name: po.Name,
        district: po.District || district,
        state: po.State || state,
        pincode: cleanPincode,
      }));

      // Fetch Geocoding coordinates (Lat/Lng) for this pincode/district via Nominatim
      let lat = 28.6139;
      let lng = 77.2090;

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&postalcode=${cleanPincode}&country=India`
        );
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lng = parseFloat(geoData[0].lon);
        } else {
          // Fallback geocode by district name
          const distRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(district + ', ' + state + ', India')}`
          );
          const distData = await distRes.json();
          if (distData && distData.length > 0) {
            lat = parseFloat(distData[0].lat);
            lng = parseFloat(distData[0].lon);
          }
        }
      } catch (geoErr) {
        console.warn('Geocoding coordinates fetch fallback:', geoErr);
      }

      return {
        success: true,
        pincode: cleanPincode,
        district,
        state,
        areaOptions,
        lat,
        lng,
      };
    } else {
      return { success: false, message: `Pincode ${cleanPincode} not found in India Post database.` };
    }
  } catch (err) {
    console.error('Error fetching pincode location:', err);
    return { success: false, message: 'Failed to connect to India Post Pincode Service.' };
  }
};

// 2. Fetch User's Current GPS Location using Browser Geolocation API + Reverse Geocoding
export const getCurrentGpsLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // Reverse Geocode to get District, State, and Pincode
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          const address = data?.address || {};

          const pincode = address.postcode || '110001';
          const district = address.state_district || address.city_district || address.district || address.city || address.town || 'Delhi';
          const state = address.state || 'Delhi';
          const street = address.suburb || address.neighbourhood || address.road || address.village || '';

          resolve({
            success: true,
            lat,
            lng,
            pincode,
            district,
            state,
            street,
            fullAddress: data?.display_name || `${district}, ${state}`,
          });
        } catch (err) {
          // Return GPS coordinates directly if reverse geocoding times out
          resolve({
            success: true,
            lat,
            lng,
            pincode: '110001',
            district: 'Delhi',
            state: 'Delhi',
            street: '',
            fullAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
          });
        }
      },
      (error) => {
        let msg = 'Failed to acquire GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied by user. Please allow location access in your browser or enter pincode manually.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
