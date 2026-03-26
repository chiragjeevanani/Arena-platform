// Comprehensive Mock Database for Badminton Arena CRM
// Reflects realistic SaaS relationships: Arena -> Court -> Slot -> Booking

export const MOCK_DB = {
  arenas: [
    { id: 'arena-1', name: 'Elite Badminton Hub', locations: 'HSR Layout, Bangalore', courts: ['court-1', 'court-2', 'court-3'] },
    { id: 'arena-2', name: 'Pro-Smash Academy', locations: 'Indiranagar, Bangalore', courts: ['court-4', 'court-5'] },
    { id: 'arena-3', name: 'Green Field Arena', locations: 'Whitefield, Bangalore', courts: ['court-6'] },
  ],
  
  courts: [
    { id: 'court-1', arenaId: 'arena-1', name: 'Premium Synthetic 1', type: 'Synthetic', pricePerHour: 450 },
    { id: 'court-2', arenaId: 'arena-1', name: 'Premium Synthetic 2', type: 'Synthetic', pricePerHour: 450 },
    { id: 'court-3', arenaId: 'arena-1', name: 'Wooden Pro 1', type: 'Wooden', pricePerHour: 550 },
    { id: 'court-4', arenaId: 'arena-2', name: 'Court A', type: 'Synthetic', pricePerHour: 400 },
    { id: 'court-5', arenaId: 'arena-2', name: 'Court B', type: 'Synthetic', pricePerHour: 400 },
    { id: 'court-6', arenaId: 'arena-3', name: 'G-1 Court', type: 'Wooden', pricePerHour: 600 },
  ],

  coaches: [
    { id: 'coach-1', name: 'Rahul Dravid', specialty: 'Advanced Footwork', rating: 4.9, students: 25 },
    { id: 'coach-2', name: 'Saina Nehwal', specialty: 'Smash Technique', rating: 5.0, students: 40 },
  ],

  batches: [
    { id: 'batch-1', coachId: 'coach-1', arenaId: 'arena-1', name: 'Morning Pros', time: '06:00 AM - 08:00 AM', level: 'Advanced', students: 12 },
    { id: 'batch-2', coachId: 'coach-2', arenaId: 'arena-2', name: 'Junior Champions', time: '04:00 PM - 06:00 PM', level: 'Beginner', students: 15 },
  ],

  inventory: [
    { id: 'inv-1', name: 'Yonyx Shuttlecocks (Gold)', stock: 45, category: 'Consumables', price: 120 },
    { id: 'inv-2', name: 'Grip Tape (Neon)', stock: 120, category: 'Accessories', price: 50 },
    { id: 'inv-3', name: 'Carbon Fiber Frame Racket', stock: 8, category: 'Equipment', price: 3500 },
  ],

  bookings: [
    { id: 'book-101', customerName: 'Amit Shah', arenaId: 'arena-1', courtId: 'court-1', date: '2026-03-14', time: '07:00 AM', status: 'Confirmed', amount: 450 },
    { id: 'book-102', customerName: 'Priya Rai', arenaId: 'arena-1', courtId: 'court-2', date: '2026-03-14', time: '08:00 AM', status: 'Pending', amount: 450 },
    { id: 'book-103', customerName: 'Karan Johar', arenaId: 'arena-2', courtId: 'court-4', date: '2026-03-15', time: '06:00 PM', status: 'Confirmed', amount: 400 },
  ],

  users: [
    { id: 'USR-001', name: 'John Doe', role: 'SUPER_ADMIN', arenaId: 'all', email: 'admin@arena.com', status: 'Active' },
    { id: 'USR-002', name: 'Alia Bhatt', role: 'ARENA_ADMIN', arenaId: 'arena-1', email: 'elite@arena.com', status: 'Active' },
    { id: 'USR-003', name: 'Raj Kumar', role: 'ARENA_ADMIN', arenaId: 'arena-2', email: 'prosmash@arena.com', status: 'Active' },
    { id: 'USR-004', name: 'Neha Sharma', role: 'RECEPTIONIST', arenaId: 'arena-1', email: 'hsr_reception@arena.com', status: 'Active' },
    { id: 'USR-005', name: 'Amit Shah', role: 'CUSTOMER', arenaId: 'arena-1', email: 'amit@gmail.com', status: 'Active' },
    { id: 'USR-006', name: 'Priya Rai', role: 'CUSTOMER', arenaId: 'arena-2', email: 'priya@outlook.com', status: 'Active' },
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
