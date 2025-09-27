import { Router } from 'express';
import { 
  addToWishlist, 
  removeFromWishlist, 
  getWishlist, 
  clearWishlist 
} from '../controllers/wishlistController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// All wishlist routes require authentication
router.use(verifyToken);

// GET /api/wishlist - Get user's wishlist
router.get('/', getWishlist);

// POST /api/wishlist - Add product to wishlist
router.post('/', addToWishlist);

// DELETE /api/wishlist/:productId - Remove specific product from wishlist
router.delete('/:productId', removeFromWishlist);

// DELETE /api/wishlist - Clear entire wishlist
router.delete('/', clearWishlist);

export default router;