import express from 'express';
import { registerUser } from '../controllers/UserController.js';
import { loginUser } from '../controllers/UserController.js';
import { getUserData } from '../controllers/UserController.js';
import { getCars } from '../controllers/UserController.js';
import { protect } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserData);

userRouter.get('/cars', getCars);

export default userRouter;
