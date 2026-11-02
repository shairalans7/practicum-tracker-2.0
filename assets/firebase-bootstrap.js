const host = window.location.hostname.toLowerCase();
const useLocalStorage = host === "localhost" || host === "127.0.0.1" || host === "[::1]";

document.documentElement.dataset.storage = useLocalStorage ? "local" : "firebase";

if (useLocalStorage) {
  await import("./local-storage-backend.js");
} else {
  await import("./firebase-online.js");
}

await import("./theme.js");
await import("./index-B_b0rHmn.js");
