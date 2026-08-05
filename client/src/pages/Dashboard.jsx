import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, Archive, CheckCircle, PackageSearch, Plus } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, itemsRes] = await Promise.all([
          axios.get('/api/dashboard/analytics'),
          axios.get(`/api/items?user=${user._id}`)
        ]);
        setAnalytics(analyticsRes.data);
        setMyItems(itemsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Welcome back, <span className="font-semibold text-primary">{user?.name}</span>!
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <Link to="/report/lost" className="flex items-center px-4 py-2 bg-white dark:bg-dark border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-lg font-medium">
            <Plus size={18} className="mr-2" /> Report Lost
          </Link>
          <Link to="/report/found" className="flex items-center px-4 py-2 bg-primary text-white hover:bg-primary-dark transition-colors rounded-lg font-medium shadow-lg shadow-primary/30">
            <Plus size={18} className="mr-2" /> Report Found
          </Link>
        </div>
      </div>
      
      {/* Platform Analytics Cards */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Platform Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex items-center">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mr-4">
            <PackageSearch size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Lost Items</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.lostItems || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex items-center">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mr-4">
            <Archive size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Found Items</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.foundItems || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex items-center">
          <div className="p-3 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mr-4">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful Returns</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.successfulReturns || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-lighter p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex items-center">
          <div className="p-3 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Claims</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.activeClaims || 0}</p>
          </div>
        </div>
      </div>

      {/* User's Recent Items */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Your Recent Activity</h2>
      <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {myItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            You haven't reported any items yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {myItems.slice(0, 5).map((item) => (
              <li key={item._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <Link to={`/item/${item._id}`} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <PackageSearch className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Reported on {new Date(item.createdAt).toLocaleDateString()} • {item.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                      item.type === 'lost' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {item.type}
                    </span>
                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      item.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {myItems.length > 5 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link to="/browse?user=me" className="text-primary hover:text-primary-dark font-medium text-sm">
              View all your items
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
