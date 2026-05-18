# Prowider Lead System - Manual Testing Guide

This guide will walk you through verifying all features requested in `assignment.md` using the built-in UI and Test Tools page.

## Prerequisites
Before starting, ensure you have provided the following in your `.env.local` file:
```env
MONGODB_URI=your_mongodb_connection_string
```

Run the development server: `npm run dev`

## Feature 1: Database Setup & Auto-Seeding (Must Be Pre-Inserted)
1. **Action**: Open the app at `http://localhost:3000` and go to the **Dashboard** (`/dashboard`).
2. **Expected Behavior**: The database will automatically check if providers exist. Since none exist initially, it will auto-seed 8 providers with quotas set to 10.
3. **Verification**: You should instantly see 8 providers listed on the dashboard with 10 Remaining Quota and 0 Received Leads.

## Feature 2: Basic Lead Intake & Mandatory Rules
1. **Action**: Go to **Submit Lead** (`/request-service`).
2. **Action**: Submit a lead with the following details:
   - Name: `John Doe`
   - Phone: `5551112222`
   - Service: `Service 1`
3. **Verification**: Go to the **Dashboard**. Provider 1 (mandatory for Service 1) MUST have received the lead. Their remaining quota should be 9.

## Feature 3: Fair Distribution (Round-Robin)
1. **Action**: Submit 5 more leads for `Service 1` with different phone numbers.
2. **Verification**: Go to the **Dashboard**. Provider 1 will receive the first one (due to mandatory rule). The rest should be distributed sequentially to Provider 2, Provider 3, Provider 4, Provider 5, etc., in a round-robin format.

## Feature 4: Quota Enforcement & Handling Full Quotas
1. **Action**: Go to **Test Tools** (`/test-tools`) and click **Generate 10 Leads** a few times until a provider's Remaining Quota reaches `0`.
2. **Action**: Try to submit a new manual lead for a service that would normally assign to that specific provider.
3. **Verification**: The system should skip the provider with `0` quota and assign the lead to the *next available provider*.

## Feature 5: Idempotent Webhook (Reset Quotas)
1. **Action**: Ensure some providers have consumed their quota (e.g., Remaining Quota < 10).
2. **Action**: Go to **Test Tools** and click **Trigger Webhook**.
3. **Expected Behavior**: All providers should have their `remainingQuota` reset to 10. `leadsReceived` will remain unchanged.
4. **Action**: Click **Test Multiple Webhooks** (sends 3 simultaneous identical requests).
5. **Verification**: Look at the execution logs at the bottom of the page. Only the first request should succeed (resetting quotas). The other two should return a success status but safely ignore the logic due to idempotency (preventing multiple simultaneous resets).

## Feature 6: Concurrency Safety (Race Conditions)
1. **Action**: Go to **Test Tools** and click **Generate 10 Leads**.
2. **Expected Behavior**: 10 distinct leads will be fired at the exact same millisecond.
3. **Verification**: Check the Dashboard. The leads should be assigned sequentially without skipping providers or assigning multiple leads to the same provider for the same turn. The system handles concurrency via MongoDB atomic updates (`$inc`).

## Feature 7: Duplicate Lead Rejection
1. **Action**: Submit a lead manually via the form with phone `9998887777` and `Service 2`.
2. **Action**: Submit a lead *again* with the EXACT SAME phone `9998887777` and `Service 2`.
3. **Expected Behavior**: The UI should show a red alert: "Submission Error: Duplicate lead: A lead with this phone number already exists for this service."

## Summary of Tech Stack Used
- Next.js 15 (App Router, API Routes)
- MongoDB + Mongoose
- Tailwind CSS + Framer Motion (Modern, sleek dark aesthetic with glassmorphism)
- Lucide React (Icons)
