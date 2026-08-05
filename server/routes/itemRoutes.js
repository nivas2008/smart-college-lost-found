const express = require('express');
const router = express.Router();
const { createItem, getItems, getItemById, updateItem, deleteItem } = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .post(protect, upload.array('images', 5), createItem)
  .get(getItems);
  
router.route('/:id')
  .get(getItemById)
  .put(protect, upload.array('images', 5), updateItem)
  .delete(protect, deleteItem);

module.exports = router;
