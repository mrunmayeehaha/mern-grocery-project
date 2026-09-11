"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    }
    else {
        res.status(403).json({
            message: "Admin access required",
        });
    }
};
exports.default = admin;
