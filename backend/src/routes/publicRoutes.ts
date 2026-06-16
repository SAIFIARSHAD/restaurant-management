import { Router } from 'express';
import {
  getPublicRestaurantInfo,
  validatePublicTable,
  getPublicMenu,
  createPublicOrder,
  getPublicOrderStatus,
} from '../controllers/publicController';

const router = Router();

router.get('/:slug/restaurant', getPublicRestaurantInfo);
router.get('/:slug/table/:tableId', validatePublicTable);
router.get('/:slug/menu', getPublicMenu);
router.post('/:slug/orders', createPublicOrder);
router.get('/orders/:orderToken', getPublicOrderStatus);
router.post('/:slug/orders', createPublicOrder);

export default router;