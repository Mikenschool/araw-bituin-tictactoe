import "./globals.css";

export const metadata = {
  title: "Araw vs Bituin · Tic-Tac-Toe",
  description: "A two-player Tic-Tac-Toe game in React and Next.js, themed on the sun and stars of the Philippine flag.",
};

export const viewport = { themeColor: "#0b1f4d" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
