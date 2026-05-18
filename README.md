# ⚡ Prowider — Advanced Lead Distribution Engine

<img width="1272" height="910" alt="Screenshot 2026-05-18 085812" src="https://github.com/user-attachments/assets/1e3c7347-6f21-4c05-8ffa-d917273123a1" />

An industrial-grade, real-time, concurrency-safe lead distribution engine built using a high-performance **Next.js 15 App Router** architecture, **MongoDB**, and a custom **Neo-Brutalist** design system. Designed specifically to handle high-frequency incoming request traffic, complex routing rules, and strict transactional consistency.

---

## 🚀 Deployed System & Repository

*   **GitHub Repository**: [Omkarop0808/MIniLeadDistributionSystem](https://github.com/Omkarop0808/MIniLeadDistributionSystem)
*   **Live Production URL**: [m-ini-lead-distribution-system.vercel.app](https://m-ini-lead-distribution-system.vercel.app/)

---
<img width="1717" height="901" alt="Screenshot 2026-05-18 085737" src="https://github.com/user-attachments/assets/67b3ccf9-d5fe-4481-bb0e-fa0e1a0761b5" />
<img width="1541" height="898" alt="Screenshot 2026-05-18 085746" src="https://github.com/user-attachments/assets/de12dbbb-322a-480c-adb0-73d7928b4150" />

## ✨ Core Features

| Feature | Description | Engineering Achievement |
| :--- | :--- | :--- |
| **🛡️ Concurrency Safety** | Heavy write locking simulation using MongoDB atomic execution | Avoids race conditions and double-allocations |
| **🎯 Mandatory Rules** | Dynamic service routing based on strict provider-matching rules | Automates initial provider assignments based on expertise |
| **🔄 Fair Allocation** | High-reliability persistent sequential round-robin routing | Guarantees balanced lead share over time among eligible providers |
| **📺 Real-time Dashboard** | Continuous live reactive synchronization and active status tracking | Smooth interface showing instant lead counts without refresh |
| **🔗 Idempotent Webhooks** | Unique constraint tracking for transactional payment gateways | Prevents double quota-resets from network retries |
| **⚡ Neo-Brutalist UX** | Premium, high-contrast layout using Framer Motion and HSL values | Inspired by the ultra-clean GreenGauge design system |
| **🧪 Integrated Test Suite** | Simulation playground to trigger massive concurrent load & webhooks | Allows real-time stress testing of the application |

---

## 🛠️ Technical Stack

*   **Framework**: Next.js 15 (App Router, Serverless API Routes)
*   **Language**: TypeScript
*   **Database**: MongoDB (via Mongoose ODM)
*   **Styling**: Tailwind CSS 4 (Custom high-contrast neo-brutalist theme)
*   **Animations**: Framer Motion (Fluid micro-interactions and viewport triggers)
*   **Icons**: Lucide React

---

## ⚙️ Setup Instructions

### 1. Clone the repository:
```bash
git clone https://github.com/Omkarop0808/MIniLeadDistributionSystem.git
cd prowider-lead-system
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Configure Environment Variables:
Create a `.env.local` file in the root of the project and add your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://minileaddistributionsystem:KbvLFOXi3fioQEyU@cluster0.uw2u78x.mongodb.net/?appName=Cluster0
```

### 4. Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

*Note: The database automatically seeds itself with the required 8 providers (10 quota each) upon the first interaction with the dashboard or test tools.*

---

## 🧠 System Architecture & Engineering Breakdown

### 1. Lead Allocation Algorithm
The lead allocation process consists of a deterministic **two-phase routing engine** designed to assign exactly 3 providers to every lead:
- **Phase A (Mandatory Rules):** 
  The engine checks the lead's service type against predefined routing rules:
  - `Service 1` $\rightarrow$ Always assigned to **Provider 1**
  - `Service 2` $\rightarrow$ Always assigned to **Provider 5**
  - `Service 3` $\rightarrow$ Always assigned to **Provider 1** and **Provider 4**
  If the mandatory providers have quota remaining, they are instantly allocated, decrementing their remaining quota.
- **Phase B (Fair Round-Robin Pool):**
  If the mandatory assignments are less than 3, the engine pulls from the service's designated fair pool:
  - `Service 1 Pool` $\rightarrow$ [Provider 2, Provider 3, Provider 4]
  - `Service 2 Pool` $\rightarrow$ [Provider 6, Provider 7, Provider 8]
  - `Service 3 Pool` $\rightarrow$ [Provider 2, Provider 3, Provider 5, Provider 6, Provider 7, Provider 8]
  The engine updates a single state document in the `AllocationState` collection using `$inc: { lastAssignedIndex: 1 }`. By applying a modulo operation (`lastAssignedIndex % pool.length`), it ensures a perfect, persistent sequential rotation that remains unaffected by serverless cold starts.

### 2. Concurrency Control (Race Condition Prevention)
Traditional systems suffer from over-allocation when multiple requests read a provider's current quota simultaneously, approve it, and then decrement it. 
To prevent this, **Prowider** utilizes **atomic transactional filters**:
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
- The constraint `$lt: ["$leadsReceived", "$quota"]` ensures that a provider is only updated if they actually have quota left.
- Because MongoDB operations are atomic and single-threaded per document, if multiple requests hit concurrently, only the first $N$ requests matching the condition will succeed. Any subsequent requests will instantly return `null`, prompting the engine to gracefully cycle to the next provider in the round-robin.

### 3. Webhook Idempotency
Webhooks are prone to network failures and automatic retries, which could trigger multiple quota resets and corrupt the ledger.
To handle this, we implement a **Strict Idempotency Layer**:
- Every incoming webhook carries a unique `eventId` in its payload.
- Upon receiving a request, the server attempts to write to the `WebhookEvent` collection:
  ```typescript
  try {
    await WebhookEvent.create({ eventId });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: true, message: 'Event already processed' });
    }
  }
  ```
- Because `eventId` has a unique database index, any parallel or retried webhook carrying the same ID will instantly trigger a `11000 Duplicate Key Error`. The server catches this, prevents duplicate database writes, and returns a safe success status to the client.

---

## 🧪 Verification & Manual Testing
We have included a complete verification dashboard at `/test-tools` which allows you to:
- Reset all quotas to 10 via the idempotent webhook simulation.
- Trigger 3 simultaneous webhook calls to verify the idempotency filter.
- Fire 10 concurrent lead submissions in a single millisecond to verify that the atomic lock prevents any double assignments or race conditions.
- View real-time output terminal logs on-screen.
