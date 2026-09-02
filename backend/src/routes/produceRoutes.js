const express = require('express');
const {
  createListing,
  getListings,
  getListingById,
  getMyListings,
  deleteListing,
} = require('../controllers/produceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getListings);
router.get('/farmer/my-listings', protect, authorize('FARMER', 'FPO'), getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, authorize('FARMER', 'FPO'), createListing);
router.delete('/:id', protect, authorize('FARMER', 'FPO', 'ADMIN'), deleteListing);

module.exports = router;
