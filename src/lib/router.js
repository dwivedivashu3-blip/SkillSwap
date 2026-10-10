import { useSyncExternalStore } from "react";

// Tiny hash router so the built site works on any static host (no server config).
const subscribe = (cb) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const getHash = () => window.location.hash || "#/";
const getServerHash = () => (typeof window !== "undefined" && window.location && window.location.hash) || "#/";

export function parseHash(hash) {
  const raw = hash.replace(/^#/, "") || "/";
  const [path, qs = ""] = raw.split("?");
  return { parts: path.split("/").filter(Boolean), query: new URLSearchParams(qs) };
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);
  return parseHash(hash);
}

export function navigate(to) {
  window.location.hash = to.startsWith("#") ? to : `#${to}`;
  window.scrollTo?.({ top: 0 });
}
