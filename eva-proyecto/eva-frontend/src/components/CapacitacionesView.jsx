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

import { Eye } from "lucide-react";

import HomeImg from "../assets/Img/imagenes/home-img.jpg";

export default function CapacitacionesView() {
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

  const trainingSessions = [
    "capacitación de limpieza",
    "capacitación de calibración",
    "capacitación de mantenimiento",
    "capacitación de seguridad",
    "capacitación de limpieza",
    "capacitación de calibración",
    "capacitación de mantenimiento",
    "capacitación de seguridad",
    "capacitación de limpieza",
    "capacitación de calibración",
    "capacitación de mantenimiento",
    "capacitación de seguridad",
    "capacitación de limpieza",
    "capacitación de calibración",
    "capacitación de mantenimiento",
    "capacitación de seguridad",
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
                        CONSULTA AQUÍ las capacitaciones disponibles
                      </h3>
                    </div>
                  </div>
                  <Input
                    placeholder="Capacitación equipos biomédicos"
                    className="w-full text-sm sm:text-base"
                  />{" "}
                  <div
                    onClick={() => setShowDropdown((prev) => !prev)}
                    className="mt-4 w-full text-center p-2 bg-[#EFF7FF]  rounded-md cursor-pointer relative"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <p className="text-slate-700">
                        Navega todas las capacitaciones
                      </p>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </span>
                    <div
                      className={`overflow-hidden transition-all duration-200 ease-in-out ${
                        showDropdown
                          ? "max-h-36 opacity-100 translate-y-0"
                          : "max-h-0 opacity-0 -translate-y-2"
                      }`}
                    >
                      <div className="mt-2 bg-white border rounded shadow z-10 overflow-auto max-h-32">
                        {trainingSessions.map((guide, idx) => (
                          <div
                            key={idx}
                            className="p-2 hover:bg-gray-100 text-left flex justify-between transition-colors duration-150"
                          >
                            {guide}
                            <span className="ml-2 cursor-pointer bg-[#CBFBF1] rounded-full p-1 hover:bg-[#A7F3D0] transition-colors duration-150">
                              <Eye className="h-4 w-4  text-[#0E6A64]" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image */}
            <div className="flex  justify-center order-1 lg:order-2">
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
                <img
                  className="w-full h-auto rounded-lg shadow-lg"
                  src="https://hips.hearstapps.com/hmg-prod/images/gato-1603975456.gif?resize=640:*"
                  alt=""
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
