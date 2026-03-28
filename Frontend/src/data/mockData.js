import Arena1 from '../assets/Arenas/Arena1.jpg';
import Arena2 from '../assets/Arenas/Arena2.jpg';
import Arena3 from '../assets/Arenas/Arena3.jpg';
import AmmArena1 from '../assets/Arenas/AmmArena1.jpeg';

export const ARENAS = [
  {
    id: 1,
    name: "Amm Sports arena",
    location: "Sector 62, Noida",
    distance: "1.2 km",
    rating: 4.8,
    reviews: 120,
    pricePerHour: 4.5,
    courtsCount: 5,
    image: AmmArena1,
    category: 'Badminton',
    amenities: ["Parking", "Shower", "Locker", "Cafe"],
    description: "Premium wooden flooring courts with professional lighting and gallery seating."
  }
];

export const COURTS = [
  { id: 1, arenaId: 1, name: "Court 1", type: "Wooden" },
  { id: 2, arenaId: 1, name: "Court 2", type: "Wooden" },
  { id: 3, arenaId: 1, name: "Court 3", type: "Synthetic" },
  { id: 4, arenaId: 1, name: "Court 4", type: "Synthetic" },
  { id: 18, arenaId: 1, name: "Court 5", type: "Wooden" },
];

export const SLOTS = [
  { id: 1, time: "05:00 AM - 06:00 AM", status: "Available", price: 3.0 },
  { id: 2, time: "06:00 AM - 07:00 AM", status: "Booked", price: 4.0 },
  { id: 3, time: "07:00 AM - 08:00 AM", status: "Coaching", price: 4.0 },
  { id: 4, time: "08:00 AM - 09:00 AM", status: "Available", price: 4.0 },
  { id: 5, time: "09:00 AM - 10:00 AM", status: "Maintenance", price: 3.0 },
  { id: 6, time: "10:00 AM - 11:00 AM", status: "Blocked", price: 3.0 },
  { id: 7, time: "05:00 PM - 06:00 PM", status: "Available", price: 5.0 },
  { id: 8, time: "06:00 PM - 07:00 PM", status: "Available", price: 5.0 },
  { id: 9, time: "07:00 PM - 08:00 PM", status: "Booked", price: 5.0 },
  { id: 10, time: "08:00 PM - 09:00 PM", status: "Available", price: 4.5 }
];

export const COACHING_BATCHES = [
  {
    id: 1,
    coachName: "Vikram Singh",
    timing: "06:00 AM - 08:00 AM",
    days: "Mon, Wed, Fri",
    fees: 25.0,
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 2,
    coachName: "Anjali Sharma",
    timing: "04:00 PM - 06:00 PM",
    days: "Tue, Thu, Sat",
    fees: 35.0,
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop"
  }
];

export const USER_BOOKINGS = [
  {
    id: "BK-10293",
    arenaName: "Amm Sports arena",
    arenaImage: AmmArena1,
    location: "Sector 62, Noida",
    courtName: "Court 2",
    date: "2024-03-20",
    slot: "07:00 PM - 08:00 PM",
    status: "Upcoming",
    price: 4.500,
    receiptUrl: "#receipt-court-1"
  },
  {
    id: "AC-9921",
    type: "Coaching",
    arenaName: "Amm Sports Academy",
    arenaImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop",
    coachName: "Vikram Singh",
    plan: "Monthly Pro Training",
    date: "2024-03-15",
    slot: "06:00 AM - 08:00 AM",
    status: "Active",
    price: 45.000,
    receiptUrl: "#receipt-1"
  },
  {
    id: "AC-9922",
    type: "Coaching",
    arenaName: "Elite Smash Center",
    arenaImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop",
    coachName: "Anjali Sharma",
    plan: "Quarterly Advance",
    date: "2024-03-10",
    slot: "04:00 PM - 06:00 PM",
    status: "Active",
    price: 120.000,
    receiptUrl: "#receipt-2"
  }
];
