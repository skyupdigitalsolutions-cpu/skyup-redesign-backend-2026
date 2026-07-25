const Contact = require("../models/contact.model");

// ────────────────────────────────────────────────────────────────
// CRM forwarding
// Every saved lead is pushed to the CRM's /website-webhook endpoint
// SERVER-SIDE, so delivery does not depend on the browser, GTM, or the
// visitor keeping the tab open. Critical for paid (Google Ads) traffic.
//
// CRM webhook contract (reads EXACTLY these keys):
//   webhook_secret, name, mobile, email, message
//
// Configure in backend .env:
//   CRM_WEBHOOK_URL=https://your-crm-domain/website-webhook
//   CRM_WEBHOOK_SECRET=your_real_secret
// ────────────────────────────────────────────────────────────────
async function forwardToCrm(contact) {
  if (!process.env.CRM_WEBHOOK_URL) {
    console.warn("⚠️  CRM_WEBHOOK_URL not set — lead NOT forwarded to CRM");
    return;
  }

  // 8s safety timeout so a slow/unreachable CRM never hangs a dangling request.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(process.env.CRM_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        webhook_secret: process.env.CRM_WEBHOOK_SECRET,
        name:    contact.name,
        mobile:  contact.phone,
        email:   contact.email,
        message: contact.message,
        source:  contact.service || "Website",
      }),
    });

    if (!res.ok) {
      console.error(
        `❌ CRM webhook rejected lead (${contact.email}) — status ${res.status}:`,
        await res.text().catch(() => "")
      );
    } else {
      console.log(`✅ Lead forwarded to CRM: ${contact.email}`);
    }
  } catch (err) {
    // Never throw — the lead is already safely saved in MongoDB.
    console.error(`❌ CRM webhook error for ${contact.email}:`, err.message);
  } finally {
    clearTimeout(timer);
  }
}

const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    // Forward to CRM without blocking the visitor's response.
    // (Lead is already saved, so we never await or fail on this.)
    forwardToCrm(contact);

    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndUpdate(id, req.body);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    const updatedContact = await Contact.findById(id);
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
};
