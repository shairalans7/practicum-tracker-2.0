import {
  addDoc,
  auth,
  collection,
  createUserWithEmailAndPassword,
  db,
  doc,
  getDoc,
  getDocs,
  isFirebaseConfigured,
  query,
  sendEmailVerification,
  sendPasswordResetEmail,
  serverTimestamp,
  setDoc,
  signInWithEmailAndPassword,
  signOut,
  Timestamp,
  updateDoc,
  updatePassword,
  updateProfile,
  where
} from "./firebase.js";

if (!isFirebaseConfigured || !auth || !db) {
  throw new Error("Firebase Web App configuration is missing.");
}

if (typeof auth.authStateReady === "function") {
  await auth.authStateReady();
}

const continueUrl = new URL("./index.html", window.location.href).href;
const actionSettings = { url: continueUrl };

function identityUser(user) {
  if (!user) return null;
  return {
    id: user.uid,
    name: user.displayName || "",
    email: user.email || "",
    emailVerified: Boolean(user.emailVerified),
    userMetadata: { full_name: user.displayName || "" }
  };
}

async function ensureProfile(user, fullName = "") {
  const profileRef = doc(db, "profiles", user.uid);
  const snapshot = await getDoc(profileRef);
  const saved = snapshot.exists() ? snapshot.data() : {};
  const profile = {
    fullName: fullName || saved.fullName || user.displayName || user.email?.split("@")[0] || "Practicum student",
    email: user.email || "",
    course: saved.course || "",
    major: saved.major || "",
    companyName: saved.companyName || "",
    targetHours: Number(saved.targetHours || 243),
    dailyMinutes: Number(saved.dailyMinutes || 480),
    timezone: saved.timezone || "Asia/Manila",
    updatedAt: serverTimestamp()
  };
  await setDoc(profileRef, profile);
  return profile;
}

