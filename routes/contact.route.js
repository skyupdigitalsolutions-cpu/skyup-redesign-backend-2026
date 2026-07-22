const express = require("express");
const router = express.Router();
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} = require("../controller/contact.controller");

// get all contacts
router.get("/", getContacts);

// get a single contact
router.get("/:id", getContact);

// submit a new contact form
router.post("/", createContact);

// update a contact (status, notes)
router.put("/:id", updateContact);

// delete a contact
router.delete("/:id", deleteContact);

module.exports = router;