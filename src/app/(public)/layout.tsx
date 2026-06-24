import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchModalWrapper from "@/components/search/SearchModalWrapper";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <div className="flex-grow" id="main-content">
        {children}
      </div>
      <Footer />
      <SearchModalWrapper />
    </>
  );
}
