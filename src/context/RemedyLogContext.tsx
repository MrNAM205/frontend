import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

// --- 1. DEFINE INTERFACES ---
export interface RemedyEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: 'user' | 'system';
  documentUrl?: string;
  stage: 'notice' | 'response' | 'rebuttal' | 'endorsement';
}

export interface RemedyLogContextType {
  events: RemedyEvent[];
  addEvent: (event: Omit<RemedyEvent, 'id' | 'timestamp'>) => Promise<void>;
  getCompletedStages: () => string[];
  loading: boolean;
  error: string | null;
}

// --- 2. CREATE CONTEXT ---
const RemedyLogContext = createContext<RemedyLogContextType | undefined>(
  undefined,
);

// --- 3. CREATE PROVIDER ---
interface RemedyLogProviderProps {
  children: ReactNode;
}

const API_URL = 'http://127.0.0.1:8000'; // FastAPI backend URL

export const RemedyLogProvider: React.FC<RemedyLogProviderProps> = ({
  children,
}) => {
  const [events, setEvents] = useState<RemedyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/remedy-log`);
        if (!response.ok) {
          throw new Error('Failed to fetch remedy log.');
        }
        const data: RemedyEvent[] = await response.json();
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Function to add a new event via the backend
  const addEvent = async (event: Omit<RemedyEvent, 'id' | 'timestamp'>) => {
    try {
      const response = await fetch(`${API_URL}/remedy-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      if (!response.ok) {
        throw new Error('Failed to post new event.');
      }
      const newEvent: RemedyEvent = await response.json();
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    } catch (err: any) {
      setError(err.message);
      // Optionally re-throw or handle as needed
      throw err;
    }
  };

  // Function to determine which stages are completed
  const getCompletedStages = (): string[] => {
    const completed = new Set<string>();
    events.forEach((event) => completed.add(event.stage));
    return Array.from(completed);
  };

  const value = {
    events,
    addEvent,
    getCompletedStages,
    loading,
    error,
  };

  return (
    <RemedyLogContext.Provider value={value}>
      {children}
    </RemedyLogContext.Provider>
  );
};

// --- 4. CREATE CUSTOM HOOK ---
export const useRemedyLog = () => {
  const context = useContext(RemedyLogContext);
  if (context === undefined) {
    throw new Error('useRemedyLog must be used within a RemedyLogProvider');
  }
  return context;
};
