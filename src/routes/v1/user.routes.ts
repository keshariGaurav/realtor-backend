import express from 'express';
import passport from 'passport';
import { v1AuthUserControllers } from '../../controllers/index';


const router = express.Router();

router.post('/register', v1AuthUserControllers.signup);
router.post('/login', v1AuthUserControllers.login);
export { router };
