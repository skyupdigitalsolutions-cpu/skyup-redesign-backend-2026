const mongoose = require("mongoose");

const contactSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },

    company: {
      type: String,
      required: [true, "Please enter your company name"],
    },

    email: {
      type: String,
      required: [true, "Please enter your email"],
    },

    phone: {
      type: String,
      required: [true, "Please enter your phone number"],
    },

    service: {
      type: String,
      required: [true, "Please select a service"],
    },

    budget: {
      type: String,
      required: [true, "Please select a budget range"],
    },

    message: {
      type: String,
      required: [true, "Please enter a message"],
    },

    status: {
      type: String,
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;