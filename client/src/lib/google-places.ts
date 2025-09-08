/**
 * Google Places API Utilities
 * Modular implementation for address autocomplete functionality
 */

import type { GoogleMapsAutocompleteOptions, GooglePlaceResult, GoogleAutocomplete } from '@/types/google-maps';

// Address component interface
export interface AddressComponents {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Google Places API loading utility
export const loadGooglePlacesApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.googlePlacesApiLoaded) {
      resolve();
      return;
    }

    // Check if already loading
    if (window.googlePlacesApiLoading) {
      // Wait for the existing loading to complete
      const checkLoaded = () => {
        if (window.googlePlacesApiLoaded) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Mark as loading
    window.googlePlacesApiLoading = true;

  // Get API key from environment
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Places API key not found. Address autocomplete will not work.');
    reject(new Error('Google Places API key not configured'));
    return;
  }

  // Create script element
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
  script.async = true;
  script.defer = true;

  // Set up callback
  (window as any).initGooglePlaces = () => {
    window.googlePlacesApiLoaded = true;
    window.googlePlacesApiLoading = false;
    delete (window as any).initGooglePlaces;
    resolve();
  };

  // Handle errors
  script.onerror = () => {
    window.googlePlacesApiLoading = false;
    reject(new Error('Failed to load Google Places API'));
  };

    // Add script to document
    document.head.appendChild(script);
  });
};

// Parse Google Places result into our address format
export const parseGooglePlaceResult = (
  place: GooglePlaceResult
): Partial<AddressComponents> => {
  const addressComponents: Partial<AddressComponents> = {};

  if (!place.address_components) {
    return addressComponents;
  }

  let streetNumber = '';
  let route = '';

  place.address_components.forEach((component: any) => {
    const types = component.types;

    if (types.includes('street_number')) {
      streetNumber = component.long_name;
    } else if (types.includes('route')) {
      route = component.long_name;
    } else if (types.includes('locality')) {
      addressComponents.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      addressComponents.state = component.short_name;
    } else if (types.includes('postal_code')) {
      addressComponents.zipCode = component.long_name;
    } else if (types.includes('country')) {
      addressComponents.country = component.long_name;
    }
  });

  // Combine street number and route for address line 1
  if (streetNumber && route) {
    addressComponents.addressLine1 = `${streetNumber} ${route}`;
  } else if (route) {
    addressComponents.addressLine1 = route;
  }

  return addressComponents;
};

// Create autocomplete instance with our default options
export const createAddressAutocomplete = (
  input: HTMLInputElement,
  onPlaceSelected: (addressComponents: Partial<AddressComponents>) => void,
  options?: Partial<GoogleMapsAutocompleteOptions>
): GoogleAutocomplete => {
  const defaultOptions: GoogleMapsAutocompleteOptions = {
    types: ['address'], // Restrict to addresses only
    componentRestrictions: {
      country: ['us', 'ca'], // Restrict to US and Canada
    },
    fields: [
      'address_components',
      'formatted_address',
      'geometry',
      'name',
      'place_id',
    ],
  };

  const autocomplete = new window.google!.maps.places.Autocomplete(input, {
    ...defaultOptions,
    ...options,
  });

  // Set up place selection handler
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    
    if (!place.address_components) {
      console.warn('No address components found for selected place');
      return;
    }

    const addressComponents = parseGooglePlaceResult(place);
    onPlaceSelected(addressComponents);
  });

  // Fix Google Places click selection issues - use pointerdown instead of click
  // and whitelist the dropdown to prevent input blur
  setTimeout(() => {
    const pacContainers = document.querySelectorAll('.pac-container');
    pacContainers.forEach(container => {
      // Set up ignoreBlur flag for this input
      let ignoreNextBlur = false;
      
      // Handle pointerdown on the container to set ignoreBlur flag
      container.addEventListener('pointerdown', (e) => {
        ignoreNextBlur = true;
        e.preventDefault(); // Prevent blur
        
        // Reset flag after a short delay
        setTimeout(() => {
          ignoreNextBlur = false;
        }, 200);
      }, true);
      
      // Handle pointerdown on individual suggestions for immediate selection
      container.addEventListener('pointerdown', (e) => {
        const target = e.target as HTMLElement;
        const pacItem = target.closest('.pac-item');
        
        if (pacItem) {
          e.preventDefault(); // Prevent blur
          e.stopPropagation(); // Don't bubble
          
          // Trigger Google's selection mechanism
          const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          pacItem.dispatchEvent(event);
        }
      }, true);
      
      // Override input blur to respect ignoreBlur flag
      const originalBlur = input.onblur;
      input.onblur = (e) => {
        if (ignoreNextBlur) {
          ignoreNextBlur = false;
          return; // Don't process blur
        }
        if (originalBlur) originalBlur.call(input, e);
      };
    });
  }, 100);

  return autocomplete;
};

// Utility to check if Google Places API is available
export const isGooglePlacesAvailable = (): boolean => {
  return !!(window.google && window.google.maps && window.google.maps.places);
};
