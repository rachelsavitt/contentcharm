import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  User,
  LogOut,
  Users,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { ClientManagement } from './ClientManagement';
import { CalendarList } from './CalendarList';
import { CalendarCreator } from './CalendarCreator';
import { CalendarView } from './CalendarView';
import { Profile } from './Profile';
import { Onboarding } from './Onboarding';
import { AIAssistant } from './AIAssistant';
import { HelpButton } from './HelpButton';
import { Calendar, supabase } from '../lib/supabase';

type View = 'calendars' | 'clients' | 'create-calendar' | 'view-calendar' | 'profile';

interface Client {
  id: string;
  name: string;
  email: string;
  brand_logo_url?: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  created_at: string;
}

export function Dashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<View>('calendars');
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [profileTab, setProfileTab] = useState<'account' | 'subscription'>('account');

  useEffect(() => {
    const state = location.state as { view?: View; tab?: 'account' | 'subscription' };
    if (state?.view) {
      setView(state.view);
      if (state.view === 'profile' && state.tab) {
        setProfileTab(state.tab);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setShowOnboarding(!data.onboarding_completed);
      } else {
        setShowOnboarding(true);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  useEffect(() => {
    const loadClients = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setClients(data);
      }
      setLoadingClients(false);
    };

    loadClients();
  }, [user]);

  const handleOnboardingComplete = async () => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id);

    setShowOnboarding(false);
  };

  const handleOpenCalendarCreator = () => {
    setView('create-calendar');
    setSidebarOpen(false);
  };

  const handleCalendarSelect = (calendar: Calendar) => {
    setSelectedCalendar(calendar);
    setView('view-calendar');
    setSidebarOpen(false);
  };

  const handleBack = () => {
    setView('calendars');
    setSelectedCalendar(null);
  };

  const handleClientClick = async (clientId: string) => {
    const { data, error } = await supabase
      .from('calendars')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      handleCalendarSelect(data);
    }
    setSidebarOpen(false);
  };

  const getClientInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getClientAvatarColors = (index: number) => {
    const colorPairs = [
      { bg: '#fbeaf0', text: '#72243e' },
      { bg: '#eeedfe', text: '#3c3489' },
      { bg: '#e1f5ee', text: '#0f6e56' },
      { bg: '#faeeda', text: '#854f0b' },
    ];
    return colorPairs[index % colorPairs.length];
  };

  const NavButton = ({ icon: Icon, label, viewName, onClick }: {
    icon: React.ElementType;
    label: string;
    viewName?: View;
    onClick?: () => void;
  }) => (
    <button
      onClick={() => {
        if (onClick) {
          onClick();
        } else if (viewName) {
          setView(viewName);
          setSidebarOpen(false);
        }
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-[10px] transition-colors w-full ${
        view === viewName
          ? 'bg-[#FAF8F4] text-[#1A1612] font-medium'
          : 'text-[#8C8479] hover:bg-[#FAF8F4]/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E8E3DC] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-[#E8E3DC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#c8a84b]" fill="#c8a84b" />
                <h1 className="text-2xl leading-none">
                  <span className="italic" style={{ fontFamily: 'Playfair Display, serif', color: '#c8a84b' }}>Content</span>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'normal', fontWeight: 700, color: '#1a1a18' }}>Charm</span>
                </h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-[#8C8479] hover:text-[#1A1612]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div data-onboarding="calendars-nav">
              <NavButton icon={CalendarIcon} label="Dashboard" viewName="calendars" />
            </div>
            <div data-onboarding="clients-nav">
              <NavButton icon={Users} label="Clients" viewName="clients" />
            </div>
            <NavButton icon={User} label="Profile" viewName="profile" />

            {!loadingClients && clients.length > 0 && (
              <div className="pt-4 mt-4 border-t border-[#E8E3DC]">
                <div className="px-4 mb-3">
                  <p className="text-[9px] uppercase tracking-wider text-[#bbb] font-medium">
                    Active Clients
                  </p>
                </div>
                <div className="space-y-1">
                  {clients.map((client, index) => (
                    <button
                      key={client.id}
                      onClick={() => handleClientClick(client.id)}
                      className="flex items-center gap-3 px-4 py-2 rounded-[10px] transition-colors w-full hover:bg-[#FAF8F4]/50"
                    >
                      <div
                        className="w-[24px] h-[24px] flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                        style={{
                          backgroundColor: getClientAvatarColors(index).bg,
                          color: getClientAvatarColors(index).text,
                          borderRadius: '50%',
                        }}
                      >
                        {getClientInitials(client.name)}
                      </div>
                      <span className="text-[11px] text-[#1A1612] truncate">{client.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-[#E8E3DC]">
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 text-[#c8a84b] hover:bg-[#c8a84b]/10 rounded-[10px] transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-[#E8E3DC] lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#8C8479] hover:text-[#1A1612]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c8a84b]" fill="#c8a84b" />
              <h1 className="text-xl leading-none">
                <span className="italic" style={{ fontFamily: 'Playfair Display, serif', color: '#c8a84b' }}>Content</span>
                <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'normal', fontWeight: 700, color: '#1a1a18' }}>Charm</span>
              </h1>
            </div>
            <div className="w-6" />
          </div>
        </header>

        <main className="flex-1">
          {view === 'calendars' && (
            <CalendarList
              onCalendarSelect={handleCalendarSelect}
              onNewCalendar={() => setView('create-calendar')}
            />
          )}

          {view === 'clients' && <ClientManagement />}

          {view === 'create-calendar' && (
            <CalendarCreator onComplete={handleBack} />
          )}

          {view === 'view-calendar' && selectedCalendar && (
            <CalendarView
              calendar={selectedCalendar}
              onBack={handleBack}
              onUpdate={() => {
                // stay on calendar after save
              }}
            />
          )}

          {view === 'profile' && <Profile initialTab={profileTab} />}
        </main>
      </div>

      {showOnboarding && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onOpenCalendarCreator={handleOpenCalendarCreator}
        />
      )}

      <AIAssistant
        calendarContext={
          selectedCalendar
            ? {
                title: selectedCalendar.title,
                platforms: selectedCalendar.platforms,
                niche: selectedCalendar.niche,
                audience: selectedCalendar.audience,
              }
            : undefined
        }
      />

      <HelpButton />
    </div>
  );
}
