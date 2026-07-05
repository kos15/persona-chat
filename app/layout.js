import "./globals.css";

export const metadata = {
  title: "Chai, Code & Personas — Chat with Hitesh or Piyush",
  description:
    "An AI chat that simulates conversations with Hitesh Choudhary or Piyush Garg, mirroring each educator's voice, teaching style, and personality.",
  openGraph: {
    title: "Chai, Code & Personas",
    description:
      "Chat with AI recreations of Hitesh Choudhary and Piyush Garg.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
