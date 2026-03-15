-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 15-03-2026 a las 18:47:23
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
-- Estructura de tabla para la tabla `archivos`
--

CREATE TABLE `archivos` (
  `id` int NOT NULL,
  `name` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

--
-- Volcado de datos para la tabla `archivos`
--

INSERT INTO `archivos` (`id`, `name`) VALUES
(1, 'Acta de entrega'),
(2, 'Permiso de importación'),
(4, 'Acta de recepción'),
(13, 'Factura de venta'),
(6, 'Garantia'),
(7, 'Orden de compra'),
(8, 'Cronograma mantenimiento preventivo'),
(9, 'Capacitacion'),
(10, 'Declaración de importación'),
(11, 'Documento de baja'),
(12, 'Salida almacen'),
(14, 'Acta de entrega empresa'),
(15, 'Documento carta interna'),
(16, 'Documento carta externa'),
(17, 'Contingencia'),
(18, 'Contrato'),
(19, 'Otros documentos de ingreso'),
(20, 'Traslado (re-asignación)'),
(21, 'Lista de checkeo recepcion'),
(22, 'Protocolo de mantenimiento'),
(23, 'Verificacion fisico-funcional'),
(24, 'Instalación'),
(25, 'Cronograma de capacitación'),
(26, 'Ficha tecnica'),
(27, 'Protocolo de limpieza y desinfección'),
(28, 'Hoja de vida empresa'),
(29, 'Inspección de fabrica'),
(30, 'Justificacion de no calibracion');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `archivos`
--
ALTER TABLE `archivos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `archivos`
--
ALTER TABLE `archivos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
