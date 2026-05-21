export interface Branch {
  id: string;
  name: string;            // short display name (e.g. "Karama")
  fullName: string;        // long form for WhatsApp message
  emirate: string;
  address: string;
  /** Lat/lng used to compute nearest branch by Haversine distance. */
  lat: number;
  lng: number;
  /** Phone in E.164 digits only — used by wa.me link builder. */
  whatsappNumber: string;
  /** Free-form delivery area note shown in the UI. */
  deliveryArea: string;
  /** Operating hours for this branch. */
  hours: string;
  isMain?: boolean;
}

/**
 * Sample Pinoy Mart branches across the UAE.
 * Replace WhatsApp numbers + coordinates with the real values when going live.
 */
export const branches: Branch[] = [
  {
    id: "karama",
    name: "Karama",
    fullName: "Pinoy Mart – Al Karama (Dubai)",
    emirate: "Dubai",
    address: "Kuwait St, Al Karama, Dubai",
    lat: 25.2461,
    lng: 55.3083,
    whatsappNumber: "971501234567",
    deliveryArea: "Karama · Satwa · Bur Dubai · Oud Metha",
    hours: "Daily · 9:00 AM – 11:00 PM",
    isMain: true,
  },
  {
    id: "bur-dubai",
    name: "Bur Dubai",
    fullName: "Pinoy Mart – Bur Dubai",
    emirate: "Dubai",
    address: "Al Mankhool Rd, Bur Dubai",
    lat: 25.2548,
    lng: 55.2962,
    whatsappNumber: "971501234568",
    deliveryArea: "Bur Dubai · Mankhool · Golden Sands",
    hours: "Daily · 9:00 AM – 11:00 PM",
  },
  {
    id: "al-quoz",
    name: "Al Quoz",
    fullName: "Pinoy Mart – Al Quoz (Dubai)",
    emirate: "Dubai",
    address: "Al Quoz Industrial 3, Dubai",
    lat: 25.1432,
    lng: 55.2347,
    whatsappNumber: "971501234569",
    deliveryArea: "Al Quoz · Barsha · Tecom · JLT",
    hours: "Daily · 9:00 AM – 10:00 PM",
  },
  {
    id: "sharjah",
    name: "Sharjah",
    fullName: "Pinoy Mart – Rolla, Sharjah",
    emirate: "Sharjah",
    address: "Al Rolla Rd, Sharjah",
    lat: 25.3573,
    lng: 55.3911,
    whatsappNumber: "971501234570",
    deliveryArea: "Rolla · Al Nahda · Al Qasimia · Al Majaz",
    hours: "Daily · 9:00 AM – 11:00 PM",
  },
  {
    id: "abu-dhabi",
    name: "Abu Dhabi",
    fullName: "Pinoy Mart – Hamdan St, Abu Dhabi",
    emirate: "Abu Dhabi",
    address: "Hamdan St, Abu Dhabi",
    lat: 24.4922,
    lng: 54.3580,
    whatsappNumber: "971501234571",
    deliveryArea: "Hamdan · Tourist Club · Khalidiya · Mussafah",
    hours: "Daily · 10:00 AM – 11:00 PM",
  },
  {
    id: "ajman",
    name: "Ajman",
    fullName: "Pinoy Mart – Al Nuaimiya, Ajman",
    emirate: "Ajman",
    address: "Al Nuaimiya, Ajman",
    lat: 25.4111,
    lng: 55.4351,
    whatsappNumber: "971501234572",
    deliveryArea: "Al Nuaimiya · Al Rashidiya · Corniche",
    hours: "Daily · 9:00 AM – 10:30 PM",
  },
];

export const DEFAULT_BRANCH_ID = "karama";

export const getBranchById = (id: string): Branch | undefined =>
  branches.find((b) => b.id === id);

export const getDefaultBranch = (): Branch =>
  branches.find((b) => b.id === DEFAULT_BRANCH_ID) ?? branches[0];
