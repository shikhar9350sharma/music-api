import express from 'express';
const router = express.Router();
import { signup, logout, login } from '../controllers/auth.controller.js';


router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);