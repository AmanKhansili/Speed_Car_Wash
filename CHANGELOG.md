# Speed Car Wash - Complete Updates & Admin Integration Changelog

## 1. Role-Based Admin Control Center (`is_admin === true`)
- **`app/admin.tsx`**:
  - Full-featured in-app Admin Control Center accessible only when `profiles.is_admin === true`.
  - **Live Revenue & Booking Stats**: Total Bookings, Completed Washes, Total Confirmed Revenue (`₹`), and Pending Cash Collection (`₹`).
  - **Search & Status Filters**: Filter by `All`, `Pending`, `Confirmed`, `Completed`, `Cancelled` with live counts, plus search by customer phone, vehicle, service, address, or `#ID`.
  - **Payment Mode Badges**: Clearly distinguishes `Paid via UPI (UPI-xxxxxx)` vs `Collect on Spot (Cash / QR)` vs `Cash Collected`.
  - **1-Tap Customer Actions**: Direct Call (`tel:`), pre-filled WhatsApp message (`wa.me`), and Google Maps navigation.
  - **1-Tap Status Transitions**: `Confirm`, `Mark Completed` (automatically triggers customer review notification), and `Cancel`.
- **`app/(tabs)/index.tsx` & `app/(tabs)/profile.tsx` & `components/profile/ProfileMenuList.tsx`**:
  - Automatically checks `profiles.is_admin` for the signed-in user.
  - Shows a **Admin Control Center 👑** quick-access banner on both the Home Screen and Profile Screen when `is_admin` is `true`.

## 2. Customer Bookings Enhancements (`components/booking/BookingTab.tsx`)
- **Live Status Stepper**: Visual progress bar (`Booked` ➔ `Confirmed` ➔ `Completed`) on active booking cards.
- **Payment Status Tag**: Displays `Paid via UPI`, `Pay After Wash`, or `Paid on Spot` next to the price.
- **1-Tap WhatsApp Support**: Added a direct WhatsApp Support button on confirmed upcoming bookings.

## 3. 100% Razorpay Removal & Direct UPI + Pay After Service
- **`app/booking/summary.tsx` & `app/membership/checkout.tsx`**:
  - Replaced Razorpay completely with Direct UPI Intent (`upi://pay`), 1-tap UPI ID copy, on-screen Dynamic Bank QR Code Scanner modal, and "Pay After Wash (Cash / Spot QR)".
  - Removed `@codearcade/expo-razorpay`, `react-native-razorpay`, `RazorpayModal.tsx`, and `razorpay.d.ts`.

## 4. App Loading Logo & Expo SDK 53 Notification Fix
- **`app.json` & `app/index.tsx`**: Configured Speed Car Wash brand logo (`./assets/logo/logo.png`) on native splash and auth loading screens.
- **`utils/registerPushToken.ts`**: Fixed Expo Go SDK 53 Android push notification crash via environment detection and lazy `require("expo-notifications")`.

## 5. Supabase SQL Triggers & Edge Functions
- **`supabase/migrations/20261014_complete_supabase_setup.sql`**:
  - Adds `is_admin` and `push_token` to `profiles`.
  - Auto-populates `public.notifications` (In-App Bell Icon 🔔) for both Customers (`booking_confirmed`, `review_request`, `booking_cancelled`) and Admins (`admin_new_booking`).
  - Configures Admin RLS policies on `public.bookings` for `SELECT` and `UPDATE`.
- **`supabase/functions/push-notifications/index.ts`**:
  - Edge function for sending Expo push notifications to customer and admin devices.
