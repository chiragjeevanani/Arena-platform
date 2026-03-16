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
    pricePerHour: 400,
    courtsCount: 6,
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
  { id: 5, arenaId: 2, name: "Court A", type: "Synthetic" },
  { id: 6, arenaId: 2, name: "Court B", type: "Synthetic" },
  { id: 7, arenaId: 2, name: "Court C", type: "Synthetic" },
  { id: 8, arenaId: 3, name: "C1", type: "Wooden" },
  { id: 9, arenaId: 3, name: "C2", type: "Wooden" },
  { id: 10, arenaId: 3, name: "C3", type: "Wooden" },
  { id: 11, arenaId: 3, name: "C4", type: "Wooden" },
  { id: 12, arenaId: 4, name: "Court 1", type: "Synthetic" },
  { id: 13, arenaId: 4, name: "Court 2", type: "Synthetic" },
  { id: 14, arenaId: 4, name: "Court 3", type: "Synthetic" },
  { id: 15, arenaId: 5, name: "Court 1", type: "Wooden" },
  { id: 16, arenaId: 5, name: "Court 2", type: "Synthetic" },
  { id: 17, arenaId: 5, name: "Court 3", type: "Synthetic" },
];

export const SLOTS = [
  { id: 1, time: "05:00 AM - 06:00 AM", status: "Available", price: 300 },
  { id: 2, time: "06:00 AM - 07:00 AM", status: "Booked", price: 400 },
  { id: 3, time: "07:00 AM - 08:00 AM", status: "Coaching", price: 400 },
  { id: 4, time: "08:00 AM - 09:00 AM", status: "Available", price: 400 },
  { id: 5, time: "09:00 AM - 10:00 AM", status: "Maintenance", price: 300 },
  { id: 6, time: "10:00 AM - 11:00 AM", status: "Blocked", price: 300 },
  { id: 7, time: "05:00 PM - 06:00 PM", status: "Available", price: 500 },
  { id: 8, time: "06:00 PM - 07:00 PM", status: "Available", price: 500 },
  { id: 9, time: "07:00 PM - 08:00 PM", status: "Booked", price: 500 },
  { id: 10, time: "08:00 PM - 09:00 PM", status: "Available", price: 450 }
];

export const COACHING_BATCHES = [
  {
    id: 1,
    coachName: "Vikram Singh",
    timing: "06:00 AM - 08:00 AM",
    days: "Mon, Wed, Fri",
    fees: 2500,
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 2,
    coachName: "Anjali Sharma",
    timing: "04:00 PM - 06:00 PM",
    days: "Tue, Thu, Sat",
    fees: 3500,
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
    price: 450
  }
];
