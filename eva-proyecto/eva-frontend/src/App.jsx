import LoginForm from "./components/LoginForm";
import ParticlesBackground from "./components/ParticlesBg";
import "./App.css";
import HomePage from "./components/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProfilePage from "./components/ProfilePage";

import IndustrialDevices from "./components/EquiposIndustriales";
const App = () => {
  return (
    <div>
      <Navbar />

      <ProfilePage />
    </div>
  );
};

export default App;
