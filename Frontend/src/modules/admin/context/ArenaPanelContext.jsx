import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../user/context/AuthContext';
import { getMyArena } from '../../../services/arenaStaffApi';
import { listAdminArenas } from '../../../services/adminOpsApi';

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

  const [allArenas, setAllArenas] = useState([]);
  const [selectedArenaId, setSelectedArenaIdState] = useState(() => {
    return localStorage.getItem('selectedArenaId') || '';
  });

  const setSelectedArenaId = useCallback((id) => {
    localStorage.setItem('selectedArenaId', id);
    setSelectedArenaIdState(id);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      if (user.role === 'SUPER_ADMIN') {
        const arenasData = await listAdminArenas();
        const list = arenasData.arenas || [];
        setAllArenas(list);

        let activeId = selectedArenaId;
        if (!activeId && list.length > 0) {
          activeId = list[0]._id || list[0].id;
          localStorage.setItem('selectedArenaId', activeId);
          setSelectedArenaIdState(activeId);
        }

        if (activeId) {
          const data = await getMyArena();
          setArena(data.arena);
          setCourts(data.courts || []);
        } else {
          setArena(null);
          setCourts([]);
        }
      } else {
        if (user.assignedArena === 'all') {
          setLoading(false);
          return;
        }
        const data = await getMyArena();
        setArena(data.arena);
        setCourts(data.courts || []);
      }
    } catch (err) {
      console.error('Error fetching arena panel data:', err);
      setError(err.message || 'Failed to load arena data');
    } finally {
      setLoading(false);
    }
  }, [user, selectedArenaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = {
    arena,
    courts,
    loading,
    error,
    arenaId: user?.role === 'SUPER_ADMIN' ? selectedArenaId : user?.assignedArena,
    allArenas,
    selectedArenaId,
    setSelectedArenaId,
    refetch: fetchData
  };

  return (
    <ArenaPanelContext.Provider value={value}>
      {children}
    </ArenaPanelContext.Provider>
  );
};
