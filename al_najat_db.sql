-- MariaDB dump 10.19-12.3.2-MariaDB, for Android (armv7-a)
--
-- Host: localhost    Database: al_najat_db
-- ------------------------------------------------------
-- Server version	12.3.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `role` varchar(30) NOT NULL,
  `module` varchar(100) NOT NULL,
  `action` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('super_admin','admin') DEFAULT 'admin',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES
(1,'admin','123456','System Administrator','super_admin','2026-07-18 17:45:20');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `admissions`
--

DROP TABLE IF EXISTS `admissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `previous_school` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admissions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `admissions` WRITE;
/*!40000 ALTER TABLE `admissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admissions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `application_documents`
--

DROP TABLE IF EXISTS `application_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_application_documents` (`application_id`),
  CONSTRAINT `fk_application_documents` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_documents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `application_documents` WRITE;
/*!40000 ALTER TABLE `application_documents` DISABLE KEYS */;
INSERT INTO `application_documents` VALUES
(85,24,'photo','1785552716091-885935977.jpg',0,NULL,'2026-08-01 02:51:56'),
(86,24,'signature','1785552716231-366097480.jpg',0,NULL,'2026-08-01 02:51:56'),
(87,24,'birth_certificate','1785552716232-325940242.pdf',0,NULL,'2026-08-01 02:51:56'),
(88,24,'tc','1785552716238-631861411.pdf',0,NULL,'2026-08-01 02:51:56'),
(89,24,'marksheet','1785552716244-246384359.pdf',0,NULL,'2026-08-01 02:51:56'),
(90,24,'aadhaar','1785552716248-30479622.pdf',0,NULL,'2026-08-01 02:51:56');
/*!40000 ALTER TABLE `application_documents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_no` varchar(30) DEFAULT NULL,
  `session` varchar(20) DEFAULT '2027',
  `full_name` varchar(100) NOT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `previous_school` varchar(150) DEFAULT NULL,
  `pen_no` varchar(50) DEFAULT NULL,
  `apaar_id` varchar(50) DEFAULT NULL,
  `siksha_setu_id` varchar(50) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_no` (`application_no`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES
(24,'ANI202600001','2026','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2003-08-01','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','Arabic Awal','Al-Jamia Ratabari','77272828','72727277287282','737377373773','Approved','2026-08-01 02:51:56');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `arsp_accounts`
--

DROP TABLE IF EXISTS `arsp_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `arsp_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `arsp_id` varchar(30) NOT NULL,
  `password` varchar(255) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `account_status` enum('Active','Inactive','Suspended') DEFAULT 'Active',
  `force_password_change` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `member_id` (`member_id`),
  UNIQUE KEY `arsp_id` (`arsp_id`),
  CONSTRAINT `fk_arsp_account_member` FOREIGN KEY (`member_id`) REFERENCES `arsp_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arsp_accounts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `arsp_accounts` WRITE;
/*!40000 ALTER TABLE `arsp_accounts` DISABLE KEYS */;
INSERT INTO `arsp_accounts` VALUES
(39,39,'ARSP000001','$2b$10$5xzwBpeVxUdVs1lOAVF6beSdhX7.ZDbZKihAXai/GWqHn3qPOZPya',NULL,'Active',0,'2026-08-04 07:12:07'),
(40,40,'ARSP000040','$2b$10$j0UxvlQNaOLIA2.JylOjM.gMFpcuW74tnUijKDSpxmUFv.LLynbRC',NULL,'Active',0,'2026-08-04 07:12:53'),
(41,41,'ARSP000041','$2b$10$risH16QQBJnEbaEKe.WRBOv954Asf.0gMNdRTOcVR5Iq1JdJPwb4q',NULL,'Active',0,'2026-08-04 07:26:17'),
(42,42,'ARSP000042','$2b$10$M9xSLd0D1tUDIxKmRwkQOe06VOE4L0A.//bitiEIC3p8AknvjTcCS',NULL,'Active',0,'2026-08-04 10:46:13'),
(43,43,'ARSP000043','$2b$10$SnCoa0iSFmSTEak21lKwx./iiQfR5ngGWh0hMaRtRsrBfFdo4U5KC',NULL,'Active',0,'2026-08-04 10:47:22'),
(44,44,'ARSP000044','$2b$10$i.jcgMIHmIIZzCZVOkg60.wt.FWLx6XVFsIS/zc/zFadn1t6cwU6K',NULL,'Active',0,'2026-08-05 04:42:22'),
(45,45,'ARSP000045','$2b$10$A2sG.IeCIW7C7DYbJ3cDFuMjGeMsuNO4BWlxiDVbWWvKRyQ0A8m2G',NULL,'Active',0,'2026-08-06 04:20:29'),
(46,46,'ARSP000046','$2b$10$5p7M0z.AsE3vdvyLcuV49uRn7DMV2mWQ9JM9Pdm07Auu9/dT0nHlu',NULL,'Active',0,'2026-08-06 06:49:20'),
(48,49,'ARSP000047','$2b$10$ij647Ii2.OrkTdTkwjxCLu/fcV71mNSre2MIaDxjQVJv8jPTuacpe',NULL,'Active',0,'2026-08-06 09:51:05');
/*!40000 ALTER TABLE `arsp_accounts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `arsp_activity_logs`
--

DROP TABLE IF EXISTS `arsp_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `arsp_activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `activity` varchar(255) NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arsp_activity_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `arsp_activity_logs` WRITE;
/*!40000 ALTER TABLE `arsp_activity_logs` DISABLE KEYS */;
INSERT INTO `arsp_activity_logs` VALUES
(1,4,'Logged in','::1','2026-08-02 20:50:09'),
(2,4,'Logged in','::1','2026-08-02 20:58:25'),
(3,4,'Logged in','::1','2026-08-02 21:05:48'),
(4,4,'Logged in','::1','2026-08-02 21:09:22'),
(5,4,'Logged in','::1','2026-08-02 21:39:48'),
(6,4,'Logged in','::1','2026-08-02 21:56:15'),
(7,4,'Logged in','::1','2026-08-02 22:07:01'),
(8,4,'Logged in','::1','2026-08-02 22:16:46'),
(9,9,'Logged in','::1','2026-08-03 02:44:15'),
(10,10,'Logged in','::1','2026-08-03 08:33:04'),
(11,38,'Logged in','::1','2026-08-03 17:29:59'),
(12,26,'Logged in','::1','2026-08-03 18:38:18'),
(13,26,'Logged in','::1','2026-08-03 19:21:41'),
(14,26,'Logged in','::1','2026-08-03 19:30:25'),
(15,26,'Logged in','::1','2026-08-03 19:30:53'),
(16,26,'Logged in','::1','2026-08-03 19:31:17'),
(17,26,'Logged in','::1','2026-08-03 19:31:45'),
(18,22,'Logged in','::1','2026-08-03 19:32:54'),
(19,26,'Logged in','::1','2026-08-03 19:39:49'),
(20,26,'Logged in','::1','2026-08-03 23:58:02'),
(21,26,'Logged in','::1','2026-08-04 00:04:29'),
(22,26,'Logged in','::1','2026-08-04 00:55:02'),
(23,26,'Logged in','::1','2026-08-04 01:04:37'),
(24,26,'Logged in','::1','2026-08-04 01:11:42'),
(25,26,'Logged in','::1','2026-08-04 01:16:12'),
(26,26,'Logged in','::1','2026-08-04 01:29:36'),
(27,26,'Logged in','::1','2026-08-04 01:56:36'),
(28,26,'Logged in','::1','2026-08-04 02:44:07'),
(29,26,'Logged in','::1','2026-08-04 02:47:20'),
(30,39,'Logged in','::1','2026-08-04 07:17:08'),
(31,41,'Logged in','::1','2026-08-04 07:29:00'),
(32,41,'Password changed','::1','2026-08-04 07:29:24'),
(33,39,'Logged in','::1','2026-08-04 09:22:49'),
(34,39,'Logged in','::1','2026-08-04 09:26:29'),
(35,39,'Logged in','::1','2026-08-04 10:15:27'),
(36,43,'Logged in','::1','2026-08-04 10:48:22'),
(37,39,'Logged in','::1','2026-08-04 17:19:36'),
(38,39,'Logged in','::1','2026-08-04 17:37:26'),
(39,39,'Logged in','::1','2026-08-04 17:55:24'),
(40,39,'Logged in','::1','2026-08-04 18:00:40'),
(41,39,'Logged in','::1','2026-08-04 18:06:51'),
(42,39,'Logged in','::1','2026-08-04 18:13:00'),
(43,39,'Logged in','::1','2026-08-04 18:19:17'),
(44,39,'Logged in','::1','2026-08-04 18:27:55'),
(45,39,'Logged in','::1','2026-08-04 18:32:40'),
(46,39,'Logged in','::1','2026-08-04 18:37:30'),
(47,39,'Logged in','::1','2026-08-04 19:14:46'),
(48,39,'Logged in','::1','2026-08-04 19:34:37'),
(49,39,'Logged in','::1','2026-08-04 19:46:47'),
(50,39,'Logged in','::1','2026-08-04 19:58:56'),
(51,39,'Logged in','::1','2026-08-04 20:05:05'),
(52,39,'Logged in','::1','2026-08-04 20:09:18'),
(53,44,'Logged in','::1','2026-08-05 12:32:05'),
(54,44,'Password changed','::1','2026-08-05 12:32:35'),
(55,44,'Logged in','::1','2026-08-05 13:13:00'),
(56,44,'Logged in','::1','2026-08-05 13:18:09'),
(57,44,'Logged in','::1','2026-08-05 14:06:27'),
(58,44,'Logged in','::1','2026-08-05 14:10:35'),
(59,44,'Logged in','::1','2026-08-05 14:26:54'),
(60,44,'Logged in','::1','2026-08-05 15:03:01'),
(61,44,'Logged in','::1','2026-08-05 15:06:55'),
(62,44,'Logged in','::1','2026-08-05 15:20:26'),
(63,44,'Logged in','::1','2026-08-05 15:29:12'),
(64,44,'Logged in','::1','2026-08-05 15:45:16'),
(65,44,'Logged in','::1','2026-08-05 15:53:03'),
(66,45,'Logged in','::1','2026-08-06 04:21:45'),
(67,45,'Password changed','::1','2026-08-06 04:21:59'),
(68,49,'Logged in','::1','2026-08-06 09:51:45'),
(69,49,'Logged in','::1','2026-08-06 09:56:24'),
(70,49,'Password changed','::1','2026-08-06 09:56:46');
/*!40000 ALTER TABLE `arsp_activity_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `arsp_committees`
--

DROP TABLE IF EXISTS `arsp_committees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `arsp_committees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `committee_name` varchar(150) NOT NULL,
  `session_name` varchar(50) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('Upcoming','Active','Completed') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arsp_committees`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `arsp_committees` WRITE;
/*!40000 ALTER TABLE `arsp_committees` DISABLE KEYS */;
INSERT INTO `arsp_committees` VALUES
(3,'EXICUTIVE COMMTTE','2026-2028','2026-08-04','2027-08-04','Active','2026-08-04 07:16:13');
/*!40000 ALTER TABLE `arsp_committees` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `arsp_designations`
--

DROP TABLE IF EXISTS `arsp_designations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `arsp_designations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section` enum('Founder','Organizing Body','Chief Adviser','Advisory Body') NOT NULL,
  `designation_name` varchar(100) NOT NULL,
  `display_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arsp_designations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `arsp_designations` WRITE;
/*!40000 ALTER TABLE `arsp_designations` DISABLE KEYS */;
INSERT INTO `arsp_designations` VALUES
(1,'Founder','Founder',1,'Active','2026-08-02 06:22:40'),
(2,'Chief Adviser','Chief Adviser',1,'Active','2026-08-02 06:22:40'),
(3,'Organizing Body','President',1,'Active','2026-08-02 06:22:40'),
(4,'Organizing Body','Working President',2,'Active','2026-08-02 06:22:40'),
(5,'Organizing Body','Vice President',3,'Active','2026-08-02 06:22:40'),
(6,'Organizing Body','General Secretary',4,'Active','2026-08-02 06:22:40'),
(7,'Organizing Body','Joint Secretary',5,'Active','2026-08-02 06:22:40'),
(8,'Organizing Body','Assistant Secretary',6,'Active','2026-08-02 06:22:40'),
(9,'Organizing Body','Organizing Secretary',7,'Active','2026-08-02 06:22:40'),
(10,'Organizing Body','Office Secretary',8,'Active','2026-08-02 06:22:40'),
(11,'Organizing Body','Treasurer',9,'Active','2026-08-02 06:22:40'),
(12,'Organizing Body','Media Secretary',10,'Active','2026-08-02 06:22:40'),
(13,'Organizing Body','IT Secretary',11,'Active','2026-08-02 06:22:40'),
(14,'Organizing Body','Education Secretary',12,'Active','2026-08-02 06:22:40'),
(15,'Organizing Body','Cultural Secretary',13,'Active','2026-08-02 06:22:40'),
(16,'Organizing Body','Executive Member',14,'Active','2026-08-02 06:22:40'),
(17,'Organizing Body','Regional Coordinator',15,'Active','2026-08-02 06:22:40'),
(18,'Advisory Body','Legal Adviser',1,'Active','2026-08-02 06:22:40'),
(19,'Advisory Body','Press Adviser',2,'Active','2026-08-02 06:22:40'),
(20,'Advisory Body','Education Adviser',3,'Active','2026-08-02 06:22:40'),
(21,'Advisory Body','IT Adviser',4,'Active','2026-08-02 06:22:40'),
(22,'Advisory Body','Financial Adviser',5,'Active','2026-08-02 06:22:40'),
(23,'Advisory Body','Medical Adviser',6,'Active','2026-08-02 06:22:40'),
(24,'Advisory Body','Cultural Adviser',7,'Active','2026-08-02 06:22:40');
/*!40000 ALTER TABLE `arsp_designations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `arsp_document_verifications`
--

DROP TABLE IF EXISTS `arsp_document_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `arsp_document_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `document_number` varchar(100) NOT NULL,
  `issue_date` date NOT NULL,
  `status` enum('Valid','Revoked') DEFAULT 'Valid',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `document_number` (`document_number`),
  KEY `member_id` (`member_id`),
  KEY `document_number_2` (`document_number`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arsp_document_verifications`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `arsp_document_verifications` WRITE;
/*!40000 ALTER TABLE `arsp_document_verifications` DISABLE KEYS */;
INSERT INTO `arsp_document_verifications` VALUES
(1,26,'Appointment Letter','ARSP-APPT-2026-ARSP000026','2026-08-03','Valid','2026-08-04 01:30:52'),
(2,39,'Appointment Letter','ARSP-APPT-2026-ARSP000001','2026-08-04','Valid','2026-08-04 07:17:13'),
(3,43,'Appointment Letter','ARSP-APPT-2026-ARSP000043','2026-08-04','Valid','2026-08-04 10:52:54'),
(4,44,'Appointment Letter','ARSP-APPT-2026-ARSP000044','2026-08-05','Valid','2026-08-05 15:55:44'),
(5,45,'Appointment Letter','ARSP-APPT-2026-ARSP000045','2026-08-06','Valid','2026-08-06 04:23:46');
/*!40000 ALTER TABLE `arsp_document_verifications` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `arsp_management_positions`
--

DROP TABLE IF EXISTS `arsp_management_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `arsp_management_positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `committee_id` int(11) NOT NULL,
  `section` enum('Founder','Organizing Body','Chief Adviser','Advisory Body') NOT NULL,
  `designation` varchar(100) NOT NULL,
  `region_id` int(11) DEFAULT NULL,
  `display_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `appointed_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_arsp_member` (`member_id`),
  KEY `fk_arsp_region` (`region_id`),
  KEY `fk_arsp_committee` (`committee_id`),
  CONSTRAINT `fk_arsp_committee` FOREIGN KEY (`committee_id`) REFERENCES `arsp_committees` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_arsp_member` FOREIGN KEY (`member_id`) REFERENCES `arsp_members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_arsp_region` FOREIGN KEY (`region_id`) REFERENCES `arsp_regions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arsp_management_positions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `arsp_management_positions` WRITE;
/*!40000 ALTER TABLE `arsp_management_positions` DISABLE KEYS */;
INSERT INTO `arsp_management_positions` VALUES
(11,39,3,'Organizing Body','Regional Coordinator',NULL,1,'Inactive','2026-08-04','2026-08-04 07:16:50'),
(12,43,3,'Organizing Body','Joint Secretary',NULL,1,'Inactive','2026-08-04','2026-08-04 10:52:44'),
(13,44,3,'Chief Adviser','Chief Adviser',NULL,1,'Inactive','2026-08-05','2026-08-05 12:30:45'),
(14,42,3,'Organizing Body','General Secretary',NULL,3,'Inactive','2026-08-05','2026-08-05 16:41:24'),
(15,41,3,'Organizing Body','General Secretary',NULL,4,'Inactive','2026-08-05','2026-08-05 16:41:52'),
(16,43,3,'Advisory Body','Education Adviser',NULL,1,'Inactive','2026-08-05','2026-08-05 16:43:03'),
(17,44,3,'Advisory Body','Education Adviser',NULL,1,'Inactive','2026-08-05','2026-08-05 16:43:37'),
(18,44,3,'Advisory Body','IT Adviser',NULL,1,'Inactive','2026-08-05','2026-08-05 16:44:17'),
(19,45,3,'Organizing Body','President',NULL,1,'Inactive','2026-08-06','2026-08-06 04:23:37'),
(20,45,3,'Chief Adviser','Chief Adviser',NULL,1,'Inactive','2026-08-06','2026-08-06 10:47:18'),
(21,45,3,'Organizing Body','Assistant Secretary',NULL,1,'Active','2026-08-06','2026-08-06 10:47:53'),
(22,44,3,'Organizing Body','Cultural Secretary',NULL,1,'Active','2026-08-06','2026-08-06 14:56:01');
/*!40000 ALTER TABLE `arsp_management_positions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `arsp_members`
--

DROP TABLE IF EXISTS `arsp_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `arsp_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` varchar(30) DEFAULT NULL,
  `registration_no` varchar(30) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `father_name` varchar(150) DEFAULT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `occupation` varchar(150) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'Indian',
  `identity_type` enum('Aadhaar','PAN','Voter ID','Passport','Driving Licence','Bank Passbook') DEFAULT NULL,
  `identity_number` varchar(100) DEFAULT NULL,
  `identity_front` varchar(255) DEFAULT NULL,
  `identity_back` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `emergency_contact_name` varchar(150) DEFAULT NULL,
  `emergency_contact_relation` varchar(100) DEFAULT NULL,
  `emergency_contact_mobile` varchar(20) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `registration_source` enum('Admin','Self') DEFAULT 'Admin',
  `approval_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `qr_code` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `member_id` (`member_id`),
  UNIQUE KEY `registration_no` (`registration_no`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arsp_members`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `arsp_members` WRITE;
/*!40000 ALTER TABLE `arsp_members` DISABLE KEYS */;
INSERT INTO `arsp_members` VALUES
(39,'ARSP000001','ARSP-REG-2026-000001','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','Male','2002-07-08','B+','Student','Indian ','Aadhaar','971829940085','1785827526691.pdf','',NULL,NULL,NULL,'Sribhumi ','Assam','788156','Sultana Begum ','Mother','6901646612','1785827526698.jpg','2026-08-03','Active','Self','Pending',NULL,NULL,'2026-08-04 07:12:06','ARSP000001.png'),
(40,'ARSP000040','ARSP-REG-2026-000040','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','Male','2008-07-07','B+','Student','Indian ','Aadhaar','971829940085','1785827572658.pdf','','6901646612','abusahedarafathh@gmail.com','Kachukhouri','Sribhumi ','Assam','788156','Sultana Begum ','Mother','6901646612','1785827572663.jpg','2026-08-04','Active','Self','Pending',NULL,NULL,'2026-08-04 07:12:52','ARSP000040.png'),
(41,'ARSP000041','ARSP-REG-2026-000041','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','Male','2004-08-04','B+','Student','Indian','Aadhaar','971829940085','1785828376742.pdf','','6901646612','abusahedarafathh@gmail.com','Kachukhouri','Sribhumi ','Assam','788156','Abu Sahed Arafath','Brother','6901646612','1785828376756.jpg','2026-08-04','Active','Self','Pending',NULL,NULL,'2026-08-04 07:26:16','ARSP000041.png'),
(42,'ARSP000042','ARSP-REG-2026-000042','Aminul Haque ','Abdul kaiyum','Samsung Nessa','Male','2008-08-04','B+','STUDENT','Indian','Bank Passbook','0626010536592','1785840372746.pdf','','6901646612','','Ratabari ','Karimganj','Assam','788735','','Single','','1785840372760.jpg','2026-08-04','Active','Self','Pending',NULL,NULL,'2026-08-04 10:46:12','ARSP000042.png'),
(43,'ARSP000043','ARSP-REG-2026-000043','Aminul Haque ','Abdul kaiyum','Samsung Nessa','Male','2008-08-04','B+','STUDENT','Indian','Bank Passbook','0626010536592','1785840442334.pdf','','6901646612','','Ratabari ','Karimganj','Assam','788735','','Single','','1785840442337.jpg','2026-08-04','Active','Self','Pending',NULL,NULL,'2026-08-04 10:47:22','ARSP000043.png'),
(44,'ARSP000044','ARSP-REG-2026-000044','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','Male','2002-08-05','B+','Student','Indian','Aadhaar','433434333333','1785904941568.pdf','','7086765437','abusahed4rafathh@gmail.com','Kasukauri','Sribhumi ','Assam','788156','Sultana ','Mother','600251506','1785904941736.jpg','2026-08-05','Active','Self','Pending',NULL,NULL,'2026-08-05 04:42:21','ARSP000044.png'),
(45,'ARSP000045','ARSP-REG-2026-000045','MD HUSSAIN AHMED BARBHUIYA','ABDUL KALAM BARBHUIYA','YEARUN NESSA','Male','2007-02-19','B+','Student','Indian','Aadhaar','987740153916','1785990028971.pdf','','9954239796','mhab19022007@gmail.com','Vill- Jalal Abad','Sribhumi ','Assam','788737','Abu Sahed Arafath','','','1785990028986.jpg','2026-08-06','Active','Self','Pending',NULL,NULL,'2026-08-06 04:20:29','ARSP000045.png'),
(46,'ARSP000046','ARSP-REG-2026-000046','Husna Begum','Jamal Uddin','Sahina Aktar','Female','2010-08-06','B+','STUDENT','Indian','Aadhaar','872863672828','1785998960260.pdf','','7087688152','arsp@gmail.com','Vill- Kachukhouri, Dist-Sribhumi, PO-Ratabari, PS-Ratabari, Assam, 788735','Sribhumi ','Assam','788156','Sahin','Brother','6764828378','1785998960277.jpg','2026-08-06','Active','Self','Pending',NULL,NULL,'2026-08-06 06:49:20','ARSP000046.png'),
(49,'ARSP000047','ARSP-REG-2026-000047','Test','Test 1','Test m','Male','2010-08-06','B+','STUDENT','Indian','Aadhaar','334677875455','1786009865165.pdf','','1234567890','abcd@gmail.com','Tttt','Tyy','Bbb','78877667','Gest','Mom','0987654321','1786009865220.jpg','2026-08-06','Active','Self','Pending',NULL,NULL,'2026-08-06 09:51:05','ARSP000047.png');
/*!40000 ALTER TABLE `arsp_members` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `arsp_regions`
--

DROP TABLE IF EXISTS `arsp_regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `arsp_regions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `region_name` varchar(150) NOT NULL,
  `region_type` enum('State','Division','District','Subdivision','Block','Area','Village','Other') DEFAULT 'Area',
  `display_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arsp_regions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `arsp_regions` WRITE;
/*!40000 ALTER TABLE `arsp_regions` DISABLE KEYS */;
INSERT INTO `arsp_regions` VALUES
(1,'Barak Valley','Division',1,'Active','2026-08-02 06:18:33'),
(2,'Sribhumi','District',2,'Active','2026-08-02 06:18:33'),
(3,'Cachar','District',3,'Active','2026-08-02 06:18:33'),
(4,'Hailakandi','District',4,'Active','2026-08-02 06:18:33'),
(5,'Ratabari','Area',5,'Active','2026-08-02 06:18:33'),
(6,'Patharkandi','Area',6,'Active','2026-08-02 06:18:33'),
(7,'Badarpur','Area',7,'Active','2026-08-02 06:18:33'),
(8,'Nilambazar','Area',8,'Active','2026-08-02 06:18:33'),
(9,'Ramkrishna Nagar','Area',9,'Active','2026-08-02 06:18:33'),
(10,'Barak Valley','Division',1,'Active','2026-08-02 06:20:10'),
(11,'Sribhumi','District',2,'Active','2026-08-02 06:20:10'),
(12,'Cachar','District',3,'Active','2026-08-02 06:20:10'),
(13,'Hailakandi','District',4,'Active','2026-08-02 06:20:10'),
(14,'Ratabari','Area',5,'Active','2026-08-02 06:20:10'),
(15,'Patharkandi','Area',6,'Active','2026-08-02 06:20:10'),
(16,'Badarpur','Area',7,'Active','2026-08-02 06:20:10'),
(17,'Nilambazar','Area',8,'Active','2026-08-02 06:20:10'),
(18,'Ramkrishna Nagar','Area',9,'Active','2026-08-02 06:20:10');
/*!40000 ALTER TABLE `arsp_regions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `arsp_settings`
--

DROP TABLE IF EXISTS `arsp_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `arsp_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_name` varchar(200) NOT NULL,
  `short_name` varchar(50) DEFAULT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `president_signature` varchar(255) DEFAULT NULL,
  `official_seal` varchar(255) DEFAULT NULL,
  `favicon` varchar(255) DEFAULT NULL,
  `primary_color` varchar(20) DEFAULT '#198754',
  `secondary_color` varchar(20) DEFAULT '#0d6efd',
  `address` text DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(30) DEFAULT NULL,
  `established_year` varchar(10) DEFAULT NULL,
  `footer_text` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arsp_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `arsp_settings` WRITE;
/*!40000 ALTER TABLE `arsp_settings` DISABLE KEYS */;
INSERT INTO `arsp_settings` VALUES
(1,'ACTIVE RURAL SOCIAL PROGRESS','ARSP ERP','Member Login Portal','1785764694319-186952819.jpg','1785871185063-367986124.jpg','1785871185114-439510712.png','1785804875914-814371692.jpg',NULL,NULL,'Kachukhouri','abusahedarafathh@gmail.com','6901646612',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-02 15:44:22','2026-08-04 19:19:45');
/*!40000 ALTER TABLE `arsp_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `book_categories`
--

DROP TABLE IF EXISTS `book_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book_categories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `book_categories` WRITE;
/*!40000 ALTER TABLE `book_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `book_categories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `book_issues`
--

DROP TABLE IF EXISTS `book_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_issues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('Issued','Returned','Late') DEFAULT 'Issued',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book_issues`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `book_issues` WRITE;
/*!40000 ALTER TABLE `book_issues` DISABLE KEYS */;
/*!40000 ALTER TABLE `book_issues` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `isbn` varchar(100) DEFAULT NULL,
  `edition` varchar(50) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `available_quantity` int(11) DEFAULT 1,
  `shelf_no` varchar(50) DEFAULT NULL,
  `status` enum('Available','Unavailable') DEFAULT 'Available',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`category_id`) REFERENCES `book_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `certificate_no` varchar(50) NOT NULL,
  `student_id` int(11) NOT NULL,
  `certificate_type` enum('Transfer Certificate','Character Certificate','Bonafide Certificate','Study Certificate','Fee Clearance Certificate','Migration Certificate','Experience Certificate') NOT NULL,
  `issue_date` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_no` (`certificate_no`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES
(9,'CERT-000001',19,'Transfer Certificate','2026-08-04','This is tranfer certificate','2026-08-04 10:56:53','2026-08-04 10:56:53');
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `chairman_message`
--

DROP TABLE IF EXISTS `chairman_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `chairman_message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `designation` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `display_order` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chairman_message`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `chairman_message` WRITE;
/*!40000 ALTER TABLE `chairman_message` DISABLE KEYS */;
INSERT INTO `chairman_message` VALUES
(2,'SAHID AHMED','CHAIRMAN','I am testing','1785840062209-967713539.jpg','2026-08-04 10:41:02','2026-08-04 10:41:02','Active',1);
/*!40000 ALTER TABLE `chairman_message` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `chancellor_messages`
--

DROP TABLE IF EXISTS `chancellor_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `chancellor_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `designation` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `display_order` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chancellor_messages`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `chancellor_messages` WRITE;
/*!40000 ALTER TABLE `chancellor_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chancellor_messages` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_name` varchar(100) NOT NULL,
  `class_code` varchar(20) NOT NULL,
  `section` varchar(20) DEFAULT NULL,
  `academic_session` varchar(20) NOT NULL,
  `class_teacher` varchar(150) DEFAULT NULL,
  `capacity` int(11) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES
(7,'عربی دوم','ARB-2','A','2025-26','ARAFATH',40,2,'Active','2026-08-01 01:31:49','2026-08-01 04:29:32'),
(16,'عربی اول','ARB-01','A','2025-26','ARAFATH',50,1,'Active','2026-08-01 02:28:38','2026-08-01 02:28:38');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fee_categories`
--

DROP TABLE IF EXISTS `fee_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_categories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fee_categories` WRITE;
/*!40000 ALTER TABLE `fee_categories` DISABLE KEYS */;
INSERT INTO `fee_categories` VALUES
(2,'Admission Fee',200.00,'Hshshshh','Active','2026-08-01 01:10:09','2026-08-01 01:10:09'),
(3,'Exam Fees',200.00,'None is allowed without exam fees.','Active','2026-08-01 04:36:18','2026-08-01 04:36:18');
/*!40000 ALTER TABLE `fee_categories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fee_payments`
--

DROP TABLE IF EXISTS `fee_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_payments` (
  `receipt_no` varchar(50) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `fee_category_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `fine` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `payment_method` enum('Cash','UPI','Bank Transfer','Cheque') DEFAULT 'Cash',
  `payment_status` enum('Paid','Pending','Failed') DEFAULT 'Paid',
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `fee_category_id` (`fee_category_id`),
  KEY `fk_fee_payments_class` (`class_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_2` FOREIGN KEY (`fee_category_id`) REFERENCES `fee_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fee_payments_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fee_payments` WRITE;
/*!40000 ALTER TABLE `fee_payments` DISABLE KEYS */;
INSERT INTO `fee_payments` VALUES
('ALN-2026-000001',1,19,16,2,200.00,0.00,0.00,'Cash','Paid',NULL,'2026-07-28','This is test recipt','2026-08-01 04:02:27'),
('ALN-2026-000002',2,19,7,3,100.00,0.00,0.00,'UPI','Paid',NULL,'2026-07-31',NULL,'2026-08-01 04:37:00');
/*!40000 ALTER TABLE `fee_payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fee_receipts`
--

DROP TABLE IF EXISTS `fee_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_receipts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receipt_no` varchar(50) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_no` (`receipt_no`),
  KEY `payment_id` (`payment_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`payment_id`) REFERENCES `fee_payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_receipts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fee_receipts` WRITE;
/*!40000 ALTER TABLE `fee_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `fee_receipts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `gallery_albums`
--

DROP TABLE IF EXISTS `gallery_albums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_albums` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_albums`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `gallery_albums` WRITE;
/*!40000 ALTER TABLE `gallery_albums` DISABLE KEYS */;
INSERT INTO `gallery_albums` VALUES
(5,'Hdhdj','Hsjsj','1785411755362-334165103.jpg','Active','2026-07-30 11:42:35');
/*!40000 ALTER TABLE `gallery_albums` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `gallery_images`
--

DROP TABLE IF EXISTS `gallery_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `album_id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `album_id` (`album_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`album_id`) REFERENCES `gallery_albums` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_images`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `gallery_images` WRITE;
/*!40000 ALTER TABLE `gallery_images` DISABLE KEYS */;
INSERT INTO `gallery_images` VALUES
(67,5,'1785412001682-761895517.png','','2026-07-30 11:46:41'),
(68,5,'1785412001687-770421631.png','','2026-07-30 11:46:41'),
(69,5,'1785412001711-540331310.png','','2026-07-30 11:46:41');
/*!40000 ALTER TABLE `gallery_images` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `hero_sliders`
--

DROP TABLE IF EXISTS `hero_sliders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `hero_sliders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `display_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_sliders`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `hero_sliders` WRITE;
/*!40000 ALTER TABLE `hero_sliders` DISABLE KEYS */;
INSERT INTO `hero_sliders` VALUES
(7,'RTSE ADVERTISEMENT','','','','1785613470174-1484988.jpg',1,'Active','2026-08-01 19:44:30','2026-08-04 11:14:43');
/*!40000 ALTER TABLE `hero_sliders` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `honour_heart_awardees`
--

DROP TABLE IF EXISTS `honour_heart_awardees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `honour_heart_awardees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `award_year` varchar(20) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `award_category` varchar(150) DEFAULT NULL,
  `legend_id` int(11) DEFAULT NULL,
  `biography` longtext DEFAULT NULL,
  `achievements` longtext DEFAULT NULL,
  `citation` longtext DEFAULT NULL,
  `ceremony_date` date DEFAULT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `status` enum('Previous','Upcoming') DEFAULT 'Previous',
  `popup` enum('Yes','No') DEFAULT 'No',
  `published` enum('Yes','No') DEFAULT 'No',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `legend_id` (`legend_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`legend_id`) REFERENCES `honour_heart_legends` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `honour_heart_awardees`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `honour_heart_awardees` WRITE;
/*!40000 ALTER TABLE `honour_heart_awardees` DISABLE KEYS */;
INSERT INTO `honour_heart_awardees` VALUES
(1,'2026','1785983179647.jpg','Abu Sahed Arafath','Testing Description','Assam','India','Award category testing',1,'','','','2026-08-06','Ratabari, Kazir Bazar','Upcoming','No','Yes','2026-08-06 02:26:19','2026-08-06 03:05:14');
/*!40000 ALTER TABLE `honour_heart_awardees` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `honour_heart_legends`
--

DROP TABLE IF EXISTS `honour_heart_legends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `honour_heart_legends` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `photo` varchar(255) NOT NULL,
  `name` varchar(150) NOT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `slug` varchar(180) DEFAULT NULL,
  `biography` longtext DEFAULT NULL,
  `display_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `honour_heart_legends`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `honour_heart_legends` WRITE;
/*!40000 ALTER TABLE `honour_heart_legends` DISABLE KEYS */;
INSERT INTO `honour_heart_legends` VALUES
(1,'1785969789180.jpg','ABU SAHED ARAFATH','CHAIRMAN','Chief Adviser','Testing biography',1,'Active','2026-08-05 22:43:09','2026-08-05 22:43:09'),
(2,'1785988812685.jpg','ABU SAHED ARAFATH','Principal','Abdul-Kalam','Biography testing',1,'Active','2026-08-06 04:00:12','2026-08-06 04:00:12'),
(4,'1785988890143.png','RABIA BEGUM','Member','Chairmen','This is biography',1,'Active','2026-08-06 04:01:30','2026-08-06 04:01:30');
/*!40000 ALTER TABLE `honour_heart_legends` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `honour_heart_selection_board`
--

DROP TABLE IF EXISTS `honour_heart_selection_board`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `honour_heart_selection_board` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `photo` varchar(255) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `organisation` varchar(150) DEFAULT NULL,
  `display_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `honour_heart_selection_board`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `honour_heart_selection_board` WRITE;
/*!40000 ALTER TABLE `honour_heart_selection_board` DISABLE KEYS */;
INSERT INTO `honour_heart_selection_board` VALUES
(1,'1785988985013.jpg','ABU SAHED ARAFATH','Testing Designation','ARSP NGO',1,'Active','2026-08-06 04:03:05','2026-08-06 04:03:05'),
(2,'1785989045573.jpg','RABIA BEGUM','Principal','ARSP NGO',1,'Active','2026-08-06 04:04:05','2026-08-06 04:04:05');
/*!40000 ALTER TABLE `honour_heart_selection_board` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `honour_heart_settings`
--

DROP TABLE IF EXISTS `honour_heart_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `honour_heart_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `about_title` varchar(255) DEFAULT NULL,
  `about_description` longtext DEFAULT NULL,
  `hero_banner` varchar(255) DEFAULT NULL,
  `popup_title` varchar(255) DEFAULT NULL,
  `popup_description` longtext DEFAULT NULL,
  `popup_enabled` enum('Yes','No') DEFAULT 'No',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `honour_heart_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `honour_heart_settings` WRITE;
/*!40000 ALTER TABLE `honour_heart_settings` DISABLE KEYS */;
INSERT INTO `honour_heart_settings` VALUES
(1,'Arafat','Testing the description','1785989188612.png','Next awardee','Testing next award popup description','Yes');
/*!40000 ALTER TABLE `honour_heart_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `identity_card_settings`
--

DROP TABLE IF EXISTS `identity_card_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `identity_card_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `institution_name` varchar(200) DEFAULT NULL,
  `organization_name` varchar(200) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `background` varchar(255) DEFAULT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `seal` varchar(255) DEFAULT NULL,
  `theme_color` varchar(30) DEFAULT '#0d47a1',
  `footer_text` varchar(255) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `website` varchar(200) DEFAULT NULL,
  `qr_enabled` enum('Yes','No') DEFAULT 'Yes',
  `card_width` int(11) DEFAULT 320,
  `card_height` int(11) DEFAULT 520,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `identity_card_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `identity_card_settings` WRITE;
/*!40000 ALTER TABLE `identity_card_settings` DISABLE KEYS */;
INSERT INTO `identity_card_settings` VALUES
(1,NULL,NULL,NULL,'1785932966008-185739889.jpg',NULL,NULL,'#0d47a1',NULL,NULL,NULL,'Yes',520,320,'2026-08-05 12:29:26');
/*!40000 ALTER TABLE `identity_card_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `institutional_personalities`
--

DROP TABLE IF EXISTS `institutional_personalities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `institutional_personalities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `photo` varchar(255) NOT NULL,
  `message_title` varchar(150) NOT NULL,
  `name` varchar(150) NOT NULL,
  `designation` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `message` longtext NOT NULL,
  `biography` longtext NOT NULL,
  `message_button_text` varchar(100) DEFAULT 'Read Full Message',
  `biography_button_text` varchar(100) DEFAULT 'See Biography',
  `show_homepage` enum('Yes','No') DEFAULT 'Yes',
  `display_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `institutional_personalities`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `institutional_personalities` WRITE;
/*!40000 ALTER TABLE `institutional_personalities` DISABLE KEYS */;
INSERT INTO `institutional_personalities` VALUES
(1,'1785959680497.jpg','Chief Adviser\'Massage','ABU SAHED ARAFAT','Chief Adviser','Chief Adviser','Dear Friends, Supporters, and Partners,\r\nAt the heart of every thriving community lies a shared commitment to compassion, equity, and sustainable progress. I am deeply proud of the transformative work our organization continues to drive—empowering individuals, uplifting communities, and creating lasting social change.\r\nReal impact is never achieved alone. It is powered by the unwavering dedication of our team, the trust of the communities we serve, and the generosity of our supporters. As we look ahead, let us remain steadfast in our mission to turn hope into meaningful action and build a brighter, more equitable world for all.\r\nThank you for walking this journey with us.\r\nWith warm regards,\r\nAbu Shahid Arafat','Hahahsj','Read Full Message','See Biography','Yes',1,'Active','2026-08-05 19:54:40','2026-08-05 20:26:25'),
(4,'1786017173759.jpg','Chief Controller\'s Massage','ABU MD SAHID AHMED','CHIEF CONTROLLER','Cotroller','Chief Controller\'s Message\r\n\r\nIt gives me immense pleasure to welcome all students, parents, teachers, and well-wishers to our institution. Our commitment is to conduct every academic and examination-related activity with the highest standards of fairness, transparency, and integrity.\r\n\r\nExaminations are not merely a measure of academic achievement but also an opportunity for students to demonstrate their dedication, discipline, and potential. We strive to ensure that every examination is conducted in a secure, impartial, and well-organized manner, providing equal opportunities for all candidates.\r\n\r\nI encourage every student to prepare with confidence, maintain honesty throughout the examination process, and uphold the values of sincerity and hard work. Success is achieved not only through knowledge but also through perseverance and ethical conduct.\r\n\r\nOn behalf of the Examination Department, I extend my best wishes to all candidates for their academic journey and future success.\r\n\r\nWith best regards,\r\n\r\nChief Controller of Examinations','Na','Read Full Message','See Biography','Yes',1,'Active','2026-08-06 11:52:53','2026-08-06 11:52:53');
/*!40000 ALTER TABLE `institutional_personalities` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES
(3,'Testing news','I am testing news','1785600662176-757538093.pdf','2026-08-01','Active','2026-08-01 16:11:02'),
(4,'Test 2','This is for testing 2nd time','1785617280401-129379124.png','2026-08-02','Active','2026-08-01 20:48:00');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file` varchar(255) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
INSERT INTO `notices` VALUES
(7,'ARSP MEETING','Today our organization is going to have a press meeting on Ratabari Railway station. So all the members are here by requested to attend the meeting.','1785945831713-356384331.pdf','2026-08-05','Active','2026-08-01 16:10:22','2026-08-05 16:03:51'),
(8,'RTSE EXAM NOTICE','Tomorrow is our RTSE Exam all the members are requested to attend the centre before the examination.','1785945911869-283187838.pdf','2026-08-05','Active','2026-08-05 16:05:12','2026-08-05 16:05:12');
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `principal_messages`
--

DROP TABLE IF EXISTS `principal_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `principal_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `designation` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `display_order` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `principal_messages`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `principal_messages` WRITE;
/*!40000 ALTER TABLE `principal_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `principal_messages` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `quick_access`
--

DROP TABLE IF EXISTS `quick_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `quick_access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `icon` varchar(50) NOT NULL,
  `link` varchar(255) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quick_access`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `quick_access` WRITE;
/*!40000 ALTER TABLE `quick_access` DISABLE KEYS */;
INSERT INTO `quick_access` VALUES
(1,'Online Admission','Apply online for admission.','fas fa-user-plus','/admission',1,'Active','2026-08-01 10:16:54','2026-08-01 10:16:54'),
(2,'Student Portal','Student dashboard and services.','fas fa-user-graduate','/student/login',2,'Active','2026-08-01 10:16:54','2026-08-01 10:16:54'),
(3,'Curriculum','View curriculum.','fas fa-book','/curriculum',3,'Active','2026-08-01 10:16:54','2026-08-01 10:16:54'),
(4,'Syllabus','Download syllabus.','fas fa-book-open','/syllabus',4,'Active','2026-08-01 10:16:54','2026-08-01 10:16:54'),
(5,'Academic Calendar','View academic calendar.','fas fa-calendar','/academic-calendar',5,'Active','2026-08-01 10:16:54','2026-08-01 10:16:54'),
(6,'Downloads','Download important documents.','fas fa-download','/downloads',6,'Active','2026-08-01 10:16:54','2026-08-01 10:16:54'),
(7,'Test','Click here to go to library','Fa fa-library','/Librarry',4,'Active','2026-08-02 07:27:02','2026-08-02 07:27:02');
/*!40000 ALTER TABLE `quick_access` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `rtse_applications`
--

DROP TABLE IF EXISTS `rtse_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rtse_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_no` varchar(20) DEFAULT NULL,
  `application_year` year(4) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `father_name` varchar(150) DEFAULT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `school_name` varchar(255) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `class` int(11) NOT NULL,
  `section` char(1) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `identity_document` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `roll_no` varchar(20) DEFAULT NULL,
  `admit_generated` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `room_no` int(11) DEFAULT NULL,
  `seat_no` int(11) DEFAULT NULL,
  `archive` tinyint(1) NOT NULL DEFAULT 0,
  `pincode` varchar(10) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `archived_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_no` (`registration_no`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rtse_applications`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `rtse_applications` WRITE;
/*!40000 ALTER TABLE `rtse_applications` DISABLE KEYS */;
INSERT INTO `rtse_applications` VALUES
(1,'ARSP2600001',2026,'Abu Sahed Arafath','Jamal Uddin','Sultana Begum','Male','2003-08-07','6901646612','abusahedarafathh@gmail.com','Al-Jamia Ratabari','Sribhumi ','Assam',7,'B','1786080721775-736977875.jpg','1786080721873-124839229.pdf','Rejected',NULL,0,'2026-08-07 05:32:01',NULL,NULL,0,'788156','Kachukhouri',NULL),
(2,'ARSP2600002',2026,'Kawsar Ahmed','Jamal Uddin','Samsung Nessa','Male','2004-08-07','9577986639','abusahedarafathh@gmail.com','Al-Amin','Sribhumi ','Assam',4,'A','1786082609772-860119255.jpg','1786082609829-504757599.pdf','Approved','RTSE26-1007',1,'2026-08-07 06:03:29',1,7,0,'788156','Kachukhouri',NULL),
(3,'ARSP2600003',2026,'Kafil uddin','Samul Haque','Samrun','Male','2005-08-07','1234567890','hgahah@gmal.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786082752837-491575733.jpg','1786082752842-261744708.pdf','Approved','RTSE26-1006',1,'2026-08-07 06:05:52',1,6,0,'788156','Kachukhouri',NULL),
(4,'ARSP2600004',2026,'Rahima Khanam','Samim ahmed','Suhana','Male','2016-08-07','727727277','hshshhs@gmai.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786082850196-675588.png','1786082850251-884572343.pdf','Approved','RTSE26-1008',1,'2026-08-07 06:07:30',1,8,0,'788156','Kachukhouri',NULL),
(5,'ARSP2600005',2026,'Rahima Khanam','Samim ahmed','Suhana','Male','2016-08-07','727727277','hshshhs@gmai.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786082855071-350856868.png','1786082855129-277770041.pdf','Approved','RTSE26-1009',1,'2026-08-07 06:07:35',1,9,0,'788156','Kachukhouri',NULL),
(6,'ARSP2600006',2026,'Rahima Khanam','Samim ahmed','Suhana','Male','2016-08-07','727727277','hshshhs@gmai.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786082859257-880823612.png','1786082859292-944466393.pdf','Approved','RTSE26-1010',1,'2026-08-07 06:07:39',1,10,0,'788156','Kachukhouri',NULL),
(7,'ARSP2600007',2026,'Marzia Kahanam','Samim ahmed','Suhana','Male','2015-08-07','727727277','hshshhs@gmai.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786082886706-285052221.png','1786082886735-664327869.pdf','Rejected',NULL,0,'2026-08-07 06:08:06',NULL,NULL,0,'788156','Kachukhouri',NULL),
(8,'ARSP2600008',2026,'Amina Begum','Samim ahmed','Suhana','Male','2015-08-07','727727277','hshshhs@gmai.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786082920176-836798812.png','1786082920210-234099302.pdf','Approved','RTSE26-1004',1,'2026-08-07 06:08:40',1,4,0,'788156','Kachukhouri',NULL),
(9,'ARSP2600009',2026,'Afsana Begum','Samim ahmed','Suhana','Male','2015-08-07','727727277','hshshhs@gmai.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786082939567-877370364.png','1786082939604-401889889.pdf','Pending',NULL,0,'2026-08-07 06:08:59',NULL,NULL,1,'788156','Kachukhouri','2026-08-07 12:29:29'),
(10,'ARSP2600010',2026,'Abu Sahed Arafath','Jamal Uddin','Sultana Begum','Male','2003-08-07','6901646612','abusahedarafathh@gmail.com','Al-Jamia Ratabari','Sribhumi ','Assam',7,'B','1786083017353-114275647.jpg','1786083017375-994335117.pdf','Rejected',NULL,0,'2026-08-07 06:10:17',NULL,NULL,0,'788156','Kachukhouri',NULL),
(11,'ARSP2600011',2026,'Abu Sahed Arafath','Jamal Uddin','Sultana Begum','Male','2003-08-07','6901646612','abusahedarafathh@gmail.com','Al-Jamia Ratabari','Sribhumi 123','Assam',7,'B','1786083019742-748486681.jpg','1786083019747-631176815.pdf','Rejected',NULL,0,'2026-08-07 06:10:19',NULL,NULL,0,'788156','Kachukhouri',NULL),
(12,'ARSP2600012',2026,'Abu Saged','Jamal Uddin','Sofiya Begum','Male','2013-08-07','6901646612','abusahedarafathh@gmail.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786091041821-801604319.jpg','1786091041839-490207627.pdf','Approved','RTSE26-1002',1,'2026-08-07 08:24:01',1,2,0,'788156','Kachukhouri',NULL),
(13,'ARSP2600013',2026,'Abu Saged','Jamal Uddin','Sofiya Begum','Male','2013-08-07','6901646612','abusahedarafathh@gmail.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786091048004-580000656.jpg','1786091048009-318906512.pdf','Approved','RTSE26-1003',1,'2026-08-07 08:24:08',1,3,0,'788156','Kachukhouri',NULL),
(14,'ARSP2600014',2026,'Aagmed Sakir','Jamal Uddin','Sofiya Begum','Male','2013-08-07','6901646612','abusahedarafathh@gmail.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786091079177-245835898.jpg','1786091079181-938475445.pdf','Approved','RTSE26-1001',1,'2026-08-07 08:24:39',1,1,0,'788156','Kachukhouri',NULL),
(15,'ARSP2600015',2026,'Arif Uddin','Jamal Uddin','Sofiya Begum','Male','2013-08-07','6901646612','abusahedarafathh@gmail.com','Al-Jamia Ratabari','Sribhumi ','Assam',4,'A','1786091098168-347791504.jpg','1786091098172-941300315.pdf','Approved','RTSE26-1005',1,'2026-08-07 08:24:58',1,5,0,'788156','Kachukhouri',NULL);
/*!40000 ALTER TABLE `rtse_applications` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `rtse_certificates`
--

DROP TABLE IF EXISTS `rtse_certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rtse_certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `certificate_no` varchar(30) DEFAULT NULL,
  `certificate_type` enum('Participation','Merit','Gold','Silver','Bronze','Appreciation') DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_no` (`certificate_no`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`application_id`) REFERENCES `rtse_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rtse_certificates`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `rtse_certificates` WRITE;
/*!40000 ALTER TABLE `rtse_certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `rtse_certificates` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `rtse_exam_settings`
--

DROP TABLE IF EXISTS `rtse_exam_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rtse_exam_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_name` varchar(200) DEFAULT NULL,
  `exam_year` int(11) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `reporting_time` time DEFAULT NULL,
  `exam_start_time` time DEFAULT NULL,
  `exam_end_time` time DEFAULT NULL,
  `result_publish_date` date DEFAULT NULL,
  `certificate_publish_date` date DEFAULT NULL,
  `application_start_date` date DEFAULT NULL,
  `application_end_date` date DEFAULT NULL,
  `exam_centre` text DEFAULT NULL,
  `controller_name` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rtse_exam_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `rtse_exam_settings` WRITE;
/*!40000 ALTER TABLE `rtse_exam_settings` DISABLE KEYS */;
INSERT INTO `rtse_exam_settings` VALUES
(1,'RATABARI TALLENT SEARCH EXAMINATION',2026,'2026-09-20','21:30:00','22:00:00','13:00:00','2026-11-01','2026-10-01','2026-08-07','2026-09-17','Ratabari Higher Secondary School','Najrul Islam');
/*!40000 ALTER TABLE `rtse_exam_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `rtse_results`
--

DROP TABLE IF EXISTS `rtse_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rtse_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application_id` int(11) NOT NULL,
  `marks` decimal(6,2) DEFAULT NULL,
  `percentage` decimal(6,2) DEFAULT NULL,
  `grade` varchar(5) DEFAULT NULL,
  `rank_no` int(11) DEFAULT NULL,
  `result_status` enum('Pass','Fail','Absent') DEFAULT 'Pass',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `section_rank` int(11) DEFAULT NULL,
  `overall_rank` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`application_id`) REFERENCES `rtse_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rtse_results`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `rtse_results` WRITE;
/*!40000 ALTER TABLE `rtse_results` DISABLE KEYS */;
INSERT INTO `rtse_results` VALUES
(1,1,50.00,50.00,'C',NULL,'Pass','2026-08-07 12:06:02',NULL,NULL),
(2,2,90.00,90.00,'A+',NULL,'Pass','2026-08-07 12:06:28',NULL,NULL),
(3,3,52.00,52.00,'C',NULL,'Pass','2026-08-07 12:06:41',NULL,NULL);
/*!40000 ALTER TABLE `rtse_results` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `rtse_settings`
--

DROP TABLE IF EXISTS `rtse_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rtse_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_year` year(4) NOT NULL,
  `registration_prefix` varchar(10) DEFAULT 'ARSP',
  `registration_digits` int(11) DEFAULT 5,
  `roll_prefix` varchar(10) DEFAULT 'RTSE',
  `application_open` tinyint(1) DEFAULT 1,
  `admit_publish` tinyint(1) DEFAULT 0,
  `result_publish` tinyint(1) DEFAULT 0,
  `certificate_publish` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rtse_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `rtse_settings` WRITE;
/*!40000 ALTER TABLE `rtse_settings` DISABLE KEYS */;
INSERT INTO `rtse_settings` VALUES
(1,2026,'ARSP',5,'RTSE',0,0,1,1);
/*!40000 ALTER TABLE `rtse_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `institution_name` varchar(255) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `favicon` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES
(1,'ACTIVE RURAL SOCIAL PROGRESS','','1785745617201-319484230.jpg',NULL,'Active','2026-08-03 08:26:57');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `student_users`
--

DROP TABLE IF EXISTS `student_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `student_users` WRITE;
/*!40000 ALTER TABLE `student_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `application_id` int(11) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `previous_school` varchar(150) DEFAULT NULL,
  `admission_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES
(19,'ANI20260001',24,'Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2003-08-01','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','Arabic Awal','Al-Jamia Ratabari','2026-08-01','Active','1785552716091-885935977.jpg','2026-08-01 02:52:32');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` varchar(30) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `father_name` varchar(150) DEFAULT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `experience` int(11) DEFAULT 0,
  `salary` decimal(10,2) DEFAULT 0.00,
  `address` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `teacher_id` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES
(1,'TANI0001','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','Male','2002-07-30','6901646612','abusahedarafathh@gmail.com','BA, D.El.Ed','History','CHAIRMAN',NULL,'2026-07-30',0,255555.00,'Kachukhouri, uhhjhghjjjg, ggnycbgghh, uhnihnkjjjg, hhhjiyeetr, steady, ','1785565506025.png','Active','2026-08-01 06:25:06','2026-08-01 06:26:07');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `transport_routes`
--

DROP TABLE IF EXISTS `transport_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_routes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `route_code` varchar(20) NOT NULL,
  `route_name` varchar(150) NOT NULL,
  `start_point` varchar(150) NOT NULL,
  `end_point` varchar(150) NOT NULL,
  `distance` decimal(6,2) NOT NULL DEFAULT 0.00,
  `estimated_time` varchar(30) DEFAULT NULL,
  `fare` decimal(10,2) DEFAULT 0.00,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_routes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `transport_routes` WRITE;
/*!40000 ALTER TABLE `transport_routes` DISABLE KEYS */;
INSERT INTO `transport_routes` VALUES
(2,'','Ratabari route','Kazir Bazar','Al-Najat National Institution',0.00,NULL,NULL,'Active','2026-07-31 23:52:31','2026-07-31 23:52:31'),
(3,'','Ratabari route','Kazir Bazar','Al-Najat National Institution',0.00,NULL,NULL,'Active','2026-08-01 04:38:35','2026-08-01 04:38:35');
/*!40000 ALTER TABLE `transport_routes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','teacher','student','parent') NOT NULL,
  `reference_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'admin','$2b$10$W28gzXwmq6fKSYmKeu1/Fe4A9EuiL8WPlHCmtQqVDp3QAo8uV7fBy','admin',1,'Active','2026-07-29 16:15:59');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `route_id` int(11) DEFAULT NULL,
  `vehicle_name` varchar(150) NOT NULL,
  `vehicle_number` varchar(100) NOT NULL,
  `vehicle_type` enum('Bus','Van','Car') DEFAULT 'Bus',
  `capacity` int(11) DEFAULT 0,
  `driver_name` varchar(150) DEFAULT NULL,
  `driver_mobile` varchar(20) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicle_number` (`vehicle_number`),
  KEY `route_id` (`route_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES
(2,2,'MARJAN','7778888','Bus',20,'Jamil Ahmed','6901646612','Active','2026-08-01 04:41:13','2026-08-01 04:41:13');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `website_menus`
--

DROP TABLE IF EXISTS `website_menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `website_menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `menu_title` varchar(100) NOT NULL,
  `menu_url` varchar(255) NOT NULL,
  `menu_icon` varchar(100) DEFAULT NULL,
  `target` enum('_self','_blank') DEFAULT '_self',
  `display_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`parent_id`) REFERENCES `website_menus` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `website_menus`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `website_menus` WRITE;
/*!40000 ALTER TABLE `website_menus` DISABLE KEYS */;
INSERT INTO `website_menus` VALUES
(1,NULL,'Home','/',NULL,'_self',1,'Active','2026-08-02 08:37:06'),
(2,NULL,'About','/about',NULL,'_self',2,'Active','2026-08-02 08:37:06'),
(3,NULL,'Admission','/admission','','_self',3,'Inactive','2026-08-02 08:37:06'),
(4,NULL,'Gallery','/gallery',NULL,'_self',4,'Active','2026-08-02 08:37:06'),
(5,NULL,'Latest News','/news',NULL,'_self',5,'Active','2026-08-02 08:37:06'),
(6,NULL,'Latest Notice','/notice',NULL,'_self',6,'Active','2026-08-02 08:37:06'),
(8,NULL,'TEAM ARSP','/arsp/team','','_self',3,'Active','2026-08-02 22:42:27'),
(9,NULL,'MEMBER LOGIN','/arsp/login','fa-login','_self',2,'Active','2026-08-03 02:39:19'),
(10,NULL,'MEMBERSHIP REGISTRATION','/arsp/register','','_self',1,'Active','2026-08-04 06:45:57'),
(11,NULL,'ARSP HONOUR HEART','/honour-heart','fa-bars','_self',1,'Active','2026-08-05 22:44:58');
/*!40000 ALTER TABLE `website_menus` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `website_quick_buttons`
--

DROP TABLE IF EXISTS `website_quick_buttons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `website_quick_buttons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `subtitle` varchar(150) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  `button_color` varchar(20) DEFAULT 'primary',
  `display_order` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `website_quick_buttons`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `website_quick_buttons` WRITE;
/*!40000 ALTER TABLE `website_quick_buttons` DISABLE KEYS */;
/*!40000 ALTER TABLE `website_quick_buttons` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `welcome_sections`
--

DROP TABLE IF EXISTS `welcome_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `welcome_sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `small_title` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `welcome_sections`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `welcome_sections` WRITE;
/*!40000 ALTER TABLE `welcome_sections` DISABLE KEYS */;
INSERT INTO `welcome_sections` VALUES
(2,'WELCOME TO','ACTIVE RURAL SOCIAL PROGRESS','Active rural social progress starting it\'s RTSE exam',NULL,'','','Active','2026-08-01 16:13:28','2026-08-01 16:13:28');
/*!40000 ALTER TABLE `welcome_sections` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Dump completed on 2026-08-07 19:09:42
