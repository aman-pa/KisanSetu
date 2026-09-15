const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getNearbyFPOs,
  getMyMembership,
  requestJoinFPO,
  getPendingRequests,
  getFPOMembers,
  acceptFarmerRequest,
  rejectFarmerRequest,
  getFarmerDetails,
  getFPOAggregatedInventory,
} = require('../controllers/fpoController');

// All FPO endpoints require authentication
router.use(protect);

// --- Farmer-Facing Endpoints ---
// GET /api/fpo/nearby - Discover eligible FPOs within 10-20 km
router.get('/nearby', getNearbyFPOs);

// GET /api/fpo/my-membership - Get current membership status
router.get('/my-membership', getMyMembership);

// POST /api/fpo/join-request - Request to join an FPO
router.post('/join-request', requestJoinFPO);

// --- FPO Admin Portal Endpoints (FPO & ADMIN Roles Only) ---
// GET /api/fpo/farmers/pending-requests - Get incoming farmer requests
router.get('/farmers/pending-requests', authorize('FPO', 'ADMIN'), getPendingRequests);

// GET /api/fpo/farmers/members - Get active member farmers
router.get('/farmers/members', authorize('FPO', 'ADMIN'), getFPOMembers);

// POST /api/fpo/farmers/accept - Accept a farmer's membership request
router.post('/farmers/accept', authorize('FPO', 'ADMIN'), acceptFarmerRequest);

// POST /api/fpo/farmers/reject - Reject a farmer's membership request
router.post('/farmers/reject', authorize('FPO', 'ADMIN'), rejectFarmerRequest);

// GET /api/fpo/farmers/:id - Get farmer details for modal
router.get('/farmers/:id', authorize('FPO', 'ADMIN'), getFarmerDetails);

// GET /api/fpo/inventory - Get aggregated inventory from active approved member farmers
router.get('/inventory', authorize('FPO', 'ADMIN'), getFPOAggregatedInventory);
router.get('/produce', authorize('FPO', 'ADMIN'), getFPOAggregatedInventory);

module.exports = router;
