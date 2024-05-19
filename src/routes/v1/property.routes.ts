import express from 'express';
import { v1PropertyControllers } from '../../controllers/index';
import { v1AuthUserControllers } from '../../controllers/index';


const router = express.Router();


router.post('/',v1AuthUserControllers.protect,v1AuthUserControllers.restrictTo('seller'), v1PropertyControllers.create);
router.patch(
    '/:id',
    v1AuthUserControllers.protect,
    v1AuthUserControllers.restrictTo('seller'),
    v1PropertyControllers.verifySellerOfRealtor,
    v1PropertyControllers.update
);
router.delete(
    '/:id',
    v1AuthUserControllers.protect,
    v1AuthUserControllers.restrictTo('seller'),
    v1PropertyControllers.verifySellerOfRealtor,
    v1PropertyControllers.remove
);
router.get(
    '/',
    v1AuthUserControllers.protect,
    v1AuthUserControllers.restrictTo('seller'),
    v1PropertyControllers.getAllOfSeller
);
router.get(
    '/all-realtor',
    v1AuthUserControllers.protect,
    v1AuthUserControllers.restrictTo('buyer'),
    v1PropertyControllers.getAllProperty
);
router.get(
    '/seller-details',
    v1AuthUserControllers.protect,
    v1AuthUserControllers.restrictTo('buyer'),
    v1PropertyControllers.getSellerDetails
);

export { router };
