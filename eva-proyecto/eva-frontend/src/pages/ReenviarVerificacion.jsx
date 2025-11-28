import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ReenviarVerificacion() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://192.168.56.1:8001/api'}/v1/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        toast.success('Email de verificación enviado');
      } else {
        toast.error(data.message || 'Error al enviar el email');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Email Enviado!
                </h2>
                <p className="text-gray-600">
                  Hemos enviado un nuevo enlace de verificación a:
                </p>
                <p className="font-semibold text-blue-600 mt-2">
                  {email}
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left">
                <p className="text-sm text-blue-800">
                  <strong>Revisa tu bandeja de entrada</strong> y haz clic en el enlace 
                  de confirmación. El enlace expirará en <strong>24 horas</strong>.
                </p>
              </div>

              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full" size="lg">
                    Ir al Login
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Enviar a otro email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Reenviar Verificación
          </CardTitle>
          <p className="text-center text-gray-600 text-sm">
            Ingresa tu email y te enviaremos un nuevo enlace de confirmación
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo HUV */}
            <div className="flex justify-center">
              <img
                src="https://biotronitech.com.co/wp-content/uploads/2021/03/logo-HUV.jpg"
                alt="Hospital Universitario del Valle"
                className="h-24 w-24 object-contain"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Nota informativa */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Solo puedes reenviar el email si tu cuenta 
                aún no ha sido verificada.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email de Verificación
                </>
              )}
            </Button>

            {/* Links adicionales */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿Ya verificaste tu cuenta?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  Inicia Sesión
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-blue-600 hover:underline font-medium">
                  Regístrate
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
