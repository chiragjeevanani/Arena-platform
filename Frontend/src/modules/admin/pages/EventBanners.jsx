import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Typography, Button, IconButton, Card, Grid,
  Stepper, Step, StepLabel, LinearProgress, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Chip, TextField, InputAdornment, MenuItem,
  Select, FormControl, InputLabel, Tooltip, Breadcrumbs, Link
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarMonth,
  AddCircleOutline,
  EmojiEvents,
  Groups,
  MonetizationOn,
  TrendingUp,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  LocationOn,
  AccessTime,
  Description,
  MilitaryTech,
  Campaign,
  Receipt,
  Leaderboard,
  ArrowForward,
  CloudUpload,
  ChevronLeft,
  ChevronRight,
  Info,
  Close
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useTheme } from '../../user/context/ThemeContext';

// --- MOCK DATA ---
const MOCK_EVENTS = [
  { 
    id: 1, 
    name: 'Summer Badminton Smash 2026', 
    type: 'Tournament', 
    date: '2026-06-15', 
    time: '10:00 AM',
    venue: 'Sector 62 Main Court', 
    status: 'Upcoming', 
    participants: 128,
    maxParticipants: 256,
    revenue: 55000,
    expenses: 12000,
    banner: 'https://images.unsplash.com/photo-1626225967045-944062402170?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 2, 
    name: 'Junior Elite Coaching Camp', 
    type: 'Camp', 
    date: '2026-04-10', 
    time: '08:00 AM',
    venue: 'Amm Sports Academy', 
    status: 'Active', 
    participants: 45,
    maxParticipants: 50,
    revenue: 35000,
    expenses: 8000,
    banner: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 3, 
    name: 'Winter TT Open House', 
    type: 'Special Event', 
    date: '2025-12-05', 
    time: '11:00 AM',
    venue: 'Olympic Arena', 
    status: 'Completed', 
    participants: 96,
    maxParticipants: 100,
    revenue: 25000,
    expenses: 15000,
    banner: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=800&auto=format&fit=crop'
  },
];

const MOCK_PARTICIPANTS = [
  { id: 1, name: 'Rahul Sharma', age: 24, contact: '+91 9876543210', category: 'Men\'s Solo', status: 'Approved' },
  { id: 2, name: 'Anjali Varma', age: 19, contact: '+91 9123456789', category: 'Women\'s Solo', status: 'Pending' },
  { id: 3, name: 'Vikram Singh', age: 28, contact: '+91 9988776655', category: 'Men\'s Solo', status: 'Rejected' },
];

const MOCK_SPONSORS = [
  { id: 1, name: 'Decathlon', type: 'Main Sponsor', website: 'https://decathlon.in', logo: 'https://logo.clearbit.com/decathlon.com' },
  { id: 2, name: 'Red Bull', type: 'Co-Sponsor', website: 'https://redbull.com', logo: 'https://logo.clearbit.com/redbull.com' },
];

const MOCK_EXPENSES = [
  { id: 1, title: 'Ground Maintenance', amount: 5000, date: '2026-03-01', notes: 'Grass cutting and marking' },
  { id: 2, title: 'Trophies and Medals', amount: 3500, date: '2026-03-10', notes: 'Purchased from local dealer' },
];

const COLORS = ['#eb483f', '#0A1121', '#627D98', '#1a2b3c'];

