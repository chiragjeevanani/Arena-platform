// Comprehensive Mock Database for Badminton Arena CRM
// Reflects realistic SaaS relationships: Arena -> Court -> Slot -> Booking

export const MOCK_DB = {
  arenas: [
    { id: 'arena-1', name: 'Elite Muscat Arena', locations: 'Bawshar, Muscat', courts: ['court-1', 'court-2', 'court-3'] },
    { id: 'arena-2', name: 'Royal Smash Academy', locations: 'Muttrah, Muscat', courts: ['court-4', 'court-5'] },
    { id: 'arena-3', name: 'Dhofar Green Arena', locations: 'Seeb, Muscat', courts: ['court-6'] },
  ],
  
  courts: [
    { id: 'court-1', arenaId: 'arena-1', name: 'Premium Synthetic 1', type: 'Synthetic', pricePerHour: 4.5 },
    { id: 'court-2', arenaId: 'arena-1', name: 'Premium Synthetic 2', type: 'Synthetic', pricePerHour: 4.5 },
    { id: 'court-3', arenaId: 'arena-1', name: 'Wooden Pro 1', type: 'Wooden', pricePerHour: 5.5 },
    { id: 'court-4', arenaId: 'arena-2', name: 'Court A', type: 'Synthetic', pricePerHour: 4.0 },
    { id: 'court-5', arenaId: 'arena-2', name: 'Court B', type: 'Synthetic', pricePerHour: 4.0 },
    { id: 'court-6', arenaId: 'arena-3', name: 'G-1 Court', type: 'Wooden', pricePerHour: 6.0 },
  ],

  coaches: [
    { id: 'coach-1', name: 'Said Al-Habsi', specialty: 'Advanced Footwork', rating: 4.9, students: 25 },
    { id: 'coach-2', name: 'Amal Al-Balushi', specialty: 'Smash Technique', rating: 5.0, students: 40 },
  ],

  batches: [
    { id: 'batch-1', coachId: 'coach-1', arenaId: 'arena-1', name: 'Morning Pros', time: '06:00 AM - 08:00 AM', level: 'Advanced', students: 12 },
    { id: 'batch-2', coachId: 'coach-2', arenaId: 'arena-2', name: 'Junior Champions', time: '04:00 PM - 06:00 PM', level: 'Beginner', students: 15 },
  ],

  inventory: [
    { id: 'inv-1', name: 'Yonex Shuttlecocks (Gold)', stock: 45, minStock: 20, category: 'Consumables', price: 1.2 },
    { id: 'inv-2', name: 'Grip Tape (Neon)', stock: 120, minStock: 30, category: 'Accessories', price: 0.5 },
    { id: 'inv-3', name: 'Carbon Fiber Frame Racket', stock: 8, minStock: 10, category: 'Equipment', price: 35.0 },
    { id: 'inv-4', name: 'Badminton Net (Pro)', stock: 0, minStock: 5, category: 'Equipment', price: 18.0 },
    { id: 'inv-5', name: 'Court Floor Wax', stock: 3, minStock: 10, category: 'Consumables', price: 4.5 },
    { id: 'inv-6', name: 'Sports Towel (Arena)', stock: 60, minStock: 20, category: 'Accessories', price: 1.8 },
    { id: 'inv-7', name: 'Knee Guard Support', stock: 14, minStock: 8, category: 'Medical Kits', price: 6.5 },
    { id: 'inv-8', name: 'Feather Shuttle (Tournament)', stock: 0, minStock: 15, category: 'Consumables', price: 3.2 },
  ],

  bookings: [
    { id: 'book-101', customerName: 'Ahmed Al-Saadi', arenaId: 'arena-1', courtId: 'court-1', date: '2026-03-14', time: '07:00 AM', status: 'Confirmed', amount: 4.5 },
    { id: 'book-102', customerName: 'Laila Al-Farsi', arenaId: 'arena-1', courtId: 'court-2', date: '2026-03-14', time: '08:00 AM', status: 'Pending', amount: 4.5 },
    { id: 'book-103', customerName: 'Yousuf Al-Zadjali', arenaId: 'arena-2', courtId: 'court-4', date: '2026-03-15', time: '06:00 PM', status: 'Confirmed', amount: 4.0 },
  ],

  users: [
    { id: 'USR-001', name: 'Abdullah Al-Raisi', role: 'SUPER_ADMIN', arenaId: 'all', email: 'admin@arena.om', status: 'Active' },
    { id: 'USR-002', name: 'Fatma Al-Shuaili', role: 'ARENA_ADMIN', arenaId: 'arena-1', email: 'elite@arena.om', status: 'Active' },
    { id: 'USR-003', name: 'Mohamed Al-Kindy', role: 'ARENA_ADMIN', arenaId: 'arena-2', email: 'royal@arena.om', status: 'Active' },
    { id: 'USR-004', name: 'Sara Al-Masrouri', role: 'RECEPTIONIST', arenaId: 'arena-1', email: 'bawshar_reception@arena.om', status: 'Active' },
    { id: 'USR-005', name: 'Ahmed Al-Saadi', role: 'CUSTOMER', arenaId: 'arena-1', email: 'ahmed@gmail.com', status: 'Active' },
    { id: 'USR-006', name: 'Laila Al-Farsi', role: 'CUSTOMER', arenaId: 'arena-2', email: 'laila@outlook.com', status: 'Active' },
  ]
};

// Helper functions to simulate DB queries
export const getArenaWithDetails = (arenaId) => {
  const arena = MOCK_DB.arenas.find(a => a.id === arenaId);
  if (!arena) return null;
  
  return {
    ...arena,
    courtDetails: MOCK_DB.courts.filter(c => c.arenaId === arenaId),
    batches: MOCK_DB.batches.filter(b => b.arenaId === arenaId)
  };
};

export const getDashStats = (selectedArenaId = 'all') => {
  const relevantBookings = selectedArenaId === 'all' 
    ? MOCK_DB.bookings 
    : MOCK_DB.bookings.filter(b => b.arenaId === selectedArenaId);
    
  const totalRevenue = relevantBookings.reduce((sum, b) => sum + b.amount, 0);
  
  return {
    totalRevenue,
    bookingCount: relevantBookings.length,
    occupancy: 78, // Simulated %
    lowStockCount: MOCK_DB.inventory.filter(i => i.stock < 10).length
  };
};
