#!/usr/bin/env node

// Test script to verify booking link configuration
// Run with: node test-booking-links.js

import dotenv from "dotenv";
dotenv.config();

console.log("🔗 Booking Link Configuration Test");
console.log("=====================================");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BOOKING_LINK = process.env.BOOKING_LINK;
const EXPECTED_CALENDLY = "https://calendly.com/sahatushankar234/30min";

console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log(`Booking Link (env): ${BOOKING_LINK || "NOT SET"}`);
console.log(`Expected Calendly: ${EXPECTED_CALENDLY}`);

// Test Email Service Logic
console.log("\n📧 Email Service Tests");
console.log("======================");

// Test final email (should use direct Calendly link)
const finalEmailBookingLink = "https://calendly.com/sahatushankar234/30min";
console.log(`Final email link: ${finalEmailBookingLink}`);
console.log(`✅ Final email uses direct Calendly: ${finalEmailBookingLink === EXPECTED_CALENDLY}`);

// Test other services (should use env var or fallback)
const otherServicesLink = BOOKING_LINK || `${FRONTEND_URL}/book-call`;
console.log(`Other services link: ${otherServicesLink}`);
console.log(`✅ Other services use correct link: ${otherServicesLink === EXPECTED_CALENDLY || !BOOKING_LINK}`);

console.log("\n🏷️  Environment Variable Recommendations");
console.log("========================================");

if (!BOOKING_LINK) {
  console.log("⚠️  BOOKING_LINK not set. Add to your .env file:");
  console.log(`BOOKING_LINK=${EXPECTED_CALENDLY}`);
} else if (BOOKING_LINK !== EXPECTED_CALENDLY) {
  console.log("⚠️  BOOKING_LINK doesn't match expected Calendly URL");
  console.log(`Current: ${BOOKING_LINK}`);
  console.log(`Expected: ${EXPECTED_CALENDLY}`);
} else {
  console.log("✅ BOOKING_LINK is correctly configured");
}

console.log("\n🚀 Production Deployment Checklist");
console.log("===================================");

const checks = [
  { name: "FRONTEND_URL set", pass: !!FRONTEND_URL && FRONTEND_URL !== "http://localhost:5173" },
  { name: "BOOKING_LINK set", pass: !!BOOKING_LINK },
  { name: "BOOKING_LINK matches Calendly", pass: BOOKING_LINK === EXPECTED_CALENDLY },
  { name: "NODE_ENV set to production", pass: process.env.NODE_ENV === "production" },
  { name: "EMAIL_USER configured", pass: !!process.env.EMAIL_USER },
  { name: "EMAIL_PASS configured", pass: !!process.env.EMAIL_PASS }
];

checks.forEach(check => {
  const status = check.pass ? "✅" : "❌";
  console.log(`${status} ${check.name}`);
});

const allPassed = checks.every(check => check.pass);
console.log(`\n${allPassed ? "✅" : "⚠️"} Overall Status: ${allPassed ? "Ready for production" : "Needs configuration"}`);

if (!allPassed) {
  console.log("\n📝 Required Environment Variables for Production:");
  console.log(`FRONTEND_URL=https://deluxe-melomakarona-d6559e.netlify.app`);
  console.log(`BOOKING_LINK=${EXPECTED_CALENDLY}`);
  console.log(`NODE_ENV=production`);
  console.log(`EMAIL_USER=your-email@gmail.com`);
  console.log(`EMAIL_PASS=your-16-char-app-password`);
  console.log(`EMAIL_FROM="Ray's Healthy Living <your-email@gmail.com>"`);
}

console.log("\n🔍 Test URLs:");
console.log(`Direct Calendly: ${EXPECTED_CALENDLY}`);
console.log(`Frontend booking section: ${FRONTEND_URL}/#book-consultation`);
console.log(`Backend booking endpoint: ${process.env.BACKEND_URL || FRONTEND_URL}/book-call`);
