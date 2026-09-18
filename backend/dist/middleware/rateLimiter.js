"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.submissionRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 20, // Max 20 submissions per IP in 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many document submission attempts from this IP address. Please try again after 15 minutes.',
    },
});
