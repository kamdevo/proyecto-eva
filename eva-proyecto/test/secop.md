# SECOP Procurement Consultation Modal - Technical Report

## Executive Summary

This technical report provides comprehensive documentation of the SECOP (Sistema Electrónico de Contratación Pública) procurement consultation modal specifically designed for purchase orders within the EVA-ORG system. The modal serves as an interface for consulting and managing procurement processes from Colombia's public procurement platform.

## 1. Modal Structure and Components

### 1.1 Primary Modal Components

#### 1.1.1 SECOP API Consultation Modal (`modal_api.php`)
- **Modal ID**: `modal_api`
- **Title**: "Procesos de contratación Secop"
- **Width**: 75% of viewport
- **Purpose**: Display SECOP procurement processes retrieved from external API

**UI Elements:**
- Modal header with close button (×)
- Loading indicator with "Cargando..." text
- Dynamic content area populated via AJAX
- Close button in footer

#### 1.1.2 Purchase Order Consultation Modal (`modal_consulta.php`)
- **Modal ID**: `modal_consulta_orden_compra`
- **Title**: "Listado de soportes de compra"
- **Width**: 75% of viewport
- **Purpose**: Display internal purchase order support documents

**UI Elements:**
- Modal header with close button
- Loading indicator
- Dynamic content area for purchase order listings
- Close button in footer

#### 1.1.3 Purchase Order Edit Modal (`modal_edit.php`)
- **Modal ID**: `modal_update_orden_compra`
- **Title**: "Editar"
- **Purpose**: Edit existing purchase orders

**Input Fields:**
- **Hidden ID Field**: `id` (for record identification)
- **Order Code**: `orden` (text input, required, min 4 characters)
- **Date**: `fecha` (date input)
- **Provider**: `proveedor_id` (select dropdown)
- **Purchase Type**: `tipo_compra_id` (select dropdown, required)
- **SECOP URL**: `url_secop` (URL input)
- **File Upload**: `file` (file input for document attachment)

#### 1.1.4 Purchase Order Add Modal (`modal_add.php`)
- **Modal ID**: `modal_add_orden_compra`
- **Title**: "Agregar"
- **Purpose**: Create new purchase orders

**Input Fields:** (Same as edit modal except no hidden ID field)
- Order Code, Date, Provider, Purchase Type, SECOP URL, File Upload

### 1.2 Data Display Components

#### 1.2.1 Purchase Order Detail Table (`detalle_consulta.php`)
**Table Columns:**
- **Codigo**: Order code with selection button
- **Fecha**: Order date
- **Proveedor**: Provider name
- **Archivo**: File download link

#### 1.2.2 SECOP API Detail Table (`modal_api_detalle.php`)
**Table Columns:**
- **UID**: Unique identifier
- **Número del Contrato**: Contract number with SECOP link
- **Nombre del Proceso**: Process name
- **Fecha de Publicación**: Publication date

## 2. Database Schema

### 2.1 Core Tables

#### 2.1.1 `ordenes_compra` (Purchase Orders)
**Primary Table for Purchase Order Management**

**Columns:**
- `id` (Primary Key, Auto-increment)
- `orden` (VARCHAR) - Order code/number (unique, required, min 4 chars)
- `fecha` (DATE) - Order date
- `proveedor_id` (Foreign Key) - References `contacto.id`
- `tipo_compra_id` (Foreign Key) - References `tipos_compra.id`
- `url_secop` (VARCHAR) - SECOP platform URL
- `file` (VARCHAR) - Uploaded document filename
- `status` (INT) - Record status (1=active, 2=inactive)

**Validation Rules:**
- Order code must be unique across all records
- Minimum 4 characters for order code
- Required fields: orden, tipo_compra_id

#### 2.1.2 `tipos_compra` (Purchase Types)
**Classification Table for Purchase Types**

**Columns:**
- `id` (Primary Key, Auto-increment)
- `tipo_compra` (VARCHAR) - Purchase type description

**Known Purchase Types:**
1. Purchase Orders (tipo_compra_id = 1)
2. Contracts (tipo_compra_id = 2)
3. Account Crossings (tipo_compra_id = 3)
4. Commodities (tipo_compra_id = 4)

#### 2.1.3 `contacto` (Contacts/Providers)
**Master Table for All Contact Information**

