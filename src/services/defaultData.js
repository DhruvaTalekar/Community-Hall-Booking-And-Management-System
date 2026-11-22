export const DEFAULT_HALL = {
  name: "Grand Horizon Community Hall",
  tagline: "Your perfect venue for memorable occasions & grand celebrations.",
  description: "Grand Horizon Community Hall is a premier multi-purpose community and banquet venue designed to host weddings, grand receptions, cultural events, corporate seminars, and family celebrations with unparalleled comfort and modern amenities.",
  capacity: 850,
  parkingCapacity: 220,
  hallSize: "16,500 sq. ft.",
  yearsOfService: 12,
  suitableEvents: [
    "Weddings & Receptions",
    "Engagements & Anniversaries",
    "Corporate Seminars & Meetings",
    "Cultural & Religious Gatherings",
    "Birthday Parties & Family Reunions",
    "Exhibitions & Community Conferences"
  ],
  contact: {
    ownerName: "[Hall Management Office]",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    email: "inquiry@grandhorizonhall.com",
    address: "Plot 42, Civic Cultural Enclave, Main City Ring Road",
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.730310702652!2d72.8777!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMzLjYiTiA3MsKwNTInMzkuNyJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
  },
  status: "active"
};

export const DEFAULT_PRICING = {
  dailyPrice: 35000,
  weekendPrice: 45000,
  cleaningCharge: 3000,
  securityDeposit: 10000,
  advanceAmount: 15000,
  additionalCharges: 2000,
  weekendDays: ["Saturday", "Sunday"]
};

export const DEFAULT_FACILITIES = [
  {
    id: "fac-1",
    name: "Grand Stage & Intelligent Lighting",
    description: "Spacious 40x20 ft elevated stage with motorized curtains, spotlight arrays, warm ambient mood uplighting and ceremonial backdrops.",
    icon: "Sparkles",
    enabled: true,
    order: 1
  },
  {
    id: "fac-2",
    name: "Central Air Conditioning",
    description: "Heavy-duty commercial HVAC climate control system ensuring uniform temperature regulation throughout the main hall and dining area.",
    icon: "Wind",
    enabled: true,
    order: 2
  },
  {
    id: "fac-3",
    name: "Dedicated Dining & Buffet Area",
    description: "Independent 400-seat banquet dining section with hygienic buffet counters, heated bain-marie stations and clean handwash bays.",
    icon: "Utensils",
    enabled: true,
    order: 3
  },
  {
    id: "fac-4",
    name: "100% Generator Power Backup",
    description: "Auto-synchronizing 125 kVA silent acoustic diesel generator ensuring uninterrupted power supply for sound, lights and cooling.",
    icon: "Zap",
    enabled: true,
    order: 4
  },
  {
    id: "fac-5",
    name: "Ample On-Site Parking",
    description: "Secured, paved parking facility for up to 220 four-wheelers and 300 two-wheelers with dedicated valet parking clearance.",
    icon: "Car",
    enabled: true,
    order: 5
  },
  {
    id: "fac-6",
    name: "Pro Audio & Acoustic PA System",
    description: "JBL high-fidelity sound setup with wireless microphones, audio mixers, surround speakers and dedicated AV control booth.",
    icon: "Volume2",
    enabled: true,
    order: 6
  },
  {
    id: "fac-7",
    name: "Private Bridal & Green Rooms",
    description: "Two air-conditioned ensuite green rooms furnished with vanity mirrors, private restrooms, safety lockers and lounge sofas.",
    icon: "ShieldCheck",
    enabled: true,
    order: 7
  },
  {
    id: "fac-8",
    name: "Commercial Catering Kitchen",
    description: "Spacious kitchen equipped with commercial burners, tandoor stations, RO water purification and separate loading bay.",
    icon: "Coffee",
    enabled: true,
    order: 8
  }
];

export const DEFAULT_GALLERY = [
  {
    id: "gal-1",
    title: "Grand Banquet & Assembly Hall",
    description: "High ceilings, crystal lighting chandeliers and polished marble flooring accommodating up to 850 guests.",
    imageUrl: "/assets/hall_hero.jpg",
    category: "Ballroom",
    order: 1
  },
  {
    id: "gal-2",
    title: "Banquet Dining & Catering Pavilion",
    description: "Well-ventilated and spacious dining area configured for lavish buffet spreads and sit-down dinners.",
    imageUrl: "/assets/hall_dining.jpg",
    category: "Dining",
    order: 2
  },
  {
    id: "gal-3",
    title: "Elevated Ceremonial Stage & Floral Decor",
    description: "Grand decorated stage with warm accent lighting ideal for weddings, award ceremonies and performances.",
    imageUrl: "/assets/hall_stage.jpg",
    category: "Stage",
    order: 3
  }
];

export const DEFAULT_RULES = [
  {
    category: "Booking & Confirmation",
    items: [
      "Bookings are confirmed only upon receipt of the advance booking deposit and owner review approval.",
      "The booking duration is counted per calendar day from 8:00 AM to 11:00 PM unless an overnight extension is approved in writing.",
      "Dates will be reserved temporarily for 24 hours while your booking request is pending admin confirmation."
    ]
  },
  {
    category: "Cancellation & Refund Policy",
    items: [
      "Cancellations requested 30 days prior to the event date are eligible for an 80% refund of the advance amount.",
      "Cancellations made between 15 to 29 days prior receive a 50% refund.",
      "Cancellations made less than 14 days prior to the event date are non-refundable.",
      "Security deposit is 100% refundable within 48 hours post-event after inspection."
    ]
  },
  {
    category: "Hall Usage & Sound Restrictions",
    items: [
      "Music, live orchestras and DJ performances must strictly comply with civic sound ordinances and stop by 10:30 PM.",
      "Decorations using nails, permanent tapes or structural alterations to walls are strictly prohibited.",
      "Fireworks, flammable gases, and pyrotechnics are not permitted inside or within 50 meters of the venue perimeter."
    ]
  },
  {
    category: "Cleanliness & Waste Disposal",
    items: [
      "The hall management provides basic post-event sweeping and dusting.",
      "Caterers and organizers are responsible for packaging wet food waste and clearing personal decor before handover."
    ]
  }
];

export const DEFAULT_REVIEWS = [
  {
    id: "rev-1",
    userName: "Rajesh & Sunita Sharma",
    eventType: "Wedding Reception",
    rating: 5,
    review: "We booked Grand Horizon Hall for our daughter's wedding reception with 650 guests. The AC was remarkably efficient, parking was managed smoothly, and the management team was thoroughly accommodating.",
    createdAt: "2026-08-14",
    status: "approved",
    featured: true
  },
  {
    id: "rev-2",
    userName: "Kavita Deshmukh",
    eventType: "Silver Jubilee Celebration",
    rating: 5,
    review: "The stage lighting and acoustic sound system were top tier! The booking process online was straightforward, and getting instant availability made planning stress-free.",
    createdAt: "2026-08-28",
    status: "approved",
    featured: true
  },
  {
    id: "rev-3",
    userName: "Amit Patel (Director, Vertex Tech)",
    eventType: "Annual Corporate Summit",
    rating: 5,
    review: "Exceptional facilities for our annual company convention. Excellent audio-visual clarity, prompt generator backup, and very professional administrative staff.",
    createdAt: "2026-09-05",
    status: "approved",
    featured: true
  }
];
