import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

// --- 1. DEFINE INTERFACES ---
export interface Statute {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
}

export interface StatuteContextType {
  statutes: Statute[];
  getStatuteById: (id: string) => Statute | undefined;
  loading: boolean;
  error: string | null;
}

// --- 2. CREATE CONTEXT ---
const StatuteContext = createContext<StatuteContextType | undefined>(undefined);

// --- 3. CREATE PROVIDER ---
interface StatuteProviderProps {
  children: ReactNode;
}

const API_URL = 'http://127.0.0.1:8000/api';

export const StatuteProvider: React.FC<StatuteProviderProps> = ({
  children,
}) => {
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatutes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/statutes`);
        if (!response.ok) {
          throw new Error('Failed to fetch statutes.');
        }
        const data: Statute[] = await response.json();
        setStatutes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatutes();
  }, []);

  const getStatuteById = (id: string): Statute | undefined => {
    return statutes.find((s) => s.id === id);
  };

  const value = {
    statutes,
    getStatuteById,
    loading,
    error,
  };

  return (
    <StatuteContext.Provider value={value}>{children}</StatuteContext.Provider>
  );
};

// --- 4. CREATE CUSTOM HOOK ---
export const useStatutes = () => {
  const context = useContext(StatuteContext);
  if (context === undefined) {
    throw new Error('useStatutes must be used within a StatuteProvider');
  }
  return context;
};