**Columns:**
- `id` (Primary Key, Auto-increment)
- `name` (VARCHAR) - Contact/Provider name
- `email` (VARCHAR) - Email address
- `telefono` (VARCHAR) - Phone number
- `tcontacto_id` (Foreign Key) - References `tcontacto.id`
- `status` (INT) - Record status (1=active, 2=inactive)

**Provider Filter:**
- Providers are identified by `tcontacto_id = 3`

#### 2.1.4 `tcontacto` (Contact Types)
**Classification Table for Contact Types**

**Columns:**
- `id` (Primary Key, Auto-increment)
- `description` (VARCHAR) - Contact type description

### 2.2 Related Equipment Tables

#### 2.2.1 `equipos` (Equipment)
**Equipment records linked to purchase orders**

**Key Relationship:**
- `equipos.orden_compra_id` → `ordenes_compra.id`

This relationship enables tracking which equipment was acquired through specific purchase orders.

### 2.3 Database Relationships

```
ordenes_compra (1) ←→ (N) equipos
ordenes_compra (N) ←→ (1) tipos_compra
ordenes_compra (N) ←→ (1) contacto
contacto (N) ←→ (1) tcontacto
```

## 3. API Integration

### 3.1 External API Connections

#### 3.1.1 Colombian Government Open Data API
**Base URL**: `https://www.datos.gov.co/resource/xvdy-vvsk.json`

**Primary Endpoint for SECOP Consultation:**
```
GET https://www.datos.gov.co/resource/xvdy-vvsk.json?nombre_de_la_entidad=VALLE%20DEL%20CAUCA%20%20ESE%20HOSPITAL%20UNIVERSITARIO%20DEL%20VALLE%20EVARISTO%20GARC%C3%8DA&$limit=10000
```

**Parameters:**
- `nombre_de_la_entidad`: Entity name filter
- `$limit`: Maximum records to retrieve (10,000)

**Response Format:** JSON array containing procurement process records

**Key Response Fields:**
- `uid`: Unique identifier
- `numero_del_contrato`: Contract number
- `nombre_del_proceso`: Process name
- `fecha_de_publicacion`: Publication date
- `ruta_proceso_en_secop_i.url`: Direct link to SECOP process

#### 3.1.2 Specific Record Lookup
**Endpoint for Individual Record Retrieval:**
```
GET https://www.datos.gov.co/resource/xvdy-vvsk.json?$query=%20SELECT%20*%20WHERE%20uid=%27{UID}%27
```

**Purpose**: Retrieve specific SECOP process details by UID
**Usage**: Automatically populate SECOP URL when linking purchase orders

### 3.2 Internal API Endpoints

#### 3.2.1 Purchase Order Management Endpoints

**Base Controller**: `ordenes_compra/Cordenes_compra`

**Available Endpoints:**

1. **`consultar_secop`** (POST)
   - **Purpose**: Retrieve SECOP data from external API
   - **Response**: HTML view with SECOP data table

2. **`getWithNumberDevices`** (POST)
   - **Purpose**: Get purchase orders with equipment count
   - **Response**: JSON array of purchase orders with associated equipment count

3. **`getOne`** (POST)
   - **Parameters**: `id` (purchase order ID)
   - **Response**: JSON object with single purchase order details

4. **`add`** (POST)
   - **Purpose**: Create new purchase order
   - **Parameters**: Form data with file upload support
   - **Response**: JSON success/error response

5. **`update`** (POST)
   - **Purpose**: Update existing purchase order
   - **Parameters**: Form data including ID and optional SECOP ID
   - **Response**: JSON success/error response

6. **`show_ordenes_compra`** (POST)
   - **Purpose**: Display purchase orders (type 1)
   - **Response**: HTML view with filtered purchase orders

7. **`show_contratos`** (POST)
   - **Purpose**: Display contracts (type 2)
   - **Response**: HTML view with filtered contracts

#### 3.2.2 Supporting Endpoints

**Purchase Types**: `tipos_compra/Ctipos_compra/getAll`
- **Response**: JSON array of all purchase types

**Contacts/Providers**: `contacto/Ccontactos/getProveedores`
- **Response**: JSON array of provider contacts

## 4. Data Flow Documentation

### 4.1 SECOP Consultation Flow

```
User Action → Frontend JavaScript → Internal API → External SECOP API → Database → UI Update
```

