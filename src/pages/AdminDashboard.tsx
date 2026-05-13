import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, DollarSign, UserCheck, UserX, Search, Download, Mail, AlertTriangle } from 'lucide-react';

interface Metrics {
  totalUsers: number;
  activeSubscriptions: number;
  freeUsers: number;
  mrr: number;
}

interface User {
  id: string;
  email: string;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
  last_sign_in_at: string;
  calendar_count: number;
}

interface Subscription {
  id: string;
  user_id: string;
  user_email: string;
  subscription_tier: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  subscription_status: string;
  current_period_start: string;
  current_period_end: string;
}

interface ErrorLog {
  id: string;
  error_type: string;
  user_email: string;
  error_message: string;
  created_at: string;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    activeSubscriptions: 0,
    freeUsers: 0,
    mrr: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    if (!user || user.email !== adminEmail) {
      navigate('/login');
    } else {
      fetchAdminData();
    }
  }, [user, adminEmail, navigate]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(u =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, users]);

  const fetchAdminData = async () => {
    try {
      await Promise.all([
        fetchMetrics(),
        fetchUsers(),
        fetchSubscriptions(),
        fetchErrorLogs(),
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status');

    if (profiles) {
      const totalUsers = profiles.length;
      const activeSubscriptions = profiles.filter(
        p => p.subscription_status === 'active' && p.subscription_tier !== 'free'
      ).length;
      const freeUsers = profiles.filter(
        p => p.subscription_tier === 'free' || !p.subscription_tier
      ).length;

      const mrr = profiles.reduce((sum, p) => {
        if (p.subscription_status === 'active') {
          if (p.subscription_tier === 'pro') return sum + 29;
          if (p.subscription_tier === 'agency') return sum + 99;
        }
        return sum;
      }, 0);

      setMetrics({ totalUsers, activeSubscriptions, freeUsers, mrr });
    }
  };

  const fetchUsers = async () => {
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, subscription_tier, subscription_status');

    const { data: calendarCounts } = await supabase
      .from('calendars')
      .select('user_id');

    if (authUsers && profiles) {
      const calendarCountMap = (calendarCounts || []).reduce((acc, c) => {
        acc[c.user_id] = (acc[c.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const profileMap = profiles.reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, any>);

      const userList: User[] = authUsers.users.map(u => ({
        id: u.id,
        email: u.email || '',
        subscription_tier: profileMap[u.id]?.subscription_tier || 'free',
        subscription_status: profileMap[u.id]?.subscription_status || 'inactive',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at || u.created_at,
        calendar_count: calendarCountMap[u.id] || 0,
      }));

      setUsers(userList);
      setFilteredUsers(userList);
    }
  };

  const fetchSubscriptions = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .not('stripe_subscription_id', 'is', null);

    if (profiles) {
      const subs: Subscription[] = profiles.map(p => ({
        id: p.id,
        user_id: p.user_id,
        user_email: p.email || '',
        subscription_tier: p.subscription_tier,
        stripe_subscription_id: p.stripe_subscription_id,
        stripe_price_id: p.stripe_price_id || '',
        subscription_status: p.subscription_status,
        current_period_start: p.current_period_start || '',
        current_period_end: p.current_period_end || '',
      }));
      setSubscriptions(subs);
    }
  };

  const fetchErrorLogs = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('error_logs')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setErrorLogs(data);
    }
  };

  const updateUserPlan = async (userId: string, newTier: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_tier: newTier })
      .eq('user_id', userId);

    if (error) {
      alert('Error updating plan: ' + error.message);
    } else {
      setEditingPlan(null);
      fetchUsers();
      fetchMetrics();
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Email', 'Plan', 'Status', 'Joined Date', 'Calendars', 'Last Active'].join(','),
      ...users.map(u =>
        [
          u.email,
          u.subscription_tier,
          u.subscription_status,
          new Date(u.created_at).toLocaleDateString(),
          u.calendar_count,
          new Date(u.last_sign_in_at).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const sendAnnouncement = async () => {
    const message = prompt('Enter announcement message:');
    if (!message) return;

    alert('Email functionality requires an email service integration (e.g., SendGrid, Resend)');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A96E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, subscriptions, and monitor system health</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.activeSubscriptions}</p>
              </div>
              <UserCheck className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Free/Trial Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.freeUsers}</p>
              </div>
              <UserX className="w-12 h-12 text-gray-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${metrics.mrr}</p>
              </div>
              <DollarSign className="w-12 h-12 text-[#C9A96E]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Users</h2>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calendars</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingPlan === u.id ? (
                        <select
                          value={u.subscription_tier}
                          onChange={(e) => updateUserPlan(u.id, e.target.value)}
                          onBlur={() => setEditingPlan(null)}
                          autoFocus
                          className="border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="agency">Agency</option>
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditingPlan(u.id)}
                          className="cursor-pointer hover:text-[#C9A96E] capitalize"
                        >
                          {u.subscription_tier}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          u.subscription_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : u.subscription_status === 'trialing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {u.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{u.calendar_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(u.last_sign_in_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setEditingPlan(u.id)}
                        className="text-[#C9A96E] hover:text-[#B08D5A]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Subscriptions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billing Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stripe ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{s.user_email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">{s.subscription_tier}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${s.subscription_tier === 'pro' ? '29' : s.subscription_tier === 'agency' ? '99' : '0'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                      {s.stripe_subscription_id}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          s.subscription_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {s.subscription_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">Error Logs (Last 30 Days)</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {errorLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No errors logged in the last 30 days
                    </td>
                  </tr>
                ) : (
                  errorLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          {log.error_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.user_email || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.error_message}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="flex gap-4">
              <button
                onClick={sendAnnouncement}
                className="flex items-center gap-2 px-4 py-2 bg-[#C9A96E] text-white rounded-lg hover:bg-[#B08D5A] transition"
              >
                <Mail className="w-5 h-5" />
                Send Announcement Email
              </button>
              <button
                onClick={exportUsers}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Download className="w-5 h-5" />
                Export User List CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
