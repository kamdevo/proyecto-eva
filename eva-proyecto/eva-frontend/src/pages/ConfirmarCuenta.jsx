import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ConfirmarCuenta() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://192.168.56.1:8001/api'}/v1/verify-email/${token}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setVerified(true);
        setUserData(data.data.user);
        toast.success('¡Cuenta verificada exitosamente!');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Error al verificar la cuenta');
        toast.error(data.message || 'Error al verificar la cuenta');
      }
    } catch (err) {
      console.error('Error verificando email:', err);
      setError('Error de conexión. Por favor, intenta nuevamente.');
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900">
                Verificando tu cuenta...
              </h2>
              <p className="text-gray-600">
                Por favor espera mientras confirmamos tu email
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-t-4 border-t-green-500">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Ícono de éxito */}
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              {/* Título */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Cuenta Verificada!
                </h1>
                <p className="text-green-600 font-medium">
                  Tu email ha sido confirmado exitosamente
                </p>
              </div>

              {/* Información del usuario */}
              {userData && (
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-600 mb-2">Bienvenido al sistema EVA:</p>
                  <p className="font-semibold text-gray-900">
                    {userData.nombre} {userData.apellido}
                  </p>
                  <p className="text-sm text-gray-600">{userData.email}</p>
                </div>
              )}

              {/* Mensaje */}
              <p className="text-gray-700">
                Tu cuenta ha sido activada y ya puedes acceder al sistema.
                <br />
                <span className="text-sm text-gray-500">
                  Serás redirigido al login en unos segundos...
                </span>
              </p>

              {/* Botones */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  Ir al Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Link to="/">
                  <Button variant="outline" className="w-full" size="lg">
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-t-4 border-t-red-500">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Ícono de error */}
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>

            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Error de Verificación
              </h1>
              <p className="text-red-600 font-medium">
                {error}
              </p>
            </div>

            {/* Mensaje de ayuda */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
              <div className="flex">
                <Mail className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    ¿Qué puedes hacer?
                  </p>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    <li>• El enlace puede haber expirado (válido 24 horas)</li>
                    <li>• Solicita un nuevo enlace de verificación</li>
                    <li>• Contacta al administrador si el problema persiste</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => navigate('/resend-verification')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Mail className="w-4 h-4 mr-2" />
                Reenviar Email de Verificación
              </Button>
              
              <Link to="/login">
                <Button variant="outline" className="w-full" size="lg">
                  Ir al Login
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
