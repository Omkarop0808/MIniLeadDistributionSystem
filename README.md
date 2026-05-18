# Prowider Mini Lead Distribution System

This is a full-stack lead distribution system built with **Next.js 15**, **MongoDB**, and **Tailwind CSS**. It handles concurrency-safe lead assignments, idempotency for webhook resets, and real-time dashboard polling.

## 🚀 Live Demo & Repository
- **GitHub Repository**: *(Add your GitHub repo link here)*
- **Live Demo URL**: *(Add your deployed Vercel link here)*

## ⚙️ Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd prowider-lead-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root of the project and add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

*Note: The database automatically seeds itself with the required 8 providers upon the first request to the dashboard or when using the test tools.*

---

## 🧠 System Architecture & Implementation Details

### 1. Allocation Algorithm
The lead allocation process consists of two primary phases, ensuring each lead gets assigned to exactly 3 providers:
- **Phase A (Mandatory Assignment):** The system first evaluates business rules based on the Service Type. Mandatory providers for that service are assigned immediately, provided they have not reached their monthly quota.
- **Phase B (Fair Round-Robin Pool):** The remaining slots (up to 3 total) are distributed fairly among the specific service's available provider pool. We track a `lastAssignedIndex` in an `AllocationState` collection. We use the modulo operator (`lastAssignedIndex % pool.length`) to sequentially pick the next candidate, ensuring fair distribution over time rather than a random assignment.

### 2. Handling Concurrency
To ensure database consistency when hundreds of leads hit the API simultaneously, we avoided the traditional "Read -> Modify in JS -> Save" pattern, which suffers from race conditions.
Instead, we rely heavily on **MongoDB Atomic Operations**:
- We use `findOneAndUpdate` with the `$inc` operator to increment a provider's `leadsReceived`.
- We use `$expr` to place the quota limitation directly into the query constraint: `$expr: { $lt: ["$leadsReceived", "$quota"] }`.
- This ensures that two concurrent requests trying to assign a lead to a provider with 1 remaining slot will result in exactly one successful assignment and one failure, cleanly avoiding over-assignment.

### 3. Webhook Idempotency
To prevent accidental quota resets (e.g., from network retries or duplicate webhook firing), we implemented strict idempotency logic:
- The system includes a `WebhookEvent` model containing a unique `eventId`.
- When a webhook request hits the server, we attempt to create a new `WebhookEvent` document.
- The `eventId` field has a **unique index** at the database level.
- If multiple requests with the same `eventId` are processed concurrently, the database instantly rejects the duplicates with a `11000 Duplicate Key Error`. The API catches this error and returns a safe `200 OK` response without executing the quota reset logic a second time.

---

## 🧪 Manual Testing

A dedicated `MANUAL_TESTING.md` file is included in the repository root containing step-by-step instructions to verify idempotency, concurrency, fair distribution, and duplicate lead rejections. A built-in `/test-tools` route is also provided to quickly simulate heavy loads and trigger the reset webhooks.
