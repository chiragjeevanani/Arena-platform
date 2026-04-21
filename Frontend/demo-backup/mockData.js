import Arena1 from '../assets/Arenas/Arena1.jpg';
import Arena2 from '../assets/Arenas/Arena2.jpg';
import Arena3 from '../assets/Arenas/Arena3.jpg';
import AmmArena1 from '../assets/Arenas/AmmArena1.jpeg';
import CourtImage from '../assets/court.jpeg';

export const ARENAS = [
  {
    id: 1,
    name: "Amm Sports arena",
    location: "AMM sports arena muscat , oman",
    distance: "1.2 km",
    rating: 4.8,
    reviews: 120,
    pricePerHour: 4.5,
    courtsCount: 5,
    image: CourtImage,
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
  { id: 1, time: "05:00 AM - 06:00 AM", status: "Available", price: 3.0, type: "nonPrime" },
  { id: 2, time: "06:00 AM - 07:00 AM", status: "Booked",     price: 4.0, type: "nonPrime" },
  { id: 3, time: "07:00 AM - 08:00 AM", status: "Coaching",   price: 4.0, type: "nonPrime" },
  { id: 4, time: "08:00 AM - 09:00 AM", status: "Available",  price: 4.0, type: "nonPrime" },
  { id: 5, time: "09:00 AM - 10:00 AM", status: "Maintenance",price: 3.0, type: "nonPrime" },
  { id: 6, time: "10:00 AM - 11:00 AM", status: "Blocked",    price: 3.0, type: "nonPrime" },
  { id: 7, time: "05:00 PM - 06:00 PM", status: "Available",  price: 5.0, type: "prime" },
  { id: 8, time: "06:00 PM - 07:00 PM", status: "Available",  price: 5.0, type: "prime" },
  { id: 9, time: "07:00 PM - 08:00 PM", status: "Booked",     price: 5.0, type: "prime" },
  { id: 10,time: "08:00 PM - 09:00 PM", status: "Available",  price: 4.5, type: "prime" },
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
    arenaImage: CourtImage,
    location: "AMM sports arena muscat , oman",
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

// MEMBERSHIP_PLANS
export const MEMBERSHIP_PLANS = [
  { id: 'annual-premium', name: 'Annual Premium', duration: '12 Months', durationMonths: 12, category: 'premium', price: 150.000, discountPercent: 20, access: 'All Days', bestValue: true, status: 'active', color: '#f59e0b', benefits: ['20% off all Prime slots', '15% off Non-Prime slots', 'Priority court booking', 'Free shuttle (2/month)', 'Locker access', 'Guest passes (4/year)'] },
  { id: 'annual-non-premium', name: 'Annual Standard', duration: '12 Months', durationMonths: 12, category: 'non-premium', price: 90.000, discountPercent: 10, access: 'All Days', bestValue: false, status: 'active', color: '#6366f1', benefits: ['10% off all Prime slots', '10% off Non-Prime slots', 'Standard court booking', 'Locker access'] },
  { id: 'half-yearly-premium', name: 'Half Yearly Premium', duration: '6 Months', durationMonths: 6, category: 'premium', price: 85.000, discountPercent: 15, access: 'All Days', bestValue: false, status: 'active', color: '#f59e0b', benefits: ['15% off Prime slots', '12% off Non-Prime slots', 'Priority booking', 'Free shuttle (1/month)', 'Locker access'] },
  { id: 'half-yearly-non-premium', name: 'Half Yearly Standard', duration: '6 Months', durationMonths: 6, category: 'non-premium', price: 50.000, discountPercent: 8, access: 'All Days', bestValue: false, status: 'active', color: '#6366f1', benefits: ['8% off all slots', 'Standard court booking'] },
  { id: 'weekend-premium', name: 'Weekend Premium', duration: '3 Months', durationMonths: 3, category: 'premium', price: 55.000, discountPercent: 18, access: 'Weekends Only', bestValue: false, status: 'active', color: '#f59e0b', benefits: ['18% off weekend Prime slots', 'Priority weekend booking', 'Guest pass (1/month)'] },
  { id: 'weekend-non-premium', name: 'Weekend Standard', duration: '3 Months', durationMonths: 3, category: 'non-premium', price: 30.000, discountPercent: 10, access: 'Weekends Only', bestValue: false, status: 'active', color: '#6366f1', benefits: ['10% off weekend slots', 'Standard weekend booking'] },
  { id: 'individual-annual', name: 'Individual Annual', duration: '12 Months', durationMonths: 12, category: 'individual', price: 70.000, discountPercent: 12, access: 'All Days', bestValue: false, status: 'active', color: '#22c55e', benefits: ['12% off all slots', 'Individual booking only', 'Locker access'] },
  { id: 'individual-half-yearly', name: 'Individual Half Yearly', duration: '6 Months', durationMonths: 6, category: 'individual', price: 40.000, discountPercent: 8, access: 'All Days', bestValue: false, status: 'active', color: '#22c55e', benefits: ['8% off all slots', 'Individual booking only'] },
  { id: 'monthly-non-premium', name: 'Monthly Standard', duration: '1 Month', durationMonths: 1, category: 'non-premium', price: 15.000, discountPercent: 5, access: 'All Days', bestValue: false, status: 'active', color: '#6366f1', benefits: ['5% off all slots', 'Great for beginners'] },
];

// Change status: 'active'|'expired'|'none' to test all booking banner cases
export const USER_MEMBERSHIP = { status: 'active', planId: 'annual-premium', planName: 'Annual Premium', category: 'premium', discountPercent: 20, startDate: '2025-01-01', expiryDate: '2025-12-31', benefits: ['20% off all Prime slots', '15% off Non-Prime slots', 'Priority court booking', 'Free shuttle (2/month)'] };
