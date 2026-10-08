import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NEER-AI | Smart Water & Agro-Intelligence Platform',
  description:
    'NEER-AI is a next-generation water management and agricultural intelligence system for South India & Tamil Nadu. Featuring OpenStreetMap & Leaflet with 760 NWIC dams, live Open-Meteo weather & rain prediction, multi-depth soil moisture profiling, underground water table reports, agricultural land suitability analyzer, irrigation schedules, drought relief alerts, and grievance redressal system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
