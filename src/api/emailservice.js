// /src/api/emailService.js
import { supabase } from './supabase';

export async function sendVendorWelcomeEmail(vendor) {
  const storeUrl = `${window.location.origin}/store/${vendor.slug}`;
  
  console.log('📧 Vendor Welcome Email:', {
    to: vendor.business_email,
    subject: 'Welcome to WhatsCatalog! Your store is ready',
    storeUrl: storeUrl,
    businessName: vendor.business_name
  });

  // ✅ For now, we'll use console.log
  // When you set up Brevo/Resend, replace this
  
  // Example with Resend:
  // await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     to: vendor.business_email,
  //     subject: 'Welcome to WhatsCatalog! ',
  //     html: `
  //       <h1>Welcome ${vendor.business_name}!</h1>
  //       <p>Your store is live at: <a href="${storeUrl}">${storeUrl}</a></p>
  //       <p>Start adding products now!</p>
  //     `
  //   })
  // });
  
  return { success: true };
}