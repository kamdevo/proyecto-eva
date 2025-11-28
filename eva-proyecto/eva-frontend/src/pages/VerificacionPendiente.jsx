import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerificacionPendiente() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData || {};
  const emailSent = location.state?.emailSent !== false; // Por defecto true para compatibilidad

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Ícono de email */}
            <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${
              emailSent ? 'bg-blue-100' : 'bg-yellow-100'
            }`}>
              <Mail className={`w-12 h-12 ${emailSent ? 'text-blue-600' : 'text-yellow-600'}`} />
            </div>

            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Cuenta Creada!
              </h1>
              <p className={`text-lg font-medium ${
                emailSent ? 'text-blue-600' : 'text-yellow-600'
              }`}>
                {emailSent 
                  ? 'Revisa tu correo para activar tu cuenta'
                  : 'El email no pudo ser enviado'
                }
              </p>
            </div>

            {/* Logo HUV */}
            <div className="flex justify-center">
              <img
                src="https://biotronitech.com.co/wp-content/uploads/2021/03/logo-HUV.jpg"
                alt="Hospital Universitario del Valle"
                className="h-24 w-24 object-contain"
              />
            </div>

            {/* Información del usuario */}
            {userData.email && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-600 mb-2">Cuenta registrada:</p>
                <p className="font-semibold text-gray-900">
                  {userData.nombre} {userData.apellido}
                </p>
                <p className="text-sm text-gray-600">{userData.email}</p>
              </div>
            )}

            {/* Mensaje principal */}
            {emailSent ? (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 text-left">
                <div className="flex">
                  <Mail className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 font-semibold mb-2">
                      📧 Hemos enviado un email de confirmación
                    </p>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Revisa tu <strong>bandeja de entrada</strong> (y spam/correo no deseado)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Haz clic en el botón <strong>"Confirmar mi cuenta"</strong></span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Una vez confirmado, podrás <strong>iniciar sesión</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 text-left">
                <div className="flex">
                  <Mail className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-900 font-semibold mb-2">
                      ⚠️ El email de confirmación no pudo ser enviado
                    </p>
                    <p className="text-sm text-yellow-800 mb-3">
                      Tu cuenta fue creada exitosamente, pero hubo un problema al enviar el email de confirmación.
                    </p>
                    <ul className="text-sm text-yellow-800 space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Puedes intentar <strong>reenviar el email</strong> usando el botón de abajo</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span>O contacta al <strong>administrador del sistema</strong> para activar tu cuenta manualmente</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Advertencia de expiración (solo si el email se envió) */}
            {emailSent && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Importante:</strong> El enlace de confirmación expirará en{' '}
                  <strong>24 horas</strong>. Si no lo confirmas a tiempo, deberás solicitar 
                  un nuevo enlace.
                </p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Entiendo, ir al Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Link to="/resend-verification">
                <Button variant="outline" className="w-full" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  ¿No recibiste el email? Reenviar
                </Button>
              </Link>
            </div>

            {/* Ayuda */}
            <div className="pt-6 border-t">
              <p className="text-xs text-gray-500">
                Si tienes problemas para confirmar tu cuenta, contacta al administrador 
                del sistema o solicita ayuda en soporte técnico.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
