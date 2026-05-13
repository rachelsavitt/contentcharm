import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, Clock, Share2, Trash2, Plus, Copy } from 'lucide-react';

interface CalendarListProps {
  onCalendarSelect: (calendar: Calendar) => void;
  onNewCalendar: () => void;
}

interface Client {
  id: string;
  name: string;
  brand_logo_url?: string;
}

export function CalendarList({ onCalendarSelect, onNewCalendar }: CalendarListProps) {
  const { user } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicatingCalendar, setDuplicatingCalendar] = useState<Calendar | null>(null);
  const [duplicateFormData, setDuplicateFormData] = useState({
    title: '',
    month: '',
    copyPosts: true,
    resetStatuses: true,
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [calendarsData, clientsData] = await Promise.all([
        supabase
          .from('calendars')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('id, name, brand_logo_url')
          .eq('user_id', user.id)
      ]);

      if (calendarsData.data) {
        setCalendars(calendarsData.data);
      }

      if (clientsData.data) {
        const clientsMap: Record<string, Client> = {};
        clientsData.data.forEach((client) => {
          clientsMap[client.id] = client;
        });
        setClients(clientsMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (calendar: Calendar) => {
    if (!confirm(`Delete "${calendar.title}"? This will also delete all posts.`)) {
      return;
    }

    const { error } = await supabase
      .from('calendars')
      .delete()
      .eq('id', calendar.id);

    if (error) {
      console.error('Error deleting calendar:', error);
      alert('Failed to delete calendar');
      return;
    }

    loadData();
  };

  const openDuplicateModal = (calendar: Calendar) => {
    setDuplicatingCalendar(calendar);
    setDuplicateFormData({
      title: `${calendar.title} — Copy`,
      month: new Date().toISOString().slice(0, 7), // YYYY-MM format
      copyPosts: true,
      resetStatuses: true,
    });
    setShowDuplicateModal(true);
  };

  const handleDuplicate = async () => {
    if (!duplicatingCalendar || !user) return;

    try {
      // Create the new calendar
      const { data: newCalendar, error: calendarError } = await supabase
        .from('calendars')
        .insert({
          user_id: user.id,
          client_id: duplicatingCalendar.client_id,
          title: duplicateFormData.title,
          platforms: duplicatingCalendar.platforms,
          cover_image_url: duplicatingCalendar.cover_image_url,
          approval_deadline: null,
          niche: duplicatingCalendar.niche || '',
          audience: duplicatingCalendar.audience || '',
          time_period: duplicatingCalendar.time_period || 30,
        })
        .select()
        .single();

      if (calendarError) throw calendarError;

      // Copy posts if requested
      if (duplicateFormData.copyPosts && newCalendar) {
        const { data: originalPosts, error: postsError } = await supabase
          .from('calendar_posts')
          .select('*')
          .eq('calendar_id', duplicatingCalendar.id);

        if (postsError) throw postsError;

        if (originalPosts && originalPosts.length > 0) {
          // Calculate date offset
          const originalDate = new Date(duplicatingCalendar.created_at);
          const newDate = new Date(duplicateFormData.month + '-01');
          const monthsDiff = (newDate.getFullYear() - originalDate.getFullYear()) * 12 +
                           (newDate.getMonth() - originalDate.getMonth());

          const newPosts = originalPosts.map((post) => {
            let newScheduledDate = null;
            if (post.scheduled_date) {
              const oldDate = new Date(post.scheduled_date + 'T12:00:00');
              const adjustedDate = new Date(oldDate.setMonth(oldDate.getMonth() + monthsDiff));
              newScheduledDate = adjustedDate.toISOString().split('T')[0];
            }

            return {
              calendar_id: newCalendar.id,
              title: post.title,
              caption: post.caption,
              platform: post.platform,
              platforms: post.platforms || [post.platform],
              scheduled_date: newScheduledDate,
              image_url: post.image_url,
              video_url: post.video_url,
              thumbnail_url: post.thumbnail_url,
              media_type: post.media_type,
              approval_status: duplicateFormData.resetStatuses ? 'pending' : post.approval_status,
              client_feedback: duplicateFormData.resetStatuses ? null : post.client_feedback,
              reactions: [],
            };
          });

          const { error: insertError } = await supabase
            .from('calendar_posts')
            .insert(newPosts);

          if (insertError) throw insertError;
        }
      }

      setShowDuplicateModal(false);
      setDuplicatingCalendar(null);
      await loadData();

      // Show success and open the new calendar
      if (newCalendar) {
        onCalendarSelect(newCalendar);
      }
    } catch (error) {
      console.error('Error duplicating calendar:', error);
      alert('Failed to duplicate calendar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A96E]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-[#1A1612]" style={{ fontFamily: 'DM Serif Display, serif' }}>Content Calendars</h1>
          <p className="text-[#8C8479] mt-1">Manage your client content calendars</p>
        </div>
        <button
          onClick={onNewCalendar}
          className="btn-primary flex items-center gap-2"
          data-onboarding="new-calendar-btn"
        >
          <Plus className="w-5 h-5" />
          New Calendar
        </button>
      </div>

      {calendars.length === 0 ? (
        <div className="bg-white rounded-[14px] border-2 border-dashed border-[#E8E3DC] p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-[#8C8479] mx-auto mb-4" />
          <h3 className="text-lg text-[#1A1612] mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>No Calendars Yet</h3>
          <p className="text-[#8C8479] mb-4">Create your first content calendar for a client</p>
          <button
            onClick={onNewCalendar}
            className="btn-primary"
          >
            Create First Calendar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calendars.map((calendar) => {
            const client = calendar.client_id ? clients[calendar.client_id] : null;

            return (
              <div
                key={calendar.id}
                className="card overflow-hidden"
              >
                {calendar.cover_image_url ? (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={calendar.cover_image_url}
                      alt={calendar.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-2 bg-gradient-to-r from-[#C9A96E] to-[#7C9E8A]"></div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        onClick={() => onCalendarSelect(calendar)}
                        className="text-lg text-[#1A1612] mb-1 hover:text-[#C9A96E] cursor-pointer"
                        style={{ fontFamily: 'DM Serif Display, serif' }}
                      >
                        {calendar.title}
                      </h3>
                      {client && (
                        <div className="flex items-center gap-2 text-sm text-[#8C8479]">
                          {client.brand_logo_url && (
                            <img
                              src={client.brand_logo_url}
                              alt={client.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          )}
                          <span>{client.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openDuplicateModal(calendar)}
                        className="text-[#8C8479] hover:text-[#7C9E8A] transition-colors p-1 rounded hover:bg-[#7C9E8A]/10"
                        title="Duplicate calendar"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(calendar)}
                        className="text-[#8C8479] hover:text-[#D4614A] transition-colors p-1 rounded hover:bg-[#D4614A]/10"
                        title="Delete calendar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex flex-wrap gap-2">
                      {calendar.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="platform-badge"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#E8E3DC]">
                    <div className="flex items-center gap-2 text-xs text-[#8C8479]">
                      <Clock className="w-3 h-3" />
                      {new Date(calendar.created_at).toLocaleDateString()}
                    </div>
                    {calendar.share_token && (
                      <div className="flex items-center gap-1 text-xs text-[#7C9E8A]">
                        <Share2 className="w-3 h-3" />
                        Shareable
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onCalendarSelect(calendar)}
                    className="btn-primary w-full mt-4"
                  >
                    View Calendar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDuplicateModal && duplicatingCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-[#1A1612] mb-6" style={{ fontFamily: 'DM Serif Display, serif' }}>
              Duplicate Calendar
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Calendar Name
                </label>
                <input
                  type="text"
                  value={duplicateFormData.title}
                  onChange={(e) => setDuplicateFormData({ ...duplicateFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C9E8A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <input
                  type="month"
                  value={duplicateFormData.month}
                  onChange={(e) => setDuplicateFormData({ ...duplicateFormData, month: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C9E8A] focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={duplicateFormData.copyPosts}
                    onChange={(e) => setDuplicateFormData({ ...duplicateFormData, copyPosts: e.target.checked })}
                    className="w-4 h-4 text-[#7C9E8A] rounded focus:ring-[#7C9E8A]"
                  />
                  <span className="text-sm text-gray-700">Copy posts too</span>
                </label>

                {duplicateFormData.copyPosts && (
                  <label className="flex items-center gap-2 cursor-pointer ml-6">
                    <input
                      type="checkbox"
                      checked={duplicateFormData.resetStatuses}
                      onChange={(e) => setDuplicateFormData({ ...duplicateFormData, resetStatuses: e.target.checked })}
                      className="w-4 h-4 text-[#7C9E8A] rounded focus:ring-[#7C9E8A]"
                    />
                    <span className="text-sm text-gray-700">Reset all approval statuses</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setDuplicatingCalendar(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDuplicate}
                className="flex-1 px-4 py-2 bg-[#1A1612] text-white rounded-lg hover:bg-[#2A2622] transition-colors font-medium"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
