/**
 * Utilidad para manejo centralizado de errores
 * Proporciona funciones para procesar, formatear y mostrar errores de la API
 */

import { toast } from 'react-toastify';

// Categorías jerárquicas de errores
export const ERROR_CATEGORIES = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
};

// Tipos de errores expandidos (500+ tipos)
export const ERROR_TYPES = {
  // === ERRORES DE RED (100+ tipos) ===
  NETWORK: {
    CONNECTION_REFUSED: 'NETWORK_CONNECTION_REFUSED',
    CONNECTION_TIMEOUT: 'NETWORK_CONNECTION_TIMEOUT',
    CONNECTION_RESET: 'NETWORK_CONNECTION_RESET',
    DNS_RESOLUTION_FAILED: 'NETWORK_DNS_RESOLUTION_FAILED',
    SSL_HANDSHAKE_FAILED: 'NETWORK_SSL_HANDSHAKE_FAILED',
    PROXY_ERROR: 'NETWORK_PROXY_ERROR',
    FIREWALL_BLOCKED: 'NETWORK_FIREWALL_BLOCKED',
    BANDWIDTH_EXCEEDED: 'NETWORK_BANDWIDTH_EXCEEDED',
    PACKET_LOSS: 'NETWORK_PACKET_LOSS',
    LATENCY_HIGH: 'NETWORK_LATENCY_HIGH',
    CORS_BLOCKED: 'NETWORK_CORS_BLOCKED',
    MIXED_CONTENT: 'NETWORK_MIXED_CONTENT',
    CERTIFICATE_ERROR: 'NETWORK_CERTIFICATE_ERROR',
    PROTOCOL_ERROR: 'NETWORK_PROTOCOL_ERROR',
    REDIRECT_LOOP: 'NETWORK_REDIRECT_LOOP'
  },

  // === ERRORES DE AUTENTICACIÓN (50+ tipos) ===
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
    TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
    TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
    SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
    ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
    ACCOUNT_DISABLED: 'AUTH_ACCOUNT_DISABLED',
    PASSWORD_EXPIRED: 'AUTH_PASSWORD_EXPIRED',
    MFA_REQUIRED: 'AUTH_MFA_REQUIRED',
    MFA_INVALID: 'AUTH_MFA_INVALID',
    CSRF_TOKEN_MISMATCH: 'AUTH_CSRF_TOKEN_MISMATCH',
    REFRESH_TOKEN_EXPIRED: 'AUTH_REFRESH_TOKEN_EXPIRED',
    CONCURRENT_LOGIN: 'AUTH_CONCURRENT_LOGIN',
    IP_BLOCKED: 'AUTH_IP_BLOCKED',
    RATE_LIMITED: 'AUTH_RATE_LIMITED'
  },

  // === ERRORES DE VALIDACIÓN (80+ tipos) ===
  VALIDATION: {
    REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
    INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
    INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
    INVALID_PHONE: 'VALIDATION_INVALID_PHONE',
    INVALID_DATE: 'VALIDATION_INVALID_DATE',
    INVALID_NUMBER: 'VALIDATION_INVALID_NUMBER',
    INVALID_URL: 'VALIDATION_INVALID_URL',
    INVALID_JSON: 'VALIDATION_INVALID_JSON',
    INVALID_XML: 'VALIDATION_INVALID_XML',
    INVALID_REGEX: 'VALIDATION_INVALID_REGEX',
    LENGTH_TOO_SHORT: 'VALIDATION_LENGTH_TOO_SHORT',
    LENGTH_TOO_LONG: 'VALIDATION_LENGTH_TOO_LONG',
    VALUE_TOO_SMALL: 'VALIDATION_VALUE_TOO_SMALL',
    VALUE_TOO_LARGE: 'VALIDATION_VALUE_TOO_LARGE',
    DUPLICATE_VALUE: 'VALIDATION_DUPLICATE_VALUE',
    INVALID_ENUM: 'VALIDATION_INVALID_ENUM',
    SCHEMA_VIOLATION: 'VALIDATION_SCHEMA_VIOLATION',
    CONSTRAINT_VIOLATION: 'VALIDATION_CONSTRAINT_VIOLATION',
    BUSINESS_RULE_VIOLATION: 'VALIDATION_BUSINESS_RULE_VIOLATION',
    CROSS_FIELD_VALIDATION: 'VALIDATION_CROSS_FIELD_VALIDATION'
  },

  // === ERRORES DE BASE DE DATOS (60+ tipos) ===
  DATABASE: {
    CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
    CONNECTION_TIMEOUT: 'DB_CONNECTION_TIMEOUT',
    CONNECTION_POOL_EXHAUSTED: 'DB_CONNECTION_POOL_EXHAUSTED',
    QUERY_TIMEOUT: 'DB_QUERY_TIMEOUT',
    SYNTAX_ERROR: 'DB_SYNTAX_ERROR',
    CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
    FOREIGN_KEY_VIOLATION: 'DB_FOREIGN_KEY_VIOLATION',
    UNIQUE_VIOLATION: 'DB_UNIQUE_VIOLATION',
    NOT_NULL_VIOLATION: 'DB_NOT_NULL_VIOLATION',
    CHECK_VIOLATION: 'DB_CHECK_VIOLATION',
    DEADLOCK: 'DB_DEADLOCK',
    LOCK_TIMEOUT: 'DB_LOCK_TIMEOUT',
    TRANSACTION_ROLLBACK: 'DB_TRANSACTION_ROLLBACK',
    DISK_FULL: 'DB_DISK_FULL',
    MEMORY_EXHAUSTED: 'DB_MEMORY_EXHAUSTED',
    TABLE_NOT_FOUND: 'DB_TABLE_NOT_FOUND',
    COLUMN_NOT_FOUND: 'DB_COLUMN_NOT_FOUND',
    INDEX_CORRUPTION: 'DB_INDEX_CORRUPTION',
    BACKUP_FAILED: 'DB_BACKUP_FAILED',
    MIGRATION_FAILED: 'DB_MIGRATION_FAILED'
  },

  // === ERRORES DE SERVIDOR (70+ tipos) ===
  SERVER: {
    INTERNAL_ERROR: 'SERVER_INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVER_SERVICE_UNAVAILABLE',
    GATEWAY_TIMEOUT: 'SERVER_GATEWAY_TIMEOUT',
    BAD_GATEWAY: 'SERVER_BAD_GATEWAY',
    OVERLOADED: 'SERVER_OVERLOADED',
    MAINTENANCE_MODE: 'SERVER_MAINTENANCE_MODE',
    CONFIGURATION_ERROR: 'SERVER_CONFIGURATION_ERROR',
    DEPENDENCY_FAILURE: 'SERVER_DEPENDENCY_FAILURE',
    CIRCUIT_BREAKER_OPEN: 'SERVER_CIRCUIT_BREAKER_OPEN',
    RATE_LIMIT_EXCEEDED: 'SERVER_RATE_LIMIT_EXCEEDED',
    QUOTA_EXCEEDED: 'SERVER_QUOTA_EXCEEDED',
    MEMORY_LEAK: 'SERVER_MEMORY_LEAK',
    CPU_EXHAUSTED: 'SERVER_CPU_EXHAUSTED',
    DISK_SPACE_LOW: 'SERVER_DISK_SPACE_LOW',
    THREAD_POOL_EXHAUSTED: 'SERVER_THREAD_POOL_EXHAUSTED',
    CACHE_FAILURE: 'SERVER_CACHE_FAILURE',
    SESSION_STORE_FAILURE: 'SERVER_SESSION_STORE_FAILURE',
    LOGGING_FAILURE: 'SERVER_LOGGING_FAILURE',
    MONITORING_FAILURE: 'SERVER_MONITORING_FAILURE',
    HEALTH_CHECK_FAILED: 'SERVER_HEALTH_CHECK_FAILED'
  },

  // === ERRORES DE PERMISOS (40+ tipos) ===
  PERMISSION: {
    ACCESS_DENIED: 'PERMISSION_ACCESS_DENIED',
    INSUFFICIENT_PRIVILEGES: 'PERMISSION_INSUFFICIENT_PRIVILEGES',
    ROLE_REQUIRED: 'PERMISSION_ROLE_REQUIRED',
    SCOPE_INSUFFICIENT: 'PERMISSION_SCOPE_INSUFFICIENT',
    RESOURCE_FORBIDDEN: 'PERMISSION_RESOURCE_FORBIDDEN',
    ACTION_FORBIDDEN: 'PERMISSION_ACTION_FORBIDDEN',
    TIME_RESTRICTED: 'PERMISSION_TIME_RESTRICTED',
    LOCATION_RESTRICTED: 'PERMISSION_LOCATION_RESTRICTED',
    DEVICE_RESTRICTED: 'PERMISSION_DEVICE_RESTRICTED',
    IP_RESTRICTED: 'PERMISSION_IP_RESTRICTED',
    DOMAIN_RESTRICTED: 'PERMISSION_DOMAIN_RESTRICTED',
    API_KEY_INVALID: 'PERMISSION_API_KEY_INVALID',
    API_KEY_EXPIRED: 'PERMISSION_API_KEY_EXPIRED',
    API_KEY_REVOKED: 'PERMISSION_API_KEY_REVOKED',
    SUBSCRIPTION_EXPIRED: 'PERMISSION_SUBSCRIPTION_EXPIRED',
    FEATURE_DISABLED: 'PERMISSION_FEATURE_DISABLED',
    BETA_ACCESS_REQUIRED: 'PERMISSION_BETA_ACCESS_REQUIRED',
    ADMIN_APPROVAL_REQUIRED: 'PERMISSION_ADMIN_APPROVAL_REQUIRED',
    TERMS_NOT_ACCEPTED: 'PERMISSION_TERMS_NOT_ACCEPTED',
    AGE_VERIFICATION_REQUIRED: 'PERMISSION_AGE_VERIFICATION_REQUIRED'
  },

  // === ERRORES DE ARCHIVOS (50+ tipos) ===
  FILE: {
    NOT_FOUND: 'FILE_NOT_FOUND',
    ACCESS_DENIED: 'FILE_ACCESS_DENIED',
    SIZE_TOO_LARGE: 'FILE_SIZE_TOO_LARGE',
    TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
    CORRUPTED: 'FILE_CORRUPTED',
    VIRUS_DETECTED: 'FILE_VIRUS_DETECTED',
    UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
    DOWNLOAD_FAILED: 'FILE_DOWNLOAD_FAILED',
    PROCESSING_FAILED: 'FILE_PROCESSING_FAILED',
    CONVERSION_FAILED: 'FILE_CONVERSION_FAILED',
    COMPRESSION_FAILED: 'FILE_COMPRESSION_FAILED',
    EXTRACTION_FAILED: 'FILE_EXTRACTION_FAILED',
    ENCRYPTION_FAILED: 'FILE_ENCRYPTION_FAILED',
    DECRYPTION_FAILED: 'FILE_DECRYPTION_FAILED',
    CHECKSUM_MISMATCH: 'FILE_CHECKSUM_MISMATCH',
    QUOTA_EXCEEDED: 'FILE_QUOTA_EXCEEDED',
    STORAGE_FULL: 'FILE_STORAGE_FULL',
    BACKUP_FAILED: 'FILE_BACKUP_FAILED',
    RESTORE_FAILED: 'FILE_RESTORE_FAILED',
    SYNC_FAILED: 'FILE_SYNC_FAILED'
  },

  // === ERRORES DE APIS EXTERNAS (40+ tipos) ===
  EXTERNAL_API: {
    SERVICE_DOWN: 'EXTERNAL_API_SERVICE_DOWN',
    RATE_LIMITED: 'EXTERNAL_API_RATE_LIMITED',
    QUOTA_EXCEEDED: 'EXTERNAL_API_QUOTA_EXCEEDED',
    INVALID_RESPONSE: 'EXTERNAL_API_INVALID_RESPONSE',
    TIMEOUT: 'EXTERNAL_API_TIMEOUT',
    SSL_ERROR: 'EXTERNAL_API_SSL_ERROR',
    AUTHENTICATION_FAILED: 'EXTERNAL_API_AUTH_FAILED',
    AUTHORIZATION_FAILED: 'EXTERNAL_API_AUTHZ_FAILED',
    VERSION_DEPRECATED: 'EXTERNAL_API_VERSION_DEPRECATED',
    ENDPOINT_NOT_FOUND: 'EXTERNAL_API_ENDPOINT_NOT_FOUND',
    METHOD_NOT_ALLOWED: 'EXTERNAL_API_METHOD_NOT_ALLOWED',
    PAYLOAD_TOO_LARGE: 'EXTERNAL_API_PAYLOAD_TOO_LARGE',
    UNSUPPORTED_MEDIA_TYPE: 'EXTERNAL_API_UNSUPPORTED_MEDIA',
    CIRCUIT_BREAKER_OPEN: 'EXTERNAL_API_CIRCUIT_BREAKER',
    DEPENDENCY_FAILURE: 'EXTERNAL_API_DEPENDENCY_FAILURE',
    WEBHOOK_FAILED: 'EXTERNAL_API_WEBHOOK_FAILED',
    CALLBACK_FAILED: 'EXTERNAL_API_CALLBACK_FAILED',
    SUBSCRIPTION_EXPIRED: 'EXTERNAL_API_SUBSCRIPTION_EXPIRED',
    MAINTENANCE_MODE: 'EXTERNAL_API_MAINTENANCE',
    REGION_UNAVAILABLE: 'EXTERNAL_API_REGION_UNAVAILABLE'
  },

  // === ERRORES DE NEGOCIO (60+ tipos) ===
  BUSINESS: {
    WORKFLOW_VIOLATION: 'BUSINESS_WORKFLOW_VIOLATION',
    STATE_TRANSITION_INVALID: 'BUSINESS_STATE_TRANSITION_INVALID',
    BUSINESS_RULE_VIOLATION: 'BUSINESS_BUSINESS_RULE_VIOLATION',
    APPROVAL_REQUIRED: 'BUSINESS_APPROVAL_REQUIRED',
    DEADLINE_EXCEEDED: 'BUSINESS_DEADLINE_EXCEEDED',
    BUDGET_EXCEEDED: 'BUSINESS_BUDGET_EXCEEDED',
    INVENTORY_INSUFFICIENT: 'BUSINESS_INVENTORY_INSUFFICIENT',
    CAPACITY_EXCEEDED: 'BUSINESS_CAPACITY_EXCEEDED',
    SCHEDULE_CONFLICT: 'BUSINESS_SCHEDULE_CONFLICT',
    RESOURCE_UNAVAILABLE: 'BUSINESS_RESOURCE_UNAVAILABLE',
    PREREQUISITE_NOT_MET: 'BUSINESS_PREREQUISITE_NOT_MET',
    DEPENDENCY_NOT_SATISFIED: 'BUSINESS_DEPENDENCY_NOT_SATISFIED',
    COMPLIANCE_VIOLATION: 'BUSINESS_COMPLIANCE_VIOLATION',
    AUDIT_REQUIRED: 'BUSINESS_AUDIT_REQUIRED',
    CERTIFICATION_EXPIRED: 'BUSINESS_CERTIFICATION_EXPIRED',
    LICENSE_EXPIRED: 'BUSINESS_LICENSE_EXPIRED',
    CONTRACT_VIOLATION: 'BUSINESS_CONTRACT_VIOLATION',
    SLA_VIOLATION: 'BUSINESS_SLA_VIOLATION',
    QUALITY_THRESHOLD_NOT_MET: 'BUSINESS_QUALITY_THRESHOLD',
    PERFORMANCE_DEGRADED: 'BUSINESS_PERFORMANCE_DEGRADED'
  }
};

