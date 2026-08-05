import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Box } from 'lucide-react';
import { motion } from 'framer-motion';

const BrowseItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'active'
  });

  const categories = ['electronics', 'documents', 'keys', 'clothing', 'accessories', 'books', 'other'];

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Build query string
      let query = new URLSearchParams();
      if (filters.type) query.append('type', filters.type);
      if (filters.category) query.append('category', filters.category);
      if (filters.search) query.append('search', filters.search);
      if (filters.status) query.append('status', filters.status);
      
      const { data } = await axios.get(`/api/items?${query.toString()}`);
      setItems(data);
      
      // Update URL params
      setSearchParams(query);
    } catch (error) {
      console.error("Error fetching items", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Items</h1>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-dark-lighter p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name, description, or location..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          
          <select name="type" value={filters.type} onChange={handleFilterChange} className="md:w-48 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors">
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          
          <select name="category" value={filters.category} onChange={handleFilterChange} className="md:w-48 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors capitalize">
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button type="submit" className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center">
            <Filter size={18} className="mr-2" /> Filter
          </button>
        </form>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-lighter rounded-2xl border border-gray-100 dark:border-gray-800">
          <Box size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No items found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item._id}
              className="bg-white dark:bg-dark-lighter rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group flex flex-col"
            >
              <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Box size={48} />
                  </div>
                )}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md ${
                  item.type === 'lost' ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'
                }`}>
                  {item.type}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                  {item.description}
                </p>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={14} className="mr-1 text-primary" />
                    <span className="line-clamp-1">{item.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={14} className="mr-1 text-primary" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Link to={`/item/${item._id}`} className="mt-4 w-full block text-center py-2 bg-gray-50 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors">
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseItems;
