import Navbar from "@/components/Navbar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <div
      suppressHydrationWarning
      className="flex flex-col min-h-screen bg-black text-white w-full p-4"
    >
      <Navbar />
      {children}
    </div>
  );
}
