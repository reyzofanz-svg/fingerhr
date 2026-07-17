"use client";

import { useEffect } from "react";

export function SWRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "activated") {
                  console.log("New SW activated");
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }
  }, []);

  return null;
}
