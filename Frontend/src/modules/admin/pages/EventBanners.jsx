import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Button, IconButton, Card, Grid,
  Stepper, Step, StepLabel, LinearProgress, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Chip, TextField, InputAdornment, MenuItem,
  Select, FormControl, InputLabel, Tooltip, Breadcrumbs, Link,
  Dialog, DialogTitle, DialogContent, DialogActions
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
  Close,
  Add,
  CorporateFare,
  AccountBalance
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import decathlonLogo from '../../../assets/Sponsors/decathlon.png';
import redbullLogo from '../../../assets/Sponsors/redbull.png';
import { useTheme } from '../../user/context/ThemeContext';
import {
  listAdminCms,
  createAdminCms,
  updateAdminCms,
  deleteAdminCms,
  uploadAdminImage
} from '../../../services/cmsApi';
import { listEventRegistrations, updateEventRegistrationStatus } from '../../../services/adminOpsApi';
import { registerForEvent } from '../../../services/eventsApi';

const COLORS = ['#CE2029', '#36454F', '#627D98', '#36454F'];

const PremiumCard = ({ children, sx, ...props }) => {
  const { isDark } = useTheme();
  return (
    <Card
      {...props}
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
        background: isDark
          ? 'linear-gradient(145deg, rgba(26, 29, 36, 0.9) 0%, rgba(10, 17, 33, 0.9) 100%)'
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.4)'
          : '0 8px 32px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDark
            ? '0 12px 40px rgba(0, 0, 0, 0.6)'
            : '0 12px 40px rgba(0, 0, 0, 0.1)',
          borderColor: '#CE202944',
        },
        ...sx,
      }}
    >
      {children}
    </Card>
  );
};

