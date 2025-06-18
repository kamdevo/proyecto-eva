import LoginForm from "./components/LoginForm";
import ParticlesBackground from "./components/ParticlesBg";
import "./App.css";
import HomePage from "./components/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div>
      <Navbar />
      {/* Elimina el padding superior para que el contenido no sea empujado */}

      <HomePage />

      <Footer />
    </div>
  );
};

export default App;
