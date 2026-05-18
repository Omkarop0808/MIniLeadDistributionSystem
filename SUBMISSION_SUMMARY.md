# Prowider Mini Lead Distribution System
## Technical Assignment Submission Summary

This document outlines the system setup instructions, core architecture decisions, allocation engine logic, concurrency safety patterns, and webhook idempotency mechanisms implemented in the Prowider Lead Distribution System.

---

## 🚀 Deployed URLs & Source
*   **GitHub Repository**: https://github.com/Omkarop0808/MIniLeadDistributionSystem
*   **Live Production URL**: https://m-ini-lead-distribution-system.vercel.app/

---

## 1. Local Setup Instructions

Follow these steps to run the application locally in development mode:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Omkarop0808/MIniLeadDistributionSystem.git
    cd prowider-lead-system
    ```
2.  **Install Project Dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment:**
    Create a `.env.local` file at the root of the project and specify the connection string for your MongoDB database instance:
    ```env
    MONGODB_URI=mongodb+srv://minileaddistributionsystem:KbvLFOXi3fioQEyU@cluster0.uw2u78x.mongodb.net/?appName=Cluster0
    ```
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.
5.  **Auto-Seeding Database:**
    The system database initializes and seeds itself automatically with 8 providers (having a default monthly quota of 10 leads each) upon the first request to the dashboard or when interacting with the test tools, removing the need for manual db imports.

---

## 2. Lead Allocation Algorithm

The system enforces a **deterministic, two-phase routing engine** designed to assign exactly 3 providers to every lead:

### Phase A: Mandatory Assignment Rules
Before applying general distribution, the system checks the service type of the incoming lead and applies strict mandatory rules:
*   **Service 1** $\rightarrow$ Always assigned to **Provider 1** (if quota available).
*   **Service 2** $\rightarrow$ Always assigned to **Provider 5** (if quota available).
*   **Service 3** $\rightarrow$ Always assigned to **Provider 1** and **Provider 4** (if quota available).

### Phase B: Fair Round-Robin Pool
If the mandatory rules result in less than 3 providers (which is always the case), the system fulfills the remaining slots using sequential, fair allocation among the designated provider pool:
*   **Service 1 Fair Pool:** Providers `[2, 3, 4]`
*   **Service 2 Fair Pool:** Providers `[6, 7, 8]`
*   **Service 3 Fair Pool:** Providers `[2, 3, 5, 6, 7, 8]`

**Algorithm Mechanism:**
To ensure fairness that persists across server restarts and serverless cold-starts without relying on memory state:
1.  We maintain a single state document in an `AllocationState` collection for each service type.
2.  For each lead request, the system performs an atomic increment (`$inc: { lastAssignedIndex: 1 }`) on that document.
3.  Using a modulo operation (`lastAssignedIndex % pool.length`), the algorithm sequentially identifies the next candidate in the pool rotation.
4.  If the candidate is already assigned (via mandatory rules) or has depleted its monthly quota, the engine moves to the next index in the loop.

---

## 3. Handling Concurrency & Quota Safety

Under high-traffic situations (e.g., hundreds of leads submitted in the same millisecond), standard backend logic using a "fetch, check in JS, update, save" pattern suffers from severe race conditions, resulting in over-allocating leads past a provider's monthly quota.

**Prowider** solves this by shifting all state validations to the **database driver layer** using **atomic locks**:
*   Instead of modifying quota values in JavaScript, we use Mongoose’s `findOneAndUpdate()` with the `$inc` operator.
*   We place a strict criteria directly in the database update filter:
    ```typescript
    const updated = await Provider.findOneAndUpdate(
      { 
        providerId: candidateProviderId, 
        $expr: { $lt: ["$leadsReceived", "$quota"] } 
      },
      { $inc: { leadsReceived: 1 } },
      { returnDocument: 'after' }
    );
    ```
*   **Atomicity:** MongoDB guarantees single-document update operations are fully atomic. 
*   **Evaluation:** If a provider has exactly 1 slot left and two requests hit concurrently:
    - The first request successfully matches the `$lt` condition, increments `leadsReceived` to 10, and returns the updated document.
    - The second request instantly fails the `$lt` condition filter because `leadsReceived` is already 10. It returns `null`, prompting our engine to skip this provider and cycle safely to the next candidate.

---

## 4. Webhook Idempotency Layer

A major production challenge with payment gateway webhooks (e.g., resetting quotas upon monthly subscription renewal) is duplicate network deliveries or client retries, leading to duplicate quota resets.

**Prowider** guarantees complete webhook idempotency using a **Unique Event Registry Pattern**:
1.  Every webhook transaction includes a unique transaction or event identifier (`eventId`).
2.  We register a `WebhookEvent` schema in MongoDB with a **unique index** enforced on the `eventId` field.
3.  Upon receiving a webhook reset request, the API immediately attempts to persist the `eventId` in the database:
    ```typescript
    try {
      await WebhookEvent.create({ eventId });
    } catch (error) {
      if (error.code === 11000) {
        // Safe Catch: Event already exists and has been fully processed
        return NextResponse.json({ success: true, message: 'Event already processed' });
      }
    }
    ```
4.  If Vercel processes duplicate webhook requests concurrently, MongoDB instantly throws a `11000 Duplicate Key Error` for the redundant requests. The API catches this, drops the redundant request safely without triggering another quota reset, and returns a clean `200 OK` response.

---

## 5. Front-End Technical Highlights

*   **Real-Time Data Flow:** Implemented polling endpoints (`/api/providers`) that dashboard clients listen to every 3 seconds, keeping their queues instantly synced with serverless updates.
*   **Visual Design:** Custom high-contrast Neo-Brutalist interface utilizing thick black solid borders, solid offset shadows, and clean dotted backgrounds.
*   **Micro-interactions:** Interactive form elements and buttons wrapped in `framer-motion` for fluid feedback and premium responsiveness.