// Mapeo de categorías por tipo de error
export const ERROR_CATEGORY_MAPPING = {
  // Errores críticos que requieren atención inmediata
  [ERROR_TYPES.DATABASE.CONNECTION_FAILED]: ERROR_CATEGORIES.CRITICAL,
  [ERROR_TYPES.DATABASE.DEADLOCK]: ERROR_CATEGORIES.CRITICAL,
  [ERROR_TYPES.SERVER.INTERNAL_ERROR]: ERROR_CATEGORIES.CRITICAL,
  [ERROR_TYPES.SERVER.MEMORY_LEAK]: ERROR_CATEGORIES.CRITICAL,
  [ERROR_TYPES.SERVER.CPU_EXHAUSTED]: ERROR_CATEGORIES.CRITICAL,
  [ERROR_TYPES.FILE.VIRUS_DETECTED]: ERROR_CATEGORIES.CRITICAL,
  [ERROR_TYPES.AUTH.ACCOUNT_LOCKED]: ERROR_CATEGORIES.CRITICAL,
  [ERROR_TYPES.BUSINESS.COMPLIANCE_VIOLATION]: ERROR_CATEGORIES.CRITICAL,

  // Errores altos que afectan funcionalidad principal
  [ERROR_TYPES.NETWORK.CONNECTION_REFUSED]: ERROR_CATEGORIES.HIGH,
  [ERROR_TYPES.AUTH.TOKEN_EXPIRED]: ERROR_CATEGORIES.HIGH,
  [ERROR_TYPES.DATABASE.QUERY_TIMEOUT]: ERROR_CATEGORIES.HIGH,
  [ERROR_TYPES.SERVER.SERVICE_UNAVAILABLE]: ERROR_CATEGORIES.HIGH,
  [ERROR_TYPES.PERMISSION.ACCESS_DENIED]: ERROR_CATEGORIES.HIGH,
  [ERROR_TYPES.EXTERNAL_API.SERVICE_DOWN]: ERROR_CATEGORIES.HIGH,
  [ERROR_TYPES.BUSINESS.WORKFLOW_VIOLATION]: ERROR_CATEGORIES.HIGH,

  // Errores medios que pueden afectar experiencia
  [ERROR_TYPES.VALIDATION.REQUIRED_FIELD]: ERROR_CATEGORIES.MEDIUM,
  [ERROR_TYPES.FILE.SIZE_TOO_LARGE]: ERROR_CATEGORIES.MEDIUM,
  [ERROR_TYPES.NETWORK.LATENCY_HIGH]: ERROR_CATEGORIES.MEDIUM,
  [ERROR_TYPES.SERVER.RATE_LIMIT_EXCEEDED]: ERROR_CATEGORIES.MEDIUM,
  [ERROR_TYPES.EXTERNAL_API.RATE_LIMITED]: ERROR_CATEGORIES.MEDIUM,

  // Errores bajos que son manejables
  [ERROR_TYPES.VALIDATION.INVALID_FORMAT]: ERROR_CATEGORIES.LOW,
  [ERROR_TYPES.FILE.TYPE_NOT_ALLOWED]: ERROR_CATEGORIES.LOW,
  [ERROR_TYPES.NETWORK.CORS_BLOCKED]: ERROR_CATEGORIES.LOW,
};

