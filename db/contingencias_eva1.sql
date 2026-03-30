-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 30-03-2026 a las 12:53:54
-- Versión del servidor: 8.0.42-0ubuntu0.20.04.1
-- Versión de PHP: 7.4.3-4ubuntu2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gestionthuv`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contingencias`
--

CREATE TABLE `contingencias` (
  `id` int NOT NULL,
  `fecha` date DEFAULT NULL,
  `observacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  `file` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `equipo_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `estado_id` int NOT NULL DEFAULT '1',
  `fecha_cierre` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `contingencias`
--

INSERT INTO `contingencias` (`id`, `fecha`, `observacion`, `file`, `created_at`, `equipo_id`, `usuario_id`, `estado_id`, `fecha_cierre`) VALUES
(8, '2020-08-10', 'El monitor es reemplazado por el biocare serie: C318100237', NULL, '2020-08-10 20:29:59', 2367, 11, 1, NULL),
(9, '2020-07-24', 'ESTE EQUIPO SE PRESTA AL AREA DE ARO II MIENTRAS SE REPARA EL ASPIRADOR DE ESA AREA.', NULL, '2020-08-24 09:49:09', 2249, 16, 4, '2020-08-24'),
(11, '2020-08-28', 'El equipo se entrega a la ambulancia de placas ONI-917 debido a que el monitor de signos vitales Biocare de SN: C318100237 presenta fallos en su funcionamiento.', NULL, '2020-08-28 10:03:33', 3327, 34, 4, '2020-09-22'),
(12, '2020-08-21', 'SE ENTREGA EQUIPO DE BACK UP LÁSER CARL ZEISS SERIE: 1206706 MODELO VISULAS 532S, COMO CONTINGENCIA DADA LA SALIDA DE DE SERVICIO DEL EQUIPO PERTENECIENTE A OFTALMOLOGIA CONSULTA EXTERNA.\r\n SE DEJA TRABAJANDO SUN UPS NI TOMA REGULADO, Y SE HACE LA RECOMENDACION DE LA INSTALACION DE UNA UPS', '400bb794437bdbea6af2bb7368c3d1e7.pdf', '2020-08-28 16:54:27', 3511, 7, 4, '2021-04-13'),
(13, '2020-09-03', 'SE ENTREGA MONITOR DE SIGNOS VITALES GOLDWAY COMO CONTINGENCIA. \r\nSN: 7C5AAIS-049. POR DAÑO EN LA BOMBA', '52729e5384735b38548afbc886483014.pdf', '2020-09-03 15:54:39', 825, 7, 4, '2020-12-09'),
(14, '2020-09-09', 'SE DEJA EN PRÉSTAMO EQUIPO COMO CONTINGENCIA PARA EL SERVICIO DE CIRUGÍA CARDIOVASCULAR, YA QUE REQUIEREN CON URGENCIA UN MONITOR DE TRANSPORTE QUE TENGA IBP.', '84b06f7eb42e001e617fe31ef25a5d76.pdf', '2020-09-09 15:45:21', 4147, 16, 1, NULL),
(15, '2020-09-07', 'SE REALIZA CAMBIO DE PANTALLA TEMPORALMENTE DE EQUIPO SERIE JM-78001722, CON EL FIN DE HABILITAR EL PRESENTE EQUIPO YA QUE SE ENCONTRABA FUERA DE SERVICIO.  SE ENTREGA EQUIPO EN BUENAS CONDICIONES FISICAS Y OPERATIVAS.', '75ef3f494fec22b82baed39069b4d1be.pdf', '2020-09-29 08:09:36', 614, 8, 1, NULL),
(16, '2020-09-28', 'Se ubica el monitor de serial AA6C-14503 al servicio de urgencias en contingencia  puesto que el sensor de saturador de oxigeno (40°) se encuentra dañado y no hay repuesto para realizar el cambio', '9ad1d151e358c0a2f4f46ec588457efb.pdf', '2020-09-29 10:59:37', 3063, 34, 1, NULL),
(17, '2020-07-14', 'SE REEMPLAZÓ MONITOR POR OTRO GOLDWAY SERIE 7C5AAIS-022', NULL, '2020-10-08 10:35:15', 766, 8, 1, NULL),
(18, '2020-10-09', 'EQUIPO SE REEMPLAZA POR EQUIPO DE SERIE 7C5AAIM-001', 'fb8ed4ce150719780bc16f310ea5f328.pdf', '2020-10-27 09:18:59', 763, 8, 1, NULL),
(19, '2020-11-03', 'El monitor se pone en contingencia para el remplazo del monitor COMEN STAR 8000E de número de serie E72005527028F debido a que este resultó salpicado con agua después de que un tubo de agua dentro del cubículo 4 de UCI Adulto se rompiera y arrojara el líquido al interior. El monitor que estaba en el servicio se lleva al taller de mantenimiento biomédico sede norte para prevenir daños.', NULL, '2020-11-03 16:25:12', 5060, 42, 4, '2021-02-22'),
(20, '2020-11-03', 'El monitor se pone fuera de servicio por remplazo del monitor COMEN STAR 8000E con activo fijo EMCO 4944 debido a que este monitor remplazado de serie E7200527028F resultó salpicado con agua después de que un tubo de agua dentro del cubículo 4 de UCI Adulto se rompiera y arrojara el líquido al interior. El monitor se lleva al taller de mantenimiento biomédico sede norte para prevenir daños.', NULL, '2020-11-03 16:29:46', 5042, 42, 4, '2021-01-22'),
(21, '2020-11-03', 'EQUIPO SALE DE SERVICIO DADO QUE AL REALIZAR LA VERIFICACIÓN FISICO FUNCIONAL SE IDENTIFICA QUE TIENE DAÑO EN BATERIAS Y SENSA EN SU MAYORIA RUIDO AL USAR LAS PALAS DEL ECG Y LOS ELECTRODOS. POR LO TANTO SE ENTREGA UN DESFIBRILADOR NUEVO COMO CONTINGENCIA POR LA NECESIDAD DE CONTAR CON UN DESFIBRILADOR EN EL SERVICIO', 'a3192e70382d7c08968e57dc8a9fafbf.pdf', '2020-11-23 15:30:33', 188, 7, 4, '2020-11-23'),
(23, '2020-11-06', 'SE ENTREGA EL VENTILADOR MECÁNICO MARCA MINDRAY, MODELO SV300, SERIE  GB-08027507 AL CRYC, COMO CONTINGENCIA YA QUE A LOS CIRCUITOS DE LOS VENTILADORES DE TRANSPORTE WEINMANN SE LES AVERIÓ UNA MEMBRANA QUE ESTÁ EN PROCESO DE COTIZACIÓN.', 'd4ea4bb6d6c7f7c081d5c7893a278ddf.pdf', '2020-11-24 09:31:01', 2379, 16, 1, NULL),
(24, '2020-11-06', 'SE ENTREGA EL VENTILADOR MECÁNICO MARCA MINDRAY, MODELO SV300, SERIE  GB-08027507 AL CRYC, COMO CONTINGENCIA YA QUE A LOS CIRCUITOS DE LOS VENTILADORES DE TRANSPORTE WEINMANN SE LES AVERIÓ UNA MEMBRANA QUE ESTÁ EN PROCESO DE COTIZACIÓN.', '16047ec39ebb2d463e5c47659e6b9729.pdf', '2020-11-24 09:31:22', 3060, 16, 1, NULL),
(25, '2020-12-03', 'Para el día de hoy 3 de Diciembre del 2020 el ingeniero Jorge Ivan entrega la mesa de cirugía Mindray EMCO4447 al servicio de quirofano de partos como contingencia.', NULL, '2020-12-03 16:26:12', 1888, 8, 1, NULL),
(26, '2020-11-27', 'Se entrega desfibrilador d500 como contingencia a razón de las fallas presentadas.  El cual es un desfibrilador destinado originalmente al SOAT', '213d5186d1b1f989a2e6675de0f97c36.pdf', '2020-12-04 08:19:49', 190, 7, 4, '2021-01-18'),
(27, '2020-12-18', 'EQUIPO SALE DE SERVICIO POR DAÑO EN CONTROL BOX, SE ENTREGA EN SU LUGAR LA CAMA ELECTROMECANICA  ADVANCE CON SERIE B868Y MIENTRAS ES REALIZADA LA REPARACIÓN', '9fac150f2074bf9d00824f85f3b9437f.pdf', '2020-12-21 15:56:25', 1866, 7, 4, '2021-03-19'),
(28, '2020-12-09', 'Se cambia el monitor que estaba en contingencia, y se reemplaza por un Goldway con numero de serie CN7CABAS00079', 'a040574fc92cfcb052bf3e2ea3fcf319.pdf', '2020-12-22 08:34:45', 825, 7, 1, NULL),
(29, '2020-12-07', 'SE ESTA UTILIZANDO UN GASTROSCOPIO CON NUMERO DE SERIE 4G314A008 QUE SE ENTREGO EN PRESTAMO POR PARTE DE LA EMPRESA JOMEDICAL MIENTRAS SE ENTREGA ESTE EQUIPO A CONOFIRMIDAD EN EL SERVICIO Y SE REALIZA LA RESPECTIVA CAPACITACIÓN A LA ESPECIALISTA EN ENDOSCOPIA PEDIATRICA POR PARTE DEL ESPECIALISTA DE LA EMPRESA', '01b44e7fcd9de3c0af274a7af7cba3d9.pdf', '2021-01-15 17:18:51', 5588, 7, 1, NULL),
(30, '2021-01-18', 'Se entrega monitor de signos vitales  MINDRAY IMEC 12 con numero de serie EV-08065435 (DONADO POR GASES DE OCCIDENTE), al servicio de sala de operaciones a razón de que el monitor con numero de inventario EMCO3452, trasladado previamente al servicio presenta un ruido al momento de usar el modulo analizador de gases, por lo que para evitar posibles eventos adversos se entrega como contingencia', 'b03ec6e7be67f97930b2f61a7746240f.pdf', '2021-01-18 14:20:55', 757, 7, 1, NULL),
(31, '2021-01-27', 'SE INSTALA EN EL SERVICIO DE CIRUGIA HOMBRES LA CAMA HOPEFUL EN COMODATO CON NUMERO DE SERIE M57-077, DADA LA SALIDA DE SERVICIO DE LA CAMA ELECTRICA STRYKER CON SERIE 1185100014320017', '6364ad9117c486fb41a806b3da09ea47.pdf', '2021-02-01 09:49:02', 1774, 7, 4, '2021-03-19'),
(32, '2021-01-26', 'Se instala el desfibrilador nihon kohden con activo fijo emco3635 como contingencia, dado que este permanece fuera de servicio y en el servicio se necesitan desfibriladores con los que se puedan usar palas internas.', '34c42883ec66278a11a6d8d149bb7080.pdf', '2021-02-05 15:37:30', 188, 7, 1, NULL),
(33, '2021-01-14', 'Se entrega como contingencia desfibrilador Hewlet packard dado que el mediana entregado al servicio se lo llevo la gobernación.', '2c3f6d394e2ad32d49306b650ba0c29d.pdf', '2021-02-05 15:39:13', 190, 7, 1, NULL),
(34, '2021-02-04', 'Se entrega monitor con serie EV-08065438, como contingencia dado que el monitor se quedo sin Co2 por falta de trampas de agua mindray', '52bbcc0f8774e7211bd7b9530e40b0b9.pdf', '2021-02-05 16:12:10', 843, 7, 1, NULL),
(35, '2021-02-08', 'SE DEJA EL SIGUIENTE EQUIPO EN CONTINGENCIA YA QUE EL PRESENTE NO TIENE ACOPLE DE MANGUERA NIBP:\r\n7C5AAIV019', '65019aa0a1e9862d4bc788e7e0bd828a.pdf', '2021-02-17 21:33:16', 891, 8, 1, NULL),
(36, '2021-02-18', 'SE REALIZA CAMBIO DE BOMBA DE INFUSIÓN POR EQUIPO DE SIMILAR CARQACTERÍSTICAS CON NÚMERO DE SERIE 26080008UN. ESTO COMO RESPUESTA DE TICKET 489.', '551a5df3c63fd629fb069af868ad17c8.pdf', '2021-02-18 22:31:05', 1997, 42, 4, '2021-03-05'),
(37, '2021-02-25', 'Se entrega como contingencia cama electromecánica Hopefull Advance con numero de serie M58-012, a razón de que la cama Stryker se encuentra actualmente fuera de servicio. Ya que no energiza', 'dbf0ae833143480e93afffdac13f9bea.pdf', '2021-02-26 17:01:30', 1772, 7, 4, '2021-04-27'),
(38, '2021-03-18', 'SE PRESTA FRONTOLUZ EMCO3007 COMO CONTINGENCIA.', NULL, '2021-03-25 13:15:42', 2431, 8, 1, NULL),
(39, '2021-04-07', 'Dado que la pantalla táctil del equipo se encuentra dañada, se entrega monitor de signos vitales con la siguiente información en contingencia mientras es llevada a cabo la respectiva reparación.\r\ncódigo: EMCO3411\r\nserie: w17108480', '02df35c7ae94a7f6541568580ab9da66.pdf', '2021-04-08 12:41:47', 590, 7, 1, NULL),
(40, '2021-05-03', 'REPORTAN LO SIGUIENTE: A ESTE MONITOR NO LE FUNCIONA LA BATERIA Y SE PASAN MUCHOS PROBLEMAS A LA HORA DE TOMAS LOS SIGNOS VITALES A LOS PACIENTES YA QUE A VECES NO HAY DONDE CONECTAR EL EQUIPO Y TOCA SACAR A LOS PACIENTES A UN SITIO CERCA DONDE SE PUEDA CONECTAR.\r\nCIERRE:', NULL, '2021-05-03 16:40:17', 606, 8, 1, NULL),
(41, '2021-05-27', 'ESTE EQUIPO REQUERIA REVISION POR LO TANTO SE REALIZA PRESTAMOS DE OTRO MONITOR PARA CUBRIRLO.\r\nDATOS DEL MONITOR EN PRESTAMO:\r\nMONITOR DE SIGNOS VITALES\r\nGOLDWAY\r\nSERIE: CN7CABA500071', '4d5b50e9c31e6ef0f20ca11b76c48b73.pdf', '2021-05-28 17:30:26', 4945, 8, 4, '2021-12-15'),
(42, '2021-06-10', 'Se entrega equipo en contingencia con serie con serie xv840866 h, entregado por parte de la empresa j&j', 'acef2777b017715c29f093336d36e5dc.pdf', '2021-06-10 20:33:58', 2239, 7, 4, '2021-12-15'),
(43, '2021-06-15', 'MONITOR DE SIGNOS VITALES ENTRA EN CONTINGENCIA POR MONITOR CON NÚMERO DE SERIE E7200527083F Y ACTIVO FIJO EMCO4860 PRESENTA EL MENSAJE DE \"FALLO EN CABLE SPO2\" AÙN CUANDO ESTE SE ENCUENTRA DESCONECTADO DEL EQUIPO.', NULL, '2021-06-15 22:15:35', 4143, 42, 4, '2021-12-15'),
(44, '2021-08-06', 'EL EQUIPO NO MARCA VALORES (NUMERO) DE SPO2, SIN EMBARGO SI MARCA ONDA.\r\nCIERRE: SE REEMPLAZA TEMPORALMENTE PARA ATENDER EL PARAMETRO DE SPO2, CON MONITOR DRAGER VISTA 120 EMCO3938', NULL, '2021-08-06 14:46:14', 2786, 8, 4, '2021-08-06'),
(45, '2021-07-30', 'EL PRESENTE EQUIPO (EMCO4244) PRESENTA FALLAS EN EL CONECTOR DE LA MAGUERA DE PRESION\r\nCIERRE: SE INSTALA EQUIPO MARCA BLT EMCO4251', 'f55beac6fa14ae3680708ab036f71367.pdf', '2021-08-10 20:02:32', 881, 8, 4, '2021-12-15'),
(46, '2021-10-20', 'Se instala gastroscopio con serie 6G247A059 como soporte', '5954ce537354b2fd562244eba93bc622.pdf', '2021-10-21 16:08:32', 3868, 1, 4, '2021-12-15'),
(47, '2021-11-08', 'Se entrega Ethicon con serie1111351116 en contingencia mientras es efectuada la reparación', 'acc740bb2e20924b57016045c103e5df.pdf', '2021-11-08 19:57:38', 2026, 7, 4, '2021-12-15'),
(48, '2021-11-12', 'ESTE EQUIPO ENTRA EN CONTINGENCIA AL CUBÍCULO 8 DE LA UCI ADULTO NORTE POR MONITOR CON ACTIVO FIJO EMCO5159 EL CUAL FALLÓ EN SU FUNCIONAMIENTO YA QUE NO INICIALIZA Y SE QUEDA EN PANTALLA NEGRA LUEGO DEL ENCENDIDO. ', NULL, '2021-11-12 19:56:43', 4143, 42, 4, '2021-12-15'),
(49, '2021-11-26', 'Se entrega contingencia de este equipo\r\nSE CIERRA CONTINGENCIA YA QUE AL ENTREGAR EL EQUIPO SE CUBRE LA CONTINGENCIA', '24685670c486a6f5d49d0c710eaa1d39.pdf', '2021-11-29 14:59:11', 2246, 7, 4, '2021-12-15'),
(50, '2021-11-03', 'DADO QUE EL EQUIPO SE ENCUENTRA FUERA DE SERVICIO Y EN EL BANCO DE LECHE REQUIEREN DE SU DISPONIBILIDAD, SE ENTREGA EQUIPO EN CONTINGENCIA:\r\nMICROCENTRIGUGA\r\nMARCA: HETTICH\r\nMODELOñ HEMATOKRIT 210\r\nSERIE:0000170-01-00\r\nCODIGO: EMCO0919', '31e2d6623a20001b6494b9d0de8aebce.pdf', '2021-12-15 20:33:01', 150, 8, 4, '2021-12-15'),
(51, '2022-03-17', 'Se realiza entrega como contingencia de monitor de signos vitales Goldway serie: 7C5AAIV-019 en optimo estado de funcionamiento, con todos los accesorios', '1a0e6477fb0cf1b326993f8cac94ca3f.pdf', '2022-03-31 16:37:19', 873, 7, 1, NULL),
(52, '2022-04-07', 'equipo se instala en el servicio de pediatría ya que el monitor de dicho servicio se encuentra fuera de servicio puesto que no enciende', NULL, '2022-04-07 12:54:05', 769, 34, 1, NULL),
(53, '2022-05-09', 'EL SERVICIO DE OTORRINOLARINGOLOGIA SOLICITA MONITOR DE SIGNOS VITALES DIBIDO A EVENTOS CON PACIENTES PRESENTADOS.\r\nSE ENTREGA MONITOR SERIE CN7CABAS00074 EN CONTINGENCIA. SE CIERRA EN CONTINGENCIA', 'cb655aef4f68a78b0cf871bf3fe70f98.pdf', '2022-05-13 14:49:29', 0, 8, 4, '2022-05-13'),
(55, '2022-12-07', 'SE RETIRA MONITOR DE SIGNOS VITALES, MARCA: NIHON KOHDEN MODELO: VISMO; CODIGO: EMCO3624; SERIE: 0106330; PARA REPARACION DE CARCASA (TICKET 2219); SE REALIZA ENTREGA  EN CONTIGENCIA DEL MONITOR  DE SIGNOS VITALES Marca:GOLDWAY; Modelo:UT7000C\r\nSerie:CN7CABAS00080 ', NULL, '2022-12-20 18:56:03', 0, 121, 4, '2022-12-20'),
(56, '2022-12-20', 'ESTO ES UNA PRUEBA: en el servicio de uci2 requieren de manera urgente una bomba de infusión para paciente que llegó remitido.\r\nEl día de hoy se lleva bomba de infusion 0357', NULL, '2022-12-20 20:36:18', 1313, 8, 4, '2022-12-20'),
(57, '2022-12-20', 'ESTO ES UNA PRUEBA: el equipo falla A LAS 10 AM y se detiene la atención en electrodiagnostico', NULL, '2022-12-20 20:44:04', 280, 8, 4, '2022-12-20'),
(58, '2022-12-07', 'El servicio de extensión hospitalaria requieren una bomba de infusión debido al ingreso de paciente nuevo que requiere de tratamiento. \r\nSe entrega bomba de infusión id:1421', '9d2d4fcc8b96d105212bfeea98eb910d.pdf', '2022-12-26 16:19:23', 1421, 121, 4, '2022-12-07'),
(59, '2023-01-16', 'EL EQUIPO ENTRA EN CONTINGENCIA POR MONITOR ED{AN CON ACTIVO FIJO EMCO4558.', NULL, '2023-01-17 13:10:40', 2294, 42, 4, '2023-01-23'),
(60, '2023-02-22', 'Equipo entra en contingencia por monitor de signos vitales M8000A con activo fijo EMCO4283 del servicio UCI5 el cual presento daño y requirió retirar del servicio para su respectivo correctivo ticket asociado 2453', NULL, '2023-02-28 22:36:14', 1646, 121, 4, '2023-03-06'),
(61, '2023-03-07', 'Se dispone por monitor de signos vitales con activo fijo EMCO4053,\r\nEl equipo sale de contingencia debido a que  ya se soluciono el otro equipo', NULL, '2023-03-07 21:54:06', 668, 42, 4, '2023-03-23'),
(62, '2023-03-08', 'Entra en contingencia por desfibrilador con activo fijo EMCO4565\r\nSale de contingencia debido a que se apaga durante la carga. ', NULL, '2023-03-08 15:59:40', 2297, 42, 4, '2023-03-08'),
(63, '2023-03-13', 'Se deja en contingencia por monitor MINDRAY de serie: KN-73006788', NULL, '2023-04-03 12:31:38', 1741, 42, 1, NULL),
(64, '2023-03-13', 'Se pone en contingencia por monitor MINDRAY de serie: KN-73006783', NULL, '2023-04-03 12:35:09', 1740, 42, 1, NULL),
(65, '2023-04-27', ' SE DEJA EQUIPO EN CONTIGENCIA EN EL SERVICIO CIRENA  DEBIDO A QUE EL EQUIPO ACTUAL (  MONITOR DE SIGNOS VITALES, MINDRAY,   UMEC-10, S/  UMEC-10,) QUEDA FUERA DE SERVICIO POR FALTA DE ACESSORIO ESPECIFICO NEONATAL', NULL, '2023-04-27 18:56:52', 1739, 42, 4, '2023-08-08'),
(66, '2023-06-27', 'El equipo se deja en contingencia en el servicio de urgencias triage en reemplazo de monitor EMCO4556 el cual presenta daño en electroválvulas impidiendo la toma de presión no invasiva requiriendo cambio de repuestos. Ticket asociado: #3001', NULL, '2023-07-07 21:01:49', 2253, 121, 4, '2023-06-27'),
(67, '2023-07-28', 'Ventilador de transporte del servicio de ambulancia Mindray SV300 con EMCO5285 presenta falla de batería. Como contingencia, se hace cambio de bateria con Ventilador Mindray SV300 de UCI con EMCO5290. El serial de la bateria del ventilador de UCI es 2021A0503417. Se anexa soporte de préstamo de batería. ', 'c757052f0cefe8fff4721e51107a2a56.pdf', '2023-08-08 15:23:28', 5267, 258, 4, '2023-08-08'),
(68, '2023-09-08', 'se atiende llamado, se revisa equipo, se evidencia electro-valvulas pegadas, se realiza despegue de electro-valvulas, se vuelven a tomar pruebas de funcionamiento, equipo no responde correctamente. equipo queda fuera de servicio hasta la compra de electro-vaulvulas, se pone monitor de signos vitales de contigencia identificado con la serie 7C5AAIM-001; Equipo retirado es el EMCO4816 BLT q 5\r\n\r\n\r\n\r\n\r\nSE RETORNA EL EQUIPO IDENTIFICADO CON EL EMCO4816, A FUNCIONAMEINTO ', '8494892fec29a7747f082c3bf303820a.pdf', '2023-09-11 12:24:13', 705, 42, 4, '2023-09-14'),
(69, '2023-09-13', 'se atiende llamado, equipo es reportado en varias ocasiones, se realiza retiro del servicio par su revisión interna en el taller biomédico. Se pone monitor de signos vitales de contingencia identificado con la serie 7C5AAIM-001; Equipo retirado es el EMCO3606 NIHON KOHDEN', NULL, '2023-09-14 16:54:11', 0, 42, 1, NULL),
(70, '2023-09-18', 'se atiende llamado, se revisa equipo, se evidencia que no toma las señales ECG, se realiza desarme del equipo, se limpian tarjetas, se revisa componentes electrónicos  y se comprueba daño en el modulo de accesorios. Se pone monitor de signos vitales de la marca COMEN, modelo STAR 8000E de contingencia identificado con la serie E7200527059F y numero de inventario EMCO5144; Equipo retirado es el EMCO4066 DRAGER. ', NULL, '2023-09-18 20:57:47', 0, 42, 1, NULL),
(71, '2023-10-20', 'Se realiza contingencia de aspirador en el servicio de perinatologia, debido a la necesidad  de tecnología para realizar proceso de amniodrenaje. Se entrega aspirador EMCO4772 del servicio de ambulancia, mientras se realiza la compra de aspirador para el servicio. ', '55e97bcc7df02f4eae2c991c542b6911.pdf', '2023-10-23 12:46:06', 3035, 258, 1, NULL),
(72, '2024-04-18', 'Se requiere para círugia fetal inútero un ecógrafo. Equipo es devulto al servicio el 19/04/2024\r\n', 'eba637f9b7cb1c4a873d6aa86e43c013.pdf', '2024-04-18 20:33:59', 236, 258, 4, '2024-04-18'),
(73, '2024-04-09', 'Se requiere para cirugía fetal in útero un equipo de compresión vascular. ', 'cbba8fd881833e05ba4f31b6a487b81f.pdf', '2024-04-30 19:15:35', 7762, 121, 4, '2024-04-18'),
(74, '2025-02-19', 'Se requiere ecógrafo para contingencia en el servicio de sala de Imágenes Diagnosticas.  Se traslada ecógrafo de Partos en contingencia. \r\nSe devuelve el equipo el 21/02/2025', '7017d25a988924cad4f2b488351a6d06.pdf', '2025-02-21 20:33:08', 6221, 258, 4, '2025-02-21'),
(75, '2025-03-11', 'Se requiere ecógrafo en contingencia para el servicio de Imágenes Diagnosticas debido a un daño presentado en uno de los ecógrafos del servicio. ', 'f3eccc8428baeca833f799208daad992.pdf', '2025-03-19 15:26:10', 9206, 258, 4, '2025-03-19'),
(76, '2025-06-04', 'Se requiere bascula tallimetro en contingencia para el servicio de Hemato Oncologia por daño de bascula del servicio EMCO4008. Se traslada Bascula tallimetro de Urologia EMCO3790.', 'd3b24c28f2534a0448e677d1556c45ac.pdf', '2025-06-04 15:46:41', 0, 121, 4, '2025-10-03'),
(77, '2025-06-04', 'Se realiza contingencia al servicio de Hemato Oncologia en calidad de prestamo por fallo en bascula del servicio la cual debe ser dada de baja.', NULL, '2025-06-04 15:48:53', 121, 121, 4, '2025-10-03'),
(78, '2026-01-16', 'se realiza contingencia en el servicio de medicas hombres en calidad de préstamo por golpe de monitor en pantalla el cual no se cuenta con repuesto para realizar reparación.', NULL, '2026-01-17 13:19:19', 0, 42, 1, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `contingencias`
--
ALTER TABLE `contingencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipo_id` (`equipo_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `contingencias`
--
ALTER TABLE `contingencias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
