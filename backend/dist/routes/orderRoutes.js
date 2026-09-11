"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const adminMiddleware_1 = __importDefault(require("../middleware/adminMiddleware"));
const router = express_1.default.Router();
router.post("/", authMiddleware_1.default, orderController_1.createOrder);
router.get("/", authMiddleware_1.default, orderController_1.getOrders);
router.put("/:id", authMiddleware_1.default, adminMiddleware_1.default, orderController_1.updateOrderStatus);
exports.default = router;
