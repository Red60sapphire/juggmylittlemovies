"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch("/layout-body.html")
      .then((res) => res.text())
      .then((text) => setHtml(text))
      .catch(() => {});
  }, []);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <div id="children-container" style={{ display: "none" }}>{children}</div>
      <Script src="/layout.js" strategy="afterInteractive" />
    </>
  );
}
