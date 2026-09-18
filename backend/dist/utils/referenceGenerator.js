"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSubmissionReference = generateSubmissionReference;
const crypto_1 = __importDefault(require("crypto"));
function generateSubmissionReference() {
    const year = new Date().getFullYear();
    const randomHex = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
    return `SB-${year}-${randomHex}`;
}
