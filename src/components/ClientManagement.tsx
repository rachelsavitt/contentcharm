import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, CreditCard as Edit2, Trash2, Users, Sparkles, Loader2, Link as LinkIcon } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { CalendarDatePicker } from './CalendarDatePicker';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  name: string;
  email: string;
  brand_logo_url?: string;
  mockup_logo_url?: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  brand_fonts: {
    heading: string;
    body: string;
  };
  notes?: string;
  brand_dna?: any;
  created_at: string;
}

export function ClientManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('starter');
  const [clientLimit, setClientLimit] = useState<number>(3);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [scrapedDNA, setScrapedDNA] = useState<any>(null);
  const [manualMode, setManualMode] = useState(false);
  const [expressClient, setExpressClient] = useState<any>(null);
  const [expressPlatforms, setExpressPlatforms] = useState<string[]>(['Instagram']);
  const [expressDates, setExpressDates] = useState<string[]>([]);
  const [expressApproval, setExpressApproval] = useState('');
  const [expressLoading, setExpressLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    brand_logo_url: '',
    mockup_logo_url: '',
    brand_colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981'
    },
    brand_fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    notes: ''
  });

  useEffect(() => {
    loadClients();
    loadSubscriptionPlan();
  }, [user]);

  const loadSubscriptionPlan = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .maybeSingle();

    const plan = profile?.subscription_plan || 'starter';
    setSubscriptionPlan(plan);

    const limits: { [key: string]: number } = {
      starter: 3,
      pro: 6,
      agency: Infinity
    };

    setClientLimit(limits[plan]);
  };

  const loadClients = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .or('is_archived.is.null,is_archived.eq.false')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading clients:', error);
      return;
    }

    setClients(data || []);
    setLoading(false);
  };

  const handleScrapeForClient = async () => {
    if (!scrapeUrl.trim()) { setScrapeError('Paste a website URL first'); return; }
    setScraping(true);
    setScrapeError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch('https://bvgkrotyvoungxmfvdnj.supabase.co/functions/v1/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ url: scrapeUrl }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setScrapedDNA(data);
      setFormData((prev) => ({
        ...prev,
        name: prev.name || data.businessName || '',
        brand_logo_url: prev.brand_logo_url || data.logo || '',
        notes: data.brandSummary || prev.notes,
        brand_colors: {
          primary: data.colors?.[0] || prev.brand_colors.primary,
          secondary: data.colors?.[1] || prev.brand_colors.secondary,
          accent: data.colors?.[2] || prev.brand_colors.accent,
        },
      }));
    } catch (err: any) {
      setScrapeError('Could not read that site. Fill in the details manually below.');
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update({
          name: formData.name,
          email: formData.email,
          brand_logo_url: formData.brand_logo_url,
          mockup_logo_url: formData.mockup_logo_url,
          brand_colors: formData.brand_colors,
          brand_dna: scrapedDNA || editingClient?.brand_dna || null,
          brand_fonts: formData.brand_fonts,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingClient.id);

      if (error) {
        console.error('Error updating client:', error);
        return;
      }
    } else {
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
          user_id: user!.id,
          name: formData.name,
          email: formData.email,
          brand_logo_url: formData.brand_logo_url,
          mockup_logo_url: formData.mockup_logo_url,
          brand_colors: formData.brand_colors,
          brand_dna: scrapedDNA || editingClient?.brand_dna || null,
          brand_fonts: formData.brand_fonts,
          notes: formData.notes
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        return;
      }

      // New client created — offer the express "first month" flow instead of just closing
      setExpressClient(newClient);
      setShowModal(false);
      setEditingClient(null);
      resetForm();
      loadClients();
      return;
    }

    setShowModal(false);
    setEditingClient(null);
    resetForm();
    loadClients();
  };

  const handleExpressGenerate = async () => {
    if (!expressClient || expressPlatforms.length === 0) return;
    setExpressLoading(true);
    try {
      // Dates are now picked in the Studio. Default the calendar title to next month.
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const title = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const approval = expressApproval || null;

      const { data: newCal, error } = await supabase
        .from('calendars')
        .insert({
          user_id: user!.id,
          client_id: expressClient.id,
          title,
          platforms: expressPlatforms,
          cover_image_url: null,
          approval_deadline: approval || null,
          niche: '',
          audience: '',
          time_period: 30,
        })
        .select()
        .single();

      if (error) throw error;

      const calId = newCal.id;
      setExpressClient(null);
      setExpressDates([]);
      setExpressPlatforms(['Instagram']);
      setExpressApproval('');
      navigate('/dashboard', { state: { view: 'view-calendar', calendarId: calId, openStudio: true } });
    } catch (err) {
      console.error('Express generate error:', err);
      alert('Could not create the calendar. Please try again.');
    } finally {
      setExpressLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      brand_logo_url: client.brand_logo_url || '',
      mockup_logo_url: client.mockup_logo_url || '',
      brand_colors: client.brand_colors,
      brand_fonts: client.brand_fonts,
      notes: client.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Archiving a client will hide them from your list. They will still count toward your plan limit.')) {
      return;
    }

    const { error } = await supabase
      .from('clients')
      .update({ is_archived: true })
      .eq('id', clientId);

    if (error) {
      console.error('Error archiving client:', error);
      return;
    }

    loadClients();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      brand_logo_url: '',
      mockup_logo_url: '',
      brand_colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981'
      },
      brand_fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      notes: ''
    });
  };

  const handleAddClientClick = async () => {
    if (!user) return;

    const { count, error } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error checking client count:', error);
      return;
    }

    if ((count || 0) >= clientLimit) {
      setShowLimitModal(true);
      return;
    }
    resetForm();
    setEditingClient(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A96E]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-[#1A1612]" style={{ fontFamily: 'DM Serif Display, serif' }}>Clients</h1>
          <p className="text-[#8C8479] mt-1">Manage your client roster and brand kits</p>
        </div>
        <button
          onClick={handleAddClientClick}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[14px] border-2 border-dashed border-[#E8E3DC]">
          <Users className="w-16 h-16 text-[#8C8479] mx-auto mb-4" />
          <h3 className="text-lg text-[#1A1612] mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>No clients yet</h3>
          <p className="text-[#8C8479] mb-4">Add your first client to get started</p>
          <button
            onClick={handleAddClientClick}
            className="btn-primary"
          >
            Add First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="card overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {client.brand_logo_url ? (
                      <img
                        src={client.brand_logo_url}
                        alt={client.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: client.brand_colors.primary }}
                      >
                        {client.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-[#1A1612]" style={{ fontFamily: 'DM Serif Display, serif' }}>{client.name}</h3>
                      {client.email && (
                        <p className="text-sm text-[#8C8479]">{client.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="label-uppercase mb-2">Brand Colors</p>
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded-[8px] border border-[#E8E3DC]"
                        style={{ backgroundColor: client.brand_colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="w-8 h-8 rounded-[8px] border border-[#E8E3DC]"
                        style={{ backgroundColor: client.brand_colors.secondary }}
                        title="Secondary"
                      />
                      <div
                        className="w-8 h-8 rounded-[8px] border border-[#E8E3DC]"
                        style={{ backgroundColor: client.brand_colors.accent }}
                        title="Accent"
                      />
                    </div>
                  </div>
                </div>

                {client.notes && (
                  <p className="text-sm text-[#8C8479] mb-4 line-clamp-2">{client.notes}</p>
                )}

                <div className="flex gap-2 pt-4 border-t border-[#E8E3DC]">
                  <button
                    onClick={() => handleEdit(client)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#FAF8F4] text-[#1A1612] rounded-[8px] hover:bg-[#E8E3DC] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#D4614A]/10 text-[#D4614A] rounded-[8px] hover:bg-[#D4614A]/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {expressClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[14px] max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 6px 24px rgba(26, 22, 18, 0.15)' }}>
            <div className="p-6 border-b border-[#E8E3DC] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A96E]" fill="#C9A96E" />
              <h2 className="text-2xl text-[#1A1612]" style={{ fontFamily: 'DM Serif Display, serif' }}>
                Generate {expressClient.name}'s first month
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="label-uppercase block mb-2">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Pinterest'].map((pf) => (
                    <button
                      key={pf}
                      type="button"
                      onClick={() => setExpressPlatforms((prev) => prev.includes(pf) ? prev.filter((x) => x !== pf) : [...prev, pf])}
                      className="px-3 py-1.5 rounded-[10px] text-sm border transition"
                      style={{
                        borderColor: expressPlatforms.includes(pf) ? '#C9A96E' : '#E8E3DC',
                        backgroundColor: expressPlatforms.includes(pf) ? '#C9A96E10' : 'white',
                        color: expressPlatforms.includes(pf) ? '#C9A96E' : '#1A1612',
                        fontWeight: expressPlatforms.includes(pf) ? 600 : 400,
                      }}
                    >
                      {pf}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-uppercase block mb-2">Approval due date <span className="text-[#8C8479] font-normal normal-case">(optional)</span></label>
                <input
                  type="date"
                  value={expressApproval}
                  onChange={(e) => setExpressApproval(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E8E3DC] rounded-[10px] focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent text-[#1A1612]"
                />
                <p className="text-xs text-[#8C8479] mt-1">Optional — you can set this anytime.</p>
              </div>
            </div>

            <div className="p-6 border-t border-[#E8E3DC] flex gap-3">
              <button
                type="button"
                onClick={() => { setExpressClient(null); setExpressDates([]); setExpressPlatforms(['Instagram']); setExpressApproval(''); }}
                className="flex-1 px-4 py-2 border border-[#E8E3DC] text-[#1A1612] rounded-[10px] hover:bg-[#FAF8F4] transition text-sm"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleExpressGenerate}
                disabled={expressLoading || expressPlatforms.length === 0}
                className="flex-1 px-4 py-2 text-white rounded-[10px] text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: '#C9A96E' }}
              >
                {expressLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Sparkles className="w-4 h-4" fill="white" /> Generate content</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[14px] max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 6px 24px rgba(26, 22, 18, 0.15)' }}>
            <div className="p-6 border-b border-[#E8E3DC]">
              <h2 className="text-2xl text-[#1A1612]" style={{ fontFamily: 'DM Serif Display, serif' }}>
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {!editingClient && (
                <div className="text-center py-4">
                  <h3 className="text-2xl text-[#1A1612] mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>One link. Their whole brand, ready.</h3>
                  <p className="text-sm text-[#8C8479] mb-5">Paste your client's website and we'll build their brand profile in seconds.</p>
                  <div className="flex gap-2 max-w-md mx-auto">
                    <input
                      type="text"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleScrapeForClient(); } }}
                      placeholder="theirwebsite.com"
                      className="flex-1 px-4 py-3 border border-[#E8E3DC] rounded-[12px] text-sm focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent text-[#1A1612]"
                    />
                    <button
                      type="button"
                      onClick={handleScrapeForClient}
                      disabled={scraping}
                      className="px-5 py-3 rounded-[12px] text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 whitespace-nowrap"
                      style={{ backgroundColor: '#C9A96E' }}
                    >
                      {scraping ? <><Loader2 className="w-4 h-4 animate-spin" /> Reading...</> : <><Sparkles className="w-4 h-4" fill="white" /> Build their brand profile</>}
                    </button>
                  </div>
                  {scrapeError && <p className="text-xs text-[#D4614A] mt-2">{scrapeError}</p>}
                  {!scrapedDNA && !manualMode && (
                    <button type="button" onClick={() => setManualMode(true)} className="text-xs text-[#8C8479] underline mt-3 hover:text-[#1A1612]">
                      or set up manually
                    </button>
                  )}
                  {scrapedDNA && !scrapeError && (
                    <div className="mt-4 text-xs text-[#5C564E] text-left max-w-md mx-auto bg-[#C9A96E0D] border border-[#C9A96E33] rounded-[12px] p-3">
                      <span className="font-semibold text-[#1A1612]">Got it.</span> {scrapedDNA.brandSummary}
                      {scrapedDNA.messagingThemes?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {scrapedDNA.messagingThemes.map((t, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#C9A96E1A', color: '#C9A96E' }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(editingClient || scrapedDNA || manualMode) && (
              <>

              <div>
                <label className="label-uppercase block mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E3DC] rounded-[10px] focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent text-[#1A1612]"
                  required
                />
              </div>

              <div>
                <label className="label-uppercase block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E3DC] rounded-[10px] focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent text-[#1A1612]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Logo
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Primary logo for general branding and client profiles
                </p>
                <ImageUpload
                  value={formData.brand_logo_url}
                  onChange={(url) => setFormData({ ...formData, brand_logo_url: url })}
                  onRemove={() => setFormData({ ...formData, brand_logo_url: '' })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mockup Logo (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Secondary logo optimized for social media mockups. Use a version that displays well on smaller screens without being cut off.
                </p>
                <ImageUpload
                  value={formData.mockup_logo_url}
                  onChange={(url) => setFormData({ ...formData, mockup_logo_url: url })}
                  onRemove={() => setFormData({ ...formData, mockup_logo_url: '' })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={formData.brand_colors.primary}
                    onChange={(e) => setFormData({
                      ...formData,
                      brand_colors: { ...formData.brand_colors, primary: e.target.value }
                    })}
                    className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={formData.brand_colors.secondary}
                    onChange={(e) => setFormData({
                      ...formData,
                      brand_colors: { ...formData.brand_colors, secondary: e.target.value }
                    })}
                    className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={formData.brand_colors.accent}
                    onChange={(e) => setFormData({
                      ...formData,
                      brand_colors: { ...formData.brand_colors, accent: e.target.value }
                    })}
                    className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="label-uppercase block mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E3DC] rounded-[10px] focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent text-[#1A1612]"
                  rows={3}
                  placeholder="Internal notes about this client..."
                />
              </div>
              </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClient(null);
                    resetForm();
                    setManualMode(false);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[14px] max-w-md w-full" style={{ boxShadow: '0 6px 24px rgba(26, 22, 18, 0.15)' }}>
            <div className="p-6">
              <h2 className="text-2xl text-[#1A1612] mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
                Client Limit Reached
              </h2>
              <p className="text-[#1A1612] mb-6">
                You've reached your {subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)} plan limit of {clientLimit} clients. Upgrade your plan to add more clients.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    navigate('/dashboard', { state: { view: 'profile', tab: 'subscription' } });
                  }}
                  className="btn-primary flex-1"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
