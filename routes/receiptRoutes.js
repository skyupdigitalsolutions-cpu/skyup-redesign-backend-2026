const express = require("express");
const router = express.Router();
const { getLastInvoice, createReceipt, getReceipts, updateReceipt, deleteReceipt } = require("../controller/receiptController");
const { authenticateToken } = require("../middleware/auth");

router.get("/api/last-invoice", authenticateToken, getLastInvoice);
router.post("/receipt", authenticateToken, createReceipt);
router.get("/receipts", authenticateToken, getReceipts);
router.put("/receipt/:id", authenticateToken, updateReceipt);
router.delete("/receipt/:id", authenticateToken, deleteReceipt);

module.exports = router;