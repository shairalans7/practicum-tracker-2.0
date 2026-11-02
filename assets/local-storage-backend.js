const USERS_KEY = "practicumflow-local-users-v1";
const SESSION_KEY = "practicumflow-local-session-v1";
const DATA_PREFIX = "practicumflow-local-data-v1:";
const encoder = new TextEncoder();

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error?.name === "QuotaExceededError") {
      throw new Error("Local storage is full. Export or clear old browser data before adding more.");
    }
    throw new Error("The browser could not save local data. Check that site storage is enabled.");
  }
}

function makeId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function currentLocalUser() {
  const uid = localStorage.getItem(SESSION_KEY);
  if (!uid) return null;
  const users = readJson(USERS_KEY, {});
  return Object.values(users).find((user) => user.uid === uid) || null;
}

function identityUser(user) {
  if (!user) return null;
  return {
    id: user.uid,
    name: user.name || "",
    email: user.email,
    emailVerified: true,
    userMetadata: { full_name: user.name || "" }
  };
}

function defaultData(user) {
  return {
    profile: {
      fullName: user.name || user.email.split("@")[0],
      email: user.email,
      course: "",
      major: "",
      companyName: "",
      targetHours: 243,
      dailyMinutes: 480,
      timezone: "Asia/Manila"
    },
    shifts: [],
    activities: []
  };
}

function loadLocalData(user) {
  return readJson(`${DATA_PREFIX}${user.uid}`, defaultData(user));
}

function saveLocalData(user, data) {
  writeJson(`${DATA_PREFIX}${user.uid}`, data);
}

function apiData(user) {
  const data = loadLocalData(user);
  const profile = data.profile;
  return {
    profile: profile ? {
      fullName: profile.fullName || user.name,
      totalHours: Number(profile.targetHours || 243),
      dailyMinutes: Number(profile.dailyMinutes || 480),
      timezone: profile.timezone || "Asia/Manila"
    } : null,
    shifts: [...data.shifts].sort((a, b) => (b.start || "").localeCompare(a.start || "")),
    activities: [...data.activities].sort((a, b) => `${b.date}${b.createdAt || ""}`.localeCompare(`${a.date}${a.createdAt || ""}`))
  };
}

function encodeBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function decodeBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt: decodeBase64(salt),
    iterations: 120000,
    hash: "SHA-256"
  }, key, 256);
  return encodeBase64(new Uint8Array(bits));
}

async function ensureLocalProfile(user) {
  const data = loadLocalData(user);
  if (!data.profile) {
    data.profile = defaultData(user).profile;
    saveLocalData(user, data);
  }
}

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function clockTime(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

async function handleLocalTrackerRequest(request, init) {
  try {
    const user = currentLocalUser();
    if (!user) return response({ error: "Sign in to your local demo account first." }, 401);

    const method = (init?.method || request?.method || "GET").toUpperCase();
    const data = loadLocalData(user);
    if (method === "GET") return response(apiData(user));

    const payload = JSON.parse(init?.body || "{}");
    if (payload.action === "clock-in") {
      if (data.shifts.some((shift) => !shift.end)) throw new Error("You already have an active shift.");
      data.shifts.push({
        id: makeId(),
        userId: user.uid,
        start: new Date().toISOString(),
        end: null,
        durationSeconds: 0,
        createdAt: new Date().toISOString()
      });
    } else if (payload.action === "clock-out") {
      const active = data.shifts.find((shift) => !shift.end);
      if (!active) throw new Error("There is no active shift to clock out.");
      active.end = new Date().toISOString();
      active.durationSeconds = Math.min(86400, Math.max(0, Math.round((Date.parse(active.end) - Date.parse(active.start)) / 1000)));
    } else if (payload.action === "settings") {
      data.profile = {
        ...data.profile,
        fullName: user.name || data.profile.fullName,
        email: user.email,
        targetHours: Number(payload.totalHours || 243),
        dailyMinutes: Number(payload.dailyMinutes || 480),
        timezone: String(payload.timezone || "Asia/Manila")
      };
    } else if (payload.action === "activity") {
      const minutes = Math.round(Number(payload.minutes));
      if (!Number.isInteger(minutes) || minutes < 15 || minutes > 1440) {
        throw new Error("Activity duration must be between 15 minutes and 24 hours.");
      }
      const startMinutes = 9 * 60;
      data.activities.push({
        id: makeId(),
        userId: user.uid,
        title: String(payload.title || "").trim(),
        category: String(payload.category || "Other"),
        minutes,
        date: String(payload.date || ""),
        startTime: clockTime(startMinutes),
        endTime: clockTime(startMinutes + minutes),
        notes: String(payload.notes || ""),
        createdAt: new Date().toISOString()
      });
    } else {
      throw new Error("Unsupported tracker action.");
    }

    saveLocalData(user, data);
    return response(apiData(user));
  } catch (error) {
    return response({ error: error.message || "Could not save local data." }, 400);
  }
}

globalThis.practicumFirebase = {
  async currentUser() {
    return identityUser(currentLocalUser());
  },
  async signUp(email, password, metadata = {}) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) throw new Error("Enter an email address and password.");

    const users = readJson(USERS_KEY, {});
    if (users[normalizedEmail]) throw new Error("A local demo account already exists with this email. Sign in instead.");

    const salt = encodeBase64(crypto.getRandomValues(new Uint8Array(16)));
    const user = {
      uid: makeId(),
      email: normalizedEmail,
      name: String(metadata.full_name || "").trim(),
      salt,
      passwordHash: await hashPassword(password, salt)
    };
    users[normalizedEmail] = user;
    writeJson(USERS_KEY, users);
    localStorage.setItem(SESSION_KEY, user.uid);
    await ensureLocalProfile(user);
    return { emailVerified: true };
  },
  async signIn(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const users = readJson(USERS_KEY, {});
    const user = users[normalizedEmail];
    if (!user) throw new Error("No local demo account was found for this email. Create one from this localhost first.");
    const suppliedHash = await hashPassword(String(password || ""), user.salt);
    if (suppliedHash !== user.passwordHash) throw new Error("The local demo password is incorrect.");
    localStorage.setItem(SESSION_KEY, user.uid);
    await ensureLocalProfile(user);
  },
  async signOut() {
    localStorage.removeItem(SESSION_KEY);
  },
  async sendPasswordReset() {
    throw new Error("Password reset email is unavailable in local-only mode. Use your Firebase account on the live website.");
  },
  async updatePassword(password) {
    const user = currentLocalUser();
    if (!user) throw new Error("Sign in again before changing the password.");
    const users = readJson(USERS_KEY, {});
    const salt = encodeBase64(crypto.getRandomValues(new Uint8Array(16)));
    users[user.email] = { ...user, salt, passwordHash: await hashPassword(password, salt) };
    writeJson(USERS_KEY, users);
  }
};

const localModeNotice = document.createElement("div");
localModeNotice.className = "local-mode-notice";
localModeNotice.setAttribute("role", "status");
localModeNotice.textContent = "LOCAL DEMO MODE - data is saved only in this browser; Firebase and internet are not used.";
document.body.append(localModeNotice);

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  const requestUrl = input instanceof Request ? input.url : String(input);
  const url = new URL(requestUrl, window.location.href);
  if (url.pathname.endsWith("/api/tracker")) return handleLocalTrackerRequest(input, init);
  return nativeFetch(input, init);
};
