import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LYNX Command Center",
  description: "Digitalt styrsystem för agentkalas — LYNX Agent Academy by EventX",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body style={{ margin: 0, background: "#060a10", overflowX: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
