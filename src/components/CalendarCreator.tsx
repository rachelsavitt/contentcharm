import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, ArrowLeft } from 'lucide-react';
import { CoverImageUpload } from './CoverImageUpload';

interface Client {
  id: string;
  name: string;
}

interface CalendarCreatorProps {
  onComplete: () => void;
}

const PLATFORMS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'LinkedIn',
  'X (Twitter)',
  'Facebook',
  'Pinterest',
  'Snapchat',
];

export function CalendarCreator({ onComplete }: CalendarCreatorProps) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    platforms: [] as string[],
    cover_image_url: '',
    approval_deadline: '',
  });

  useEffect(() => {
    loadClients();
  }, [user]);

  const loadClients = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name');

    if (!error && data) {
      setClients(data);
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      alert('Please select a client');
      return;
    }

    if (formData.platforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('calendars')
        .insert({
          user_id: user!.id,
          client_id: formData.client_id,
          title: formData.title,
          platforms: formData.platforms,
          cover_image_url: formData.cover_image_url || null,
          approval_deadline: formData.approval_deadline || null,
          niche: '',
          audience: '',
          time_period: 30,
        });

      if (error) throw error;

      onComplete();
    } catch (error) {
      console.error('Error creating calendar:', error);
      alert('Failed to create calendar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={onComplete}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Create New Calendar</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client *
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                You need to add a client first before creating a calendar
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calendar Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., March 2024 Content"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Target Platforms * (Select one or more)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.platforms.includes(platform)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
            {formData.platforms.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {formData.platforms.length} platform{formData.platforms.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cover Image (Optional)
            </label>
            <CoverImageUpload
              value={formData.cover_image_url}
              onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
              onRemove={() => setFormData({ ...formData, cover_image_url: '' })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Approval By (Optional)
            </label>
            <input
              type="date"
              value={formData.approval_deadline}
              onChange={(e) => setFormData({ ...formData, approval_deadline: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Set a deadline for your client to review and approve this calendar
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || clients.length === 0}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Calendar...' : 'Create Calendar'}
          </button>
        </form>
      </div>
    </div>
  );
}
