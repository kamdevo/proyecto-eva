-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 15-03-2026 a las 18:47:06
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
-- Estructura de tabla para la tabla `bajas`
--

CREATE TABLE `bajas` (
  `id` int NOT NULL,
  `fecha_baja` date DEFAULT NULL,
  `archivo` text CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `bajas`
--

INSERT INTO `bajas` (`id`, `fecha_baja`, `archivo`, `descripcion`) VALUES
(1, '2019-11-21', 'ae3a2581446540640cb5fc9526c95d70.pdf', 'Primer listado de baja Taller de mantenimiento'),
(2, '2019-11-27', '74dce6509939dd3847ae41dcd3fbba41.pdf', 'Segundo listado de baja taller de mantenimiento'),
(3, '2020-06-24', 'fe2fa9aec021e70b52e6644abb406e64.pdf', 'Se da baja al equipo porque termina el periodo de prestamo y se devuelve a la empresa Kayka'),
(4, '2020-09-10', 'baf8a796b71e5b3365aa02a1d1e5734e.pdf', 'DOCUMENTO DE BAJA, EQUIPO LAMPARA CIELITICA BERCHTOLD DE QUIROFANO 8'),
(5, '2020-09-02', 'd81a47b2e74fb33fec5c9aaaf26b74ed.pdf', 'SE ENTREGAN EQUIPOS QUE ESTABAN OBSOLETOS UBICADOS EN LA OFICINA DE MANTENIMIENTO PARA SU DISPOSICIÓN FINAL'),
(6, '2020-09-09', '5055fcb0adaa890af7fde198d6ed81d7.pdf', 'El Invima como Centro Nacional de Referencia del Programa Nacional de\r\nTecnovigilancia en el país, ha sido notificado de treinta y cuatro (34) eventos e incidentes adversos\r\nserios relacionados con fallas de funcionamiento durante el uso de Ventiladores Mecánicos -\r\nMarca Eternity - Modelo SH 300, en los cuales se informa que durante su funcionamiento dejan de\r\nciclar o se apagan de forma inesperada; adicionalmente, entregan datos alterados de los parámetros\r\nventilatorios controlados, lo cual no permite la sincronía entre paciente – ventilador, situaciones\r\nadversas que ocurrieron durante la terapia respiratoria asistida con pacientes confirmados con\r\nSARS-CoV2. Los hechos se generaron en doce (12) Instituciones Hospitalarias de diferentes\r\nciudades del país y han sido reportados desde el 31/07/2020 a la fecha por los mismos Prestadores\r\nde Servicios de Salud.\r\nEsta situación pone en riesgo la salud pública, por lo tanto, el Invima ha venido adelantando con\r\nceleridad y diligencia las investigaciones de los casos, tanto con las Instituciones Hospitalarias\r\ndonde ocurrieron los eventos adversos, como con los importadores autorizados de los Ventiladores\r\nMecánicos involucrados en los reportes.\r\nEn virtud de lo expuesto el Invima temporalmente ordena SUSPENDER LA IMPORTACIÓN,\r\nCOMERCIALIZACIÓN Y USO de TODOS los seriales de los Ventiladores Mecánicos - Marca\r\nEternity - Modelo SH 300 fabricados por la empresa Beijing Eternity Electronic Technology Co. LTD.\r\npaís de origen: China. '),
(7, '2020-10-01', '0f10176733d843f0d17ac042fafa9f70.pdf', 'BAJA EQUIPOS BODEGA DE INVENTARIOS 1 DE OCTUBRE 2020'),
(8, '2019-02-04', 'b5d8a36a08bf6eb31556e4ec0d3cb5ea.pdf', 'Concepto técnico de baja  ecógrafo aloka perinatología consultorio 1 (febrero 2019)'),
(9, '2020-11-10', 'd5fa300d626b94bc33cbe657235023fe.pdf', 'Listado de equipos del taller de mantenimiento para disposición final noviembre del 2020'),
(10, '2019-09-13', '713ff531b92f4397ff9202695fe5e80a.pdf', 'Monitor de signos vitales spacelabs 402306'),
(11, '2019-07-31', 'ce1224d74ca581d330776f62ad4b1527.pdf', 'BAJA DE MAQUINAS DE ANESTESIA 31-7-2019'),
(12, '2019-07-18', '5ba50d9d06b566a5c4ebe29d5774539f.pdf', 'BAJA EQUIPOS LABORATORIO CLINICO 18-7-2019'),
(13, '2020-07-15', 'b1b5b2a95e945e76c281bb816bd9d26f.pdf', 'FINALIZACION COMODATO EQUIPOS BIOEMDICOS'),
(14, '2020-12-17', '8a1d4329d39475a6bfa040d84c2f4ee7.pdf', 'DISPOSICIÓN FINAL POR PARTE DEL SERVICIO, TRICICLO DE ORTOPEDIA EMCO 0301'),
(15, '2020-12-18', '02d12ca8cf3e1f7d5a6743d58eba0e20.pdf', 'devolución de equipo en comodato rayos x portátil de la gobernación'),
(16, '2020-06-23', '157f23680fdd88592e8458ebc22e512e.pdf', 'DEVOLUCION  CABEZALES DE CAMARA QUE SE ENCONTRABAN EN CALIDAD DE CONTINGENCIA EN SALA DE OPERACIONES MIENTRAS ERAN REPARADOS LOS QUE ESTABAN ASIGNADOS ORIGINALMENTE EN EL COMODATO DE J&J'),
(17, '2021-01-07', 'de10d437412ced7a3bbe805414584ee4.pdf', 'DOCUMENTOS DE SALIDA Y BAJA DEL EQUIPO RAYOS X PORTATIL DE LA GOBERNACION'),
(18, '2021-01-27', 'aa43ca12fafc17e6b7f1d3371c65567c.pdf', 'DEVOLUCION DE LA MESA MEERA A LA EMPRESA'),
(19, '2021-01-04', '1331783019303a314c17da86ff51b8f8.pdf', 'Salida de 10 camas, solicitadas por la gobernación para san juan de dios'),
(20, '2021-03-23', '32ff2d35928f03fd35a3d59cecd8d888.pdf', 'SE RETIRA LA TORRE DE LAPAROSCOPIA STRYKER LA CUAL SE ENCONTRABA EN LA INSTITUCIÓN EN MODALIDAD DE DEMO CON LA EMPRESA MEDTRONIC.'),
(21, '2021-04-16', '685a57bb26f74e94a79a4b9c87062c5c.pdf', 'COMO PARTE DEL COMODATO QUE SE TIENE CON BAXTER SE PROCEDE A DAR BAJA DEL VAPORIZADODADO QUE NO SE ENCUENTRA FUNCIONAL'),
(22, '2021-02-03', '868721aba3892b2cbaa3a6a81f04a57c.pdf', 'Disposición final de extractor de plasma y 2 balanza doble plato'),
(23, '2021-01-14', 'f51361f65aa40b05ce593377d34f2c0b.pdf', 'Salida de carro de paro con desfibriladdor mediana d500, por solicitud de la gobernación '),
(24, '2021-05-28', '5ab6b859a96de10c4c464daa62eafeb9.pdf', 'Depuración inventario,  equipos baja, entrega a inventarios 28-05-2021'),
(25, '2021-06-08', '876585898f8e4948948c49b0afa0f5c4.pdf', 'Documento que soporta la salida del equipo gastroscopio pediátrico en prestamo'),
(26, '2021-01-19', '312ec5e51b8ea45c8586bce504699a26.pdf', 'Solicitud de banco de sangre de verificación para baja'),
(27, '2021-07-08', 'ceb594175a935675b78ee4caf3878d91.pdf', 'Se relaciona la disposición final de equipos biomédicos varios ubicados en el taller de inventario primer piso'),
(28, '2021-08-06', 'ba965f3e24cb8bd93bc140f6ee358987.pdf', 'Mesa de cirugía hotbo EMCO3729 de oftalmo'),
(29, '2021-08-13', 'ab5061d065bb57ff602439f455be7414.pdf', 'Se devuelve cabezal de cámara de serie XV840866 a la empresa J&J, el cual es recogido por biotronitech'),
(30, '2020-08-16', 'e78e0d6611dfcf00400b5d453e7a60b7.pdf', 'Retiro de bomba de infusion 26110096UN'),
(31, '2021-09-27', '6c6e7dd307d31168edf32c8e3f27a378.pdf', 'EL EQUIPO RETORNA A LA EMPRESA JOMEDICAL, POR TERMINO DE SOPORTE'),
(32, '2021-10-13', '9b84e18c49a00fb463d931d789b95179.pdf', 'RETIRO GASTROSCOPIO EN PRESTAMO 13-10-2021'),
(33, '2019-09-05', '1709c50c942155aff3ad3b720a1f7854.pdf', 'Baja de Arco en C Philips Pulsera 9 EMCO1230 SN 7180-95'),
(34, '2021-12-17', 'a8b3dffd035f92036aea4afc7cbcf93c.pdf', 'Bajas Equipos biomédicos mes de noviembre - diciembre 2021'),
(35, '2021-12-13', '61ee15ceaebeb7da07b7545465ee74de.pdf', 'Equipo ethicon retorna a la empresa, finaliza el periodo de soporte'),
(36, '2022-01-25', '2baef3873b05760006d809975e08a3e6.pdf', 'Se retira gastroscopio que se encontraba como soporte por parte de la empresa Jomedical'),
(37, '2022-02-01', 'c267ab2da40c11c0e26478f5b2cf27e2.pdf', 'Equipos dados de baja por obsolescencia de tecnología. Donde se incluye torre de endoscopia olympus con su monitor y electrobisturi olympus\r\n'),
(38, '2022-02-22', 'cb34a2ce09a47368f2a0712ba2a982e7.pdf', 'Salida de equipos por finalización de comodato'),
(39, '2022-01-21', '2cba28fb71ade60a9d2858da24967e60.pdf', 'Baja de  Fluoroscopio de imágenes diagnosticas'),
(40, '2022-03-23', '81df6dfe1355ebc122d2b24ce88fe40f.pdf', 'Salida de 52 bombas de infusión, que no serán reparadas y por cambio de tecnología.'),
(41, '2022-03-30', '881837a7d92c05bfa8e75bf8c88757d6.pdf', 'Salida de la institución del gastroscopio por finalización de soporte'),
(42, '2022-03-28', '93416ec22a48e4b6f829963bdfccc551.pdf', 'Salida de maquina de anestesia para cambio por garantia'),
(43, '2022-06-08', 'bee3808cf741f98270cc5183b77abce3.pdf', 'Finalización de prestamo4G314A007'),
(44, '2022-06-28', '8566d360f52d0a8d38e1708175e85622.pdf', 'Bajas equipos biomédicos junio 2022'),
(45, '2022-07-19', 'c855a00664461efaf5560ee21d2bb7d1.pdf', 'Retiro del equipo por finalización de préstamo.'),
(46, '2022-07-25', '35c4700ec3a725aaec96dde521ac415f.pdf', 'Equipo se retira del servicio por finalización de préstamo'),
(47, '2022-08-01', '9348733d30c0bb9708929366d0a834a9.pdf', 'Baja equipos taller 18/07/2022'),
(48, '2022-07-12', '37acf4edfedb38a415fa0b3e986f10ca.pdf', 'Baja lamparas cieliticas qx otorrino'),
(49, '2022-08-23', '8edeafb695a78d90e523ec548e53625a.pdf', 'Equipo retorna a Jomedical dado que termino el prestamo'),
(50, '2022-10-18', 'db0a486de59c9a113f45307e2a7a2f77.pdf', 'Se retira equipo de soporte de la institución por fuga positiva'),
(51, '2022-11-03', '646cc97a8ae5daeae64d2854d7e75234.pdf', 'Documento de disposición final equipos biomédicos taller Noviembre 2022'),
(52, '2022-11-28', '20e14b4df8aa790727aee5cf0e2b688e.pdf', 'Retiro gastroscopio en soporte sn 7g361k049'),
(53, '2022-10-14', 'e8536377b17e9ea2e6631381852f20d0.pdf', 'Se relacionan retros y el documento de soporte de la disposición final de las unidades odontológicas,'),
(54, '2022-10-14', '4fb74f71af6d87731d1a1c159a6d32e6.pdf', 'Se relacionan reportes de disposición final de 1 humidificador , 3 tensiómetros y 1 glucómetro'),
(55, '2023-02-06', '957e1f8dac1aabe752ead84535002465.pdf', 'Equipos entregados para disposicion final enero 2023'),
(56, '2023-02-03', 'f7e914962ce27edec102c5a3d25b1379.pdf', 'Disposicion final eliptica'),
(57, '2023-02-16', '86fb3be80e391d09b64444239086a94d.pdf', 'Disposición final de centrifuga de laboratorio'),
(58, '2023-02-22', 'e20c010b57cba012de846d395e1d1b5b.pdf', 'colono serie 4C496A027 de JOMEDICAL se retira porque no da imagen'),
(59, '2022-05-05', '0052d44665ae82ef795b4be0d55d33c6.pdf', 'Concepto técnico de baja de equipo: Unidad de electroterapia Chattanooga propiedad de Universidad del Valle'),
(60, '2023-03-09', '72e0e704d7c05a2b57f2647df06b8b53.pdf', 'Disposición final ureterofibroscopio univalle'),
(61, '2023-03-09', 'b63dfdaf118f9dcd343d68cdb524ba7a.pdf', 'Documento de baja manta térmica Univalle'),
(62, '2023-03-21', '7d84231fdb969429592831caedb47e51.pdf', 'Disposición final equipos biomédicos en el taller marzo del 2023'),
(63, '2022-04-13', '2a7eb6cc4106674e2c1a72e01f07417d.pdf', 'Equipos comodato banco de sangre retiro de la institución '),
(64, '2022-05-09', '82c5f24ab3bd551414769cd71594f81d.pdf', 'Retiro de la institución equipos comodato banco de sangre'),
(65, '2022-05-09', 'b9e28827822fcf24acfb57e5e76c354b.pdf', 'Retiro de la institución equipos comodato'),
(66, '2023-04-05', 'e10c4c0d4ab93c7fa8c856fa8e6c331d.pdf', 'Documento de revisión para el retiro definitivo del equipo de soporte  sn: 3g361a590'),
(67, '2023-04-04', 'e2213d448c9fd13d0976b718e70844a6.pdf', 'finalización de contingencia gastroscopio 4a124'),
(68, '2021-11-23', '2af626ff50611fb4f86e279a9296e7a2.pdf', 'Documento de disposicion final de equipo perteneciente a las damas Hebreas '),
(69, '2020-12-17', '37b8dd810f1881f719bb9356aee6aff8.pdf', 'Retiro de equipos instalados de Biocientifica en calidad de apoyo.'),
(70, '2023-04-27', '78cceeef6645b53229060a68d2804c7b.pdf', 'Bajas equipos taller abril del 2023'),
(71, '2023-05-03', '621cc3385fc51766bd1cb00dcdf286ea.pdf', 'Baja de termohigrometro '),
(72, '2023-05-03', '2b1543d235f1ea23fb11886cb7688648.pdf', 'EQUIPO SALE POR PINZA INCRUSTADA'),
(73, '2023-07-18', '8a17fd27202f428b59c665032eadc5ad.pdf', '(Colonoscopio) Finaliza contingencia, equipo se retira de la institución'),
(74, '2023-07-25', 'bfb619ca870aa4d1872c9164b6558374.pdf', ''),
(75, '2023-07-25', 'cfea4cb81fea84a5bd991cc8e4813416.pdf', 'BAJA EQUIPOS VARIOS 1'),
(76, '2023-07-25', '6124b1a505628c00ba5fb48f1df8ec80.pdf', 'BAJA EQUIPOS VARIOS 1'),
(77, '2023-10-03', '4e954e61e8db1ea546070b8953152aab.pdf', 'Retiro de la institución comodato banco de sangre '),
(78, '2023-10-10', 'fd06a3d70e5166ec78cd7188c11e11c8.pdf', 'Baja de bombas de infusión EVOIQ por imposibilidad de reparar en campo y reposición.'),
(79, '2023-11-29', '20cf89f89e5fd99bf29fc60838f10816.pdf', 'Baja pulsioximetro portátil.'),
(80, '2024-01-19', '3433cac7405b6f4811059e45e44fa07a.pdf', 'BAJAS EQUIPOS ENERO 2024'),
(81, '2024-07-18', 'e8e60b5bf7a631705ecbf4725d1aeb29.pdf', 'Baja de neveras de transporte de banco de sangre por daño en infraestructura y termómetro. '),
(82, '2024-05-27', '6fdba90c2aff38e06e10eb7640db3540.pdf', 'Salida equipos comodato biocientifica Ltda.'),
(83, '2024-10-03', 'c7d0ba9ca8ff620d0ab8ae483824a773.pdf', 'Baja tensiometros manuales por daño en manómetros. '),
(84, '2024-06-02', 'ecca64f1ececbb79cb436938b1b588b9.pdf', 'Baja tecnica'),
(85, '2024-12-09', '079abb8af1a11405ce37bb02894e716f.pdf', 'RETIRO EQUIPO QUINBERLAB HEMOCENTRO'),
(86, '2024-12-12', '6aff9b78b59b5b409b72e80048d7f05e.pdf', ' Se retira Analizador Molecular SN: IP3538 por parte del proveedor ANNAR. '),
(87, '2025-04-09', '65cfafb425cdc2b1150f3232032ccaf1.pdf', 'Se retira equipo de aféresis Trima SN: 1T00746 debido a renovación de la tecnología. '),
(88, '2025-03-21', '1536749195a18739d5d19cd008565ce3.pdf', 'SE REALIZA RELACION DE EQUIPOS DADOS DE BAJA QUE SE ENCUENTRAN EN MAL ESTADO FISICO, FUNCIONAL Y POR OBSOLESCENCIA.'),
(89, '2025-04-01', 'e119eccb06d7ef3a479ff853c9eda022.pdf', 'SE REALIZA RELACION DE EQUIPOS DE BAJA QUE SE ENCUENTRAN EN MAL ESTADO FISICO, FUNCIONAL Y POR OBSOLESCENCIA'),
(90, '2025-04-23', '1171ad323f21051259f001fcaee67376.pdf', 'Se retiran equipos de oftalmología propiedad Universidad del Valle, los cuales ya cumplieron con su vida util.'),
(91, '2025-04-01', '09d93b06445109fb3359ae65963cdaf8.pdf', 'Retiro por baja equipos UNIVALLE: Oftalmologia y sala de operaciones'),
(92, '2024-09-16', 'bca19924e8deb62b1ba86d2daf2eac98.pdf', 'SE REALIZA RELACION DE EQUIPOS DE BAJA QUE SE ENCUENTRAN EN MAL ESTADO FISICO, FUNCIONAL Y POR OBSOLESCENCIA'),
(93, '2025-06-09', '0d5e3be98a83a7759f8530e04a4df38f.pdf', 'Se realiza salida de (5) hemoglobinómetros por fin de contrato de apoyo tecnológico con ANNAR.'),
(94, '2025-06-09', 'eb7ccd20434e6bcc6cefacf01b23a41a.pdf', 'Se realiza salida de (5) hemoglobinómetros por fin de contrato de apoyo tecnológico con ANNAR.'),
(95, '2025-07-07', '08db0b96cedfd08f9bd806bb43ff20bd.pdf', 'baja lamparas cieliticas'),
(96, '2025-06-13', 'd1170a1cd2d5a9017b660bdd9ce18132.pdf', 'Baja tecnica electromiografo cadwell por obsolescencia y modalidad de retoma para adquisicion de dos nuevos electromiografos.'),
(97, '2024-09-19', '930899bb87278f7efcb74297439abda5.pdf', 'Disposición final GAMMACAMARA  Serie: 2006/ IVK5979484000979'),
(98, '2025-09-04', '7979dd59537086ba92166c89d499230b.pdf', 'ACTA DE RETIRO DE EQUIPOS EN CONDICION DE EVALUACION/PRESTAMO DE USO/COMODATO ENTRE J&J Y HUV '),
(99, '2025-09-25', 'cb1680cc1ffc3b8e5537537f57272cd5.pdf', 'Acta y reportes de baja de varios equipos: Electromiografo, blender, dopple, bascula tallimetro, bascula, monitor signos vitales, centrifuga, balanza de plato, nevera transporte, foroptero, sillon oftalmologia, ureteroscopio flexible, humidificador y regulador de vacio'),
(100, '2025-07-15', 'a59b68f62c978b937de2950beccf0dcc.pdf', 'Baja equipo de biometrica - oftalmologia'),
(101, '2025-10-18', '56711d399e973628df1a1da174875e6c.pdf', 'Baja de MAQUINA DE ANESTESIA EMCO0785'),
(102, '2024-04-12', '1b0b9576d90f1f052f98b88c6e92dce5.pdf', 'Baja de maquinas de anestesia marca DRAGER'),
(103, '2025-04-29', '5733edb017e2a6eccfde52dae22f0b35.pdf', 'Baja de ARCOS EN C y RAYOS X FIJO'),
(104, '2025-09-02', '39ff1a65f74ec3b2346c424394c45bbc.pdf', 'Dada de baja, ecografo de Hemodinamia - serie C150080725'),
(105, '2025-03-21', '2c3f7bc23b031d38a10b6b8d5a3cbd4b.pdf', 'baja del equipo analizador de hematologia S:RJ49118506'),
(106, '2025-09-15', 'bbc8c8e1eb5736a9f21af9a8c50174d2.pdf', 'BAJA DEL TERMOHIGROMETRO TH317'),
(107, '2025-03-21', 'a06b818a702a65dfe93a520aa2edbd06.pdf', 'BAJA DE MONITOR DE SIGNOS S:1997'),
(108, '2025-03-21', '273114664c0d00d6c20bdc30f63188fe.pdf', 'BAJA DE MONITOR DE SIGNOS S:01998'),
(109, '2025-05-28', '951d5401c554fba282b66ef9e93f36aa.pdf', 'DADO DE BAJA EMCO3433'),
(110, '2025-05-28', 'c86879c7532df759331bc310893b98d5.pdf', 'DADO DE BAJA EMCO2875'),
(111, '2025-10-18', '3d436fb5179a3004956c53369c58c2fb.pdf', 'DADO DE BAJA  EMCO3571'),
(112, '2025-10-18', 'b3f773ad831648fb4f0d6c663a1d6b26.pdf', 'DADO DE BAJA  EMCO0336'),
(113, '2025-10-18', '654b27fd50ea733d50f8f3929ae3832c.pdf', 'DADO DE BAJA  EMCO3225'),
(114, '2025-10-18', '8369217465f94dd1bf46d947ac3dc3a2.pdf', 'DADO DE BAJA  SPORTOP 2'),
(115, '2025-10-18', '6e9e57286d706ec16399f2325f207dc9.pdf', 'DADO DE BAJA  HUMIDIFCADOR 3300707071'),
(116, '2025-10-18', '7c002eca71eefeb533a134ff3e8ab998.pdf', 'DADO DE BAJA  HUMIDIFCADOR 3300707044'),
(117, '2025-10-17', 'f6f8ed73fce46c3ad5532d945ab54a9a.pdf', 'DADO DE BAJAA EMCO3569'),
(118, '2025-10-17', '004a35c9e7f8dc28e5c485146f9c682e.pdf', 'DADO DE BAJAA EMCO3726'),
(119, '2025-10-17', 'b854c385b74a69d3f79cc01bf6e9bbb5.pdf', 'DADO DE BAJAA EMCO1341'),
(120, '2026-02-27', '0bd93c867633754ca40680c3757daf0d.pdf', '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bajas`
--
ALTER TABLE `bajas`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bajas`
--
ALTER TABLE `bajas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