// --- MAIN COMPONENT ---
const EventBanners = () => {
  const { isDark } = useTheme();
  const [view, setView] = useState('DASHBOARD'); // DASHBOARD, CALENDAR, FORM, DETAILS
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(0);

  // Results Management State
  const [resultWinner, setResultWinner] = useState('');
  const [resultRunnerUp, setResultRunnerUp] = useState('');
  const [scorecardImage, setScorecardImage] = useState(null);
  const [publishDuration, setPublishDuration] = useState('7');
  const [hideEventBanner, setHideEventBanner] = useState(false);
  const [publishStatus, setPublishStatus] = useState('IDLE');
  const [isPublished, setIsPublished] = useState(false);
  const [isPubliclyVisible, setIsPubliclyVisible] = useState(true);

  const handlePublishResults = () => {
    if (!resultWinner || !resultRunnerUp || !scorecardImage) {
      alert("Please select the Winner, Runner Up, and upload the Scorecard before publishing.");
      return;
    }
    setPublishStatus('PUBLISHING');
    setTimeout(() => {
      setPublishStatus('SUCCESS');
      setTimeout(() => {
        setPublishStatus('IDLE');
        setIsPublished(true);
      }, 1500);
    }, 1500);
  };

  // Layout Transition
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const PageHeader = ({ title, subtitle, actionLabel, onAction }) => (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid', borderColor: isDark ? 'white/10' : 'slate.200', pb: 1.5 }}>
      <Box>
        <Typography variant="overline" sx={{ fontWeight: 600, color: '#eb483f', letterSpacing: 2, mb: 0, display: 'block', lineHeight: 1, fontSize: '0.6rem' }}>
          Portfolio Management
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? 'white' : '#0A1121', textTransform: 'uppercase', mt: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5, letterSpacing: 1, display: 'block' }}>
          {subtitle}
        </Typography>
      </Box>
      {actionLabel && (
        <Button 
          variant="contained" 
          size="small"
          startIcon={<AddCircleOutline fontSize="small" />}
          onClick={onAction}
          sx={{ bgcolor: '#0A1121', color: 'white', px: 2, py: 0.5, borderRadius: 1.5, '&:hover': { bgcolor: 'black' }, textTransform: 'none', fontWeight: 500, fontSize: '0.65rem', letterSpacing: 0.5 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );

  // --- DASHBOARD VIEW ---
  const DashboardView = () => (
    <Box>
      <PageHeader 
        title="Event Dashboard" 
        subtitle="Growth & Operations Overview" 
        actionLabel="Create New Event"
        onAction={() => setView('FORM')}
      />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Events', value: MOCK_EVENTS.length, icon: <EmojiEvents />, color: '#eb483f' },
          { label: 'Upcoming', value: '08', icon: <CalendarMonth />, color: '#0A1121' },
          { label: 'Athletes', value: '1.2K', icon: <Groups />, color: '#627D98' },
          { label: 'Net Revenue', value: '₹4.5L', icon: <MonetizationOn />, color: '#2ECC71' }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ 
              p: 2, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'white/5' : 'slate.100',
              background: isDark ? 'rgba(26, 29, 36, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              position: 'relative', overflow: 'hidden'
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: 1, lineHeight: 1, display: 'block' }}>{stat.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: isDark ? 'white' : '#0A1121' }}>{stat.value}</Typography>
              </Box>
              <Box sx={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1, color: stat.color, transform: 'scale(2.5)' }}>
                {stat.icon}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Events List */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
          <TrendingUp sx={{ color: '#eb483f', fontSize: 16 }} /> Recent Deployments
        </Typography>
        <Grid container spacing={2}>
          {MOCK_EVENTS.map((event) => (
            <Grid item xs={12} md={4} key={event.id}>
              <Card sx={{ 
                borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: isDark ? 'white/10' : 'slate.100',
                transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', borderColor: '#eb483f' }
              }}>
                <Box sx={{ height: 100, position: 'relative' }}>
                  <img src={event.banner} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <Chip label={event.status} size="small" sx={{ 
                      bgcolor: event.status === 'Active' ? '#eb483f' : '#0A1121', 
                      color: 'white', fontWeight: 600, fontSize: '0.5rem', height: 20, textTransform: 'uppercase' 
                    }} />
                  </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#eb483f', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.55rem' }}>{event.type}</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0, lineHeight: 1.2 }}>{event.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1, opacity: 0.6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}><Groups sx={{ fontSize: '0.75rem' }} /><Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>{event.participants}</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}><LocationOn sx={{ fontSize: '0.75rem' }} /><Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>{event.venue}</Typography></Box>
                  </Box>
                  <Button 
                    fullWidth 
                    size="small"
                    variant="outlined" 
                    sx={{ mt: 1.5, borderRadius: 1.5, borderColor: 'divider', color: 'text.primary', fontWeight: 600, textTransform: 'none', py: 0.5, fontSize: '0.65rem' }}
                    onClick={() => { setActiveEvent(event); setView('DETAILS'); }}
                  >
                    Manage Module
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );

  // --- CALENDAR VIEW (Simple Custom Implementation) ---
  const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    return (
      <Box>
        <PageHeader title="Calendar View" subtitle="Event Schedule Management" onAction={() => setView('DASHBOARD')} actionLabel="Back to Dashboard" />
        
        <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'white/10' : 'slate.100' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight fontSize="small" /></IconButton>
            </Box>
          </Box>

          {/* Weekday Headers - 7-Column Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 1, 
            mb: 1.5,
            borderBottom: '1px solid', 
            borderColor: 'divider',
            pb: 1
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Box key={day} sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#eb483f', textTransform: 'uppercase', letterSpacing: 1.2, fontSize: '0.55rem' }}>{day}</Typography>
              </Box>
            ))}
          </Box>

          {/* Days - 7-Column Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 0.5 
          }}>
            {Array.from({ length: 42 }).map((_, i) => {
              const day = i - firstDayOfMonth + 1;
              const isCurrentMonth = day > 0 && day <= daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
              const eventThisDay = MOCK_EVENTS.find(e => {
                const eventDate = new Date(e.date);
                return eventDate.getDate() === day && eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
              });

              return (
                <Box key={i} sx={{ 
                  aspectRatio: '1.8/1',
                  minHeight: 36,
                  border: '1px solid', 
                  borderColor: isDark ? 'white/30' : '#cbd5e1',
                  borderRadius: 2, 
                  p: 0.35, 
                  position: 'relative', 
                  bgcolor: isCurrentMonth ? 'white' : 'action.hover',
                  opacity: isCurrentMonth ? 1 : 0.2, 
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    borderColor: isCurrentMonth ? '#eb483f' : 'transparent',
                    boxShadow: isCurrentMonth ? '0 4px 12px -5px rgba(235, 72, 63, 0.1)' : 'none',
                    zIndex: 2
                  },
                }}>
                  <Typography variant="caption" sx={{ 
                    fontWeight: 700, 
                    fontSize: '0.8rem', 
                    color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                    display: 'block',
                    lineHeight: 1
                  }}>
                    {isCurrentMonth ? day : ''}
                  </Typography>

                  {isCurrentMonth && eventThisDay && (
                    <Box 
                      onClick={() => { setActiveEvent(eventThisDay); setView('DETAILS'); }}
                      sx={{ 
                        mt: 0.25,
                        p: 0.35, 
                        bgcolor: '#eb483f', 
                        borderRadius: 0.75, 
                        color: 'white', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s', 
                        '&:hover': { bgcolor: '#0A1121' }
                      }}
                    >
                      <Typography variant="inherit" sx={{ 
                        fontSize: '0.45rem', 
                        fontWeight: 800, 
                        display: 'block', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {eventThisDay.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Card>
      </Box>
    );
  };

  // --- MULTI-STEP FORM (Stepper) ---
  const EventFormView = () => {
    const [step, setStep] = useState(0);
    const steps = ['Identity', 'Logistics', 'Financials'];

    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <PageHeader title="Draft Framework" subtitle="Event Architecture Definition" />
        <Stepper activeStep={step} sx={{ mb: 4 }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase' } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'white/10' : 'slate.100' }}>
          {step === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField size="small" fullWidth label="Event Nomenclature" placeholder="Enter title..." InputProps={{ startIcon: <Description fontSize="small" /> }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Event Typology</InputLabel>
                    <Select label="Event Typology">
                      <MenuItem value="Tournament">Tournament</MenuItem>
                      <MenuItem value="Coaching">Coaching</MenuItem>
                      <MenuItem value="Camp">Training Camp</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />} sx={{ height: 40, borderRadius: 2, borderStyle: 'dashed', textTransform: 'none' }}>
                    Upload Artwork
                    <input type="file" hidden />
                  </Button>
                </Grid>
              </Grid>
              <TextField size="small" fullWidth multiline rows={3} label="Program Descriptor" />
            </Box>
          )}

          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><TextField size="small" fullWidth type="date" label="Chronological Date" InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} md={6}><TextField size="small" fullWidth type="time" label="Temporal Node" InputLabelProps={{ shrink: true }} /></Grid>
              </Grid>
              <FormControl fullWidth size="small">
                <InputLabel>Locus Point (Venue)</InputLabel>
                <Select label="Locus Point (Venue)">
                  <MenuItem value="Main Court">Sector 62 Main Court</MenuItem>
                  <MenuItem value="Academy">Amm Sports Academy</MenuItem>
                </Select>
              </FormControl>
              <TextField size="small" fullWidth type="number" label="Athlete Quota (Max Participants)" />
            </Box>
          )}

          {step === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField size="small" fullWidth type="number" label="Access Fee (₹)" InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
              <TextField size="small" fullWidth multiline rows={4} label="Protocols & Mandates (Rules)" />
            </Box>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button size="small" disabled={step === 0} onClick={() => setStep(step - 1)} sx={{ fontWeight: 600 }}>Previous</Button>
            <Button 
              size="small"
              variant="contained" 
              onClick={() => step === 2 ? setView('DASHBOARD') : setStep(step + 1)}
              sx={{ bgcolor: '#0A1121', px: 4, fontWeight: 600 }}
            >
              {step === 2 ? 'Deploy Framework' : 'Continue'}
            </Button>
          </Box>
        </Card>
      </Box>
    );
  };

  // --- EVENT DETAILS SUB-MODULES ---
  
  const ParticipantRegistration = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Athlete Registry</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Search athletes..." 
            InputProps={{ startAdornment: <Search sx={{ fontSize: 16, mr: 0.5, opacity: 0.5 }} />, sx: { fontSize: '0.7rem', height: 32 } }} 
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button size="small" variant="contained" startIcon={<FilterList fontSize="small" />} sx={{ bgcolor: '#0A1121', borderRadius: 1.5, textTransform: 'none', fontWeight: 500 }}>Filters</Button>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', py: 1 }}>Athlete</TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', py: 1 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', py: 1 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', py: 1 }}>Contact</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', py: 1 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_PARTICIPANTS.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#eb483f', fontWeight: 600, fontSize: '0.55rem' }}>{row.name[0]}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.1 }}>{row.name}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.6rem' }}>Age: {row.age}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: '0.65rem', py: 1 }}>{row.category}</TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip label={row.status} size="small" color={row.status === 'Approved' ? 'success' : row.status === 'Pending' ? 'warning' : 'error'} 
                    sx={{ fontWeight: 600, fontSize: '0.5rem', height: 18, textTransform: 'uppercase' }} 
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', opacity: 0.7, py: 1 }}>{row.contact}</TableCell>
                <TableCell align="right" sx={{ py: 0.5 }}>
                  <IconButton size="small" sx={{ p: 0.5 }}><CheckCircle sx={{ color: 'success.main', fontSize: 16 }} /></IconButton>
                  <IconButton size="small" sx={{ p: 0.5 }}><Cancel sx={{ color: 'error.main', fontSize: 16 }} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const SponsorManagement = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Partner Portfolio</Typography>
        <Button size="small" variant="contained" startIcon={<Campaign fontSize="small" />} sx={{ bgcolor: '#eb483f', borderRadius: 1.5, textTransform: 'none' }}>Add Sponsor</Button>
      </Box>
      <Grid container spacing={2}>
        {MOCK_SPONSORS.map((sponsor) => (
          <Grid item xs={12} sm={6} key={sponsor.id}>
            <Card sx={{ p: 1.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Avatar src={sponsor.logo} variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'white', border: '1px solid', borderColor: 'divider' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{sponsor.name}</Typography>
                <Typography variant="caption" sx={{ color: '#eb483f', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.55rem' }}>{sponsor.type}</Typography>
                <Link href={sponsor.website} target="_blank" sx={{ display: 'block', fontSize: '0.65rem', mt: 0.5, opacity: 0.6 }}>{sponsor.website}</Link>
              </Box>
              <IconButton color="error"><Delete /></IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const ResultsManagement = () => (
    <Box>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <MilitaryTech sx={{ fontSize: 40, color: isPublished ? (isPubliclyVisible ? '#2ECC71' : 'warning.main') : '#eb483f', mb: 0 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isPublished ? (isPubliclyVisible ? 'Tournament Concluded' : 'Results Archived') : 'Tournament Outcome'}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          {isPublished ? (isPubliclyVisible ? 'Official results are live on the User App' : 'Results are hidden from the public UI') : 'Declare winners and publish leaderboard'}
        </Typography>
      </Box>

      {isPublished ? (
        <Grid container spacing={3}>
           <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, textTransform: 'uppercase', color: '#2ECC71', fontSize: '0.65rem' }}>Official Podium</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                 {[
                   { rank: 'Gold Medalist - Winner', color: '#FFD700', id: resultWinner },
                   { rank: 'Silver Medalist - Runner Up', color: '#C0C0C0', id: resultRunnerUp }
                 ].map((pos, i) => (
                   <Card key={i} sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: pos.color, boxShadow: 'none', bgcolor: isDark ? 'white/5' : pos.color + '10' }}>
                     <Avatar sx={{ width: 44, height: 44, bgcolor: pos.color, fontWeight: 700, fontSize: '1.2rem', color: isDark ? '#0A1121' : 'white' }}>
                        {MOCK_PARTICIPANTS.find(p => p.id === pos.id)?.name[0]}
                     </Avatar>
                     <Box sx={{ flex: 1 }}>
                       <Typography variant="caption" sx={{ fontWeight: 700, color: pos.color, fontSize: '0.6rem', textTransform: 'uppercase' }}>{pos.rank}</Typography>
                       <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{MOCK_PARTICIPANTS.find(p => p.id === pos.id)?.name || 'N/A'}</Typography>
                     </Box>
                     <EmojiEvents sx={{ color: pos.color, fontSize: 32, opacity: 0.5 }} />
                   </Card>
                 ))}
              </Box>
           </Grid>
           <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, textTransform: 'uppercase', color: '#0A1121', fontSize: '0.65rem' }}>Official Scorecard</Typography>
              <Box sx={{ 
                height: 160, border: '1px solid', borderColor: 'divider', borderRadius: 3, 
                position: 'relative', overflow: 'hidden'
              }}>
                 <img src={scorecardImage} alt="Final Scorecard" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 <Button size="small" variant="contained" startIcon={<CloudUpload />} sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', textTransform: 'none', fontSize: '0.6rem' }}>View Full Document</Button>
              </Box>
           </Grid>
           <Grid item xs={12}>
             <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
               <Chip label={`Auto-archives in: ${publishDuration === 'forever' ? 'Never' : publishDuration + ' Days'}`} size="small" sx={{ fontWeight: 600, fontSize: '0.6rem', bgcolor: 'divider' }} />
               <Chip label={hideEventBanner ? "Event Banner: Removed" : "Event Banner: Active"} size="small" color={hideEventBanner ? "warning" : "success"} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.6rem' }} />
             </Box>
           </Grid>
           <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
             <Button 
               variant="contained" 
               color={isPubliclyVisible ? "warning" : "success"}
               size="small" 
               onClick={() => setIsPubliclyVisible(!isPubliclyVisible)} 
               sx={{ borderRadius: 1.5, fontWeight: 600, px: 3 }}
             >
               {isPubliclyVisible ? 'Hide from Public UI' : 'Restore to Public UI'}
             </Button>
             <Button variant="outlined" color="error" size="small" onClick={() => setIsPublished(false)} sx={{ borderRadius: 1.5, fontWeight: 600 }}>Retract Results</Button>
           </Grid>
        </Grid>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, textTransform: 'uppercase', color: '#eb483f', fontSize: '0.65rem' }}>Podium Standings</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { rank: 'Winner', color: '#FFD700', icon: <EmojiEvents fontSize="small" />, value: resultWinner, setter: setResultWinner },
                  { rank: 'Runner Up', color: '#C0C0C0', icon: <EmojiEvents fontSize="small" />, value: resultRunnerUp, setter: setResultRunnerUp }
                ].map((pos, i) => (
                  <Card key={i} sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid', borderColor: pos.color, boxShadow: 'none' }}>
                    <Box sx={{ color: pos.color }}>{pos.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.6, fontSize: '0.55rem', textTransform: 'uppercase' }}>{pos.rank}</Typography>
                      <Select fullWidth variant="standard" displayEmpty sx={{ fontWeight: 600, fontSize: '0.75rem' }} value={pos.value} onChange={(e) => pos.setter(e.target.value)}>
                        <MenuItem value="" disabled>Select Athlete...</MenuItem>
                        {MOCK_PARTICIPANTS.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                      </Select>
                    </Box>
                    {pos.value && (
                      <Avatar sx={{ width: 32, height: 32, bgcolor: pos.color, fontWeight: 700, fontSize: '0.8rem', color: isDark ? '#0A1121' : 'white' }}>
                          {MOCK_PARTICIPANTS.find(p => p.id === pos.value)?.name[0]}
                      </Avatar>
                    )}
                  </Card>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, textTransform: 'uppercase', color: '#0A1121', fontSize: '0.65rem' }}>Scorecard Upload</Typography>
              <Box sx={{ 
                height: 120, border: '2px dashed', borderColor: scorecardImage ? '#eb483f' : 'divider', borderRadius: 3, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s', '&:hover': { borderColor: '#eb483f', bgcolor: 'action.hover' }
              }}>
                {scorecardImage ? (
                    <>
                      <img src={scorecardImage} alt="Scorecard preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <IconButton size="small" onClick={() => setScorecardImage(null)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'red' } }}><Close fontSize="small" /></IconButton>
                    </>
                ) : (
                    <>
                      <CloudUpload sx={{ fontSize: 32, opacity: 0.3 }} />
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>Drop result documents here</Typography>
                      <Button size="small" variant="outlined" component="label" sx={{ borderRadius: 1.5, textTransform: 'none', py: 0.25 }}>
                        Browse local
                        <input type="file" accept="image/*" hidden onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setScorecardImage(URL.createObjectURL(e.target.files[0]));
                          }
                        }} />
                      </Button>
                    </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, textTransform: 'uppercase', color: '#0A1121', fontSize: '0.65rem' }}>Publication Preferences</Typography>
               <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
                  <FormControl variant="standard" sx={{ minWidth: 150 }}>
                     <InputLabel sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Auto-Archive Results</InputLabel>
                     <Select value={publishDuration} onChange={(e) => setPublishDuration(e.target.value)} sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        <MenuItem value="1">After 1 Day</MenuItem>
                        <MenuItem value="3">After 3 Days</MenuItem>
                        <MenuItem value="5">After 5 Days</MenuItem>
                        <MenuItem value="7">After 1 Week</MenuItem>
                        <MenuItem value="forever">Never (Permanent)</MenuItem>
                     </Select>
                  </FormControl>
                  
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                     <Box>
                       <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Remove Event Banner</Typography>
                       <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.55rem' }}>Hide the promotional registering banner from the User app.</Typography>
                     </Box>
                     <Button size="small" variant={hideEventBanner ? 'contained' : 'outlined'} color={hideEventBanner ? "error" : "primary"} onClick={() => setHideEventBanner(!hideEventBanner)} sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none' }}>
                        {hideEventBanner ? 'Yes, Remove Banner' : 'Keep Banner Active'}
                     </Button>
                  </Box>
               </Card>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              size="small" 
              variant="contained" 
              onClick={handlePublishResults}
              disabled={publishStatus === 'PUBLISHING'}
              sx={{ 
                bgcolor: publishStatus === 'SUCCESS' ? '#2ECC71' : '#0A1121', 
                px: 6, py: 1, borderRadius: 1.5, fontWeight: 600,
                transition: 'all 0.3s'
              }}
            >
              {publishStatus === 'PUBLISHING' ? 'Publishing...' : publishStatus === 'SUCCESS' ? '✓ Published successfully' : 'Publish Results'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );

  const ExpenseTracker = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Disbursement Log</Typography>
        <Button size="small" variant="contained" startIcon={<Receipt fontSize="small" />} sx={{ bgcolor: '#0A1121', borderRadius: 1.5, textTransform: 'none' }}>Log Expense</Button>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.55rem', textTransform: 'uppercase', py: 1 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.55rem', textTransform: 'uppercase', py: 1 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.55rem', textTransform: 'uppercase', py: 1 }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.55rem', textTransform: 'uppercase', py: 1 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_EXPENSES.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.1 }}>{row.title}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.6rem' }}>{row.notes}</Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'error.main', fontSize: '0.75rem', py: 1 }}>₹{row.amount}</TableCell>
                <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, py: 1 }}>{row.date}</TableCell>
                <TableCell align="right" sx={{ py: 0.5 }}>
                  <IconButton size="small"><Edit sx={{ fontSize: 16 }} /></IconButton>
                  <IconButton size="small"><Delete sx={{ fontSize: 16 }} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const FinancialReports = () => {
    const data = [
      { name: 'Gross Revenue', value: activeEvent?.revenue || 0, color: '#3B82F6' },
      { name: 'Disbursements', value: activeEvent?.expenses || 0, color: '#EF4444' },
      { name: 'Net Surplus', value: (activeEvent?.revenue || 0) - (activeEvent?.expenses || 0), color: '#10B981' }
    ];

    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: isDark ? 'white' : '#0A1121' }}>Fiscal Overlook</Typography>
        <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 3 }}>Real-time revenue metrics and tournament disbursements.</Typography>
        
        <Grid container spacing={3} alignItems="stretch">
          {/* Summary Performance Card */}
          <Grid item xs={12} md={4}>
             <Card sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: 4, 
                bgcolor: '#0A1121', 
                color: 'white', 
                boxShadow: isDark ? 'none' : '0 20px 40px -10px rgba(0,0,0,0.15)', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
             }}>
                {/* Decorative background glows */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, bgcolor: 'rgba(46, 204, 113, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
                <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, bgcolor: 'rgba(235, 72, 63, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 1.5, fontSize: '0.65rem' }}>Summary Performance</Typography>
                  <Box sx={{ mt: 2, mb: 4 }}>
                     <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-1px' }}>₹{(activeEvent?.revenue || 0) - (activeEvent?.expenses || 0)}</Typography>
                     <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(46, 204, 113, 0.1)', px: 1.5, py: 0.5, borderRadius: 2 }}>
                       <TrendingUp sx={{ color: '#2ECC71', fontSize: 14 }} />
                       <Typography variant="caption" sx={{ color: '#2ECC71', fontWeight: 700, fontSize: '0.65rem' }}>NET SURPLUS GAIN</Typography>
                     </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>Gross Collection</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>₹{activeEvent?.revenue || 0}</Typography>
                     </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>Total Disbursement</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#EF4444' }}>-₹{activeEvent?.expenses || 0}</Typography>
                     </Box>
                  </Box>
                </Box>
             </Card>
          </Grid>
          
          {/* Chart Wrapper */}
          <Grid item xs={12} md={8} sx={{ minWidth: 0 }}>
             <Card sx={{ 
                p: { xs: 2.5, md: 4 }, 
                borderRadius: 4, 
                border: '1px solid', 
                borderColor: 'divider', 
                boxShadow: isDark ? 'none' : '0 10px 30px -10px rgba(0,0,0,0.05)', 
                height: '100%', 
                width: '100%',
                minHeight: 320, 
                display: 'flex', 
                flexDirection: 'column' 
             }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', color: isDark ? 'white' : '#0A1121', fontSize: '0.7rem', letterSpacing: 1 }}>Fiscal Breakdown</Typography>
                  <Tooltip title="Data is simulated based on participant fees and event logistics."><Info sx={{ fontSize: 16, opacity: 0.3 }} /></Tooltip>
                </Box>
                <Box sx={{ flex: 1, minHeight: 250, width: '100%', minWidth: 0, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB"} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? '#9CA3AF' : '#6B7280' }} axisLine={false} tickLine={false} dy={15} />
                      <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? '#9CA3AF' : '#6B7280' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => `₹${val}`} />
                      <RechartsTooltip 
                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }} 
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px 16px', fontWeight: 600, backgroundColor: isDark ? '#1F2937' : 'white', color: isDark ? 'white' : '#111827' }} 
                        formatter={(value) => [`₹${value}`, 'Amount']}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={140} barSize={80}>
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
             </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // --- RENDER CONTROLLER ---
  return (
    <Box sx={{ 
      minHeight: '100vh', bgcolor: isDark ? '#0A1121' : '#F9FAFB', 
      color: isDark ? 'white' : '#1a2b3c', p: 1.5 
    }}>
      <Container maxWidth="xl">
        {/* View Switcher Tabs (Only if not in details view) */}
        {view !== 'DETAILS' && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Tabs 
              value={view === 'DASHBOARD' ? 0 : view === 'CALENDAR' ? 1 : 2} 
              textColor="inherit"
              onChange={(e, val) => {
                if (val === 0) setView('DASHBOARD');
                if (val === 1) setView('CALENDAR');
                if (val === 2) setView('FORM');
              }}
              sx={{ 
                bgcolor: isDark ? 'white/5' : 'white', p: 0.5, borderRadius: 2, minHeight: 36,
                '& .MuiTabs-indicator': { bgcolor: '#eb483f', height: '100%', borderRadius: 1.5, zIndex: 0 },
                '& .MuiTab-root': { 
                  zIndex: 1, minHeight: 36, py: 0.5, transition: 'all 0.3s', 
                  fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', 
                  letterSpacing: 1.3, color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b',
                  '&.Mui-selected': { color: 'white' }
                }
              }}
            >
              <Tab label="Dashboard" />
              <Tab label="Calendar Overlay" />
              <Tab label="Deployment" />
            </Tabs>
          </Box>
        )}

        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {view === 'DASHBOARD' && <DashboardView />}
          {view === 'CALENDAR' && <CalendarView />}
          {view === 'FORM' && <EventFormView />}
          {view === 'DETAILS' && (
            <Box>
              <PageHeader 
                title={activeEvent?.name} 
                subtitle={`Management Module | ${activeEvent?.status}`} 
                onAction={() => setView('DASHBOARD')}
                actionLabel="Terminate Session"
              />
              
              <Box sx={{ mb: 2, display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, scrollbarWidth: 'none' }}>
                {['Participants', 'Sponsors', 'Results', 'Expenses', 'Financials'].map((tab, i) => (
                  <Button 
                    size="small"
                    key={tab} 
                    onClick={() => setActiveSubTab(i)}
                    variant={activeSubTab === i ? 'contained' : 'outlined'}
                    sx={{ 
                      borderRadius: 2, px: 2, py: 0.5, flexShrink: 0,
                      bgcolor: activeSubTab === i ? '#eb483f' : 'transparent',
                      borderColor: activeSubTab === i ? '#eb483f' : 'divider',
                      color: activeSubTab === i ? 'white' : 'text.primary',
                      fontWeight: 600, fontSize: '0.55rem', textTransform: 'uppercase',
                      '&:hover': { bgcolor: activeSubTab === i ? '#eb483f' : 'action.hover' }
                    }}
                  >
                    {tab}
                  </Button>
                ))}
              </Box>

              <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'white/10' : 'slate.100', width: '100%' }}>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeSubTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    style={{ width: '100%' }}
                  >
                    {activeSubTab === 0 && <ParticipantRegistration />}
                    {activeSubTab === 1 && <SponsorManagement />}
                    {activeSubTab === 2 && <ResultsManagement />}
                    {activeSubTab === 3 && <ExpenseTracker />}
                    {activeSubTab === 4 && <FinancialReports />}
                  </motion.div>
                </AnimatePresence>
              </Card>
            </Box>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

// Helper for Layout
const Container = ({ children, maxWidth }) => (
  <Box sx={{ maxWidth: maxWidth === 'xl' ? 1400 : 800, mx: 'auto' }}>{children}</Box>
);

export default EventBanners;

