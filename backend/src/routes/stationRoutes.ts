import express from 'express';
import {
  createStation,
  getStations,
  getStationOrders,
  updateStation,
  deleteStation
} from '../controllers/stationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createStation);
router.get('/', protect, getStations);
router.get('/orders/:stationType', protect, getStationOrders);
router.patch('/:id', protect, updateStation);
router.delete('/:id', protect, deleteStation);

export default router;
