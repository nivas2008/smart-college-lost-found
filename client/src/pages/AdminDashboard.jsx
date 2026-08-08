import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Users, Package, Trash2, Shield, UserX } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'users') {
        await fetchUsers();
      } else {
        await fetchItems();
      }
      setLoading(false);
    };
    loadData();
  }, [activeTab]);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        toast.success('User deleted successfully');
      } catch {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const { data } = await axios.put(`/api/users/${id}`, { role: newRole });
      setUsers(users.map(u => (u._id === id ? { ...u, role: data.role } : u)));
      toast.success('User role updated');
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/items/${id}`);
        setItems(items.filter(i => i._id !== id));
        toast.success('Item deleted successfully');
      } catch {
        toast.error('Failed to delete item');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Panel</h1>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-lighter'
          }`}
        >
          <Users size={20} className="mr-2" /> Manage Users
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'items'
              ? 'bg-secondary text-white shadow-md'
              : 'bg-white dark:bg-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-lighter'
          }`}
        >
          <Package size={20} className="mr-2" /> Manage Items
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
          
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-dark-lighter border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">User Info</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Department</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Role</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.department || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          user.role === 'faculty' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => handleRoleChange(user._id, 'admin')}
                            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                            title="Make Admin"
                          >
                            <Shield size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(user._id, 'student')}
                            className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                            title="Remove Admin"
                          >
                            <UserX size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="inline-flex items-center text-sm text-red-500 hover:text-red-700 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ITEMS TAB */}
          {activeTab === 'items' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-dark-lighter border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Item</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Type / Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Reported By</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{item.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block w-fit px-2 py-0.5 rounded text-xs font-medium ${
                            item.type === 'lost' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {item.type.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{item.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {item.user?.name || 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="inline-flex items-center text-sm text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No items found.</td>
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
