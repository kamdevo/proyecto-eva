"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenTool, Save, Trash2, Type, Tablet } from "lucide-react";

export default function DigitalSignatureModal({ isOpen, onClose, onSave, signerName = "" }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureName, setSignatureName] = useState(signerName);
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);
  const [signatureType, setSignatureType] = useState("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [fontStyle, setFontStyle] = useState("cursive");

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (signatureType === "draw") {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      setTypedSignature("");
    }
  };

  const saveSignature = () => {
    let signatureData;
    
    if (signatureType === "draw") {
      const canvas = canvasRef.current;
      signatureData = canvas.toDataURL();
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#000000';
      ctx.font = `36px ${fontStyle}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
      
      signatureData = canvas.toDataURL();
    }
    
    onSave({
      signature: signatureData,
      name: signatureName,
      date: signatureDate,
      type: signatureType,
      timestamp: new Date().toISOString()
    });
    onClose();
  };

  const fontOptions = [
    { value: "cursive", label: "Cursiva Clásica" },
    { value: "'Dancing Script', cursive", label: "Dancing Script" },
    { value: "'Great Vibes', cursive", label: "Great Vibes" },
    { value: "'Allura', cursive", label: "Allura" },
    { value: "'Pacifico', cursive", label: "Pacifico" },
    { value: "'Kaushan Script', cursive", label: "Kaushan Script" },
    { value: "'Alex Brush', cursive", label: "Alex Brush" },
    { value: "'Amatic SC', cursive", label: "Amatic SC" },
    { value: "'Architects Daughter', cursive", label: "Architects Daughter" },
    { value: "'Bad Script', cursive", label: "Bad Script" },
    { value: "'Berkshire Swash', cursive", label: "Berkshire Swash" },
    { value: "'Bilbo', cursive", label: "Bilbo" },
    { value: "'Bilbo Swash Caps', cursive", label: "Bilbo Swash Caps" },
    { value: "'Brush Script MT', cursive", label: "Brush Script MT" },
    { value: "'Caveat', cursive", label: "Caveat" },
    { value: "'Courgette', cursive", label: "Courgette" },
    { value: "'Damion', cursive", label: "Damion" },
    { value: "'Delius', cursive", label: "Delius" },
    { value: "'Euphoria Script', cursive", label: "Euphoria Script" },
    { value: "'Fasthand', cursive", label: "Fasthand" },
    { value: "'Fredericka the Great', cursive", label: "Fredericka the Great" },
    { value: "'Gloria Hallelujah', cursive", label: "Gloria Hallelujah" },
    { value: "'Grand Hotel', cursive", label: "Grand Hotel" },
    { value: "'Handlee', cursive", label: "Handlee" },
    { value: "'Homemade Apple', cursive", label: "Homemade Apple" },
    { value: "'Indie Flower', cursive", label: "Indie Flower" },
    { value: "'Italianno', cursive", label: "Italianno" },
    { value: "'Kalam', cursive", label: "Kalam" },
    { value: "'Kristi', cursive", label: "Kristi" },
    { value: "'La Belle Aurore', cursive", label: "La Belle Aurore" },
    { value: "'League Script', cursive", label: "League Script" },
    { value: "'Leckerli One', cursive", label: "Leckerli One" },
    { value: "'Lobster', cursive", label: "Lobster" },
    { value: "'Lobster Two', cursive", label: "Lobster Two" },
    { value: "'Marck Script', cursive", label: "Marck Script" },
    { value: "'Merienda', cursive", label: "Merienda" },
    { value: "'Monsieur La Doulaise', cursive", label: "Monsieur La Doulaise" },
    { value: "'Mr Dafoe', cursive", label: "Mr Dafoe" },
    { value: "'Nothing You Could Do', cursive", label: "Nothing You Could Do" },
    { value: "'Permanent Marker', cursive", label: "Permanent Marker" },
    { value: "'Pinyon Script', cursive", label: "Pinyon Script" },
    { value: "'Qwigley', cursive", label: "Qwigley" },
    { value: "'Reenie Beanie', cursive", label: "Reenie Beanie" },
    { value: "'Rochester', cursive", label: "Rochester" },
    { value: "'Rock Salt', cursive", label: "Rock Salt" },
    { value: "'Satisfy', cursive", label: "Satisfy" },
    { value: "'Shadows Into Light', cursive", label: "Shadows Into Light" },
    { value: "'Tangerine', cursive", label: "Tangerine" },
    { value: "'Yellowtail', cursive", label: "Yellowtail" },
    { value: "'Zeyada', cursive", label: "Zeyada" },
    { value: "'Aguafina Script', cursive", label: "Aguafina Script" },
    { value: "'Arizonia', cursive", label: "Arizonia" },
    { value: "'Arvo', serif", label: "Arvo Signature" },
    { value: "'Asul', sans-serif", label: "Asul Formal" },
    { value: "'Autour One', cursive", label: "Autour One" },
    { value: "'Babylonica', cursive", label: "Babylonica" },
    { value: "'Barrio', cursive", label: "Barrio" },
    { value: "'Beau Rivage', cursive", label: "Beau Rivage" },
    { value: "'Birthstone', cursive", label: "Birthstone" },
    { value: "'Borel', cursive", label: "Borel" },
    { value: "'Butterfly Kids', cursive", label: "Butterfly Kids" },
    { value: "'Calligraffitti', cursive", label: "Calligraffitti" },
    { value: "'Cedarville Cursive', cursive", label: "Cedarville Cursive" },
    { value: "'Charm', cursive", label: "Charm" },
    { value: "'Clicker Script', cursive", label: "Clicker Script" },
    { value: "'Cookie', cursive", label: "Cookie" },
    { value: "'Cormorant Garamond', serif", label: "Cormorant Signature" },
    { value: "'Covered By Your Grace', cursive", label: "Covered By Your Grace" },
    { value: "'Crafty Girls', cursive", label: "Crafty Girls" },
    { value: "'Creepster', cursive", label: "Creepster" },
    { value: "'Crushed', cursive", label: "Crushed" },
    { value: "'Dawning of a New Day', cursive", label: "Dawning of a New Day" },
    { value: "'Dekko', cursive", label: "Dekko" },
    { value: "'Devonshire', cursive", label: "Devonshire" },
    { value: "'Dr Sugiyama', cursive", label: "Dr Sugiyama" },
    { value: "'Dynalight', cursive", label: "Dynalight" },
    { value: "'Eagle Lake', cursive", label: "Eagle Lake" },
    { value: "'Engagement', cursive", label: "Engagement" },
    { value: "'Felipa', cursive", label: "Felipa" },
    { value: "'Fleur De Leah', cursive", label: "Fleur De Leah" },
    { value: "'Fondamento', cursive", label: "Fondamento" },
    { value: "'Gideon Roman', cursive", label: "Gideon Roman" },
    { value: "'Give You Glory', cursive", label: "Give You Glory" },
    { value: "'Gochi Hand', cursive", label: "Gochi Hand" },
    { value: "'Herr Von Muellerhoff', cursive", label: "Herr Von Muellerhoff" },
    { value: "'Homemade Apple', cursive", label: "Homemade Apple" },
    { value: "'Hurricane', cursive", label: "Hurricane" },
    { value: "'Imperial Script', cursive", label: "Imperial Script" },
    { value: "'Inspiration', cursive", label: "Inspiration" },
    { value: "'Julee', cursive", label: "Julee" },
    { value: "'Just Me Again Down Here', cursive", label: "Just Me Again Down Here" },
    { value: "'Kalam', cursive", label: "Kalam Signature" },
    { value: "'Kite One', sans-serif", label: "Kite One" },
    { value: "'Lavishly Yours', cursive", label: "Lavishly Yours" },
    { value: "'League Script', cursive", label: "League Script" },
    { value: "'Loved by the King', cursive", label: "Loved by the King" },
    { value: "'Lovers Quarrel', cursive", label: "Lovers Quarrel" },
    { value: "'Luxurious Script', cursive", label: "Luxurious Script" },
    { value: "'Meddon', cursive", label: "Meddon" },
    { value: "'Meie Script', cursive", label: "Meie Script" },
    { value: "'Merienda One', cursive", label: "Merienda One" },
    { value: "'Miltonian', cursive", label: "Miltonian" },
    { value: "'Miltonian Tattoo', cursive", label: "Miltonian Tattoo" },
    { value: "'Miss Fajardose', cursive", label: "Miss Fajardose" },
    { value: "'Molle', cursive", label: "Molle" },
    { value: "'Montez', cursive", label: "Montez" },
    { value: "'Mountains of Christmas', cursive", label: "Mountains of Christmas" },
    { value: "'Mouse Memoirs', sans-serif", label: "Mouse Memoirs" },
    { value: "'Mr Bedfort', cursive", label: "Mr Bedfort" },
    { value: "'Mrs Saint Delafield', cursive", label: "Mrs Saint Delafield" },
    { value: "'Mrs Sheppards', cursive", label: "Mrs Sheppards" },
    { value: "'Neucha', cursive", label: "Neucha" },
    { value: "'Niconne', cursive", label: "Niconne" },
    { value: "'Norican', cursive", label: "Norican" },
    { value: "'Old Standard TT', serif", label: "Old Standard Signature" },
    { value: "'Over the Rainbow', cursive", label: "Over the Rainbow" },
    { value: "'Parisienne', cursive", label: "Parisienne" },
    { value: "'Patrick Hand', cursive", label: "Patrick Hand" },
    { value: "'Patrick Hand SC', cursive", label: "Patrick Hand SC" },
    { value: "'Petit Formal Script', cursive", label: "Petit Formal Script" },
    { value: "'Playball', cursive", label: "Playball" },
    { value: "'Princess Sofia', cursive", label: "Princess Sofia" },
    { value: "'Quintessential', cursive", label: "Quintessential" },
    { value: "'Rancho', cursive", label: "Rancho" },
    { value: "'Redressed', cursive", label: "Redressed" },
    { value: "'Rouge Script', cursive", label: "Rouge Script" },
    { value: "'Ruthie', cursive", label: "Ruthie" },
    { value: "'Sacramento', cursive", label: "Sacramento" },
    { value: "'Schoolbell', cursive", label: "Schoolbell" },
    { value: "'Seaweed Script', cursive", label: "Seaweed Script" },
    { value: "'Sedgwick Ave', cursive", label: "Sedgwick Ave" },
    { value: "'Shadows Into Light Two', cursive", label: "Shadows Into Light Two" },
    { value: "'Shrikhand', cursive", label: "Shrikhand" },
    { value: "'Sigmar One', cursive", label: "Sigmar One" },
    { value: "'Signika Negative', sans-serif", label: "Signika Signature" },
    { value: "'Sniglet', cursive", label: "Sniglet" },
    { value: "'Sofia', cursive", label: "Sofia" },
    { value: "'Stalemate', cursive", label: "Stalemate" },
    { value: "'Sue Ellen Francisco', cursive", label: "Sue Ellen Francisco" },
    { value: "'Sunshiney', cursive", label: "Sunshiney" },
    { value: "'Swanky and Moo Moo', cursive", label: "Swanky and Moo Moo" },
    { value: "'The Girl Next Door', cursive", label: "The Girl Next Door" },
    { value: "'Unkempt', cursive", label: "Unkempt" },
    { value: "'Vibur', cursive", label: "Vibur" },
    { value: "'Waiting for the Sunrise', cursive", label: "Waiting for the Sunrise" },
    { value: "'Walter Turncoat', cursive", label: "Walter Turncoat" },
    { value: "'Wellfleet', cursive", label: "Wellfleet" },
    { value: "'WindSong', cursive", label: "WindSong" },
    { value: "'Yeseva One', cursive", label: "Yeseva One" }
  ];

  useEffect(() => {
    // Cargar Google Fonts dinámicamente
    const loadGoogleFonts = () => {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Allura&family=Pacifico&family=Kaushan+Script&family=Alex+Brush&family=Amatic+SC:wght@400;700&family=Architects+Daughter&family=Bad+Script&family=Berkshire+Swash&family=Bilbo&family=Bilbo+Swash+Caps&family=Caveat:wght@400;700&family=Courgette&family=Damion&family=Delius&family=Fasthand&family=Gloria+Hallelujah&family=Grand+Hotel&family=Handlee&family=Homemade+Apple&family=Indie+Flower&family=Italianno&family=Kalam:wght@300;400;700&family=Kristi&family=La+Belle+Aurore&family=Leckerli+One&family=Lobster&family=Lobster+Two:ital,wght@0,400;1,400&family=Marck+Script&family=Merienda:wght@300;400;700&family=Mr+Dafoe&family=Nothing+You+Could+Do&family=Permanent+Marker&family=Pinyon+Script&family=Qwigley&family=Reenie+Beanie&family=Rochester&family=Rock+Salt&family=Satisfy&family=Shadows+Into+Light&family=Tangerine:wght@400;700&family=Yellowtail&family=Zeyada&display=swap';
      link.rel = 'stylesheet';
      if (!document.querySelector(`link[href="${link.href}"]`)) {
        document.head.appendChild(link);
      }
    };
    
    if (isOpen) {
      loadGoogleFonts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-600" />
            Firma Digital
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre del Firmante</Label>
              <Input 
                value={signatureName} 
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input 
                type="date" 
                value={signatureDate} 
                onChange={(e) => setSignatureDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Método de Firma</Label>
            <Tabs value={signatureType} onValueChange={setSignatureType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="draw" className="flex items-center gap-2">
                  <Tablet className="w-4 h-4" />
                  Dibujar
                </TabsTrigger>
                <TabsTrigger value="type" className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Escribir
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="draw" className="mt-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full border border-gray-200 rounded cursor-crosshair bg-white touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const mouseEvent = new MouseEvent('mousedown', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                      });
                      canvasRef.current.dispatchEvent(mouseEvent);
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const mouseEvent = new MouseEvent('mousemove', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                      });
                      canvasRef.current.dispatchEvent(mouseEvent);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      const mouseEvent = new MouseEvent('mouseup', {});
                      canvasRef.current.dispatchEvent(mouseEvent);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Dibuje su firma con el mouse o dedo (en tablet/móvil)
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="type" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Escriba su Firma</Label>
                    <Input 
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="Escriba su nombre como firma"
                      className="text-lg"
                    />
                  </div>
                  
                  <div>
                    <Label>Estilo de Letra</Label>
                    <Select value={fontStyle} onValueChange={setFontStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-96">
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value, fontSize: '16px' }}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {typedSignature && (
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white text-center">
                      <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                      <div 
                        style={{ 
                          fontFamily: fontStyle, 
                          fontSize: '36px',
                          color: '#000',
                          fontWeight: 'normal',
                          letterSpacing: '1px',
                          lineHeight: '1.2'
                        }}
                      >
                        {typedSignature}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={clearSignature}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={saveSignature}
                disabled={(signatureType === "type" && !typedSignature) || (signatureType === "draw" && !signatureName)}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Firma
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}