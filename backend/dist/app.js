"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const submission_routes_js_1 = __importDefault(require("./routes/submission.routes.js"));
const health_routes_js_1 = __importDefault(require("./routes/health.routes.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security Headers
app.use((0, helmet_1.default)());
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['https://www.securebooks.co.uk', 'https://securebooks.co.uk', 'http://localhost:5173', 'http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, true); // Allow for local dev flexibility while logging
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Register Routes
app.use('/api', health_routes_js_1.default);
app.use('/api', submission_routes_js_1.default);
// Global Error Handler
app.use(errorHandler_js_1.errorHandler);
exports.default = app;
