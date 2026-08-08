import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MapPin, Calendar, Clock, Tag, User, Phone, Box, CheckCircle, ShieldAlert, ArrowLeft } from 'lucide-react';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  
  // Claim modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimProof, setClaimProof] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await axios.get(`/api/items/${id}`);
        setItem(data);
      } catch {
        toast.error("Failed to load item details");
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingClaim(true);
    
    try {
      await axios.post('/api/claims', {
        item: item._id,
        proofOfOwnership: claimProof
      });
      toast.success("Claim submitted successfully! Admins will review it.");
      setShowClaimModal(false);
      // Refresh item to show pending claim status if we added that to the UI, 
      // but for now just redirect or let them know.
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit claim");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleResolve = async () => {
    if(window.confirm("Are you sure you want to mark this item as resolved/returned?")) {
      try {
        await axios.put(`/api/items/${item._id}`, { status: 'resolved' });
        toast.success("Item marked as resolved!");
        setItem({...item, status: 'resolved'});
      } catch {
        toast.error("Failed to update status");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) return null;

  const isOwner = user?._id === item.user?._id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to items
      </button>

      <div className="bg-white dark:bg-dark-lighter rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row">
          
          {/* Image Gallery */}
          <div className="md:w-1/2 p-6 bg-gray-50 dark:bg-dark border-r border-gray-100 dark:border-gray-800 flex flex-col">
            <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 mb-4 flex-shrink-0">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[activeImage]} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Box size={64} className="mb-4 opacity-50" />
                  <p>No images provided</p>
                </div>
              )}
              
              <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-bold uppercase backdrop-blur-md shadow-lg ${
                item.type === 'lost' ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'
              }`}>
                {item.type}
              </div>
            </div>
            
            {/* Thumbnails */}
            {item.images && item.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {item.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{item.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                item.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {item.status}
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8 whitespace-pre-wrap">{item.description}</p>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-1"><Tag size={16} className="mr-2" /> Category</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{item.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-1"><MapPin size={16} className="mr-2" /> Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{item.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-1"><Calendar size={16} className="mr-2" /> Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(item.date).toLocaleDateString()}</p>
              </div>
              {item.time && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-1"><Clock size={16} className="mr-2" /> Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.time}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 mb-auto">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Reporter Information</h3>
              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                <User size={16} className="mr-3 text-gray-400" />
                <span>{item.user?.name} ({item.user?.department})</span>
              </div>
              {item.contactNumber && (
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Phone size={16} className="mr-3 text-gray-400" />
                  <span>{item.contactNumber}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              {isOwner ? (
                <div className="flex flex-col space-y-3">
                  <p className="text-sm text-gray-500 text-center mb-2">You reported this item.</p>
                  {item.status === 'active' && (
                    <button 
                      onClick={handleResolve}
                      className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex justify-center items-center"
                    >
                      <CheckCircle size={20} className="mr-2" /> Mark as Resolved
                    </button>
                  )}
                </div>
              ) : (
                item.type === 'found' && item.status === 'active' && (
                  <button 
                    onClick={() => setShowClaimModal(true)}
                    className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 flex justify-center items-center"
                  >
                    <ShieldAlert size={20} className="mr-2" /> Claim this Item
                  </button>
                )
              )}
              {item.type === 'lost' && !isOwner && item.status === 'active' && (
                <a href={`mailto:${item.user?.email}`} className="w-full py-3 block text-center bg-secondary text-white rounded-xl font-medium hover:bg-opacity-90 transition-colors shadow-lg shadow-secondary/30">
                  I Found This Item (Contact Reporter)
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-lighter w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Claim Item</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Please provide detailed proof of ownership (e.g., serial number, specific marks not visible in the photo, lock screen password).
            </p>
            <form onSubmit={handleClaimSubmit}>
              <textarea
                required
                rows="5"
                value={claimProof}
                onChange={(e) => setClaimProof(e.target.value)}
                placeholder="Enter proof of ownership details here..."
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white mb-6 focus:ring-primary focus:border-primary"
              ></textarea>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isSubmittingClaim ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
