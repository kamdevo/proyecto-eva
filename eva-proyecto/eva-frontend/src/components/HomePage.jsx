"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Menu,
  Home,
  Monitor,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  Wrench,
  GraduationCap,
  User,
  ChevronRight,
  Search,
} from "lucide-react";

import HomeImg from "../assets/Img/imagenes/home-img.jpg";

export default function EvaDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Changed from true to false for mobile
  const [isMobile, setIsMobile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const quickGuides = [
    "Guía de limpieza",
    "Guía de calibración",
    "Guía de mantenimiento",
    "Guía de seguridad",
    "Guía de limpieza",
    "Guía de calibración",
    "Guía de mantenimiento",
    "Guía de seguridad",
    "Guía de limpieza",
    "Guía de calibración",
    "Guía de mantenimiento",
    "Guía de seguridad",
    "Guía de limpieza",
    "Guía de calibración",
    "Guía de mantenimiento",
    "Guía de seguridad",
  ];

  return (
    <div className="flex flex-col  h-screen w-screen bg-gray-50 p-12 overflow-auto">
      <div className="flex flex-1">
        {/* Overlay para móviles */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
          {/* Main Heading */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-700 mb-4 sm:mb-8 tracking-wide">
              EVA GESTIONA LA TECNOLOGÍA
            </h1>
            <div className="w-full flex justify-center">
              <img className="w-80" src={HomeImg} />

              {/* <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-amber-700">
                ACREDITACIÓN
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-blue-600 font-medium">
                ¡Un compromiso de <span className="font-bold">TODOS</span>!
              </p> */}
            </div>
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start max-w-6xl mx-auto">
            {/* Left Column - Search Section */}
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <Card
                className="border-gray-200 
              "
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base leading-tight">
                        CONSULTA AQUÍ Guías rápidas equipos biomédicos
                      </h3>
                    </div>
                  </div>
                  <Input
                    placeholder="Guías rápidas equipos biomédicos"
                    className="w-full text-sm sm:text-base"
                  />
                  <div
                    onClick={() => setShowDropdown((prev) => !prev)}
                    className="mt-4 w-full text-center p-2 bg-[#f5f5f5] rounded-md cursor-pointer relative"
                  >
                    <p>Navega todas las guías rapidas</p>
                    {showDropdown && (
                      <div
                        className="relative max-h-36 overflow-auto
                       left-0 right-0 mt-2 bg-white border rounded shadow z-10"
                      >
                        {quickGuides.map((guide, idx) => (
                          <div
                            key={idx}
                            className="p-2 hover:bg-gray-100 text-left"
                          >
                            {guide}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
                <video
                  autoPlay
                  loop
                  muted
                  controls
                  src="http://eva.huv.gov.co/assets/upload_guias/CUIDADO Y LIMPIEZA.mp4"
                  alt="Medical professionals working"
                  className="rounded-lg shadow-lg w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
    </div>
  );
}
