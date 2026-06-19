"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [html, setHtml] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const htmlReady = useRef(false);
  const scriptReadyRef = useRef(false);

  function tryInit() {
    const w = window as unknown as { initApp?: () => void };
    if (htmlReady.current && scriptReadyRef.current && w.initApp) {
      w.initApp();
    }
  }

  useEffect(() => {
    fetch("/layout-body.html")
      .then((res) => res.text())
      .then((text) => {
        setHtml(text);
        htmlReady.current = true;
        tryInit();
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scriptReady) {
      scriptReadyRef.current = true;
      tryInit();
    }
  }, [scriptReady]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <div id="children-container" style={{ display: "none" }}>{children}</div>
      <Script src="/layout.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} />
    </>
  );
}
