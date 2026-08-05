import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Upload, X, Loader2 } from 'lucide-react';

const ReportItem = () => {
  const { type } = useParams(); // 'lost' or 'found'
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'electronics',
    brand: '',
    color: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    contactNumber: '',
    reward: '',
    currentStorageLocation: ''
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'electronics', 'documents', 'keys', 'clothing', 'accessories', 'books', 'other'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Store actual files for submission
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData object to handle file uploads
      const submitData = new FormData();
      
      // Append all text fields
      submitData.append('type', type);
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Append all images
      images.forEach(image => {
        submitData.append('images', image);
      });

      // Send to API
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.post('/api/items', submitData, config);
      
      toast.success(`${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to report item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize mb-6">
        Report {type} Item
      </h1>
      
      <div className="bg-white dark:bg-dark-lighter p-8 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors" placeholder="e.g., iPhone 13 Pro, Blue Backpack" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
              <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors" placeholder="Provide detailed description including any unique marks or features..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors capitalize">
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors" placeholder="e.g., Apple, Nike" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors" placeholder="e.g., Black, Navy Blue" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date {type === 'lost' ? 'Lost' : 'Found'} *</label>
              <input type="date" name="date" required value={formData.date} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Approximate Time</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location {type === 'lost' ? 'Lost' : 'Found'} *</label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors" placeholder="e.g., Library 2nd floor, Cafeteria" />
            </div>

            {/* Conditional Fields based on Type */}
            {type === 'lost' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                  <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors" placeholder="Alternate contact if any" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reward (Optional)</label>
                  <input type="text" name="reward" value={formData.reward} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors" placeholder="e.g., $50, Coffee" />
                </div>
              </>
            )}

            {type === 'found' && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Storage Location</label>
                <input type="text" name="currentStorageLocation" value={formData.currentStorageLocation} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-colors" placeholder="e.g., With me, Admin Office, Security Desk" />
              </div>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Images</label>
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl bg-gray-50 dark:bg-dark hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img src={preview} alt="Preview" className="h-24 w-full object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-3 flex items-center justify-center border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin mr-2" size={20} /> Submitting...</>
              ) : (
                `Submit ${type === 'lost' ? 'Lost' : 'Found'} Item Report`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