// --- MAIN COMPONENT ---
const EventBanners = () => {
  const { isDark } = useTheme();
  const [view, setView] = useState('DASHBOARD');
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(0);

  // --- Card kebab-menu state ---
  const [activeCardMenu, setActiveCardMenu] = useState(null);

  // --- Edit Event modal state ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({ 
    name: '', type: '', status: '', banner: '', description: '', rules: '',
    date: '', time: '', venue: '', entryFee: '', inclusions: ''
  });
  const [isEditUploading, setIsEditUploading] = useState(false);

  const handleEditFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsEditUploading(true);
    try {
      const res = await uploadAdminImage(file);
      setEditFormData(prev => ({ ...prev, banner: res.url }));
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setIsEditUploading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    try {
      const formattedRules = (editFormData.rules || '').split('\n').map(r => r.trim()).filter(Boolean).map(r => `- ${r}`).join('\n');
      const payload = {
        title: editFormData.name,
        subtitle: `${editFormData.date} | ${editFormData.time} | ${editFormData.venue} | ${editFormData.entryFee || '0'} | ${editFormData.type}`,
        imageUrl: editFormData.banner,
        body: `${editFormData.description || ''}\n\n${formattedRules}`,
        isPublished: editFormData.status === 'Active',
        inclusions: (editFormData.inclusions || '').split(',').map(i => i.trim()).filter(Boolean)
      };
      await updateAdminCms(editingEvent.id, payload);
      setIsEditModalOpen(false);
      setEditingEvent(null);
      loadEvents();
    } catch (err) {
      alert('Failed to update event');
    }
  };

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [cmsRes, regRes] = await Promise.all([
        listAdminCms('event'),
        listEventRegistrations()
      ]);
      
      const regs = regRes.registrations || [];
      const mapped = (cmsRes.contents || []).map(c => {
        const parts = (c.subtitle || '').split('|').map(s => s.trim());
        const eventParticipants = regs.filter(r => r.eventId === c.id).length;
        
        return {
          id: c.id,
          name: c.title,
          type: parts[4] || 'Tournament',
          date: parts[0] || '',
          time: parts[1] || '',
          venue: parts[2] || 'Main Court',
          entryFee: parts[3] || '0',
          status: c.isPublished ? 'Active' : 'Draft',
          participants: eventParticipants,
          maxParticipants: 100,
          revenue: regs.filter(r => r.eventId === c.id && r.status === 'Approved')
                      .reduce((sum) => sum + (parseFloat(parts[3]) || 0), 0),
          expenses: 0,
          banner: c.imageUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&auto=format&fit=crop',
          linkUrl: c.linkUrl,
          description: (c.body || '').replace(/^\s*[-*•]\s+.+\n?/gm, '').trim(),
          rules: (c.body || '').split('\n').filter(l => /^[-*•]\s+/.test(l.trim())).map(l => l.trim().replace(/^[-*•]\s+/, '')).join('\n'),
          body: c.body,
          isPublished: c.isPublished,
          inclusions: c.inclusions || []
        };
      });
      setEvents(mapped);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcoming: 0,
    athletes: 0,
    revenue: 0
  });

  const loadDashboardStats = async (currentEvents) => {
    try {
      const data = await listEventRegistrations(); // Fetch all registrations
      const regs = data.registrations || [];
      
      const totalRevenue = regs
        .filter(r => r.status === 'Approved')
        .reduce((sum, r) => {
            // Find the event for this registration to get the fee
            const ev = currentEvents.find(e => e.id === r.eventId);
            const fee = parseFloat(ev?.entryFee) || 0;
            return sum + fee;
        }, 0);

      setStats({
        totalEvents: currentEvents.length,
        upcoming: currentEvents.filter(e => e.status === 'Upcoming').length,
        athletes: regs.length,
        revenue: totalRevenue
      });
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    }
  };

  useEffect(() => {
    if (events.length > 0) {
      loadDashboardStats(events);
    }
  }, [events]);

  useEffect(() => {
    if (view === 'DETAILS' && activeEvent?.id) {
       let cancelled = false;
       (async () => {
         try {
           const data = await listEventRegistrations(activeEvent.id);
           if (!cancelled) {
             setParticipants(data.registrations.map(r => ({
                id: r.id,
                name: r.name,
                contact: r.phone,
                status: r.status,
                category: 'Standard'
             })));
           }
         } catch (err) {
           console.error('Failed to load registrations', err);
         }
       })();
       return () => { cancelled = true; };
    }
  }, [view, activeEvent]);

  const handleAddEvent = (newEvent) => {
    // This was previously just local state. Now we'll call loadEvents after real save.
    loadEvents();
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteAdminCms(id);
      loadEvents();
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  // Results Management State
  const [resultWinner, setResultWinner] = useState('');
  const [resultRunnerUp, setResultRunnerUp] = useState('');
  const [scorecardImage, setScorecardImage] = useState(null);
  const [publishDuration, setPublishDuration] = useState('7');
  const [hideEventBanner, setHideEventBanner] = useState(false);
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateEventRegistrationStatus(id, newStatus);
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert('Failed to update status');
    }
  };

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

  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);

  // Data States
  const [sponsors, setSponsors] = useState([
    { id: 1, name: 'Decathlon', type: 'Main Sponsor', website: 'https://decathlon.in', logo: decathlonLogo },
    { id: 2, name: 'Red Bull', type: 'Co-Sponsor', website: 'https://redbull.com', logo: redbullLogo },
  ]);
  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Ground Maintenance', amount: 50, date: '2026-03-01', notes: 'Grass cutting and marking' },
    { id: 2, title: 'Trophies and Medals', amount: 35, date: '2026-03-10', notes: 'Purchased from local dealer' },
  ]);

  // Form States
  const [sponsorForm, setSponsorForm] = useState({ name: '', type: 'Main Sponsor', website: '', logo: '' });
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', date: '', notes: '' });

  const handleSponsorLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSponsorForm({ ...sponsorForm, logo: URL.createObjectURL(file) });
    }
  };

  const handleAddSponsor = () => {
    if (!sponsorForm.name) return;
    if (editingSponsor) {
      setSponsors(sponsors.map(s => s.id === editingSponsor.id ? { ...s, ...sponsorForm } : s));
    } else {
      const newSponsor = {
        id: Date.now(),
        ...sponsorForm,
        logo: sponsorForm.logo || 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?q=80&w=150&auto=format&fit=crop'
      };
      setSponsors([...sponsors, newSponsor]);
    }
    setSponsorForm({ name: '', type: 'Main Sponsor', website: '', logo: '' });
    setEditingSponsor(null);
    setIsSponsorDialogOpen(false);
  };

  const handleAddExpense = () => {
    if (!expenseForm.title || !expenseForm.amount) return;
    const newExpense = {
      id: Date.now(),
      ...expenseForm
    };
    setExpenses([...expenses, newExpense]);
    setExpenseForm({ title: '', amount: '', date: '', notes: '' });
    setIsExpenseDialogOpen(false);
  };

  // Layout Transition
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const PageHeader = ({ title, subtitle, actionLabel, onAction, onBack }) => (
    <Box sx={{
      mb: 4,
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', md: 'flex-end' },
      gap: 2,
      position: 'relative'
    }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {onBack && (
          <IconButton 
            onClick={onBack}
            sx={{ 
              width: 44, h: 44, 
              border: '1px solid', 
              borderColor: 'divider',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'white',
              color: '#36454F',
              '&:hover': { bgcolor: '#CE2029', color: 'white', borderColor: '#CE2029' }
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ width: 4, height: 24, bgcolor: '#CE2029', borderRadius: 1 }} />
            <Typography variant="overline" sx={{ fontWeight: 500, color: '#CE2029', letterSpacing: 2, lineHeight: 1, fontSize: '0.75rem' }}>
              Portfolio Management
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? 'white' : '#1e293b', letterSpacing: '-0.04em' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5, opacity: 0.8 }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
      {actionLabel && (
        <Button
          variant="contained"
          onClick={onAction}
          startIcon={onBack ? <DashboardIcon sx={{ fontSize: 18 }} /> : <AddCircleOutline />}
          sx={{
            bgcolor: onBack ? '#334155' : '#36454F',
            color: 'white',
            px: 3,
            py: 1.25,
            fontSize: '0.85rem',
            borderRadius: 3,
            '&:hover': { bgcolor: onBack ? '#0f172a' : 'black', transform: 'translateY(-2px)' },
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
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
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Events', value: stats.totalEvents, icon: <EmojiEvents sx={{ fontSize: 20 }} />, color: '#CE2029' },
          { label: 'Upcoming', value: stats.upcoming.toString().padStart(2, '0'), icon: <CalendarMonth sx={{ fontSize: 20 }} />, color: '#3B82F6' },
          { label: 'Athletes', value: stats.athletes >= 1000 ? `${(stats.athletes / 1000).toFixed(1)}K` : stats.athletes.toString(), icon: <Groups sx={{ fontSize: 20 }} />, color: '#10B981' },
          { label: 'Net Revenue', value: `${stats.revenue.toLocaleString()} OMR`, icon: <MonetizationOn sx={{ fontSize: 20 }} />, color: '#8B5CF6' }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <PremiumCard sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
              <Box sx={{
                width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: `${stat.color}15`, color: stat.color, flexShrink: 0,
                boxShadow: `0 8px 16px -4px ${stat.color}25`
              }}>
                {stat.icon}
              </Box>
              <Box sx={{ position: 'relative', zIndex: 1, flex: 1, overflow: 'hidden' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.25, display: 'block' }}>
                  {stat.label}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDark ? 'white' : '#0f172a', letterSpacing: '-0.02em', lineHeight: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {stat.value}
                </Typography>
              </Box>
              <Box sx={{
                position: 'absolute', top: -10, right: -10, width: 60, height: 60,
                borderRadius: '50%', background: `radial-gradient(circle, ${stat.color}15 0%, transparent 70%)`, pointerEvents: 'none'
              }} />
            </PremiumCard>
          </Grid>
        ))}
      </Grid>

      {/* Recent Events List */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
          <TrendingUp sx={{ color: '#CE2029', fontSize: 16 }} /> Recent Deployments
        </Typography>
        <Grid container spacing={2}>
          {events.map((event) => (
            <Grid item xs={12} md={4} key={event.id}>
              <PremiumCard
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover img': { transform: 'scale(1.05)' }
                }}
              >
                <Box sx={{ height: 120, position: 'relative', overflow: 'hidden' }}>
                  <motion.img
                    src={event.banner}
                    alt={event.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <Chip
                      label={event.status}
                      size="small"
                      sx={{
                        bgcolor: event.status === 'Active' ? '#CE2029' : '#36454F',
                        color: 'white',
                        height: 20,
                        fontSize: '0.6rem',
                        textTransform: 'uppercase',
                        borderRadius: 1.5,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    />
                  </Box>
                  <Box sx={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)'
                  }} />
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                    <Typography variant="overline" sx={{ fontWeight: 600, color: '#CE2029', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                      {event.type}
                    </Typography>
                    <Box sx={{ position: 'relative' }}>
                      <IconButton
                        size="small"
                        id={`event-menu-btn-${event.id}`}
                        sx={{ mt: -0.5, mr: -0.5, color: activeCardMenu === event.id ? '#CE2029' : 'inherit' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCardMenu(activeCardMenu === event.id ? null : event.id);
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>

                      <AnimatePresence>
                        {activeCardMenu === event.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -4 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              position: 'absolute', right: 0, top: '110%', zIndex: 1000,
                              background: isDark ? '#1a1d24' : '#ffffff',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                              borderRadius: 10, boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                              minWidth: 160, overflow: 'hidden'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Box
                              id={`menu-view-${event.id}`}
                              onClick={() => {
                                setActiveEvent(event);
                                setView('DETAILS');
                                setActiveCardMenu(null);
                              }}
                              sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                px: 2, py: 1.25, cursor: 'pointer',
                                fontSize: '0.8rem', fontWeight: 600,
                                color: isDark ? 'white' : '#36454F',
                                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' },
                                transition: 'background 0.15s'
                              }}
                            >
                              <Visibility sx={{ fontSize: 16 }} />
                              View Details
                            </Box>
                            <Box sx={{ height: '1px', bgcolor: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9' }} />
                            <Box
                              id={`menu-edit-event-${event.id}`}
                              onClick={() => {
                                setEditingEvent(event);
                                setEditFormData({
                                  name: event.name,
                                  type: event.type,
                                  status: event.status,
                                  banner: event.banner,
                                  description: event.description || '',
                                  rules: event.rules || '',
                                  date: event.date || '',
                                  time: event.time || '',
                                  venue: event.venue || '',
                                  entryFee: event.entryFee || '',
                                  inclusions: (event.inclusions || []).join(', ')
                                });
                                setIsEditModalOpen(true);
                                setActiveCardMenu(null);
                              }}
                              sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                px: 2, py: 1.25, cursor: 'pointer',
                                fontSize: '0.8rem', fontWeight: 600,
                                color: isDark ? 'white' : '#36454F',
                                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' },
                                transition: 'background 0.15s'
                              }}
                            >
                              <Edit sx={{ fontSize: 16 }} />
                              Edit Event Details
                            </Box>
                            <Box sx={{ height: '1px', bgcolor: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9' }} />
                            <Box
                              onClick={() => handleDeleteEvent(event.id)}
                              sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                px: 2, py: 1.25, cursor: 'pointer',
                                fontSize: '0.8rem', fontWeight: 600,
                                color: '#CE2029',
                                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#fff1f1' },
                                transition: 'background 0.15s'
                              }}
                            >
                              <Delete sx={{ fontSize: 16 }} />
                              Delete Event
                            </Box>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Box>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.2, height: 36, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', letterSpacing: '-0.01em', fontSize: '0.85rem' }}>
                    {event.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
                      <Groups sx={{ fontSize: 15 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{event.participants}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
                      <LocationOn sx={{ fontSize: 15 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{event.venue.split(' ')[0]}</Typography>
                    </Box>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => { setActiveEvent(event); setView('DETAILS'); }}
                    sx={{
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                      color: isDark ? 'white' : '#36454F',
                      py: 0.6,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#CE2029',
                        color: 'white',
                        boxShadow: '0 8px 20px -6px #CE202966'
                      }
                    }}
                  >
                    Manage Event
                  </Button>
                </Box>
              </PremiumCard>
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

        <PremiumCard sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ p: 1.5, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>Select a date to manage scheduled events</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', p: 0.5, borderRadius: 2 }}>
              <IconButton size="small" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} sx={{ borderRadius: 1.5 }}><ChevronLeft /></IconButton>
              <Button size="small" onClick={() => setCurrentDate(new Date())} sx={{ fontWeight: 700, px: 2, color: 'text.primary' }}>Today</Button>
              <IconButton size="small" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} sx={{ borderRadius: 1.5 }}><ChevronRight /></IconButton>
            </Box>
          </Box>

          <Box sx={{ p: 1 }}>
            {/* Weekday Headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Box key={day} sx={{ textAlign: 'center', py: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1 }}>{day}</Typography>
                </Box>
              ))}
            </Box>

            {/* Days Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
              {Array.from({ length: 42 }).map((_, i) => {
                const day = i - firstDayOfMonth + 1;
                const isCurrentMonth = day > 0 && day <= daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                const eventThisDay = events.find(e => {
                  const eventDate = new Date(e.date);
                  return eventDate.getDate() === day && eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
                });

                return (
                  <Box key={i} sx={{
                    minHeight: 55,
                    borderRadius: 1.5,
                    p: 1,
                    position: 'relative',
                    bgcolor: isCurrentMonth ? (isDark ? 'rgba(255,255,255,0.03)' : '#fff') : 'transparent',
                    border: '1px solid',
                    borderColor: isToday ? '#CE2029' : (isCurrentMonth ? (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0') : 'transparent'),
                    opacity: isCurrentMonth ? 1 : 0.3,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: isCurrentMonth ? 'pointer' : 'default',
                    '&:hover': isCurrentMonth ? {
                      transform: 'scale(1.02)',
                      borderColor: '#CE2029',
                      boxShadow: '0 8px 24px -10px rgba(206, 32, 41, 0.3)',
                      zIndex: 1,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#fff'
                    } : {},
                  }}>
                    <Typography variant="body2" sx={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: isToday ? '#CE2029' : (isCurrentMonth ? 'text.primary' : 'text.disabled'),
                      lineHeight: 1
                    }}>
                      {isCurrentMonth ? day : ''}
                    </Typography>

                    {isCurrentMonth && eventThisDay && (
                      <Box
                        onClick={(e) => { e.stopPropagation(); setActiveEvent(eventThisDay); setView('DETAILS'); }}
                        sx={{
                          position: 'absolute', bottom: 4, left: 4, right: 4,
                          p: 0.25, px: 0.5,
                          bgcolor: '#CE2029',
                          borderRadius: 1.5,
                          color: 'white',
                          boxShadow: '0 4px 12px -2px rgba(206, 32, 41, 0.4)',
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#36454F' }
                        }}
                      >
                        <Typography variant="caption" sx={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textTransform: 'uppercase'
                        }}>
                          {eventThisDay.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </PremiumCard>
      </Box>
    );
  };

  // --- MULTI-STEP FORM (Stepper) ---
  const EventFormView = () => {
    const [step, setStep] = useState(0);
    const steps = ['General Info', 'Date & Venue', 'Pricing & Rules'];
    const [bannerPreview, setBannerPreview] = useState(null);

    // Form fields state
    const [formData, setFormData] = useState({
      name: '',
      type: 'Tournament',
      description: '',
      date: '',
      time: '',
      venue: 'Main Court',
      maxParticipants: '',
      entryFee: '',
      rules: '',
      inclusions: ''
    });

    const handleField = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      try {
        const res = await uploadAdminImage(file);
        setBannerPreview(res.url);
      } catch (err) {
        alert('Failed to upload banner');
      } finally {
        setIsUploading(false);
      }
    };

    const handleSubmit = async () => {
      if (!formData.name) return;
      try {
        const formattedRules = (formData.rules || '').split('\n').map(r => r.trim()).filter(Boolean).map(r => `- ${r}`).join('\n');
        const payload = {
          kind: 'event',
          title: formData.name,
          subtitle: `${formData.date} | ${formData.time} | ${formData.venue} | ${formData.entryFee || '0'} | ${formData.type}`,
          imageUrl: bannerPreview,
          isPublished: true, 
          body: `${formData.description || ''}\n\n${formattedRules}`,
          inclusions: (formData.inclusions || '').split(',').map(i => i.trim()).filter(Boolean)
        };
        await createAdminCms(payload);
        loadEvents();
        setView('DASHBOARD');
      } catch (err) {
        alert('Failed to create event');
      }
    };

    return (
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <PageHeader title="Create New Event" subtitle="Fill in the details to construct and launch a new event" />

        <Box sx={{ mb: 6 }}>
          <Stepper activeStep={step} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': { color: '#CE2029' },
                      '&.Mui-completed': { color: '#10B981' }
                    }
                  }}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      mt: 1,
                      color: step >= index ? (step === index ? '#CE2029' : '#10B981') : 'text.disabled'
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <PremiumCard sx={{ p: 4 }}>
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <TextField
                  fullWidth
                  label="Event Name"
                  variant="filled"
                  placeholder="e.g. Summer Badminton Smash 2026"
                  value={formData.name}
                  onChange={handleField('name')}
                  InputProps={{
                    startAdornment: <Description sx={{ mr: 1, opacity: 0.5 }} />,
                    disableUnderline: true,
                    sx: { borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', p: 1 }
                  }}
                  InputLabelProps={{ shrink: true, sx: { fontWeight: 700, color: '#CE2029' } }}
                />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="filled">
                      <InputLabel sx={{ fontWeight: 700, color: '#CE2029' }}>Event Type</InputLabel>
                      <Select
                        label="Event Type"
                        disableUnderline
                        value={formData.type}
                        onChange={handleField('type')}
                        sx={{ borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}
                      >
                        <MenuItem value="Tournament">Tournament</MenuItem>
                        <MenuItem value="Coaching">Coaching</MenuItem>
                        <MenuItem value="Camp">Training Camp</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {bannerPreview ? (
                      <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', height: 56, border: '2px solid #10B981' }}>
                        <img src={bannerPreview} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <Box sx={{
                          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          px: 2, bgcolor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: '#10B981', fontSize: 18 }} />
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>Banner uploaded</Typography>
                          </Box>
                          <Button
                            component="label"
                            size="small"
                            sx={{ color: 'white', textTransform: 'none', fontSize: '0.7rem', fontWeight: 600,
                              bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 1.5,
                              '&:hover': { bgcolor: '#CE2029' } }}
                          >
                            Change
                            <input type="file" hidden accept="image/*"
                              onChange={handleFileUpload} />
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<CloudUpload />}
                        sx={{
                          height: 56, borderRadius: 3, borderStyle: 'dashed', borderWidth: 2,
                          textTransform: 'none', fontWeight: 700, borderColor: 'divider',
                          '&:hover': { borderColor: '#CE2029', bgcolor: 'rgba(206, 32, 41, 0.05)' }
                        }}
                      >
                        {isUploading ? 'Uploading...' : 'Upload Banner (16:9)'}
                        <input type="file" hidden accept="image/*"
                          onChange={handleFileUpload} />
                      </Button>
                    )}
                  </Grid>
                </Grid>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.75 }}>
                    Event Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Describe the event goals and highlights..."
                    value={formData.description}
                    onChange={handleField('description')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#CE202966' },
                        '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                      }
                    }}
                  />
                </Box>
              </Box>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Event Date"
                      variant="filled"
                      value={formData.date}
                      onChange={handleField('date')}
                      InputLabelProps={{ shrink: true, sx: { fontWeight: 700, color: '#CE2029' } }}
                      InputProps={{
                        disableUnderline: true,
                        sx: { borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Event Time"
                      variant="filled"
                      value={formData.time}
                      onChange={handleField('time')}
                      InputLabelProps={{ shrink: true, sx: { fontWeight: 700, color: '#CE2029' } }}
                      InputProps={{
                        disableUnderline: true,
                        sx: { borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }
                      }}
                    />
                  </Grid>
                </Grid>
                <FormControl fullWidth variant="filled">
                  <InputLabel sx={{ fontWeight: 700, color: '#CE2029' }}>Event Venue</InputLabel>
                  <Select
                    disableUnderline
                    value={formData.venue}
                    onChange={handleField('venue')}
                    sx={{ borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}
                  >
                    <MenuItem value="Main Court">Sector 62 Main Court</MenuItem>
                    <MenuItem value="Academy">Amm Sports Academy</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Participants"
                  variant="filled"
                  value={formData.maxParticipants}
                  onChange={handleField('maxParticipants')}
                  InputLabelProps={{ sx: { fontWeight: 700, color: '#CE2029' } }}
                  InputProps={{
                    startAdornment: <Groups sx={{ mr: 1, opacity: 0.5 }} />,
                    disableUnderline: true,
                    sx: { borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }
                  }}
                />
              </Box>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Entry Fee (OMR)"
                  variant="filled"
                  placeholder="e.g. 5.000"
                  value={formData.entryFee}
                  onChange={handleField('entryFee')}
                  InputLabelProps={{ shrink: true, sx: { fontWeight: 700, color: '#CE2029' } }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end" sx={{ fontWeight: 800 }}>OMR</InputAdornment>,
                    disableUnderline: true,
                    sx: { borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }
                  }}
                />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.75 }}>
                    Event Rules & Guidelines
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    variant="outlined"
                    placeholder="List the event rules, eligibility, and guidelines..."
                    value={formData.rules}
                    onChange={handleField('rules')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#CE202966' },
                        '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                      }
                    }}
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.75 }}>
                    What's Included (Amenities, comma separated)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="e.g. Sanitized, Equipment, Parking, Refreshments"
                    value={formData.inclusions}
                    onChange={handleField('inclusions')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#CE202966' },
                        '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                      }
                    }}
                  />
                </Box>
              </Box>
            </motion.div>
          )}

          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'none', fontSize: '1rem' }}
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setView('DASHBOARD')}
                sx={{ borderRadius: 2.5, px: 3, fontWeight: 700, textTransform: 'none', border: '2px solid' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => step === 2 ? handleSubmit() : setStep(step + 1)}
                sx={{
                  bgcolor: '#CE2029',
                  px: 5,
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 800,
                  textTransform: 'none',
                  boxShadow: '0 8px 20px -4px rgba(206, 32, 41, 0.4)',
                  '&:hover': { bgcolor: '#d43d35', transform: 'translateY(-2px)' }
                }}
              >
                {step === 2 ? 'Create Event' : 'Continue'}
              </Button>
            </Box>
          </Box>
        </PremiumCard>
      </Box>
    );
  };

  const ParticipantRegistration = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Athlete Registry</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{participants.length} confirmed entries</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            size="small"
            placeholder="Search roster..."
            InputProps={{
              startAdornment: <Search sx={{ fontSize: 20, mr: 1, opacity: 0.5 }} />,
              sx: { borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }
            }}
            sx={{ flex: 1 }}
          />
          <IconButton sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: 2 }}>
            <FilterList />
          </IconButton>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        bgcolor: 'transparent'
      }}>
        <Table>
          <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5, py: 2 }}>Athlete Identity</TableCell>
              <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5, py: 2 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5, py: 2 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5, py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((row) => (
              <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 40, height: 40,
                        bgcolor: '#CE202922', color: '#CE2029',
                        fontWeight: 800, fontSize: '1rem',
                        border: '2px solid', borderColor: '#CE202944'
                      }}
                    >
                      {row.name?.[0] || 'A'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{row.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{row.contact}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>{row.category}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      borderRadius: 1.5,
                      bgcolor: row.status === 'Approved' ? '#10B98115' : (row.status === 'Pending' ? '#F59E0B15' : '#EF444415'),
                      color: row.status === 'Approved' ? '#10B981' : (row.status === 'Pending' ? '#F59E0B' : '#EF4444'),
                      border: '1px solid',
                      borderColor: 'currentColor'
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Approve">
                      <IconButton 
                        size="small" 
                        onClick={() => handleUpdateStatus(row.id, 'Approved')}
                        sx={{ color: '#10B981', '&:hover': { bgcolor: '#10B98110' } }}
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton 
                        size="small" 
                        onClick={() => handleUpdateStatus(row.id, 'Rejected')}
                        sx={{ color: '#EF4444', '&:hover': { bgcolor: '#EF444410' } }}
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Partner Portfolio</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Manage event sponsors and branding assets</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            bgcolor: '#CE2029',
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            '&:hover': { bgcolor: '#d43d35' }
          }}
          onClick={() => setIsSponsorDialogOpen(true)}
        >
          Add Partner
        </Button>
      </Box>

      <Grid container spacing={3}>
        {sponsors.map((sponsor) => (
          <Grid item xs={12} sm={6} key={sponsor.id}>
            <PremiumCard sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{
                width: 64, height: 64,
                borderRadius: 3,
                p: 1,
                bgcolor: 'white',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img src={sponsor.logo} alt={sponsor.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{sponsor.name}</Typography>
                <Chip
                  label={sponsor.type}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    mb: 1,
                    bgcolor: sponsor.type === 'Main Sponsor' ? '#CE202915' : 'rgba(0,0,0,0.05)',
                    color: sponsor.type === 'Main Sponsor' ? '#CE2029' : 'text.secondary'
                  }}
                />
                <Link
                  href={sponsor.website}
                  target="_blank"
                  sx={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': { color: '#CE2029' }
                  }}
                >
                  {sponsor.website.replace('https://', '')}
                </Link>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <IconButton size="small" onClick={() => {
                  setSponsorForm({ name: sponsor.name, type: sponsor.type, website: sponsor.website, logo: sponsor.logo });
                  setEditingSponsor(sponsor);
                  setIsSponsorDialogOpen(true);
                }}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => setSponsors(sponsors.filter(s => s.id !== sponsor.id))}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </PremiumCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const ResultsManagement = () => (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{
          display: 'inline-flex', p: 2, borderRadius: '50%',
          bgcolor: isPublished ? '#10B98115' : '#CE202915', mb: 2
        }}>
          <MilitaryTech sx={{ fontSize: 48, color: isPublished ? '#10B981' : '#CE2029' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {isPublished ? (isPubliclyVisible ? 'Tournament Concluded' : 'Results Archived') : 'Tournament Outcome'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {isPublished
            ? (isPubliclyVisible ? 'Official results are live for all participants' : 'Results are preserved but hidden from public')
            : 'Declare winners and certify the final leaderboard'}
        </Typography>
      </Box>

      {isPublished ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: '#10B981', letterSpacing: 2, mb: 2, display: 'block' }}>Official Podium</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { rank: 'Gold Medalist', color: '#FFD700', id: resultWinner, label: 'Winner' },
                { rank: 'Silver Medalist', color: '#C0C0C0', id: resultRunnerUp, label: 'Runner Up' }
              ].map((pos, i) => (
                <PremiumCard key={i} sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 3, borderLeft: `4px solid ${pos.color}` }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: `${pos.color}20`, color: pos.color, fontWeight: 900, border: '2px solid' }}>
                    {participants.find(p => p.id === pos.id)?.name[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: pos.color, textTransform: 'uppercase', letterSpacing: 1.5 }}>{pos.rank}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{participants.find(p => p.id === pos.id)?.name || 'N/A'}</Typography>
                  </Box>
                  <EmojiEvents sx={{ color: pos.color, fontSize: 32, opacity: 0.3 }} />
                </PremiumCard>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 2, mb: 2, display: 'block' }}>Certified Scorecard</Typography>
            <PremiumCard sx={{
              height: 240, position: 'relative', overflow: 'hidden', cursor: 'zoom-in',
              '&:hover img': { transform: 'scale(1.05)' }
            }}>
              <img src={scorecardImage} alt="Final Scorecard" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }} />
              <Box sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                display: 'flex', alignItems: 'flex-end', p: 3
              }}>
                <Button variant="contained" size="small" startIcon={<Visibility />} sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', textTransform: 'none', fontWeight: 700 }}>
                  View Full Resolution
                </Button>
              </Box>
            </PremiumCard>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color={isPubliclyVisible ? "warning" : "success"}
              onClick={() => setIsPubliclyVisible(!isPubliclyVisible)}
              sx={{ borderRadius: 2.5, fontWeight: 800, px: 4, py: 1, textTransform: 'none', border: '2px solid' }}
            >
              {isPubliclyVisible ? 'Conceal Results' : 'Broadcast Results'}
            </Button>
            <Button variant="text" color="error" onClick={() => setIsPublished(false)} sx={{ fontWeight: 800, textTransform: 'none' }}>Re-evaluate Outcome</Button>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: '#CE2029', letterSpacing: 2, mb: 2, display: 'block' }}>Define Standings</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { rank: 'Tournament Winner', color: '#FFD700', value: resultWinner, setter: setResultWinner },
                { rank: 'Runner Up', color: '#C0C0C0', value: resultRunnerUp, setter: setResultRunnerUp }
              ].map((pos, i) => (
                <PremiumCard key={i} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>{pos.rank}</Typography>
                    <Select
                      fullWidth variant="standard" disableUnderline displayEmpty
                      value={pos.value} onChange={(e) => pos.setter(e.target.value)}
                      sx={{ fontWeight: 800, fontSize: '1.1rem', color: pos.color }}
                    >
                      <MenuItem value="" disabled>Select Athlete...</MenuItem>
                      {participants.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                    </Select>
                  </Box>
                  {pos.value && (
                    <Avatar sx={{ width: 44, height: 44, bgcolor: `${pos.color}20`, color: pos.color, border: '2px solid' }}>
                      {participants.find(p => p.id === pos.value)?.name[0]}
                    </Avatar>
                  )}
                </PremiumCard>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 2, mb: 2, display: 'block' }}>Scorecard Artifact</Typography>
            <Box
              sx={{
                height: 180, border: '2px dashed', borderColor: scorecardImage ? '#CE2029' : 'divider',
                borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 2, overflow: 'hidden', position: 'relative',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                transition: 'all 0.3s', '&:hover': { borderColor: '#CE2029' }
              }}
            >
              {scorecardImage ? (
                <>
                  <img src={scorecardImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <IconButton
                    size="small" onClick={() => setScorecardImage(null)}
                    sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: '#CE2029' } }}
                  >
                    <Close />
                  </IconButton>
                </>
              ) : (
                <>
                  <CloudUpload sx={{ fontSize: 40, opacity: 0.2 }} />
                  <Button variant="outlined" component="label" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                    Upload Results
                    <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && setScorecardImage(URL.createObjectURL(e.target.files[0]))} />
                  </Button>
                </>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handlePublishResults}
              disabled={publishStatus === 'PUBLISHING'}
              sx={{
                bgcolor: '#36454F', px: 8, py: 1.5, borderRadius: 3, fontWeight: 900,
                fontSize: '1rem', textTransform: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                '&:hover': { bgcolor: 'black', transform: 'translateY(-2px)' }
              }}
            >
              {publishStatus === 'PUBLISHING' ? 'Certifying...' : 'Finalize & Publish Results'}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const ExpenseTracker = () => (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Disbursement Log</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Track all operational expenditures for this event</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Receipt />}
          sx={{ bgcolor: '#36454F', borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3 }}
          onClick={() => setIsExpenseDialogOpen(true)}
        >
          New Entry
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: 'transparent' }}>
        <Table>
          <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5 }}>Chronology</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1.5 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{row.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{row.notes}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: '#EF4444' }}>{row.amount} OMR</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{row.date}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton size="small"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setExpenses(expenses.filter(e => e.id !== row.id))}><Delete fontSize="small" /></IconButton>
                  </Box>
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Fiscal Overlook</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Real-time revenue metrics vs operational disbursements</Typography>
        </Box>

        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={5}>
            <PremiumCard sx={{
              p: 4, height: '100%', background: '#36454F', color: 'white', position: 'relative',
              '&::after': {
                content: '""', position: 'absolute', top: 0, right: 0, width: '100%', height: '100%',
                background: 'radial-gradient(circle at top right, rgba(206, 32, 41, 0.15), transparent 75%)',
                pointerEvents: 'none'
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2.5, fontWeight: 600 }}>Current Net Surplus</Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.04em', display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  {(activeEvent?.revenue || 0) - (activeEvent?.expenses || 0)} 
                  <Typography component="span" variant="h5" sx={{ opacity: 0.5, fontWeight: 400 }}>OMR</Typography>
                </Typography>
                <Chip
                  icon={<TrendingUp style={{ color: '#10B981', fontSize: 16 }} />}
                  label="PROFESSIONAL TIERS"
                  size="small"
                  sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 700, px: 1, border: '1px solid rgba(16, 185, 129, 0.2)' }}
                />
                <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>Gross Collections</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{activeEvent?.revenue || 0} OMR</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>Total Disbursements</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#CE2029', letterSpacing: '-0.01em' }}>{activeEvent?.expenses || 0} OMR</Typography>
                  </Box>
                </Box>
              </Box>
            </PremiumCard>
          </Grid>
          <Grid item xs={12} md={7}>
            <PremiumCard sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, mb: 4, color: 'text.secondary' }}>Revenue Allocation</Typography>
              <Box sx={{ flex: 1, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB"} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'text.secondary', fontWeight: 700, fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'text.secondary', fontWeight: 700, fontSize: 11 }}
                    />
                    <RechartsTooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        borderRadius: 16, border: 'none',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        bgcolor: isDark ? '#1a1d24' : '#fff'
                      }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={60}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </PremiumCard>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // --- RENDER CONTROLLER ---
  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: isDark ? '#36454F' : '#F9FAFB',
      color: isDark ? 'white' : '#36454F', p: 1.5,
      '& .MuiTypography-root': { fontFamily: "'Inter', sans-serif" },
      '& .MuiButton-root, & input, & textarea, & select': { fontFamily: "'Inter', sans-serif" }
    }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.45)',
            bgcolor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 251, 235, 0.95)',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Demo UI: event banner scheduling here is local-only. Use Events admin + CMS for published events.
          </Typography>
        </Box>
        {/* View Switcher Tabs (Only if not in details view) */}
        {view !== 'DETAILS' && (
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{
              p: 0.75,
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'white',
              borderRadius: 4,
              boxShadow: isDark ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'divider',
              display: 'flex',
              gap: 1
            }}>
              {[
                { label: 'Dashboard', id: 'DASHBOARD' },
                { label: 'Calendar Grid', id: 'CALENDAR' },
                { label: 'Create Event', id: 'FORM' }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  sx={{
                    px: 2.5, py: 0.75, borderRadius: 2.5,
                    textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
                    bgcolor: view === tab.id ? '#CE2029' : 'transparent',
                    color: view === tab.id ? 'white' : 'text.secondary',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: view === tab.id ? '#CE2029' : 'rgba(0,0,0,0.03)',
                      transform: view === tab.id ? 'none' : 'translateY(-1px)'
                    }
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </Box>
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
                onBack={() => setView('DASHBOARD')}
                onAction={() => setView('DASHBOARD')}
                actionLabel="Exit Management"
              />

              <Box sx={{
                mb: 4, display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' }
              }}>
                {[
                  { label: 'Roster', icon: <Groups sx={{ fontSize: 20 }} /> },
                  { label: 'Partners', icon: <CorporateFare sx={{ fontSize: 20 }} /> },
                  { label: 'Outcome', icon: <EmojiEvents sx={{ fontSize: 20 }} /> },
                  { label: 'Logistics', icon: <Receipt sx={{ fontSize: 20 }} /> },
                  { label: 'Treasury', icon: <AccountBalance sx={{ fontSize: 20 }} /> }
                ].map((tab, i) => (
                  <Button
                    key={tab.label}
                    onClick={() => setActiveSubTab(i)}
                    startIcon={tab.icon}
                    sx={{
                      borderRadius: 3, px: 3, py: 1.25, flexShrink: 0,
                      textTransform: 'none', fontWeight: 800, fontSize: '0.85rem',
                      bgcolor: activeSubTab === i ? (isDark ? 'white' : '#36454F') : 'transparent',
                      color: activeSubTab === i ? (isDark ? '#36454F' : 'white') : 'text.secondary',
                      border: '1px solid',
                      borderColor: activeSubTab === i ? 'transparent' : 'divider',
                      boxShadow: activeSubTab === i ? '0 10px 20px -5px rgba(0,0,0,0.2)' : 'none',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: activeSubTab === i ? undefined : 'rgba(0,0,0,0.03)',
                        borderColor: activeSubTab === i ? 'transparent' : '#CE202944'
                      }
                    }}
                  >
                    {tab.label}
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

      {/* MODAL DIALOGS */}
      <Dialog open={isSponsorDialogOpen} onClose={() => { setIsSponsorDialogOpen(false); setEditingSponsor(null); setSponsorForm({ name: '', type: 'Main Sponsor', website: '', logo: '' }); }} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>{editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Sponsor Name" fullWidth size="small" sx={{ mt: 1 }}
            value={sponsorForm.name} onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
          />
          <TextField
            label="Sponsorship Type" fullWidth size="small" select
            value={sponsorForm.type} onChange={(e) => setSponsorForm({ ...sponsorForm, type: e.target.value })}
          >
            <MenuItem value="Main Sponsor">Main Sponsor</MenuItem>
            <MenuItem value="Co-Sponsor">Co-Sponsor</MenuItem>
            <MenuItem value="Partner">Partner</MenuItem>
          </TextField>
          <TextField
            label="Website URL" fullWidth size="small"
            value={sponsorForm.website} onChange={(e) => setSponsorForm({ ...sponsorForm, website: e.target.value })}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            {sponsorForm.logo && (
              <Avatar src={sponsorForm.logo} variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'divider' }} />
            )}
            <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />} sx={{ height: 44, textTransform: 'none' }}>
              {sponsorForm.logo ? 'Change Logo' : 'Upload Logo'}
              <input type="file" hidden accept="image/*" onChange={handleSponsorLogoUpload} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsSponsorDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#CE2029', textTransform: 'none', fontWeight: 600 }}
            onClick={handleAddSponsor}
          >
            {editingSponsor ? 'Save Changes' : 'Add Sponsor'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isExpenseDialogOpen} onClose={() => setIsExpenseDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Log New Expense</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Description" placeholder="e.g. Catering, Equipment" fullWidth size="small" sx={{ mt: 1 }}
            value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
          />
          <TextField
            label="Amount (OMR)" type="number" fullWidth size="small"
            value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
          />
          <TextField
            label="Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }}
            value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
          />
          <TextField
            label="Context/Notes" multiline rows={2} fullWidth size="small"
            value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#36454F', textTransform: 'none', fontWeight: 600 }}
            onClick={handleAddExpense}
          >
            Create Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Event Details Modal ── */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); }}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        <Box sx={{ p: 3, bgcolor: '#36454F', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Edit sx={{ color: '#CE2029' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1 }}>Edit Event Details</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>Construct and Refine: {editingEvent?.name}</Typography>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, display: 'block' }}>
              Event Name
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              placeholder="e.g. Badminton Championship"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                  '&:hover fieldset': { borderColor: '#CE202944' },
                  '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                }
              }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, display: 'block' }}>
                Event Type
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  sx={{ 
                    borderRadius: 3, 
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CE202944' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#CE2029' }
                  }}
                >
                  <MenuItem value="Tournament">Tournament</MenuItem>
                  <MenuItem value="Camp">Training Camp</MenuItem>
                  <MenuItem value="Special Event">Special Event</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, display: 'block' }}>
                Deployment Status
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  sx={{ 
                    borderRadius: 3, 
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CE202944' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#CE2029' }
                  }}
                >
                  <MenuItem value="Upcoming">Upcoming</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, display: 'block' }}>
                Event Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                variant="outlined"
                value={editFormData.date}
                onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                    '&:hover fieldset': { borderColor: '#CE202944' },
                    '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, display: 'block' }}>
                Event Time
              </Typography>
              <TextField
                fullWidth
                type="time"
                variant="outlined"
                value={editFormData.time}
                onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                    '&:hover fieldset': { borderColor: '#CE202944' },
                    '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, display: 'block' }}>
                Event Venue
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={editFormData.venue}
                onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                placeholder="e.g. Court 1"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                    '&:hover fieldset': { borderColor: '#CE202944' },
                    '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, display: 'block' }}>
                Entry Fee (OMR)
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={editFormData.entryFee}
                onChange={(e) => setEditFormData({ ...editFormData, entryFee: e.target.value })}
                placeholder="0.000"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                    '&:hover fieldset': { borderColor: '#CE202944' },
                    '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                  }
                }}
              />
            </Grid>
          </Grid>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, display: 'block' }}>
              Event Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              placeholder="Enter brief event description..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                  '&:hover fieldset': { borderColor: '#CE202944' },
                  '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                }
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, display: 'block' }}>
              Rules & Guidelines (One per line)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={editFormData.rules}
              onChange={(e) => setEditFormData({ ...editFormData, rules: e.target.value })}
              placeholder="1. Wear proper sports shoes..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                  '&:hover fieldset': { borderColor: '#CE202944' },
                  '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                }
              }}
            />
          </Box>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#CE2029', textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, display: 'block' }}>
              What's Included (Amenities, comma separated)
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={editFormData.inclusions}
              onChange={(e) => setEditFormData({ ...editFormData, inclusions: e.target.value })}
              placeholder="e.g. Sanitized, Equipment, Parking"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                  '&:hover fieldset': { borderColor: '#CE202944' },
                  '&.Mui-focused fieldset': { borderColor: '#CE2029' }
                }
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1.5 }}>
              Visual Identity (Banner)
            </Typography>
            <Box sx={{ position: 'relative', borderRadius: 4, overflow: 'hidden', height: 160, border: '1px solid', borderColor: 'divider' }}>
              <img src={editFormData.banner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Box sx={{ position: 'absolute', bottom: 12, right: 12 }}>
                <Button
                  component="label"
                  variant="contained"
                  size="small"
                  startIcon={<CloudUpload />}
                  sx={{ bgcolor: 'rgba(54, 69, 79, 0.8)', backdropFilter: 'blur(8px)', textTransform: 'none', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#CE2029' } }}
                >
                  {isEditUploading ? 'Uploading...' : 'Swap Image'}
                  <input type="file" hidden accept="image/*" onChange={handleEditFileUpload} />
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', gap: 1.5 }}>
          <Button
            onClick={() => setIsEditModalOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', borderRadius: 2 }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateEvent}
            sx={{
              bgcolor: '#CE2029', textTransform: 'none', fontWeight: 800,
              borderRadius: 2.5, px: 4,
              boxShadow: '0 8px 20px -6px rgba(206,32,41,0.4)',
              '&:hover': { bgcolor: '#b01c23', transform: 'translateY(-1px)' }
            }}
          >
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


const Container = ({ children, maxWidth }) => (
  <Box sx={{ maxWidth: maxWidth === 'xl' ? 1400 : 800, mx: 'auto' }}>{children}</Box>
);

export default EventBanners;
