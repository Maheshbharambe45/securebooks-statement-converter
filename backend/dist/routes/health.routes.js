"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Secure Books Document Submission API',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        storageMode: 'Temporary Processing Only',
    });
});
exports.default = router;