**Detailed Flow:**
1. User clicks "Consultar SECOP" button
2. JavaScript triggers `consultar_secop()` function
3. AJAX call to `ordenes_compra/Cordenes_compra/consultar_secop`
4. Controller fetches data from `datos.gov.co` API
5. Data processed and rendered in `modal_api_detalle.php` view
6. Modal content updated with SECOP procurement data
7. DataTable initialized with Spanish localization

### 4.2 Purchase Order Creation Flow

```
Form Submission → Validation → File Upload → Database Insert → Response
```

**Detailed Flow:**
1. User fills purchase order form in modal
2. Form validation (client-side and server-side)
3. File upload to `./assets/upload_ordenes_compra/` directory
4. Database insertion via `Mordenes_compra->add()`
5. Success/error response returned to frontend
6. Modal closed and data tables refreshed

### 4.3 SECOP URL Auto-Population Flow

```
SECOP ID Selection → API Query → URL Extraction → Form Update
```

**Detailed Flow:**
1. User selects SECOP ID from dropdown
2. System queries specific SECOP record by UID
3. Extracts `ruta_proceso_en_secop_i.url` from response
4. Automatically populates `url_secop` field in form

### 4.4 Equipment Association Flow

```
Purchase Order Selection → Equipment Linking → Database Update
```

**Detailed Flow:**
1. User selects purchase order from consultation modal
2. `asociar_orden_compra()` function called with order ID
3. Equipment record updated with `orden_compra_id`
4. Relationship established between equipment and purchase order

## 5. Business Logic and Validation Rules

### 5.1 Data Validation Rules

#### 5.1.1 Purchase Order Validation
- **Order Code**: Must be unique, required, minimum 4 characters
- **Purchase Type**: Required selection
- **File Upload**: All file types accepted, encrypted filename storage
- **SECOP URL**: Valid URL format when provided

#### 5.1.2 Provider Validation
- **Name**: Must be unique, required, minimum 3 characters
- **Contact Type**: Required selection
- **Status**: Active providers only (status = 1)

### 5.2 File Management Rules

#### 5.2.1 Upload Configuration
- **Directory**: `./assets/upload_ordenes_compra/`
- **File Types**: All types accepted (`*`)
- **Naming**: Encrypted filenames for security
- **Cleanup**: Failed uploads automatically removed

### 5.3 Access Control

#### 5.3.1 Module Permissions
- **Module Name**: "soportes compra"
- **Required Permission**: Read access (`leer = 1`)
- **Redirect**: Users without permission redirected to Forbidden page

## 6. Technical Dependencies

### 6.1 Frontend Dependencies
- **jQuery**: AJAX operations and DOM manipulation
- **DataTables**: Table display and pagination
- **Bootstrap**: Modal framework and UI components
- **Select2**: Enhanced dropdown functionality (for SECOP selection)

### 6.2 Backend Dependencies
- **CodeIgniter Framework**: MVC architecture
- **PHP File Functions**: `file_get_contents()` for API calls
- **Upload Library**: File upload handling
- **Form Validation Library**: Server-side validation

### 6.3 External Dependencies
- **Colombian Government API**: Real-time SECOP data
- **Internet Connectivity**: Required for external API access

## 7. Security Considerations

### 7.1 Data Protection
- **File Encryption**: Uploaded filenames encrypted
- **SQL Injection Protection**: Parameterized queries via CodeIgniter
- **Access Control**: Permission-based module access

### 7.2 External API Security
- **HTTPS**: Secure connection to government API
- **Rate Limiting**: 10,000 record limit per request
- **Data Validation**: External data sanitized before display

## 8. Performance Considerations

### 8.1 Database Optimization
- **Indexed Relationships**: Foreign key relationships properly indexed
- **Query Optimization**: Efficient JOIN operations in complex queries
- **Pagination**: DataTables provide client-side pagination

### 8.2 API Performance
- **Caching Strategy**: No current caching implementation
- **Batch Processing**: Large datasets handled via pagination
- **Timeout Handling**: No explicit timeout configuration

## Conclusion

The SECOP procurement consultation modal represents a comprehensive integration between the internal EVA-ORG system and Colombia's public procurement platform. The system provides robust functionality for managing purchase orders while maintaining real-time connectivity with government procurement data.

The architecture demonstrates good separation of concerns with clear MVC patterns, proper database relationships, and secure file handling. However, areas for improvement include implementing caching strategies for external API calls and adding more comprehensive error handling for network failures.
