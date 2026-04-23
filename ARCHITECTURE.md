# Smart Resource Allocation — Full Architecture Document
> **Google Solution Challenge Hackathon**  
> Stack: React · Java Spring Boot · Firebase · Vertex AI · Google Cloud  
> Use this file with Claude Code (claude-opus-4-6) to scaffold, build, and iterate on every layer.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Tech Stack Decisions](#3-tech-stack-decisions)
4. [Repository Structure](#4-repository-structure)
5. [Firebase & Google Cloud Setup](#5-firebase--google-cloud-setup)
6. [Database Schema — Firestore Collections](#6-database-schema--firestore-collections)
7. [Backend — Java Spring Boot](#7-backend--java-spring-boot)
8. [Frontend — React Portals](#8-frontend--react-portals)
9. [AI/ML — Vertex AI Matching Engine](#9-aiml--vertex-ai-matching-engine)
10. [Data Pipeline — Forms to Firestore](#10-data-pipeline--forms-to-firestore)
11. [Matching Algorithm — Full Specification](#11-matching-algorithm--full-specification)
12. [Rewards System](#12-rewards-system)
13. [Notification System — FCM](#13-notification-system--fcm)
14. [Google APIs Integration Map](#14-google-apis-integration-map)
15. [API Endpoints Reference](#15-api-endpoints-reference)
16. [Environment Variables](#16-environment-variables)
17. [Deployment Guide](#17-deployment-guide)
18. [Claude Code Prompts — Build Order](#18-claude-code-prompts--build-order)

---

## 1. Project Overview

### Problem Statement
Local social groups and NGOs collect community needs data through paper surveys and field reports. This data is scattered, making it hard to identify the most urgent problems and deploy the right volunteers efficiently.

### Solution
A three-portal web platform that:
- Digitises community need data (paper → Google Forms → Firestore)
- Visualises urgency on a Google Maps heatmap
- Uses Vertex AI to automatically match volunteers to tasks by skill, proximity, availability, and impact score
- Rewards volunteers with a points-and-badge system they can redeem

### Three User Roles

| Role | Primary Actions |
|------|----------------|
| **NGO** | Post tasks, set urgency (1–5), specify location, required skills, volunteer count needed |
| **Volunteer** | Create profile with skills, browse open tasks, accept/decline matches, redeem rewards |
| **Admin** | Approve/delete NGOs and volunteers, trigger AI matching, audit all actions, view analytics |

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Firebase Hosting)             │
│                    Firebase Auth — Google Sign-In                │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  NGO Portal  │  │ Volunteer Portal  │  │  Admin Portal    │  │
│  └──────┬───────┘  └────────┬─────────┘  └────────┬─────────┘  │
└─────────┼───────────────────┼────────────────────-─┼────────────┘
          │   REST / HTTPS    │                       │
          ▼                   ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Java Spring Boot REST API (Cloud Run)               │
│   Auth Middleware · Role Guard · Input Validation · Pub/Sub      │
└──────┬────────────────┬────────────────┬────────────────────────┘
       │                │                │
       ▼                ▼                ▼
┌──────────┐   ┌─────────────────┐   ┌──────────────────────┐
│ Firestore│   │   Vertex AI     │   │  Google Maps API     │
│ (DB)     │   │  Embeddings +   │   │  Distance Matrix +   │
│          │   │  Matching Algo  │   │  Geocoding + Maps JS │
└──────────┘   └─────────────────┘   └──────────────────────┘
       │                │
       ▼                ▼
┌──────────────────────────────────────────────────────┐
│                 Cloud Pub/Sub                         │
│  triggers → Cloud Functions → FCM Notifications      │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Google Forms → Sheets → Cloud Function → Firestore  │
│  Google Translate API (multilingual task posting)    │
│  Firebase Storage (profile photos, documents)        │
│  Cloud Logging + Monitoring                          │
└──────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack Decisions

### Frontend
- **React 18** with Vite — fast build, HMR, modern JSX
- **React Router v6** — separate route trees per portal (`/ngo/*`, `/volunteer/*`, `/admin/*`)
- **Firebase SDK v10** — Firestore real-time listeners, Auth, Storage, FCM
- **Google Maps JS API** — task heatmap, location picker
- **TailwindCSS** — utility-first, no extra overhead

### Backend
- **Java 21 + Spring Boot 3** — REST API, runs on Cloud Run
- **Spring Security** — Firebase JWT validation via `firebase-admin` SDK
- **Google Cloud Firestore Admin SDK** — server-side reads/writes
- **Vertex AI Java SDK** — embedding calls and AutoML predictions
- **Cloud Run** — containerised, auto-scales, free tier sufficient for hackathon

### Database
- **Cloud Firestore** — chosen over Realtime Database for:
  - Rich querying (compound queries, collection group queries)
  - GeoPoint data type (native lat/lng storage)
  - Offline persistence for volunteers in low-connectivity areas
  - Subcollections for task applications

### AI/ML
- **Vertex AI Text Embeddings API** (`text-embedding-004`) — skill vector generation
- **Vertex AI Matching Engine** — approximate nearest neighbour for scaled matching
- Custom scoring formula (see §11) running in Java backend

### Additional Google Services
- **Google Sign-In** via Firebase Auth (social login, zero password friction)
- **Google Maps Platform** — Maps JS API, Distance Matrix API, Geocoding API
- **Google Translate API** — auto-translate task descriptions for multilingual reach
- **Google Forms + Sheets** — paper survey digitisation pipeline
- **Firebase Cloud Messaging (FCM)** — push notifications
- **Cloud Pub/Sub** — event bus between API and Cloud Functions
- **Firebase Hosting** — React deployment with SSL, CDN
- **Firebase Storage** — profile photos, NGO verification documents
- **Cloud Logging** — structured audit log shipping

---

## 4. Repository Structure

```
smart-resource-allocation/
├── frontend/                          # React app
│   ├── src/
│   │   ├── portals/
│   │   │   ├── ngo/                   # NGO portal pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── PostTask.jsx
│   │   │   │   ├── TaskList.jsx
│   │   │   │   └── MatchResults.jsx
│   │   │   ├── volunteer/             # Volunteer portal pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ProfileSetup.jsx
│   │   │   │   ├── BrowseTasks.jsx
│   │   │   │   ├── MyMatches.jsx
│   │   │   │   └── Rewards.jsx
│   │   │   └── admin/                 # Admin portal pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── ManageNGOs.jsx
│   │   │       ├── ManageVolunteers.jsx
│   │   │       ├── RunMatching.jsx
│   │   │       └── AuditLog.jsx
│   │   ├── components/                # Shared UI components
│   │   │   ├── TaskCard.jsx
│   │   │   ├── VolunteerCard.jsx
│   │   │   ├── UrgencyBadge.jsx
│   │   │   ├── HeatMap.jsx
│   │   │   ├── RewardsBadge.jsx
│   │   │   └── SkillTag.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useTasks.js
│   │   │   └── useMatches.js
│   │   ├── services/
│   │   │   ├── firebase.js            # Firebase init
│   │   │   ├── api.js                 # Axios wrapper → Java backend
│   │   │   └── maps.js                # Google Maps helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── firebase.json
│   └── vite.config.js
│
├── backend/                           # Java Spring Boot
│   ├── src/main/java/com/sra/
│   │   ├── SraApplication.java
│   │   ├── config/
│   │   │   ├── FirebaseConfig.java
│   │   │   ├── SecurityConfig.java
│   │   │   └── VertexAIConfig.java
│   │   ├── controller/
│   │   │   ├── TaskController.java
│   │   │   ├── VolunteerController.java
│   │   │   ├── NGOController.java
│   │   │   ├── MatchController.java
│   │   │   ├── AdminController.java
│   │   │   └── RewardController.java
│   │   ├── service/
│   │   │   ├── TaskService.java
│   │   │   ├── MatchingService.java   # Core algorithm
│   │   │   ├── EmbeddingService.java  # Vertex AI calls
│   │   │   ├── ProximityService.java  # Maps Distance Matrix
│   │   │   ├── NotificationService.java
│   │   │   └── RewardService.java
│   │   ├── model/
│   │   │   ├── Task.java
│   │   │   ├── UserProfile.java
│   │   │   ├── Match.java
│   │   │   └── MatchScore.java
│   │   └── middleware/
│   │       └── FirebaseTokenFilter.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── serviceAccountKey.json     # never commit this
│   ├── Dockerfile
│   └── pom.xml
│
├── functions/                         # Cloud Functions (Node.js)
│   ├── index.js                       # Forms→Firestore pipeline
│   └── package.json
│
├── firestore.rules                    # Firestore security rules
├── firestore.indexes.json
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
└── README.md
```

---

## 5. Firebase & Google Cloud Setup

```bash
# 1. Create Firebase project at console.firebase.google.com
# 2. Enable Authentication → Google Sign-In provider
# 3. Create Firestore database (production mode)
# 4. Enable Storage
# 5. Enable Cloud Messaging

# Enable required GCP APIs
gcloud services enable \
  aiplatform.googleapis.com \
  maps-backend.googleapis.com \
  distance-matrix-backend.googleapis.com \
  geocoding-backend.googleapis.com \
  translate.googleapis.com \
  run.googleapis.com \
  cloudfunctions.googleapis.com \
  pubsub.googleapis.com \
  logging.googleapis.com

# Install Firebase CLI
npm install -g firebase-tools
firebase login
firebase init
```

---

## 6. Database Schema — Firestore Collections

### Collection: `users`
```
users/{uid}
├── uid: string                        (Firebase Auth UID)
├── role: "volunteer" | "ngo" | "admin"
├── name: string
├── email: string
├── phone: string
├── photoURL: string                   (Firebase Storage URL)
├── verified: boolean                  (set by admin)
├── createdAt: Timestamp
│
│  [volunteer-only fields]
├── skills: string[]                   (e.g. ["first aid", "teaching", "python"])
├── skillEmbedding: number[]           (Vertex AI embedding vector — 768 dims)
├── experience: string                 (free text, years of experience)
├── languages: string[]                (e.g. ["Malayalam", "Hindi", "English"])
├── location: GeoPoint
├── locationName: string               (human-readable address)
├── availability: {
│     dates: string[]                  (ISO date strings: "2025-04-20")
│     timeSlots: string[]              ("morning" | "afternoon" | "evening")
│   }
├── totalPoints: number                (reward points running total)
├── badges: string[]
│
│  [ngo-only fields]
├── ngoId: string                      (ref → ngos collection)
└── registrationNo: string
```

### Collection: `ngos`
```
ngos/{ngoId}
├── ngoId: string
├── name: string
├── registrationNo: string
├── verified: boolean                  (admin approves)
├── focusAreas: string[]               (e.g. ["education", "healthcare", "disaster relief"])
├── description: string
├── website: string
├── contactEmail: string
├── location: GeoPoint
├── locationName: string
├── adminUid: string                   (ref → users/{uid} of NGO admin user)
├── rating: number                     (avg volunteer rating of this NGO, 1–5)
├── totalTasksPosted: number
└── createdAt: Timestamp
```

### Collection: `tasks`
```
tasks/{taskId}
├── taskId: string
├── ngoId: string                      (ref → ngos)
├── ngoName: string                    (denormalised for fast display)
├── title: string
├── description: string
├── descriptionTranslated: {           (Google Translate output)
│     hi: string, en: string, ta: string, ml: string
│   }
├── urgency: number                    (1–5, set by NGO)
├── urgencyScore: number               (computed: urgency × recency factor)
├── category: string                   ("education"|"healthcare"|"disaster"|"environment"|"other")
├── requiredSkills: string[]
├── requiredSkillsEmbedding: number[]  (Vertex AI embedding of skills array)
├── location: GeoPoint
├── locationName: string
├── address: string
├── volunteersRequired: number
├── volunteersMatched: number          (running count)
├── startDate: string                  (ISO date)
├── endDate: string
├── status: "open" | "matching" | "active" | "completed" | "cancelled"
├── applicants: string[]               (volunteer UIDs who self-applied)
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Collection: `matches`
```
matches/{matchId}
├── matchId: string
├── taskId: string                     (ref → tasks)
├── volunteerId: string                (ref → users)
├── ngoId: string
│
│  [scoring breakdown — stored for transparency]
├── scoreTotal: number                 (0.0 – 1.0)
├── scoreSkill: number
├── scoreProximity: number
├── scoreAvailability: number
├── scoreImpact: number
│
├── status: "pending" | "accepted" | "declined" | "completed" | "cancelled"
├── matchedBy: string                  (admin UID who triggered matching)
├── volunteerResponse: string          (decline reason, optional)
├── completedAt: Timestamp
├── ngoRating: number                  (NGO rates volunteer after completion, 1–5)
├── volunteerRating: number            (volunteer rates NGO after completion, 1–5)
└── createdAt: Timestamp
```

### Collection: `rewards`
```
rewards/{rewardId}
├── rewardId: string
├── volunteerId: string                (ref → users)
├── type: "task_complete" | "badge" | "referral" | "milestone"
├── points: number
├── description: string
├── taskId: string                     (ref → tasks, if applicable)
└── createdAt: Timestamp

rewards_catalog/{catalogId}
├── title: string                      (e.g. "Amazon Gift Card Rs.500")
├── pointsCost: number
├── stock: number
├── imageURL: string
└── active: boolean
```

### Collection: `audit_logs`
```
audit_logs/{logId}
├── action: string                     (e.g. "create_task", "delete_ngo", "run_matching")
├── performedBy: string                (UID of actor)
├── performedByRole: string
├── targetId: string                   (ID of affected document)
├── targetCollection: string
├── before: map                        (document state before, optional)
├── after: map                         (document state after, optional)
├── ipAddress: string
└── timestamp: Timestamp
```

### Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() { return request.auth != null; }
    function isAdmin() {
      return isAuth() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    function isNGO() {
      return isAuth() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ngo';
    }
    function isVolunteer() {
      return isAuth() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'volunteer';
    }
    function isOwner(uid) { return isAuth() && request.auth.uid == uid; }

    match /users/{uid} {
      allow read: if isAuth();
      allow create: if isOwner(uid);
      allow update: if isOwner(uid) || isAdmin();
      allow delete: if isAdmin();
    }
    match /ngos/{ngoId} {
      allow read: if isAuth();
      allow create: if isNGO();
      allow update: if isAdmin() ||
        (isNGO() && resource.data.adminUid == request.auth.uid);
      allow delete: if isAdmin();
    }
    match /tasks/{taskId} {
      allow read: if isAuth();
      allow create: if isNGO();
      allow update: if isAdmin() ||
        (isNGO() && resource.data.ngoId ==
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.ngoId);
      allow delete: if isAdmin();
    }
    match /matches/{matchId} {
      allow read: if isAuth() && (
        resource.data.volunteerId == request.auth.uid || isAdmin() || isNGO()
      );
      allow create, update: if isAdmin();
      allow update: if resource.data.volunteerId == request.auth.uid &&
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['status', 'volunteerResponse']);
    }
    match /rewards/{rewardId} {
      allow read: if isAuth() &&
        (resource.data.volunteerId == request.auth.uid || isAdmin());
      allow create, update: if isAdmin();
    }
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAdmin();
      allow update, delete: if false;
    }
  }
}
```

### Firestore Indexes (`firestore.indexes.json`)
```json
{
  "indexes": [
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "urgencyScore", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "urgencyScore", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "volunteerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "taskId", "order": "ASCENDING" },
        { "fieldPath": "scoreTotal", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "audit_logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 7. Backend — Java Spring Boot

### `pom.xml` — Key Dependencies
```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>

  <!-- Firebase Admin SDK -->
  <dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
  </dependency>

  <!-- Vertex AI -->
  <dependency>
    <groupId>com.google.cloud</groupId>
    <artifactId>google-cloud-aiplatform</artifactId>
    <version>3.42.0</version>
  </dependency>

  <!-- Google Maps Services -->
  <dependency>
    <groupId>com.google.maps</groupId>
    <artifactId>google-maps-services</artifactId>
    <version>2.2.0</version>
  </dependency>

  <!-- Cloud Translate -->
  <dependency>
    <groupId>com.google.cloud</groupId>
    <artifactId>google-cloud-translate</artifactId>
    <version>2.43.0</version>
  </dependency>

  <!-- Lombok -->
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>
</dependencies>
```

### Firebase JWT Middleware
```java
// FirebaseTokenFilter.java
@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String idToken = authHeader.substring(7);
            try {
                FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String role = (String) decoded.getClaims().get("role");
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        decoded.getUid(), null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (FirebaseAuthException e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Firebase token");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
```

### Core MatchingService Structure
```java
// MatchingService.java
@Service
public class MatchingService {

    private final EmbeddingService embeddingService;
    private final ProximityService proximityService;
    private final FirebaseFirestore db;
    private final NotificationService notificationService;
    private final RewardService rewardService;

    // Scoring weights
    private static final double W_SKILL        = 0.40;
    private static final double W_PROXIMITY    = 0.30;
    private static final double W_AVAILABILITY = 0.20;
    private static final double W_IMPACT       = 0.10;

    public List<MatchScore> runMatching(String taskId, String adminUid) {
        Task task = fetchTask(taskId);
        List<UserProfile> candidates = fetchActiveCandidates();
        List<MatchScore> scores = new ArrayList<>();

        for (UserProfile volunteer : candidates) {
            MatchScore s = computeScore(task, volunteer);
            scores.add(s);
        }

        scores.sort(Comparator.comparingDouble(MatchScore::getTotal).reversed());
        List<MatchScore> topN = scores.subList(
            0, Math.min(task.getVolunteersRequired(), scores.size()));

        saveMatchesToFirestore(topN, task, adminUid);
        notificationService.notifyMatchedVolunteers(topN, task);
        return topN;
    }

    public MatchScore computeScore(Task task, UserProfile volunteer) {
        double skill = embeddingService.cosineSimilarity(
            task.getRequiredSkillsEmbedding(),
            volunteer.getSkillEmbedding());

        double distKm = proximityService.drivingDistanceKm(
            task.getLocation(), volunteer.getLocation());
        double prox = 1.0 / (1.0 + distKm / 10.0);

        double avail = availabilityScore(task, volunteer);

        int completed = matchRepo.countCompleted(volunteer.getUid());
        double avgRating = matchRepo.averageNGORating(volunteer.getUid());
        double impact = Math.min(1.0, (completed * avgRating) / 25.0);

        double total = W_SKILL*skill + W_PROXIMITY*prox
                     + W_AVAILABILITY*avail + W_IMPACT*impact;

        return new MatchScore(volunteer.getUid(), total, skill, prox, avail, impact, distKm);
    }

    private double availabilityScore(Task task, UserProfile volunteer) {
        boolean hasDate = volunteer.getAvailability().getDates()
            .stream().anyMatch(d -> isWithinTaskRange(d, task));
        if (!hasDate) return 0.0;
        long matchingSlots = volunteer.getAvailability().getTimeSlots()
            .stream().filter(s -> task.getRequiredTimeSlots().contains(s)).count();
        return matchingSlots / 3.0;
    }
}
```

### Dockerfile
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/sra-backend.jar app.jar
COPY src/main/resources/serviceAccountKey.json serviceAccountKey.json
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 8. Frontend — React Portals

### Firebase Init (`services/firebase.js`)
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const storage   = getStorage(app);
export const messaging = getMessaging(app);
export const googleProvider = new GoogleAuthProvider();
```

### Route Structure (`App.jsx`)
```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />

  <Route path="/ngo/*"
    element={<ProtectedRoute role="ngo"><NGOLayout /></ProtectedRoute>}>
    <Route index element={<NGODashboard />} />
    <Route path="post-task"       element={<PostTask />} />
    <Route path="tasks"           element={<TaskList />} />
    <Route path="matches/:taskId" element={<MatchResults />} />
  </Route>

  <Route path="/volunteer/*"
    element={<ProtectedRoute role="volunteer"><VolunteerLayout /></ProtectedRoute>}>
    <Route index element={<VolunteerDashboard />} />
    <Route path="profile"    element={<ProfileSetup />} />
    <Route path="browse"     element={<BrowseTasks />} />
    <Route path="my-matches" element={<MyMatches />} />
    <Route path="rewards"    element={<Rewards />} />
  </Route>

  <Route path="/admin/*"
    element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
    <Route index element={<AdminDashboard />} />
    <Route path="ngos"       element={<ManageNGOs />} />
    <Route path="volunteers" element={<ManageVolunteers />} />
    <Route path="matching"   element={<RunMatching />} />
    <Route path="audit"      element={<AuditLog />} />
  </Route>
</Routes>
```

### Real-time Task Feed (`hooks/useTasks.js`)
```javascript
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useState, useEffect } from 'react';

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = collection(db, 'tasks');
    if (filters.status)   q = query(q, where('status', '==', filters.status));
    if (filters.category) q = query(q, where('category', '==', filters.category));
    q = query(q, orderBy('urgencyScore', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [filters.status, filters.category]);

  return { tasks, loading };
}
```

### NGO — PostTask Form Fields
```jsx
// All fields an NGO must fill when posting a task
const taskFields = {
  title:              '',
  description:        '',       // auto-translated on submit via backend
  category:           '',       // education | healthcare | disaster | environment | other
  urgency:            3,        // slider 1–5
  requiredSkills:     [],       // multi-tag input (free-text tags)
  volunteersRequired: 1,        // number input
  location:           null,     // Google Maps Place Picker → GeoPoint
  locationName:       '',
  startDate:          '',
  endDate:            '',
};
```

### Volunteer — ProfileSetup Fields
```jsx
// All fields a volunteer fills on first login
const profileFields = {
  name:         '',
  phone:        '',
  skills:       [],   // tag input — these get embedded by Vertex AI on save
  experience:   '',   // free text
  languages:    [],   // multi-select: Malayalam, Hindi, English, Tamil, Kannada
  location:     null, // Maps autocomplete → GeoPoint
  availability: {
    dates:     [],    // date picker multi-select (ISO strings)
    timeSlots: [],    // morning | afternoon | evening
  },
};
```

### Google Maps Heatmap
```jsx
// HeatMap.jsx
import { GoogleMap, HeatmapLayer, useJsApiLoader } from '@react-google-maps/api';

export function TaskHeatMap({ tasks }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAPS_API_KEY,
    libraries: ['visualization'],
  });

  const heatmapData = tasks.map(task => ({
    location: new window.google.maps.LatLng(
      task.location._lat, task.location._long),
    weight: task.urgency,  // urgency 1–5 drives heat intensity
  }));

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '500px' }}
      zoom={10}
      center={{ lat: 11.85, lng: 75.77 }}>
      <HeatmapLayer
        data={heatmapData}
        options={{ radius: 30, opacity: 0.7 }} />
    </GoogleMap>
  ) : null;
}
```

---

## 9. AI/ML — Vertex AI Matching Engine

### Skill Embedding Service (Java)
```java
// EmbeddingService.java
@Service
public class EmbeddingService {

    @Value("${vertex-ai.project}")
    private String project;

    private final PredictionServiceClient predictionClient;

    private static final String MODEL =
        "publishers/google/models/text-embedding-004";

    public List<Double> embedSkills(List<String> skills) {
        String input = String.join(", ", skills);
        String endpoint = String.format(
            "projects/%s/locations/us-central1/%s", project, MODEL);

        Value instance = Value.newBuilder()
            .setStructValue(Struct.newBuilder()
                .putFields("content",
                    Value.newBuilder().setStringValue(input).build()))
            .build();

        PredictResponse response = predictionClient.predict(
            EndpointName.parse(endpoint),
            List.of(instance),
            Value.newBuilder().build()
        );

        return response.getPredictions(0)
            .getStructValue()
            .getFieldsMap()
            .get("embeddings")
            .getStructValue()
            .getFieldsMap()
            .get("values")
            .getListValue()
            .getValuesList()
            .stream()
            .map(Value::getNumberValue)
            .collect(Collectors.toList());
    }

    public double cosineSimilarity(List<Double> a, List<Double> b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.size(); i++) {
            dot   += a.get(i) * b.get(i);
            normA += a.get(i) * a.get(i);
            normB += b.get(i) * b.get(i);
        }
        if (normA == 0 || normB == 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
```

### When to Trigger Embedding
- Volunteer saves/updates profile → Cloud Function calls `POST /api/users/embed/{uid}`
- Task posted → Cloud Function calls `POST /api/tasks/embed/{taskId}`
- Embedding stored as `skillEmbedding` / `requiredSkillsEmbedding` in Firestore

---

## 10. Data Pipeline — Forms to Firestore

### Google Forms Fields to Create
| Field | Type | Maps To |
|-------|------|---------|
| Community area / ward name | Short answer | `task.locationName` |
| Problem category | Dropdown | `task.category` |
| Description of problem | Paragraph | `task.description` |
| Number of people affected | Short answer | stored in `task.metadata` |
| Urgency level (1–5) | Linear scale | `task.urgency` |
| Contact name | Short answer | `task.metadata.contact` |
| GPS coordinates or landmark | Short answer | geocoded → `task.location` |

### Apps Script — Sheet to Backend
```javascript
// Attach this to the Google Sheet that receives form responses
function onFormSubmit(e) {
  const row = e.values;
  const payload = {
    area:          row[1],
    category:      row[2],
    description:   row[3],
    affectedCount: parseInt(row[4]) || 0,
    urgency:       parseInt(row[5]) || 3,
    contact:       row[6],
    rawLocation:   row[7],
    source:        'google_forms',
    createdAt:     new Date().toISOString()
  };

  const secret = PropertiesService.getScriptProperties()
    .getProperty('PIPELINE_SECRET');

  UrlFetchApp.fetch('https://YOUR_CLOUD_RUN_URL/api/pipeline/ingest', {
    method:      'post',
    contentType: 'application/json',
    payload:     JSON.stringify(payload),
    headers:     { 'X-Pipeline-Secret': secret }
  });
}
```

### Backend Ingest Endpoint (Java)
```java
@PostMapping("/api/pipeline/ingest")
public ResponseEntity<?> ingestFormData(
    @RequestBody PipelinePayload payload,
    @RequestHeader("X-Pipeline-Secret") String secret) {

    if (!secret.equals(pipelineSecret))
        return ResponseEntity.status(403).build();

    // 1. Geocode rawLocation string → GeoPoint
    GeoPoint location = proximityService.geocode(payload.getRawLocation());

    // 2. Translate description into regional languages
    Map<String, String> translations =
        translateService.translateToAll(payload.getDescription());

    // 3. Extract required skills via Vertex AI NLP
    List<String> skills = nlpService.extractSkills(payload.getDescription());

    // 4. Save as open task draft in Firestore
    taskService.createFromPipeline(payload, location, translations, skills);

    return ResponseEntity.ok().build();
}
```

---

## 11. Matching Algorithm — Full Specification

### Scoring Formula
```
finalScore = (0.40 × skillScore)
           + (0.30 × proximityScore)
           + (0.20 × availabilityScore)
           + (0.10 × impactScore)
```

### Signal 1: Skill Score (weight 0.40)
```
skillScore = cosineSimilarity(taskSkillEmbedding, volunteerSkillEmbedding)
Range: 0.0 – 1.0
```
Both are 768-dim Vertex AI vectors. Cosine similarity naturally handles partial
skill overlap — a volunteer with 3 of 5 required skills scores approximately 0.6.

### Signal 2: Proximity Score (weight 0.30)
```
distanceKm    = Maps Distance Matrix API (driving distance)
proximityScore = 1 / (1 + distanceKm / 10)

Range: 0.0 – 1.0
Examples:
  0 km  → 1.00
  10 km → 0.50
  40 km → 0.20
  100km → 0.09
```

### Signal 3: Availability Score (weight 0.20)
```
Step 1: does volunteer have any date within task.startDate..endDate?
  No  → availabilityScore = 0.0
  Yes → proceed

Step 2: slot overlap fraction
  volunteer.timeSlots ∩ task.requiredTimeSlots
  score = matchingSlots / 3.0
  → 0.33 if one slot matches, 0.67 if two, 1.0 if all three
```

### Signal 4: Impact Score (weight 0.10)
```
completedTasks = count(matches where volunteerId=uid AND status="completed")
avgNGORating   = mean(match.ngoRating for this volunteer)
impactScore    = min(1.0, (completedTasks × avgNGORating) / 25)

Range: 0.0 – 1.0  (saturates at ~5 tasks with perfect 5.0 rating)
New volunteers get 0.0 — skill and proximity carry them.
```

### Tiebreaking (when finalScore identical)
1. Higher `skillScore` first
2. Lower `distanceKm` first
3. Earlier `createdAt` (more platform tenure)

---

## 12. Rewards System

### Point Allocation Rules
| Action | Points Awarded |
|--------|---------------|
| Complete task (urgency 1) | 50 |
| Complete task (urgency 2) | 100 |
| Complete task (urgency 3) | 150 |
| Complete task (urgency 4) | 200 |
| Complete task (urgency 5 — critical) | 300 |
| NGO gives 5-star rating bonus | +50 |
| First ever task completion | +100 (one-time milestone) |
| Refer a volunteer who completes a task | +75 |

### Badge Definitions
| Badge ID | Name | Trigger Condition |
|----------|------|-------------------|
| `first_responder` | First Responder | Complete first task |
| `skill_champion` | Skill Champion | Complete 5 tasks in same category |
| `community_hero` | Community Hero | Accumulate 1000 total points |
| `speed_volunteer` | Speed Volunteer | Accept match within 1 hour of notification |
| `multilingual` | Multilingual | Complete task that required translation |

### Redemption Flow
1. Volunteer calls `POST /api/rewards/redeem` with `{ catalogId }`
2. Backend checks `volunteer.totalPoints >= catalog.pointsCost`
3. Deducts points atomically via Firestore transaction
4. Decrements `catalog.stock`
5. Creates redemption record in `rewards` collection
6. Sends FCM notification to admin to fulfil the request
7. Admin marks order fulfilled in admin portal

---

## 13. Notification System — FCM

### Trigger Events and Messages
| Event | Recipient | Notification Body |
|-------|-----------|-------------------|
| Volunteer matched to task | Volunteer | "You have been matched to [Task Title] by [NGO Name]" |
| Volunteer accepts match | NGO admin | "[Volunteer Name] accepted your task [Title]" |
| Volunteer declines match | NGO admin | "[Name] declined — a replacement match has been triggered" |
| Task completed | NGO admin | "[Name] completed [Title] — please rate them" |
| New task within 30km | Nearby volunteers | "New [urgency]/5 urgency task near you: [Title]" |
| Reward redeemed | Admin | "[Name] redeemed [Item] for [points] points — fulfil request" |
| NGO approved | NGO admin user | "Your NGO has been verified. You can now post tasks." |

### Cloud Function — Match Created Trigger
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin     = require('firebase-admin');
admin.initializeApp();

exports.onMatchCreated = functions.firestore
  .document('matches/{matchId}')
  .onCreate(async (snap, context) => {
    const match     = snap.data();
    const [volDoc, taskDoc] = await Promise.all([
      admin.firestore().doc(`users/${match.volunteerId}`).get(),
      admin.firestore().doc(`tasks/${match.taskId}`).get(),
    ]);

    const token = volDoc.data().fcmToken;
    if (!token) return null;

    return admin.messaging().send({
      token,
      notification: {
        title: 'New task match!',
        body:  `You have been matched to "${taskDoc.data().title}"`,
      },
      data: {
        matchId: context.params.matchId,
        taskId:  match.taskId,
        type:    'match_created',
      },
    });
  });

exports.onNearbyTask = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap) => {
    const task = snap.data();
    // Query volunteers within rough bounding box of task location
    // Send FCM to each volunteer with fcmToken
    // (implement GeoPoint bounding box query in Firestore)
  });
```

---

## 14. Google APIs Integration Map

| Google Product | Where Used | Purpose |
|----------------|-----------|---------|
| Firebase Auth | Frontend + Backend | Google Sign-In, JWT generation, role custom claims |
| Cloud Firestore | Backend + Frontend | Primary database, real-time listeners |
| Firebase Hosting | Frontend | React deployment, global CDN, SSL |
| Firebase Storage | Frontend + Backend | Profile photos, NGO verification documents |
| Firebase Cloud Messaging | Cloud Functions | Push notifications to volunteers and admins |
| Vertex AI text-embedding-004 | Backend | Convert skill strings to 768-dim vectors |
| Google Maps JS API | Frontend | Interactive task heatmap, location picker |
| Maps Distance Matrix API | Backend | Volunteer-to-task driving distance for scoring |
| Maps Geocoding API | Backend | Convert address text to GeoPoint |
| Google Translate API | Backend | Multilingual task descriptions (ml, hi, ta, en, kn, te) |
| Google Forms + Sheets | Data pipeline | Paper survey digitisation with Apps Script |
| Cloud Run | Backend | Java Spring Boot containerised hosting |
| Cloud Pub/Sub | Backend | Async event bus between API and Cloud Functions |
| Cloud Functions | Functions | FCM triggers, pipeline ingestion webhook |
| Cloud Logging | Backend | Structured audit log shipping |
| Google Sign-In (OAuth) | Frontend | Frictionless authentication |

---

## 15. API Endpoints Reference

All endpoints require `Authorization: Bearer {firebaseIdToken}` except `/api/pipeline/ingest`.

### Tasks
```
GET    /api/tasks                      list tasks (query: status, category, urgencyMin)
POST   /api/tasks                      create task                          [NGO]
GET    /api/tasks/{taskId}             get single task
PUT    /api/tasks/{taskId}             update task                          [NGO]
DELETE /api/tasks/{taskId}             delete task                          [Admin]
POST   /api/tasks/{taskId}/apply       volunteer self-applies               [Volunteer]
GET    /api/tasks/{taskId}/applicants  list self-applicants                 [NGO/Admin]
```

### Matching
```
POST   /api/match/run/{taskId}         trigger matching algorithm           [Admin]
GET    /api/match/results/{taskId}     ranked candidate list                [Admin]
PUT    /api/match/{matchId}/confirm    admin confirms match                 [Admin]
PUT    /api/match/{matchId}/respond    volunteer accepts or declines        [Volunteer]
GET    /api/match/my-matches           volunteer's own match history        [Volunteer]
GET    /api/match/task/{taskId}        all matches for a task               [NGO/Admin]
```

### Users
```
GET    /api/users/me                   own profile
PUT    /api/users/me                   update own profile (triggers re-embed)
GET    /api/users/{uid}                get any user                         [Admin]
DELETE /api/users/{uid}                delete user                          [Admin]
PUT    /api/users/{uid}/verify         approve volunteer                    [Admin]
POST   /api/users/embed/{uid}          trigger embedding update             [Admin/Internal]
```

### NGOs
```
GET    /api/ngos                       list all NGOs
POST   /api/ngos                       register NGO                         [NGO]
GET    /api/ngos/{ngoId}               get NGO detail
PUT    /api/ngos/{ngoId}/verify        approve NGO                          [Admin]
DELETE /api/ngos/{ngoId}               delete NGO                           [Admin]
GET    /api/ngos/{ngoId}/tasks         tasks posted by this NGO             [NGO/Admin]
```

### Rewards
```
GET    /api/rewards/my-points          volunteer's current points balance   [Volunteer]
GET    /api/rewards/catalog            available redemption items
POST   /api/rewards/redeem             redeem points                        [Volunteer]
GET    /api/rewards/leaderboard        top 20 volunteers by totalPoints
GET    /api/rewards/history            volunteer's reward history           [Volunteer]
```

### Admin
```
GET    /api/admin/stats                dashboard totals (NGOs, volunteers, tasks, matches)
GET    /api/admin/audit-logs           paginated audit log (query: action, dateFrom, dateTo)
GET    /api/admin/unverified           pending NGO and volunteer approvals
```

### Pipeline (internal)
```
POST   /api/pipeline/ingest            receive Google Forms data            [Pipeline secret header]
```

---

## 16. Environment Variables

### Frontend `.env`
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_MAPS_API_KEY=
VITE_API_BASE_URL=https://YOUR_CLOUD_RUN_URL
```

### Backend `application.yml`
```yaml
server:
  port: 8080

firebase:
  service-account-path: /app/serviceAccountKey.json
  project-id: ${FIREBASE_PROJECT_ID}

vertex-ai:
  project:         ${GCP_PROJECT_ID}
  location:        us-central1
  embedding-model: text-embedding-004

google:
  maps-api-key:      ${MAPS_API_KEY}
  translate-api-key: ${TRANSLATE_API_KEY}

pipeline:
  secret: ${PIPELINE_SECRET}

spring:
  security:
    filter:
      order: 1
```

---

## 17. Deployment Guide

### Step 1 — Firebase Setup
```bash
npm install -g firebase-tools
firebase login
firebase init
# Select: Firestore, Hosting, Functions, Storage
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Step 2 — Backend to Cloud Run
```bash
# Build JAR
cd backend
mvn clean package -DskipTests

# Build and push Docker image
docker build -t gcr.io/YOUR_PROJECT/sra-backend .
docker push gcr.io/YOUR_PROJECT/sra-backend

# Deploy
gcloud run deploy sra-backend \
  --image gcr.io/YOUR_PROJECT/sra-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars \
    FIREBASE_PROJECT_ID=xxx,\
    GCP_PROJECT_ID=xxx,\
    MAPS_API_KEY=xxx,\
    TRANSLATE_API_KEY=xxx,\
    PIPELINE_SECRET=xxx
```

### Step 3 — Frontend to Firebase Hosting
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Step 4 — Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### Step 5 — Seed Demo Data
```bash
node scripts/seed.js
```

---

## 18. Claude Code Prompts — Build Order

> Use these prompts sequentially. At the start of each Claude Code session,
> share this file with `@ARCHITECTURE.md` and tell Claude which prompt you are on.
> Commit working code after each prompt before starting the next.
> Use `claude-opus-4-6` for algorithm and security code.
> `claude-sonnet-4-6` is fine for CRUD boilerplate.

---

### PROMPT 1 — Project Scaffold
```
Read ARCHITECTURE.md §4 (Repository Structure).
Create the full project scaffold exactly as described:
- Init React + Vite + TailwindCSS in /frontend
- Init Spring Boot with pom.xml dependencies from §7 in /backend
- Create placeholder Cloud Functions in /functions/index.js
- Create firestore.rules and firestore.indexes.json at root with content from §6
- Create .env.example for frontend and application.yml for backend from §16
- Create root README.md with setup instructions
Do not write application logic yet. Only structure, config files, and empty placeholders.
```

---

### PROMPT 2 — Firebase Auth + Role-Based Routing
```
Read ARCHITECTURE.md §8.
Implement in /frontend:
1. services/firebase.js — exact code from §8
2. hooks/useAuth.js — reads Firebase Auth user, fetches role from Firestore users/{uid}.role
3. ProtectedRoute component — redirects /login if unauthenticated or wrong role
4. App.jsx — full route structure from §8 (NGO, Volunteer, Admin route trees)
5. LoginPage.jsx — Google Sign-In button, redirect after login based on role
```

---

### PROMPT 3 — Firestore Rules and Indexes
```
Read ARCHITECTURE.md §6 (Firestore Security Rules and Indexes).
Write the complete firestore.rules file exactly as specified.
Write firestore.indexes.json with all five composite indexes from §6.
Test rules logic by tracing through: can a volunteer read another volunteer's matches? (expected: no)
```

---

### PROMPT 4 — Java Backend: Auth Middleware and Config
```
Read ARCHITECTURE.md §7 (Backend).
Implement in /backend:
1. FirebaseConfig.java — init Firebase Admin SDK from serviceAccountKey.json path in application.yml
2. FirebaseTokenFilter.java — validate Bearer JWT, extract uid and role, set SecurityContext
3. SecurityConfig.java — use FirebaseTokenFilter, permit /api/pipeline/ingest with header-only auth, require auth for all other routes
4. VertexAIConfig.java — init PredictionServiceClient
5. Add GET /api/health that returns { uid, role } of authenticated caller for testing
```

---

### PROMPT 5 — Task CRUD (Backend + Frontend NGO portal)
```
Read ARCHITECTURE.md §6 tasks collection, §7, §8, §15 Tasks endpoints.
Backend:
1. Task.java model with all fields from §6 tasks collection
2. TaskController.java — all endpoints from §15 Tasks section
3. TaskService.java — Firestore CRUD, urgencyScore = urgency × (1 / (daysSincePosted + 1))
4. On task creation: publish "task-created" event to Cloud Pub/Sub

Frontend (NGO portal):
1. PostTask.jsx — all form fields from §8, Google Maps Place Picker for location
2. TaskList.jsx — real-time Firestore listener using useTasks hook from §8
3. UrgencyBadge.jsx — colour coded: 1=gray 2=blue 3=yellow 4=orange 5=red
```

---

### PROMPT 6 — Volunteer Profile and Skill Embedding
```
Read ARCHITECTURE.md §6 users collection, §7, §8, §9, §15 Users endpoints.
Backend:
1. UserProfile.java model with all volunteer fields from §6
2. VolunteerController.java — GET /api/users/me, PUT /api/users/me
3. EmbeddingService.java — Vertex AI text-embedding-004 call as in §9, cosineSimilarity method
4. When profile updated: call EmbeddingService.embedSkills() and write vector to Firestore

Frontend (Volunteer portal):
1. ProfileSetup.jsx — all fields from §8 including multi-tag skill input and date-picker availability
2. On submit: PUT /api/users/me, show success toast
3. BrowseTasks.jsx — display open tasks from Firestore, filter by category and urgency, show TaskCard component
```

---

### PROMPT 7 — Matching Algorithm
```
Read ARCHITECTURE.md §11 (Matching Algorithm — Full Specification) carefully.
Backend:
1. ProximityService.java — Maps Distance Matrix API call, proximityScore formula from §11
2. MatchingService.java — full computeScore() and runMatching() as in §7 and §11
3. MatchController.java:
   POST /api/match/run/{taskId} [Admin] — run matching, save top N matches to Firestore
   GET  /api/match/results/{taskId} [Admin] — return ranked scored candidates
   PUT  /api/match/{matchId}/confirm [Admin] — set status pending, trigger FCM
   PUT  /api/match/{matchId}/respond [Volunteer] — accept or decline

Frontend (Admin portal):
1. RunMatching.jsx — select open task, button "Run Matching", show ranked volunteer cards
   with score breakdown bars (skill, proximity, availability, impact) and distance label
2. Admin can confirm or override selections before saving
```

---

### PROMPT 8 — Google Maps Heatmap
```
Read ARCHITECTURE.md §8 HeatMap component.
Install @react-google-maps/api in frontend.
Implement HeatMap.jsx exactly as in §8 — urgency-weighted heatmap using Maps Visualization library.
Add to:
- NGO Dashboard (filtered to their tasks only)
- Admin Dashboard (all tasks)
- Volunteer BrowseTasks (all open tasks)
```

---

### PROMPT 9 — Rewards System
```
Read ARCHITECTURE.md §12 (Rewards System), §6 rewards collection, §15 Rewards endpoints.
Backend:
1. RewardService.java — calculatePoints(task), awardPoints(volunteerId, taskId),
   checkAndAwardBadges(volunteerId), redeemReward(volunteerId, catalogId)
2. RewardController.java — all endpoints from §15 Rewards section
3. When match status transitions to "completed": automatically call rewardService.awardPoints()
4. Badge check runs after every task completion

Frontend (Volunteer portal):
1. Rewards.jsx — points balance, earned badges grid, leaderboard top 20, rewards catalog
2. Redemption flow: select item, confirm dialog, call POST /api/rewards/redeem
3. RewardsBadge.jsx — badge icon with tooltip for volunteer cards
```

---

### PROMPT 10 — FCM Push Notifications
```
Read ARCHITECTURE.md §13 (Notification System — FCM).
Cloud Functions in /functions/index.js:
Implement all triggers from §13 notification table:
1. onMatchCreated — notify volunteer
2. onMatchStatusUpdate (accepted) — notify NGO admin
3. onTaskCreated — notify volunteers within 30km using GeoPoint bounding box query
4. onRewardRedeemed — notify admin

Frontend:
1. In firebase.js: init getMessaging(), requestNotificationPermission() on first login
2. On login: save FCM token to users/{uid}.fcmToken in Firestore
3. Foreground message handler: show toast notification component
```

---

### PROMPT 11 — Google Forms Data Pipeline
```
Read ARCHITECTURE.md §10 (Data Pipeline).
1. Write the Apps Script code from §10 as /scripts/appsScript.js with instructions to copy into Google Apps Script editor
2. Backend PipelineController.java — ingest endpoint from §10:
   a. Validate X-Pipeline-Secret header
   b. Call Maps Geocoding API to resolve rawLocation string → GeoPoint
   c. Call Google Translate API to translate description to en, hi, ta, ml
   d. Call Vertex AI NLP to extract suggested skills from description text
   e. Save as open task in Firestore
3. Admin portal: add "Form Submissions" tab showing recent pipeline-ingested tasks with option to publish or discard
```

---

### PROMPT 12 — Admin Portal Full CRUD
```
Read ARCHITECTURE.md §15 Admin endpoints, §6 audit_logs collection.
Frontend (Admin portal):
1. ManageNGOs.jsx — real-time data table: name, verified status, tasks posted, date.
   Actions: Verify button, Delete button (with confirm dialog)
2. ManageVolunteers.jsx — real-time table: name, skills tags, points, tasks completed.
   Actions: Verify, Delete
3. AuditLog.jsx — paginated table from audit_logs, filterable by action type and date range
4. AdminDashboard.jsx — 4 metric cards (NGOs, volunteers, open tasks, matches this week)
   + HeatMap + recent audit activity feed (last 10 entries)

Backend:
1. AdminController.java — stats, paginated audit-logs, unverified-list endpoints
2. AuditService.java — every mutating admin action calls auditService.log(action, adminUid, targetId, before, after)
```

---

### PROMPT 13 — Google Translate Integration
```
Read ARCHITECTURE.md §10 and §14.
Backend TranslateService.java:
1. Inject Cloud Translation API v3 client
2. translateToAll(text): Map<String,String> — translate to en, hi, ta, ml, kn, te
3. detectLanguage(text): String — detect source language code
Wire into:
- TaskService.createTask(): auto-translate description before saving
- PipelineController.ingest(): translate field report description

Frontend:
Add language toggle to BrowseTasks.jsx — display task description in user's
preferred language (from profile.languages[0]), falling back to English.
```

---

### PROMPT 14 — CI/CD GitHub Actions
```
Create .github/workflows/deploy-frontend.yml:
  Trigger: push to main, changes in /frontend/**
  Steps: npm ci, npm test, npm run build
  Deploy: firebase deploy --only hosting (using FIREBASE_SERVICE_ACCOUNT secret)

Create .github/workflows/deploy-backend.yml:
  Trigger: push to main, changes in /backend/**
  Steps: mvn test, docker build, docker push to GCR, gcloud run deploy
  Use GitHub Secrets for: GCP_SA_KEY, FIREBASE_PROJECT_ID, MAPS_API_KEY,
    TRANSLATE_API_KEY, PIPELINE_SECRET

Both workflows should run tests before deploying and fail fast on test errors.
```

---

### PROMPT 15 — Demo Data Seed Script
```
Read ARCHITECTURE.md §6 for all collection schemas.
Create /scripts/seed.js using Firebase Admin SDK:
Seed Firestore with realistic demo data for Kerala context:
- 3 verified NGOs: one education (Wayanad), one healthcare (Kozhikode), one disaster relief (Malappuram)
- 15 volunteers: varied skills (first aid, teaching, construction, data entry, Malayalam translation),
  locations spread across northern Kerala, different availability schedules
- 10 tasks: mix of urgency 1–5, categories, statuses (3 open, 3 matched, 2 active, 2 completed)
- Pre-computed matches for the 3 matched tasks with realistic scoreTotal values
- 5 reward records and 2 completed redemptions

Run with: node scripts/seed.js
```

---

*End of Architecture Document*

---

## Quick Reference for Claude Code Sessions

- At start of every session: `@ARCHITECTURE.md` to give Claude full context
- Say which prompt number you are executing (e.g. "Execute PROMPT 7")
- After each prompt succeeds: `git commit -m "feat: prompt 7 - matching algorithm"`
- If a prompt is large: split into Backend and Frontend halves in separate messages
- Model recommendation:
  - `claude-opus-4-6` — matching algorithm (PROMPT 7), security rules (PROMPT 3), embedding (PROMPT 6)
  - `claude-sonnet-4-6` — CRUD controllers, React forms, CI/CD boilerplate