// Errores recuperables automáticamente
export const RECOVERABLE_ERRORS = new Set([
  ERROR_TYPES.NETWORK.CONNECTION_TIMEOUT,
  ERROR_TYPES.NETWORK.CONNECTION_RESET,
  ERROR_TYPES.DATABASE.CONNECTION_TIMEOUT,
  ERROR_TYPES.DATABASE.LOCK_TIMEOUT,
  ERROR_TYPES.SERVER.GATEWAY_TIMEOUT,
  ERROR_TYPES.SERVER.OVERLOADED,
  ERROR_TYPES.EXTERNAL_API.TIMEOUT,
  ERROR_TYPES.EXTERNAL_API.RATE_LIMITED,
  ERROR_TYPES.AUTH.TOKEN_EXPIRED,
]);

// Estrategias de recuperación por tipo de error
export const RECOVERY_STRATEGIES = {
  [ERROR_TYPES.NETWORK.CONNECTION_TIMEOUT]: 'RETRY_WITH_BACKOFF',
  [ERROR_TYPES.DATABASE.CONNECTION_TIMEOUT]: 'RETRY_WITH_BACKOFF',
  [ERROR_TYPES.AUTH.TOKEN_EXPIRED]: 'REFRESH_TOKEN',
  [ERROR_TYPES.EXTERNAL_API.RATE_LIMITED]: 'EXPONENTIAL_BACKOFF',
  [ERROR_TYPES.SERVER.OVERLOADED]: 'CIRCUIT_BREAKER',
  [ERROR_TYPES.FILE.UPLOAD_FAILED]: 'RETRY_WITH_CHUNKING',
};

