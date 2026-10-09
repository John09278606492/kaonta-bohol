// Bohol Province Geographic Coordinates & Boundary
export const BOHOL_BOUNDS = {
  minLat: 9.45,
  maxLat: 10.35,
  minLng: 123.65,
  maxLng: 124.70,
};

// Check if a coordinate is within Bohol province
export function isWithinBohol(lat: number, lng: number): boolean {
  return (
    lat >= BOHOL_BOUNDS.minLat &&
    lat <= BOHOL_BOUNDS.maxLat &&
    lng >= BOHOL_BOUNDS.minLng &&
    lng <= BOHOL_BOUNDS.maxLng
  );
}

// Calculate straight-line distance in km using Haversine formula
export function calculateStraightLineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Formats straight-line distance with explicit required label
export function formatStraightLineDistance(km: number | undefined | null): string {
  if (km === undefined || km === null) return '';
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m (Approx. straight-line distance)`;
  }
  return `${km.toFixed(1)} km (Approx. straight-line distance)`;
}

// Short distance badge
export function formatShortDistance(km: number | undefined | null): string {
  if (km === undefined || km === null) return '';
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Simulated Routes across Bohol for testing radius entering / leaving
export interface SimulationStop {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface SimulationRoute {
  id: string;
  title: string;
  description: string;
  stops: SimulationStop[];
}

export const SIMULATION_ROUTES: SimulationRoute[] = [
  {
    id: 'tagbilaran-heritage',
    title: 'Route 1: Tagbilaran City to Baclayon Heritage Corridor',
    description: 'Walk from Plaza Rizal downtown toward Mansasa coastal strip and Baclayon Church.',
    stops: [
      {
        name: 'Plaza Rizal & Cathedral (Tagbilaran)',
        lat: 9.6482,
        lng: 123.8531,
        description: 'Downtown center. Near Gerarda\'s and local cafes.',
      },
      {
        name: 'Galleria Luisa / CPG Ave',
        lat: 9.6515,
        lng: 123.8562,
        description: 'Bohol Bee Farm Express kiosk and shopping corridor.',
      },
      {
        name: 'Mansasa Coastal Highway',
        lat: 9.6380,
        lng: 123.8750,
        description: 'Heading southeast along Bohol Sea shoreline.',
      },
      {
        name: 'Baclayon Poblacion & Church',
        lat: 9.6225,
        lng: 123.9042,
        description: 'Heritage square. Entering radius of Baclayon Broas Bakery.',
      },
    ],
  },
  {
    id: 'panglao-beach',
    title: 'Route 2: Panglao Alona Beach to Dauis Cliffside',
    description: 'Observe beachside cafes transition to Dauis organic farm-to-table.',
    stops: [
      {
        name: 'Alona Beachfront (Tawala)',
        lat: 9.5492,
        lng: 123.7725,
        description: 'Bohol Bee Farm Alona kiosk & beach dining.',
      },
      {
        name: 'Bolod Beach Crossroad',
        lat: 9.5700,
        lng: 123.7950,
        description: 'Midway across Panglao island.',
      },
      {
        name: 'Bohol Bee Farm Main Cliff Resort (Dauis)',
        lat: 9.5982,
        lng: 123.8291,
        description: 'Cliffside organic restaurant & honeycomb store.',
      },
      {
        name: 'Dauis Church Bridge / Strait',
        lat: 9.6256,
        lng: 123.8647,
        description: 'Bridge crossing connecting Panglao to Tagbilaran.',
      },
    ],
  },
  {
    id: 'inland-chocolate-hills',
    title: 'Route 3: Loboc River into Carmen Chocolate Hills',
    description: 'From river cruise buffet through Bilar Man-Made Forest to Chocolate Hills view cafe.',
    stops: [
      {
        name: 'Loboc Tourism River Dock',
        lat: 9.6382,
        lng: 124.0325,
        description: 'Loboc Floating Buffet starting dock.',
      },
      {
        name: 'Bilar Man-Made Mahogany Forest',
        lat: 9.7125,
        lng: 124.1167,
        description: 'Dense canopy highway, cool mountain air.',
      },
      {
        name: 'Batuan Poblacion Cross',
        lat: 9.7833,
        lng: 124.1500,
        description: 'Agricultural heartland approaching Carmen.',
      },
      {
        name: 'Chocolate Hills Viewing Complex (Carmen)',
        lat: 9.8335,
        lng: 124.1975,
        description: 'Peak observation deck cafe with Peanut Kisses and Sikwate.',
      },
    ],
  },
  {
    id: 'eastern-jagna-anda',
    title: 'Route 4: Jagna Calamay Hub to Anda White Sand Coast',
    description: 'From traditional copper-vat Calamay makers to white sand seafood paluto.',
    stops: [
      {
        name: 'Jagna Port Delicacy Highway',
        lat: 9.6538,
        lng: 124.3695,
        description: "Ching's Jagna Calamay and port terminal.",
      },
      {
        name: 'Duero Coastal Highway',
        lat: 9.6833,
        lng: 124.4167,
        description: 'Scenic southeastern coastal road.',
      },
      {
        name: 'Guindulman Bay',
        lat: 9.7333,
        lng: 124.4833,
        description: 'Fisherman landing and fresh catch.',
      },
      {
        name: 'Anda Quinale Beachfront',
        lat: 9.7435,
        lng: 124.5768,
        description: 'Anda White Beach Seafood Paluto right on the sand.',
      },
    ],
  },
];