function dateValue(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function loadData(user) {
  const [profileSnapshot, shiftSnapshot, activitySnapshot] = await Promise.all([
    getDoc(doc(db, "profiles", user.uid)),
    getDocs(query(collection(db, "shifts"), where("userId", "==", user.uid))),
    getDocs(query(collection(db, "activities"), where("userId", "==", user.uid)))
  ]);

  const savedProfile = profileSnapshot.exists() ? profileSnapshot.data() : null;
  const shifts = shiftSnapshot.docs.map((item) => {
    const shift = item.data();
    return {
      id: item.id,
      ...shift,
      start: dateValue(shift.start),
      end: dateValue(shift.end),
      createdAt: dateValue(shift.createdAt)
    };
  }).sort((a, b) => (b.start || "").localeCompare(a.start || ""));
  const activities = activitySnapshot.docs.map((item) => {
    const activity = item.data();
    return { id: item.id, ...activity, createdAt: dateValue(activity.createdAt) };
  }).sort((a, b) => `${b.date}${b.createdAt || ""}`.localeCompare(`${a.date}${a.createdAt || ""}`));

  return {
    profile: savedProfile ? {
      fullName: savedProfile.fullName || user.displayName || "",
      totalHours: Number(savedProfile.targetHours || 243),
      dailyMinutes: Number(savedProfile.dailyMinutes || 480),
      timezone: savedProfile.timezone || "Asia/Manila"
    } : null,
    shifts,
    activities
  };
}

function clockTime(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

async function handleTrackerRequest(request, init, url) {
  try {
    const user = auth.currentUser;
    if (!user || !user.emailVerified) {
      return new Response(JSON.stringify({ error: "Please sign in and verify your email first." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const method = (init?.method || request?.method || "GET").toUpperCase();
    if (method === "GET") {
      return new Response(JSON.stringify(await loadData(user)), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const payload = JSON.parse(init?.body || "{}");
    if (payload.action === "clock-in") {
      const data = await loadData(user);
      if (data.shifts.some((shift) => !shift.end)) {
        throw new Error("You already have an active shift.");
      }
      await addDoc(collection(db, "shifts"), {
        userId: user.uid,
        start: Timestamp.now(),
        end: null,
        durationSeconds: 0,
        createdAt: serverTimestamp()
      });
    } else if (payload.action === "clock-out") {
      const data = await loadData(user);
      const active = data.shifts.find((shift) => !shift.end);
      if (!active) throw new Error("There is no active shift to clock out.");
      const end = Timestamp.now();
      const durationSeconds = Math.min(86400, Math.max(0, Math.round((end.toMillis() - new Date(active.start).getTime()) / 1000)));
      await updateDoc(doc(db, "shifts", active.id), { end, durationSeconds });
    } else if (payload.action === "settings") {
      const profileRef = doc(db, "profiles", user.uid);
      const snapshot = await getDoc(profileRef);
      const saved = snapshot.exists() ? snapshot.data() : {};
      await setDoc(profileRef, {
        fullName: saved.fullName || user.displayName || user.email?.split("@")[0] || "Practicum student",
        email: user.email || "",
        course: saved.course || "",
        major: saved.major || "",
        companyName: saved.companyName || "",
        targetHours: Number(payload.totalHours || 243),
        dailyMinutes: Number(payload.dailyMinutes || 480),
        timezone: String(payload.timezone || "Asia/Manila"),
        updatedAt: serverTimestamp()
      });
    } else if (payload.action === "activity") {
      const minutes = Math.round(Number(payload.minutes));
      if (!Number.isInteger(minutes) || minutes < 15 || minutes > 1440) {
        throw new Error("Activity duration must be between 15 minutes and 24 hours.");
      }
      const startMinutes = 9 * 60;
      await addDoc(collection(db, "activities"), {
        userId: user.uid,
        title: String(payload.title || "").trim(),
        category: String(payload.category || "Other"),
        minutes,
        date: String(payload.date || ""),
        startTime: clockTime(startMinutes),
        endTime: clockTime(startMinutes + minutes),
        notes: String(payload.notes || ""),
        createdAt: serverTimestamp()
      });
    } else {
      throw new Error("Unsupported tracker action.");
    }

    return new Response(JSON.stringify(await loadData(user)), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Firebase request failed." }), {
      status: error.code === "permission-denied" ? 403 : 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}

globalThis.practicumFirebase = {
  async currentUser() {
    if (typeof auth.authStateReady === "function") await auth.authStateReady();
    return identityUser(auth.currentUser);
  },
  async signUp(email, password, metadata = {}) {
    const fullName = String(metadata.full_name || "").trim();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await updateProfile(result.user, { displayName: fullName });
      await ensureProfile(result.user, fullName);
      await sendEmailVerification(result.user, actionSettings);
    } finally {
      await signOut(auth).catch(() => {});
    }
    return { emailVerified: false };
  },
  async signIn(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      try {
        await sendEmailVerification(result.user, actionSettings);
      } catch (error) {
        await signOut(auth).catch(() => {});
        throw new Error(`Email isn't verified, and Firebase couldn't resend the verification link: ${error.message || error}`);
      }
      await signOut(auth).catch(() => {});
      throw new Error("Verify your email first. A verification link has been sent.");
    }
    return identityUser(result.user);
  },
  async signOut() {
    await signOut(auth);
  },
  async sendPasswordReset(email) {
    await sendPasswordResetEmail(auth, email, actionSettings);
  },
  async updatePassword(password) {
    if (!auth.currentUser) throw new Error("Sign in again before changing your password.");
    await updatePassword(auth.currentUser, password);
  }
};

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  const requestUrl = input instanceof Request ? input.url : String(input);
  const url = new URL(requestUrl, window.location.href);
  if (url.pathname.endsWith("/api/tracker")) {
    return handleTrackerRequest(input, init, url);
  }
  return nativeFetch(input, init);
};

await import("./theme.js");
await import("./index-B_b0rHmn.js");