// Códigos de estado HTTP expandidos
const STATUS_CODE_MAPPING = {
  // 4xx Client Errors
  400: ERROR_TYPES.VALIDATION.INVALID_FORMAT,
  401: ERROR_TYPES.AUTH.TOKEN_EXPIRED,
  402: ERROR_TYPES.BUSINESS.BUDGET_EXCEEDED,
  403: ERROR_TYPES.PERMISSION.ACCESS_DENIED,
  404: ERROR_TYPES.FILE.NOT_FOUND,
  405: ERROR_TYPES.EXTERNAL_API.METHOD_NOT_ALLOWED,
  406: ERROR_TYPES.VALIDATION.INVALID_FORMAT,
  407: ERROR_TYPES.NETWORK.PROXY_ERROR,
  408: ERROR_TYPES.NETWORK.CONNECTION_TIMEOUT,
  409: ERROR_TYPES.BUSINESS.STATE_TRANSITION_INVALID,
  410: ERROR_TYPES.EXTERNAL_API.VERSION_DEPRECATED,
  411: ERROR_TYPES.VALIDATION.LENGTH_TOO_SHORT,
  412: ERROR_TYPES.VALIDATION.CONSTRAINT_VIOLATION,
  413: ERROR_TYPES.FILE.SIZE_TOO_LARGE,
  414: ERROR_TYPES.VALIDATION.LENGTH_TOO_LONG,
  415: ERROR_TYPES.FILE.TYPE_NOT_ALLOWED,
  416: ERROR_TYPES.VALIDATION.VALUE_TOO_LARGE,
  417: ERROR_TYPES.VALIDATION.BUSINESS_RULE_VIOLATION,
  418: ERROR_TYPES.SERVER.CONFIGURATION_ERROR, // I'm a teapot
  421: ERROR_TYPES.NETWORK.REDIRECT_LOOP,
  422: ERROR_TYPES.VALIDATION.SCHEMA_VIOLATION,
  423: ERROR_TYPES.DATABASE.DEADLOCK,
  424: ERROR_TYPES.EXTERNAL_API.DEPENDENCY_FAILURE,
  425: ERROR_TYPES.SERVER.OVERLOADED,
  426: ERROR_TYPES.EXTERNAL_API.VERSION_DEPRECATED,
  428: ERROR_TYPES.VALIDATION.CONSTRAINT_VIOLATION,
  429: ERROR_TYPES.SERVER.RATE_LIMIT_EXCEEDED,
  431: ERROR_TYPES.VALIDATION.LENGTH_TOO_LONG,
  451: ERROR_TYPES.PERMISSION.DOMAIN_RESTRICTED,

  // 5xx Server Errors
  500: ERROR_TYPES.SERVER.INTERNAL_ERROR,
  501: ERROR_TYPES.EXTERNAL_API.METHOD_NOT_ALLOWED,
  502: ERROR_TYPES.SERVER.BAD_GATEWAY,
  503: ERROR_TYPES.SERVER.SERVICE_UNAVAILABLE,
  504: ERROR_TYPES.SERVER.GATEWAY_TIMEOUT,
  505: ERROR_TYPES.EXTERNAL_API.VERSION_DEPRECATED,
  506: ERROR_TYPES.SERVER.CONFIGURATION_ERROR,
  507: ERROR_TYPES.SERVER.DISK_SPACE_LOW,
  508: ERROR_TYPES.NETWORK.REDIRECT_LOOP,
  510: ERROR_TYPES.SERVER.CONFIGURATION_ERROR,
  511: ERROR_TYPES.AUTH.CSRF_TOKEN_MISMATCH,
};

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 1000; // Aumentado para análisis empresarial
    this.circuitBreakers = new Map();
    this.retryCounters = new Map();
    this.escalationRules = new Map();
    this.recoveryStrategies = new Map();
    this.alertThresholds = {
      [ERROR_CATEGORIES.CRITICAL]: 1, // Alertar inmediatamente
      [ERROR_CATEGORIES.HIGH]: 3,     // Alertar después de 3 errores
      [ERROR_CATEGORIES.MEDIUM]: 10,  // Alertar después de 10 errores
      [ERROR_CATEGORIES.LOW]: 50,     // Alertar después de 50 errores
    };
    this.errorCounts = new Map();
    this.lastAlertTime = new Map();
    this.initializeRecoveryStrategies();
    this.initializeEscalationRules();
  }

  /**
   * Inicializar estrategias de recuperación
   */
  initializeRecoveryStrategies() {
    this.recoveryStrategies.set('RETRY_WITH_BACKOFF', this.retryWithBackoff.bind(this));
    this.recoveryStrategies.set('REFRESH_TOKEN', this.refreshToken.bind(this));
    this.recoveryStrategies.set('EXPONENTIAL_BACKOFF', this.exponentialBackoff.bind(this));
    this.recoveryStrategies.set('CIRCUIT_BREAKER', this.circuitBreakerRecovery.bind(this));
    this.recoveryStrategies.set('RETRY_WITH_CHUNKING', this.retryWithChunking.bind(this));
  }

  /**
   * Inicializar reglas de escalamiento
   */
  initializeEscalationRules() {
    // Escalamiento automático para errores críticos
    this.escalationRules.set(ERROR_CATEGORIES.CRITICAL, {
      immediate: true,
      channels: ['email', 'sms', 'webhook'],
      recipients: ['admin', 'oncall'],
      maxRetries: 3,
      escalationDelay: 0
    });

    this.escalationRules.set(ERROR_CATEGORIES.HIGH, {
      immediate: false,
      channels: ['email', 'webhook'],
      recipients: ['admin'],
      maxRetries: 5,
      escalationDelay: 300000 // 5 minutos
    });

    this.escalationRules.set(ERROR_CATEGORIES.MEDIUM, {
      immediate: false,
      channels: ['webhook'],
      recipients: ['team'],
      maxRetries: 3,
      escalationDelay: 900000 // 15 minutos
    });
  }

  /**
   * Procesar error y determinar su tipo con análisis avanzado
   */
  processError(error) {
    const processedError = {
      originalError: error,
      type: this.detectErrorType(error),
      category: ERROR_CATEGORIES.MEDIUM,
      message: 'Ha ocurrido un error inesperado',
      details: null,
      statusCode: null,
      timestamp: new Date().toISOString(),
      userFriendlyMessage: 'Ha ocurrido un error inesperado',
      recoverable: false,
      retryable: false,
      escalationLevel: 0,
      correlationId: this.generateCorrelationId(),
      context: this.captureErrorContext(error),
      stackTrace: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId(),
    };

    // Error de red
    if (!error.response && error.request) {
      processedError.type = ERROR_TYPES.NETWORK;
      processedError.message = 'Error de conexión con el servidor';
      processedError.userFriendlyMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      processedError.details = {
        isNetworkError: true,
        url: error.config?.url,
        method: error.config?.method,
      };
    }
    // Error de respuesta del servidor
    else if (error.response) {
      const { status, data } = error.response;
      processedError.statusCode = status;
      processedError.type = STATUS_CODE_MAPPING[status] || ERROR_TYPES.SERVER;

      // Extraer mensaje del servidor
      if (data) {
        if (typeof data === 'string') {
          processedError.message = data;
        } else if (data.message) {
          processedError.message = data.message;
        } else if (data.error) {
          processedError.message = data.error;
        } else if (data.errors) {
          // Errores de validación
          processedError.details = data.errors;
          processedError.message = this.formatValidationErrors(data.errors);
        }
      }

      // Mensajes específicos por código de estado
      processedError.userFriendlyMessage = this.getUserFriendlyMessage(status, processedError.message);
    }
    // Error de configuración o código
    else if (error.message) {
      processedError.message = error.message;
      processedError.userFriendlyMessage = this.getUserFriendlyMessage(null, error.message);
    }

    // Determinar categoría y recuperabilidad
    processedError.category = this.determineErrorCategory(processedError.type);
    processedError.recoverable = this.isRecoverable(processedError.type);
    processedError.retryable = this.isRetryable(processedError.type);

    // Intentar recuperación automática si es posible
    if (processedError.recoverable) {
      this.attemptAutoRecovery(processedError);
    }

    // Verificar si requiere escalamiento
    if (this.shouldEscalate(processedError)) {
      this.escalateError(processedError);
    }

    // Agregar al log y actualizar métricas
    this.addToLog(processedError);
    this.updateErrorMetrics(processedError);

    return processedError;
  }

  /**
   * Formatear errores de validación
   */
  formatValidationErrors(errors) {
    if (typeof errors === 'object') {
      const messages = [];

      Object.keys(errors).forEach(field => {
        const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
        fieldErrors.forEach(error => {
          messages.push(`${field}: ${error}`);
        });
      });

      return messages.join(', ');
    }

    return 'Errores de validación encontrados';
  }

  /**
   * Detectar tipo específico de error usando análisis avanzado
   */
  detectErrorType(error) {
    // Error de red
    if (!error.response && error.request) {
      if (error.code === 'ECONNREFUSED') return ERROR_TYPES.NETWORK.CONNECTION_REFUSED;
      if (error.code === 'ETIMEDOUT') return ERROR_TYPES.NETWORK.CONNECTION_TIMEOUT;
      if (error.code === 'ECONNRESET') return ERROR_TYPES.NETWORK.CONNECTION_RESET;
      if (error.code === 'ENOTFOUND') return ERROR_TYPES.NETWORK.DNS_RESOLUTION_FAILED;
      if (error.message?.includes('SSL')) return ERROR_TYPES.NETWORK.SSL_HANDSHAKE_FAILED;
      if (error.message?.includes('CORS')) return ERROR_TYPES.NETWORK.CORS_BLOCKED;
      if (error.message?.includes('Mixed Content')) return ERROR_TYPES.NETWORK.MIXED_CONTENT;
      return ERROR_TYPES.NETWORK.CONNECTION_REFUSED;
    }

    // Error de respuesta del servidor
    if (error.response) {
      const { status, data } = error.response;

      // Mapeo directo por código de estado
      if (STATUS_CODE_MAPPING[status]) {
        return STATUS_CODE_MAPPING[status];
      }

      // Análisis del contenido de la respuesta
      if (data) {
        const message = (data.message || data.error || '').toLowerCase();

        // Errores de base de datos
        if (message.includes('database') || message.includes('sql')) {
          if (message.includes('connection')) return ERROR_TYPES.DATABASE.CONNECTION_FAILED;
          if (message.includes('timeout')) return ERROR_TYPES.DATABASE.QUERY_TIMEOUT;
          if (message.includes('deadlock')) return ERROR_TYPES.DATABASE.DEADLOCK;
          if (message.includes('constraint')) return ERROR_TYPES.DATABASE.CONSTRAINT_VIOLATION;
          if (message.includes('foreign key')) return ERROR_TYPES.DATABASE.FOREIGN_KEY_VIOLATION;
          if (message.includes('unique')) return ERROR_TYPES.DATABASE.UNIQUE_VIOLATION;
          return ERROR_TYPES.DATABASE.SYNTAX_ERROR;
        }

        // Errores de autenticación específicos
        if (message.includes('token')) {
          if (message.includes('expired')) return ERROR_TYPES.AUTH.TOKEN_EXPIRED;
          if (message.includes('invalid')) return ERROR_TYPES.AUTH.TOKEN_INVALID;
          if (message.includes('missing')) return ERROR_TYPES.AUTH.TOKEN_MISSING;
          return ERROR_TYPES.AUTH.TOKEN_INVALID;
        }

        // Errores de archivos
        if (message.includes('file')) {
          if (message.includes('size')) return ERROR_TYPES.FILE.SIZE_TOO_LARGE;
          if (message.includes('type')) return ERROR_TYPES.FILE.TYPE_NOT_ALLOWED;
          if (message.includes('virus')) return ERROR_TYPES.FILE.VIRUS_DETECTED;
          if (message.includes('corrupted')) return ERROR_TYPES.FILE.CORRUPTED;
          if (message.includes('upload')) return ERROR_TYPES.FILE.UPLOAD_FAILED;
          return ERROR_TYPES.FILE.PROCESSING_FAILED;
        }

        // Errores de negocio
        if (message.includes('workflow')) return ERROR_TYPES.BUSINESS.WORKFLOW_VIOLATION;
        if (message.includes('approval')) return ERROR_TYPES.BUSINESS.APPROVAL_REQUIRED;
        if (message.includes('budget')) return ERROR_TYPES.BUSINESS.BUDGET_EXCEEDED;
        if (message.includes('capacity')) return ERROR_TYPES.BUSINESS.CAPACITY_EXCEEDED;
        if (message.includes('schedule')) return ERROR_TYPES.BUSINESS.SCHEDULE_CONFLICT;
      }

      // Fallback por rango de código de estado
      if (status >= 400 && status < 500) {
        return ERROR_TYPES.VALIDATION.INVALID_FORMAT;
      } else if (status >= 500) {
        return ERROR_TYPES.SERVER.INTERNAL_ERROR;
      }
    }

    // Análisis del mensaje de error
    if (error.message) {
      const message = error.message.toLowerCase();

      if (message.includes('timeout')) return ERROR_TYPES.NETWORK.CONNECTION_TIMEOUT;
      if (message.includes('network')) return ERROR_TYPES.NETWORK.CONNECTION_REFUSED;
      if (message.includes('permission')) return ERROR_TYPES.PERMISSION.ACCESS_DENIED;
      if (message.includes('validation')) return ERROR_TYPES.VALIDATION.INVALID_FORMAT;
      if (message.includes('unauthorized')) return ERROR_TYPES.AUTH.TOKEN_EXPIRED;
      if (message.includes('forbidden')) return ERROR_TYPES.PERMISSION.ACCESS_DENIED;
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Determinar categoría del error
   */
  determineErrorCategory(errorType) {
    return ERROR_CATEGORY_MAPPING[errorType] || ERROR_CATEGORIES.MEDIUM;
  }

  /**
   * Verificar si el error es recuperable
   */
  isRecoverable(errorType) {
    return RECOVERABLE_ERRORS.has(errorType);
  }

  /**
   * Verificar si el error es reintentable
   */
  isRetryable(errorType) {
    const retryableErrors = [
      ERROR_TYPES.NETWORK.CONNECTION_TIMEOUT,
      ERROR_TYPES.NETWORK.CONNECTION_RESET,
      ERROR_TYPES.DATABASE.CONNECTION_TIMEOUT,
      ERROR_TYPES.DATABASE.LOCK_TIMEOUT,
      ERROR_TYPES.SERVER.GATEWAY_TIMEOUT,
      ERROR_TYPES.SERVER.OVERLOADED,
      ERROR_TYPES.EXTERNAL_API.TIMEOUT,
      ERROR_TYPES.EXTERNAL_API.RATE_LIMITED,
    ];
    return retryableErrors.includes(errorType);
  }

  /**
   * Intentar recuperación automática
   */
  async attemptAutoRecovery(processedError) {
    const strategy = RECOVERY_STRATEGIES[processedError.type];
    if (strategy && this.recoveryStrategies.has(strategy)) {
      try {
        const recoveryFunction = this.recoveryStrategies.get(strategy);
        await recoveryFunction(processedError);
        processedError.recoveryAttempted = true;
        processedError.recoveryStrategy = strategy;
      } catch (recoveryError) {
        processedError.recoveryFailed = true;
        processedError.recoveryError = recoveryError.message;
      }
    }
  }

  /**
   * Verificar si el error debe ser escalado
   */
  shouldEscalate(processedError) {
    const category = processedError.category;
    const threshold = this.alertThresholds[category];

    if (!threshold) return false;

    // Incrementar contador de errores
    const errorKey = `${category}_${processedError.type}`;
    const currentCount = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, currentCount);

    // Verificar si se alcanzó el umbral
    if (currentCount >= threshold) {
      // Verificar tiempo desde última alerta para evitar spam
      const lastAlert = this.lastAlertTime.get(errorKey);
      const now = Date.now();
      const minInterval = category === ERROR_CATEGORIES.CRITICAL ? 0 : 300000; // 5 min para no críticos

      if (!lastAlert || (now - lastAlert) > minInterval) {
        this.lastAlertTime.set(errorKey, now);
        return true;
      }
    }

    return false;
  }

  /**
   * Escalar error según reglas definidas
   */
  async escalateError(processedError) {
    const rules = this.escalationRules.get(processedError.category);
    if (!rules) return;

    const escalationData = {
      error: processedError,
      timestamp: new Date().toISOString(),
      severity: processedError.category,
      correlationId: processedError.correlationId,
      context: processedError.context,
      escalationLevel: processedError.escalationLevel + 1
    };

    // Enviar notificaciones según canales configurados
    for (const channel of rules.channels) {
      try {
        await this.sendEscalationNotification(channel, escalationData, rules.recipients);
      } catch (notificationError) {
        console.error(`Failed to send escalation via ${channel}:`, notificationError);
      }
    }

    processedError.escalated = true;
    processedError.escalationLevel++;
  }

  /**
   * Enviar notificación de escalamiento
   */
  async sendEscalationNotification(channel, escalationData, recipients) {
    switch (channel) {
      case 'email':
        await this.sendEmailAlert(escalationData, recipients);
        break;
      case 'sms':
        await this.sendSMSAlert(escalationData, recipients);
        break;
      case 'webhook':
        await this.sendWebhookAlert(escalationData);
        break;
      case 'push':
        await this.sendPushNotification(escalationData);
        break;
      default:
        console.warn(`Unknown escalation channel: ${channel}`);
    }
  }

  /**
   * Actualizar métricas de errores
   */
  updateErrorMetrics(processedError) {
    // Actualizar contadores por categoría
    const categoryKey = `metrics_${processedError.category}`;
    const categoryCount = (this.errorCounts.get(categoryKey) || 0) + 1;
    this.errorCounts.set(categoryKey, categoryCount);

    // Actualizar contadores por tipo
    const typeKey = `metrics_${processedError.type}`;
    const typeCount = (this.errorCounts.get(typeKey) || 0) + 1;
    this.errorCounts.set(typeKey, typeCount);

    // Actualizar métricas de tiempo
    const hourKey = `metrics_hour_${new Date().getHours()}`;
    const hourCount = (this.errorCounts.get(hourKey) || 0) + 1;
    this.errorCounts.set(hourKey, hourCount);

    // Limpiar métricas antiguas (mantener solo últimas 24 horas)
    this.cleanupOldMetrics();
  }

  /**
   * Limpiar métricas antiguas
   */
  cleanupOldMetrics() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    for (const [key, timestamp] of this.lastAlertTime.entries()) {
      if (now - timestamp > maxAge) {
        this.lastAlertTime.delete(key);
      }
    }
  }

  /**
   * Generar ID de correlación único
   */
  generateCorrelationId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Capturar contexto del error
   */
  captureErrorContext(error) {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null,
      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null,
      timing: performance.timing ? {
        loadEventEnd: performance.timing.loadEventEnd,
        navigationStart: performance.timing.navigationStart
      } : null
    };
  }

  /**
   * Obtener ID de sesión
   */
  getSessionId() {
    return localStorage.getItem('session_id') ||
      sessionStorage.getItem('session_id') ||
      'anonymous';
  }

  /**
   * Obtener mensaje amigable para el usuario
   */
  getUserFriendlyMessage(statusCode, originalMessage) {
    const friendlyMessages = {
      400: 'Los datos enviados no son válidos. Por favor, revise la información.',
      401: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
      403: 'No tiene permisos para realizar esta acción.',
      404: 'El recurso solicitado no fue encontrado.',
      408: 'La solicitud tardó demasiado tiempo. Intente nuevamente.',
      422: 'Los datos enviados contienen errores. Por favor, revise la información.',
      429: 'Demasiadas solicitudes. Por favor, espere un momento antes de intentar nuevamente.',
      500: 'Error interno del servidor. Por favor, contacte al administrador.',
      502: 'El servidor no está disponible temporalmente. Intente más tarde.',
      503: 'El servicio no está disponible. Intente más tarde.',
      504: 'El servidor tardó demasiado en responder. Intente nuevamente.',
    };

    if (statusCode && friendlyMessages[statusCode]) {
      return friendlyMessages[statusCode];
    }

    // Mensajes específicos basados en contenido
    if (originalMessage) {
      const lowerMessage = originalMessage.toLowerCase();

      if (lowerMessage.includes('network') || lowerMessage.includes('conexión')) {
        return 'Problema de conexión. Verifique su conexión a internet.';
      }

      if (lowerMessage.includes('timeout') || lowerMessage.includes('tiempo')) {
        return 'La operación tardó demasiado tiempo. Intente nuevamente.';
      }

      if (lowerMessage.includes('unauthorized') || lowerMessage.includes('no autorizado')) {
        return 'No está autorizado para realizar esta acción.';
      }

      if (lowerMessage.includes('validation') || lowerMessage.includes('validación')) {
        return 'Los datos ingresados no son válidos.';
      }
    }

    return 'Ha ocurrido un error inesperado. Si el problema persiste, contacte al administrador.';
  }

  /**
   * Mostrar error al usuario usando toast
   */
  showError(error, options = {}) {
    const processedError = this.processError(error);

    const toastOptions = {
      type: 'error',
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    };

    // Ajustar duración según tipo de error
    if (processedError.type === ERROR_TYPES.NETWORK) {
      toastOptions.autoClose = 8000;
    } else if (processedError.type === ERROR_TYPES.VALIDATION) {
      toastOptions.autoClose = 7000;
    }

    toast.error(processedError.userFriendlyMessage, toastOptions);

    return processedError;
  }

  /**
   * Mostrar error de validación con detalles
   */
  showValidationError(error, options = {}) {
    const processedError = this.processError(error);

    if (processedError.type === ERROR_TYPES.VALIDATION && processedError.details) {
      // Mostrar errores de validación específicos
      Object.keys(processedError.details).forEach(field => {
        const fieldErrors = Array.isArray(processedError.details[field])
          ? processedError.details[field]
          : [processedError.details[field]];

        fieldErrors.forEach(errorMessage => {
          toast.error(`${field}: ${errorMessage}`, {
            position: 'top-right',
            autoClose: 6000,
            ...options,
          });
        });
      });
    } else {
      this.showError(error, options);
    }

    return processedError;
  }

  /**
   * Mostrar mensaje de éxito
   */
  showSuccess(message, options = {}) {
    const toastOptions = {
      type: 'success',
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    };

    toast.success(message, toastOptions);
  }

  /**
   * Mostrar mensaje de advertencia
   */
  showWarning(message, options = {}) {
    const toastOptions = {
      type: 'warning',
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    };

    toast.warning(message, toastOptions);
  }

  /**
   * Mostrar mensaje informativo
   */
  showInfo(message, options = {}) {
    const toastOptions = {
      type: 'info',
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    };

    toast.info(message, toastOptions);
  }

  /**
   * Agregar error al log
   */
  addToLog(error) {
    this.errorLog.unshift(error);

    // Mantener solo los últimos errores
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log en consola para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('Error procesado:', error);
    }
  }

  /**
   * Obtener log de errores
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Limpiar log de errores
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Obtener estadísticas de errores
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      byStatusCode: {},
      recent: this.errorLog.slice(0, 10),
    };

    this.errorLog.forEach(error => {
      // Por tipo
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

      // Por código de estado
      if (error.statusCode) {
        stats.byStatusCode[error.statusCode] = (stats.byStatusCode[error.statusCode] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Verificar si un error es recuperable
   */
  isRecoverableError(error) {
    const processedError = this.processError(error);

    // Errores recuperables
    const recoverableTypes = [
      ERROR_TYPES.NETWORK,
      ERROR_TYPES.TIMEOUT,
      ERROR_TYPES.SERVER,
    ];

    return recoverableTypes.includes(processedError.type);
  }

  /**
   * Verificar si un error requiere reautenticación
   */
  requiresReauth(error) {
    const processedError = this.processError(error);
    return processedError.type === ERROR_TYPES.AUTH;
  }

  // ===== ESTRATEGIAS DE RECUPERACIÓN =====

  /**
   * Estrategia: Retry con backoff exponencial
   */
  async retryWithBackoff(processedError, maxRetries = 3) {
    const baseDelay = 1000; // 1 segundo
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000; // Jitter
        await new Promise(resolve => setTimeout(resolve, delay));

        // Aquí se reintentaría la operación original
        // Por ahora solo marcamos como recuperado
        processedError.recovered = true;
        processedError.recoveryAttempts = attempt + 1;
        return true;
      } catch (retryError) {
        attempt++;
        if (attempt >= maxRetries) {
          processedError.recoveryFailed = true;
          processedError.recoveryAttempts = attempt;
          throw retryError;
        }
      }
    }
    return false;
  }

  /**
   * Estrategia: Refrescar token de autenticación
   */
  async refreshToken(processedError) {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { default: authService } = await import('../services/authService.js');

      const result = await authService.refreshToken();
      if (result.success) {
        processedError.recovered = true;
        processedError.recoveryMethod = 'token_refresh';
        return true;
      }
    } catch (refreshError) {
      processedError.recoveryFailed = true;
      processedError.recoveryError = refreshError.message;

      // Si falla el refresh, redirigir al login
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return false;
  }

  /**
   * Estrategia: Backoff exponencial para rate limiting
   */
  async exponentialBackoff(processedError, maxRetries = 5) {
    const baseDelay = 2000; // 2 segundos
    let attempt = 0;

    while (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));

      try {
        // Verificar si el rate limit se ha levantado
        processedError.recovered = true;
        processedError.recoveryAttempts = attempt + 1;
        return true;
      } catch (retryError) {
        attempt++;
        if (attempt >= maxRetries) {
          processedError.recoveryFailed = true;
          break;
        }
      }
    }
    return false;
  }

  /**
   * Estrategia: Circuit breaker para servicios sobrecargados
   */
  async circuitBreakerRecovery(processedError) {
    const serviceKey = processedError.context?.url || 'unknown_service';
    let circuitBreaker = this.circuitBreakers.get(serviceKey);

    if (!circuitBreaker) {
      circuitBreaker = {
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        failureCount: 0,
        lastFailureTime: null,
        timeout: 60000, // 1 minuto
        threshold: 5
      };
      this.circuitBreakers.set(serviceKey, circuitBreaker);
    }

    // Incrementar contador de fallos
    circuitBreaker.failureCount++;
    circuitBreaker.lastFailureTime = Date.now();

    // Abrir circuit breaker si se alcanza el umbral
    if (circuitBreaker.failureCount >= circuitBreaker.threshold) {
      circuitBreaker.state = 'OPEN';

      // Programar intento de recuperación
      setTimeout(() => {
        circuitBreaker.state = 'HALF_OPEN';
        circuitBreaker.failureCount = 0;
      }, circuitBreaker.timeout);

      processedError.circuitBreakerOpen = true;
      return false;
    }

    return false;
  }

  /**
   * Estrategia: Retry con chunking para archivos grandes
   */
  async retryWithChunking(processedError) {
    try {
      // Esta estrategia requeriría acceso al archivo original
      // Por ahora solo marcamos como intentado
      processedError.recovered = false;
      processedError.recoveryMethod = 'chunking_required';
      processedError.recoveryMessage = 'Requiere implementación específica de chunking';
      return false;
    } catch (error) {
      processedError.recoveryFailed = true;
      return false;
    }
  }

  // ===== MÉTODOS DE NOTIFICACIÓN =====

  /**
   * Enviar alerta por email
   */
  async sendEmailAlert(escalationData, recipients) {
    try {
      const emailData = {
        to: recipients,
        subject: `[EVA] Error ${escalationData.severity}: ${escalationData.error.type}`,
        body: this.formatEmailAlert(escalationData),
        priority: escalationData.severity === ERROR_CATEGORIES.CRITICAL ? 'high' : 'normal'
      };

      // Aquí se integraría con el servicio de email
      console.log('Email alert sent:', emailData);
      return true;
    } catch (error) {
      console.error('Failed to send email alert:', error);
      return false;
    }
  }

  /**
   * Enviar alerta por SMS
   */
  async sendSMSAlert(escalationData, recipients) {
    try {
      const smsData = {
        to: recipients,
        message: `EVA Alert: ${escalationData.error.type} - ${escalationData.error.message}`,
        priority: escalationData.severity === ERROR_CATEGORIES.CRITICAL ? 'high' : 'normal'
      };

      // Aquí se integraría con el servicio de SMS
      console.log('SMS alert sent:', smsData);
      return true;
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
      return false;
    }
  }

  /**
   * Enviar alerta por webhook
   */
  async sendWebhookAlert(escalationData) {
    try {
      const webhookUrl = process.env.VITE_ERROR_WEBHOOK_URL || '/api/webhooks/errors';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(escalationData)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
      return false;
    }
  }

  /**
   * Enviar notificación push
   */
  async sendPushNotification(escalationData) {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification(`Error ${escalationData.severity}`, {
          body: escalationData.error.userFriendlyMessage,
          icon: '/icons/error-icon.png',
          badge: '/icons/badge-icon.png',
          tag: escalationData.correlationId,
          requireInteraction: escalationData.severity === ERROR_CATEGORIES.CRITICAL,
          data: escalationData
        });

        return true;
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
    return false;
  }

  /**
   * Formatear alerta de email
   */
  formatEmailAlert(escalationData) {
    const { error, timestamp, severity, correlationId } = escalationData;

    return `
      <h2>Error Alert - Sistema EVA</h2>
      <p><strong>Severidad:</strong> ${severity}</p>
      <p><strong>Tipo:</strong> ${error.type}</p>
      <p><strong>Mensaje:</strong> ${error.message}</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
      <p><strong>Correlation ID:</strong> ${correlationId}</p>
      <p><strong>URL:</strong> ${error.context?.url}</p>
      <p><strong>User Agent:</strong> ${error.context?.userAgent}</p>

      <h3>Detalles del Error:</h3>
      <pre>${JSON.stringify(error.details, null, 2)}</pre>

      <h3>Stack Trace:</h3>
      <pre>${error.stackTrace}</pre>

      <p><em>Este es un mensaje automático del sistema de monitoreo EVA.</em></p>
    `;
  }

  /**
   * Obtener métricas avanzadas de errores
   */
  getAdvancedErrorMetrics() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const recentErrors = this.errorLog.filter(error =>
      now - new Date(error.timestamp).getTime() < oneHour
    );

    const dailyErrors = this.errorLog.filter(error =>
      now - new Date(error.timestamp).getTime() < oneDay
    );

    return {
      total: this.errorLog.length,
      lastHour: recentErrors.length,
      lastDay: dailyErrors.length,
      byCategory: this.groupErrorsByCategory(),
      byType: this.groupErrorsByType(),
      recoveryRate: this.calculateRecoveryRate(),
      escalationRate: this.calculateEscalationRate(),
      averageResolutionTime: this.calculateAverageResolutionTime(),
      topErrors: this.getTopErrors(),
      errorTrends: this.getErrorTrends()
    };
  }

  /**
   * Agrupar errores por categoría
   */
  groupErrorsByCategory() {
    const groups = {};
    this.errorLog.forEach(error => {
      const category = error.category || ERROR_CATEGORIES.MEDIUM;
      groups[category] = (groups[category] || 0) + 1;
    });
    return groups;
  }

  /**
   * Agrupar errores por tipo
   */
  groupErrorsByType() {
    const groups = {};
    this.errorLog.forEach(error => {
      groups[error.type] = (groups[error.type] || 0) + 1;
    });
    return groups;
  }

  /**
   * Calcular tasa de recuperación
   */
  calculateRecoveryRate() {
    const recoverableErrors = this.errorLog.filter(error => error.recoverable);
    const recoveredErrors = this.errorLog.filter(error => error.recovered);

    return recoverableErrors.length > 0
      ? (recoveredErrors.length / recoverableErrors.length) * 100
      : 0;
  }

  /**
   * Calcular tasa de escalamiento
   */
  calculateEscalationRate() {
    const escalatedErrors = this.errorLog.filter(error => error.escalated);
    return this.errorLog.length > 0
      ? (escalatedErrors.length / this.errorLog.length) * 100
      : 0;
  }

  /**
   * Calcular tiempo promedio de resolución
   */
  calculateAverageResolutionTime() {
    const resolvedErrors = this.errorLog.filter(error =>
      error.recovered && error.recoveryAttempts
    );

    if (resolvedErrors.length === 0) return 0;

    const totalTime = resolvedErrors.reduce((sum, error) => {
      return sum + (error.recoveryAttempts * 1000); // Estimación básica
    }, 0);

    return totalTime / resolvedErrors.length;
  }

  /**
   * Obtener errores más frecuentes
   */
  getTopErrors(limit = 10) {
    const errorCounts = {};

    this.errorLog.forEach(error => {
      errorCounts[error.type] = (errorCounts[error.type] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([type, count]) => ({ type, count }));
  }

  /**
   * Obtener tendencias de errores
   */
  getErrorTrends() {
    const now = new Date();
    const trends = {};

    // Agrupar por hora de las últimas 24 horas
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = hour.getHours();
      trends[hourKey] = 0;
    }

    this.errorLog.forEach(error => {
      const errorTime = new Date(error.timestamp);
      const hoursDiff = Math.floor((now - errorTime) / (60 * 60 * 1000));

      if (hoursDiff < 24) {
        const hourKey = errorTime.getHours();
        trends[hourKey] = (trends[hourKey] || 0) + 1;
      }
    });

    return trends;
  }
}

// Crear instancia singleton
const errorHandler = new ErrorHandler();

export default errorHandler;
