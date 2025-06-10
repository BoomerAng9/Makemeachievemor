// Google Maps integration for location services
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

let isGoogleMapsLoaded = false;
let googleMapsPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps'));
    };
    
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface AddressDetails {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: LocationCoordinates;
}

export const geocodeAddress = async (address: string): Promise<AddressDetails | null> => {
  await loadGoogleMaps();
  
  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const result = results[0];
        const addressComponents = result.address_components;
        
        let city = '';
        let state = '';
        let zipCode = '';
        
        for (const component of addressComponents) {
          const types = component.types;
          if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.short_name;
          } else if (types.includes('postal_code')) {
            zipCode = component.long_name;
          }
        }
        
        resolve({
          address: result.formatted_address,
          city,
          state,
          zipCode,
          coordinates: {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng()
          }
        });
      } else {
        resolve(null);
      }
    });
  });
};

export const calculateDistance = async (
  origin: LocationCoordinates,
  destination: LocationCoordinates
): Promise<{ distance: string; duration: string } | null> => {
  await loadGoogleMaps();
  
  return new Promise((resolve) => {
    const service = new window.google.maps.DistanceMatrixService();
    
    service.getDistanceMatrix({
      origins: [new window.google.maps.LatLng(origin.lat, origin.lng)],
      destinations: [new window.google.maps.LatLng(destination.lat, destination.lng)],
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.IMPERIAL,
    }, (response: any, status: string) => {
      if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
        const element = response.rows[0].elements[0];
        resolve({
          distance: element.distance.text,
          duration: element.duration.text
        });
      } else {
        resolve(null);
      }
    });
  });
};

export const getCurrentLocation = (): Promise<LocationCoordinates | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};