import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, PlusCircle } from 'lucide-react';
import axios from 'axios';

const LandingPage = () => {
  const [stats, setStats] = useState({
    itemsReturned: '0',
    activeReports: '0',
    registeredStudents: '0',
    successRate: '100%'
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/dashboard/public-stats');
        setStats({
          itemsReturned: data.itemsReturned !== undefined ? data.itemsReturned.toString() : '0',
          activeReports: data.activeReports !== undefined ? data.activeReports.toString() : '0',
          registeredStudents: data.registeredStudents !== undefined ? data.registeredStudents.toString() : '0',
          successRate: data.successRate || '100%'
        });
      } catch (error) {
        console.error('Failed to load real-time stats', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-dark transition-colors duration-200 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6"
            >
              Smart College <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Lost & Found</span> System
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-10"
            >
              Helping Students Find Their Belongings Faster. A secure and efficient platform to report and claim lost items on campus.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link to="/report/lost" className="flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                <Search className="mr-2" size={20} /> Report Lost Item
              </Link>
              <Link to="/report/found" className="flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-primary bg-white dark:bg-dark-lighter dark:text-white border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
                <PlusCircle className="mr-2" size={20} /> Report Found Item
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <span className="w-2 h-2 mr-2 bg-emerald-500 rounded-full animate-ping"></span>
              Live Campus Metrics
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Items Returned', value: stats.itemsReturned },
              { label: 'Active Reports', value: stats.activeReports },
              { label: 'Registered Students', value: stats.registeredStudents },
              { label: 'Success Rate', value: stats.successRate },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-gray-50 dark:bg-dark border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <h3 className="text-3xl font-bold text-primary mb-2">
                  {loadingStats ? (
                    <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></span>
                  ) : (
                    stat.value
                  )}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
