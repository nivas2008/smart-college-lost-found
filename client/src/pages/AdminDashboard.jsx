import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Users, 
  Package, 
  Trash2, 
  Shield, 
  UserX, 
  PackageSearch, 
  Archive, 
  CheckCircle, 
  Activity, 
  Search,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'items'
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [itemStatusFilter, setItemStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get('/api/dashboard/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/users');
      setUsers(data);
    } catch {
      toast.error('Failed to fetch users');
    }
  };

  const fetchItems = async () => {
    try {
      const { data } = await axios.get('/api/items');
      setItems(data);
    } catch {
      toast.error('Failed to fetch items');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchUsers(), fetchItems()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/users/${id}`);
        setUsers(prev => prev.filter(u => u._id !== id));
        toast.success('User deleted successfully');
        fetchAnalytics();
      } catch {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const { data } = await axios.put(`/api/users/${id}`, { role: newRole });
      setUsers(prev => prev.map(u => (u._id === id ? { ...u, role: data.role } : u)));
      toast.success('User role updated');
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/items/${id}`);
        setItems(prev => prev.filter(i => i._id !== id));
        toast.success('Item deleted successfully');
        fetchAnalytics();
      } catch {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await axios.put(`/api/items/${id}`, { status: newStatus });
      setItems(prev => prev.map(item => (item._id === id ? { ...item, status: data.status } : item)));
      toast.success(`Item status updated to ${newStatus}`);
      fetchAnalytics();
    } catch {
      toast.error('Failed to update item status');
    }
  };

  // Filtered Items
  const filteredItems = items.filter(item => {
    const matchesType = itemTypeFilter === 'all' || item.type === itemTypeFilter;
    const matchesStatus = itemStatusFilter === 'all' || item.status === itemStatusFilter;
    const matchesSearch = !searchQuery || 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Filtered Users
  const filteredUsers = users.filter(user => {
    return !searchQuery ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const jumpToItems = (type = 'all', status = 'all') => {
    setActiveTab('items');
    setItemTypeFilter(type);
    setItemStatusFilter(status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <Shield className="mr-3 text-primary" size={32} />
            Admin Command Center
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time platform analytics, user administration, and lost & found management
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            onClick={loadAllData}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-lighter border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark shadow-sm transition-all"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Real-time Platform Overview Analytics Cards */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <Activity size={20} className="mr-2 text-primary" />
            Platform Overview (Real-Time)
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Click any metric to inspect corresponding records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Total Users */}
          <div 
            onClick={() => { setActiveTab('users'); }}
            className="bg-white dark:bg-dark-lighter p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 cursor-pointer transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Total Users</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {analytics?.totalUsers ?? users.length}
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">View user directory →</p>
          </div>

          {/* Total Lost Items */}
          <div 
            onClick={() => jumpToItems('lost', 'all')}
            className="bg-white dark:bg-dark-lighter p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 cursor-pointer transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Total Lost Items</span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <PackageSearch size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {analytics?.lostItems ?? items.filter(i => i.type === 'lost').length}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">Filter lost items →</p>
          </div>

          {/* Total Found Items */}
          <div 
            onClick={() => jumpToItems('found', 'all')}
            className="bg-white dark:bg-dark-lighter p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 cursor-pointer transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Total Found Items</span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Archive size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {analytics?.foundItems ?? items.filter(i => i.type === 'found').length}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">Filter found items →</p>
          </div>

          {/* Successful Returns */}
          <div 
            onClick={() => jumpToItems('all', 'resolved')}
            className="bg-white dark:bg-dark-lighter p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 cursor-pointer transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Successful Returns</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {analytics?.successfulReturns ?? items.filter(i => i.status === 'resolved' || i.status === 'returned').length}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">View resolved items →</p>
          </div>

          {/* Active Claims */}
          <div 
            onClick={() => jumpToItems('all', 'claimed')}
            className="bg-white dark:bg-dark-lighter p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 cursor-pointer transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Active Claims</span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Activity size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {analytics?.activeClaims ?? items.filter(i => i.status === 'claimed').length}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">View claimed items →</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex space-x-2 bg-gray-100 dark:bg-dark-lighter p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'users'
                ? 'bg-white dark:bg-dark text-primary shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users size={18} className="mr-2" /> Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'items'
                ? 'bg-white dark:bg-dark text-primary shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Package size={18} className="mr-2" /> Items ({items.length})
          </button>
        </div>

        {/* Global Search Box */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'users' ? 'users by name, email, department...' : 'items by name, description, location...'}`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-lighter text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Items Filtering Sub-toolbar (Only shown when activeTab is 'items') */}
      {activeTab === 'items' && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-dark-lighter border border-gray-200/60 dark:border-gray-800">
          <div className="flex items-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mr-2">
            <Filter size={14} className="mr-1.5" /> Filters:
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Type:</span>
            {['all', 'lost', 'found'].map(t => (
              <button
                key={t}
                onClick={() => setItemTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  itemTypeFilter === t
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white dark:bg-dark text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Status:</span>
            {['all', 'active', 'claimed', 'resolved'].map(s => (
              <button
                key={s}
                onClick={() => setItemStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  itemStatusFilter === s
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white dark:bg-dark text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {(itemTypeFilter !== 'all' || itemStatusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => { setItemTypeFilter('all'); setItemStatusFilter('all'); setSearchQuery(''); }}
              className="text-xs text-red-600 dark:text-red-400 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Main Content Tables */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
          
          {/* USERS TABLE */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-dark-lighter border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50/70 dark:hover:bg-dark-lighter/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{u.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                        {u.mobile && <div className="text-xs text-gray-400 mt-0.5">📞 {u.mobile}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {u.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                          u.role === 'faculty' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        {u.role !== 'admin' ? (
                          <button
                            onClick={() => handleRoleChange(u._id, 'admin')}
                            className="inline-flex items-center text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                            title="Promote to Admin"
                          >
                            <Shield size={16} className="mr-1" /> Make Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(u._id, 'student')}
                            className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="Demote to Student"
                          >
                            <UserX size={16} className="mr-1" /> Demote
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="inline-flex items-center text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete User"
                        >
                          <Trash2 size={16} className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No users match your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ITEMS TABLE */}
          {activeTab === 'items' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-dark-lighter border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type / Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reported By</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manage Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredItems.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50/70 dark:hover:bg-dark-lighter/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.images && item.images.length > 0 ? (
                            <img 
                              src={item.images[0]} 
                              alt={item.name} 
                              className="w-12 h-12 object-cover rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0" 
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 dark:bg-dark-lighter rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0">
                              <Package size={20} />
                            </div>
                          )}
                          <div>
                            <Link to={`/item/${item._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors flex items-center">
                              {item.name}
                              <ExternalLink size={12} className="ml-1 opacity-60" />
                            </Link>
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">{item.description}</div>
                            <div className="text-xs text-gray-400 mt-0.5">📍 {item.location} • {new Date(item.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-block w-fit px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            item.type === 'lost' 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900' 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                          }`}>
                            {item.type.toUpperCase()}
                          </span>
                          <span className={`text-xs font-semibold capitalize ${
                            item.status === 'resolved' || item.status === 'returned'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : item.status === 'claimed'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            ● {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="font-medium text-gray-900 dark:text-white">{item.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{item.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className="text-xs font-medium rounded-lg px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-lighter text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="active">Active</option>
                          <option value="claimed">Claimed</option>
                          <option value="returned">Returned</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="inline-flex items-center text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Item"
                        >
                          <Trash2 size={16} className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No items match your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
