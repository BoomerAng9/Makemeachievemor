import { storage } from "./storage";
import type { InsertDriverLocation, DriverLocation, Opportunity } from "@shared/schema";

interface GoogleMapsGeocodingResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
}

interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      status: string;
    }>;
  }>;
  status: string;
}

export class MapsService {
  private apiKey: string;
  private baseUrl = "https://maps.googleapis.com/maps/api";

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn("GOOGLE_MAPS_API_KEY not configured - location features will be limited");
    }
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured - using fallback geocoding');
      return this.fallbackGeocode(address);
    }

    try {
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data: GoogleMapsGeocodingResponse = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }

  async updateDriverLocation(userId: string, address: string, vehicleType?: string, maxDistance?: number): Promise<DriverLocation | null> {
    const coordinates = await this.geocodeAddress(address);
    if (!coordinates) {
      throw new Error("Unable to geocode address");
    }

    const locationData: InsertDriverLocation = {
      userId,
      latitude: coordinates.lat.toString(),
      longitude: coordinates.lng.toString(),
      address: coordinates.formattedAddress,
      city: this.extractCityFromAddress(coordinates.formattedAddress),
      state: this.extractStateFromAddress(coordinates.formattedAddress),
      zipCode: this.extractZipFromAddress(coordinates.formattedAddress),
      isAvailable: true,
      vehicleType,
      maxDistance: maxDistance || 100,
      lastUpdated: new Date(),
    };

    return await storage.upsertDriverLocation(locationData);
  }

  async findNearbyLoads(userId: string, maxDistance: number = 100): Promise<Array<Opportunity & { distance: number }>> {
    const driverLocation = await storage.getDriverLocation(userId);
    if (!driverLocation) {
      throw new Error("Driver location not found. Please update your location first.");
    }

    const availableLoads = await storage.getAvailableOpportunities();
    const nearbyLoads: Array<Opportunity & { distance: number }> = [];

    for (const load of availableLoads) {
      if (load.pickupLatitude && load.pickupLongitude) {
        const distance = this.calculateDistance(
          parseFloat(driverLocation.latitude),
          parseFloat(driverLocation.longitude),
          parseFloat(load.pickupLatitude),
          parseFloat(load.pickupLongitude)
        );

        if (distance <= maxDistance) {
          nearbyLoads.push({ ...load, distance });
        }
      }
    }

    return nearbyLoads.sort((a, b) => a.distance - b.distance);
  }

  async getOptimalRoute(stops: string[]): Promise<{ route: string[]; totalDistance: string; totalDuration: string } | null> {
    if (stops.length < 2) return null;

    try {
      const waypoints = stops.slice(1, -1).map(stop => encodeURIComponent(stop)).join('|');
      const origin = encodeURIComponent(stops[0]);
      const destination = encodeURIComponent(stops[stops.length - 1]);
      
      const url = `${this.baseUrl}/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypoints}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          route: route.waypoint_order,
          totalDistance: route.legs.reduce((total: number, leg: any) => total + leg.distance.value, 0),
          totalDuration: route.legs.reduce((total: number, leg: any) => total + leg.duration.value, 0),
        };
      }
      return null;
    } catch (error) {
      console.error("Route optimization error:", error);
      return null;
    }
  }

  async calculateTravelTime(origin: string, destination: string): Promise<{ distance: string; duration: string } | null> {
    try {
      const url = `${this.baseUrl}/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data: DistanceMatrixResponse = await response.json();

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        const element = data.rows[0].elements[0];
        return {
          distance: element.distance.text,
          duration: element.duration.text,
        };
      }
      return null;
    } catch (error) {
      console.error("Distance matrix error:", error);
      return null;
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private extractCityFromAddress(address: string): string | null {
    const parts = address.split(',');
    return parts.length >= 2 ? parts[parts.length - 3]?.trim() : null;
  }

  private extractStateFromAddress(address: string): string | null {
    const parts = address.split(',');
    const stateZip = parts[parts.length - 2]?.trim();
    return stateZip?.split(' ')[0] || null;
  }

  private extractZipFromAddress(address: string): string | null {
    const parts = address.split(',');
    const stateZip = parts[parts.length - 2]?.trim();
    const zipMatch = stateZip?.match(/\b\d{5}(-\d{4})?\b/);
    return zipMatch?.[0] || null;
  }
  private fallbackGeocode(address: string): { lat: number; lng: number; formattedAddress: string } | null {
    // Basic fallback for common US cities when Maps API is not available
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'new york, ny': { lat: 40.7128, lng: -74.0060 },
      'los angeles, ca': { lat: 34.0522, lng: -118.2437 },
      'chicago, il': { lat: 41.8781, lng: -87.6298 },
      'houston, tx': { lat: 29.7604, lng: -95.3698 },
      'phoenix, az': { lat: 33.4484, lng: -112.0740 },
      'philadelphia, pa': { lat: 39.9526, lng: -75.1652 },
      'san antonio, tx': { lat: 29.4241, lng: -98.4936 },
      'san diego, ca': { lat: 32.7157, lng: -117.1611 },
      'dallas, tx': { lat: 32.7767, lng: -96.7970 },
      'san jose, ca': { lat: 37.3382, lng: -121.8863 },
      'atlanta, ga': { lat: 33.7490, lng: -84.3880 },
      'miami, fl': { lat: 25.7617, lng: -80.1918 }
    };

    const normalizedAddress = address.toLowerCase().trim();
    
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (normalizedAddress.includes(city) || city.includes(normalizedAddress)) {
        return {
          lat: coords.lat,
          lng: coords.lng,
          formattedAddress: address
        };
      }
    }

    // Default to center of US if no match
    console.warn(`No fallback coordinates found for: ${address}`);
    return {
      lat: 39.8283, // Geographic center of US
      lng: -98.5795,
      formattedAddress: address
    };
  }
}

export const mapsService = new MapsService();