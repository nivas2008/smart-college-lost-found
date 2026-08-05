const express = require('express');
const router = express.Router();
const { createClaim, getClaims, updateClaimStatus } = require('../controllers/claimController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .post(protect, upload.array('proof', 1), createClaim)
  .get(protect, getClaims);

router.route('/:id')
  .put(protect, admin, updateClaimStatus);

module.exports = router;
