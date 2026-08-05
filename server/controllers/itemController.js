const Item = require('../models/Item');

// @desc    Create a new item (lost or found)
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { 
      type, name, description, category, brand, color, 
      date, time, location, currentStorageLocation, contactNumber, reward 
    } = req.body;
    
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        // If Cloudinary is used, file.path contains the full secure URL.
        // If local storage is used, we construct the local path.
        return file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`;
      });
    }

    const item = new Item({
      type,
      name,
      description,
      category,
      brand,
      color,
      date,
      time,
      location,
      currentStorageLocation,
      contactNumber,
      reward,
      images,
      user: req.user._id
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items (can filter by type, status, etc)
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { type, status, category, search, user } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;
    if (user) query.user = user;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(query)
      .populate('user', 'name email department')
      .sort({ createdAt: -1 });
      
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('user', 'name email department collegeId');
      
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (item) {
      // Check if user is owner or admin
      if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this item' });
      }

      item.status = req.body.status || item.status;
      item.name = req.body.name || item.name;
      item.description = req.body.description || item.description;
      item.location = req.body.location || item.location;
      item.currentStorageLocation = req.body.currentStorageLocation || item.currentStorageLocation;
      
      // Handle new images if uploaded
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => {
          return file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`;
        });
        item.images = [...item.images, ...newImages];
      }

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (item) {
      if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this item' });
      }
      await Item.deleteOne({ _id: item._id });
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createItem, getItems, getItemById, updateItem, deleteItem };
