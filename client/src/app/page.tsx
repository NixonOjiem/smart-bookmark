import Link from "next/link";
import NavigationBar from "@/components/homepage/NavigationBar";
import HeroSection from "@/components/homepage/HeroSection";
import FooterComponent from "@/components/homepage/FooterComponent";
export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavigationBar />
      <HeroSection />
      <FooterComponent />
    </div>
  );
}
