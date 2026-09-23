import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'CORE Wealth Baseball | Tax location workpapers', description: 'MLB and MiLB player roster timelines, injured-list periods, and Excel location reports.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
