import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AlertMessage = ({
  type = "info",
  message,
  onClose,
  dismissible = true,
  className = "",
}) => {
  if (!message) return null;

  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Alert className={`${getAlertStyles()} ${className} mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          {getIcon()}
          <AlertDescription className="text-sm font-medium">
            {typeof message === "string"
              ? message
              : message?.message || "Ha ocurrido un error"}
          </AlertDescription>
        </div>
        {dismissible && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default AlertMessage;
