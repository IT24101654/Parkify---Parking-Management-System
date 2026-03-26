import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612
};

const MapSelectorModal = ({ isOpen, onClose, onSelectLocation, initialLocation }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',

    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '' 
  });

  const [markerPos, setMarkerPos] = useState(initialLocation || defaultCenter);

  const onLoad = useCallback(function callback() {
    // Keep reference if needed
  }, []);

  const onUnmount = useCallback(function callback() {
    // Cleanup if needed
  }, []);

  const handleMapClick = (event) => {
    setMarkerPos({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
  };

  const handleConfirm = async () => {
    let formattedAddress = `Lat: ${markerPos.lat.toFixed(4)}, Lng: ${markerPos.lng.toFixed(4)}`;
    
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      try {
        const response = await geocoder.geocode({ location: markerPos });
        if (response.results[0]) {
          formattedAddress = response.results[0].formatted_address;
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      }
    }

    onSelectLocation({
      lat: markerPos.lat,
      lng: markerPos.lng,
      address: formattedAddress
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="map-modal-overlay">
      <div className="map-modal-content">
        <div className="map-modal-header">
          <h3>Select Location on Map</h3>
          <button className="close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="map-modal-body">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={markerPos}
              zoom={14}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onClick={handleMapClick}
              options={{ disableDefaultUI: true, zoomControl: true }}
            >
              <Marker position={markerPos} />
            </GoogleMap>
          ) : (
            <div className="map-loading">Loading Maps...</div>
          )}
          {!process.env.REACT_APP_GOOGLE_MAPS_API_KEY && (
            <p className="map-warning-text">Note: Google Maps API key is missing. Add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file.</p>
          )}
        </div>

        <div className="map-modal-footer">
          <p className="selected-coords">Selected: {markerPos.lat.toFixed(4)}, {markerPos.lng.toFixed(4)}</p>
          <div className="map-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-confirm" onClick={handleConfirm}>Confirm Location</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSelectorModal;
