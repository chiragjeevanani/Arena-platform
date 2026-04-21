import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../user/context/AuthContext';
import { getMyArena, listMyCourts } from '../../../services/arenaStaffApi';

const ArenaPanelContext = createContext();

export const useArenaPanel = () => {
  const context = useContext(ArenaPanelContext);
  if (!context) throw new Error('useArenaPanel must be used within ArenaPanelProvider');
  return context;
};

export const ArenaPanelProvider = ({ children }) => {
  const { user } = useAuth();
  const [arena, setArena] = useState(null);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user || user.assignedArena === 'all') {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await getMyArena();
      setArena(data.arena);
      setCourts(data.courts || []);
    } catch (err) {
      console.error('Error fetching arena panel data:', err);
      setError(err.message || 'Failed to load arena data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = {
    arena,
    courts,
    loading,
    error,
    arenaId: user?.assignedArena,
    refetch: fetchData
  };

  return (
    <ArenaPanelContext.Provider value={value}>
      {children}
    </ArenaPanelContext.Provider>
  );
};
