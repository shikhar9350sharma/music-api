import express from 'express';
const router = express.Router();
import { signup, logout, login, updateProfile , CheckAuth} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';


router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);

router.put('/update-profile', protectRoute ,updateProfile);

router.get('/check', protectRoute, CheckAuth)

export default router;