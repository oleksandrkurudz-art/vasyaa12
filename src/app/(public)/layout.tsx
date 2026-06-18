import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import BreakingBar from "@/components/BreakingBar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <BreakingBar />
      <Header />
      <NavBar />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}
