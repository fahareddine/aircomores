import Nav from "./components/Nav";
import Hero from "./hero/Hero";
import RotationHero from "./sections/RotationHero";
import Destinations from "./sections/Destinations";
import Tarifs from "./sections/Tarifs";
import Services from "./sections/Services";
import Booking from "./sections/booking/Booking";
import Footer from "./sections/Footer";
import { useLenis } from "./hooks/useLenis";

export default function App() {
  useLenis();

  return (
    <main className="min-h-screen">
      <Nav />
      <Hero />
      <RotationHero />
      <Destinations />
      <Tarifs />
      <Services />
      <Booking />
      <Footer />
    </main>
  );
}
