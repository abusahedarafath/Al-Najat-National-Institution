/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for Android (armv7-a)
--
-- Host: 127.0.0.1    Database: al_najat_db
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_documents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `application_documents` WRITE;
/*!40000 ALTER TABLE `application_documents` DISABLE KEYS */;
INSERT INTO `application_documents` VALUES
(1,10,'photo','1785032161620-983011535.png',0,NULL,'2026-07-26 02:16:01'),
(2,10,'signature','1785032161719-221016729.png',0,NULL,'2026-07-26 02:16:01'),
(3,10,'birth_certificate','1785032161753-215306634.pdf',0,NULL,'2026-07-26 02:16:01'),
(4,10,'tc','1785032161755-42980792.pdf',0,NULL,'2026-07-26 02:16:01'),
(5,10,'marksheet','1785032161757-709128086.pdf',0,NULL,'2026-07-26 02:16:01'),
(6,10,'aadhaar','1785032161759-604907053.pdf',0,NULL,'2026-07-26 02:16:01'),
(7,11,'photo','1785033254649-668367170.png',0,NULL,'2026-07-26 02:34:14'),
(8,11,'signature','1785033254766-854957210.png',0,NULL,'2026-07-26 02:34:14'),
(9,11,'birth_certificate','1785033254815-919020129.pdf',0,NULL,'2026-07-26 02:34:14'),
(10,11,'tc','1785033254817-917240007.pdf',0,NULL,'2026-07-26 02:34:14'),
(11,11,'marksheet','1785033254819-442077689.pdf',0,NULL,'2026-07-26 02:34:14'),
(12,11,'aadhaar','1785033254822-929492767.pdf',0,NULL,'2026-07-26 02:34:14'),
(13,12,'photo','1785035191165-847374610.png',0,NULL,'2026-07-26 03:06:31'),
(14,12,'signature','1785035191264-104719378.png',0,NULL,'2026-07-26 03:06:31'),
(15,12,'birth_certificate','1785035191299-303031511.pdf',0,NULL,'2026-07-26 03:06:31'),
(16,12,'tc','1785035191301-771176645.pdf',0,NULL,'2026-07-26 03:06:31'),
(17,12,'marksheet','1785035191303-554597499.pdf',0,NULL,'2026-07-26 03:06:31'),
(18,12,'aadhaar','1785035191305-858492801.pdf',0,NULL,'2026-07-26 03:06:31'),
(19,13,'photo','1785044725429-294443120.jpg',0,NULL,'2026-07-26 05:45:25'),
(20,13,'signature','1785044725517-285874321.jpg',0,NULL,'2026-07-26 05:45:25'),
(21,13,'birth_certificate','1785044725532-536025828.pdf',0,NULL,'2026-07-26 05:45:25'),
(22,13,'tc','1785044725536-385281043.pdf',0,NULL,'2026-07-26 05:45:25'),
(23,13,'marksheet','1785044725540-408179225.pdf',0,NULL,'2026-07-26 05:45:25'),
(24,13,'aadhaar','1785044725600-434148359.pdf',0,NULL,'2026-07-26 05:45:25'),
(25,14,'photo','1785045353849-68398382.png',0,NULL,'2026-07-26 05:55:54'),
(26,14,'signature','1785045353971-580615435.jpg',0,NULL,'2026-07-26 05:55:54'),
(27,14,'birth_certificate','1785045353982-74443887.pdf',0,NULL,'2026-07-26 05:55:54'),
(28,14,'tc','1785045353986-801932966.pdf',0,NULL,'2026-07-26 05:55:54'),
(29,14,'marksheet','1785045353989-909044530.pdf',0,NULL,'2026-07-26 05:55:54'),
(30,14,'aadhaar','1785045354029-900582881.pdf',0,NULL,'2026-07-26 05:55:54'),
(31,15,'photo','1785046331605-178648027.jpg',0,NULL,'2026-07-26 06:12:12'),
(32,15,'signature','1785046331662-122169253.png',0,NULL,'2026-07-26 06:12:12'),
(33,15,'birth_certificate','1785046331728-192409875.pdf',0,NULL,'2026-07-26 06:12:12'),
(34,15,'tc','1785046331730-279083659.pdf',0,NULL,'2026-07-26 06:12:12'),
(35,15,'marksheet','1785046331733-330591456.pdf',0,NULL,'2026-07-26 06:12:12'),
(36,15,'aadhaar','1785046331776-360789694.pdf',0,NULL,'2026-07-26 06:12:12'),
(37,16,'photo','1785046464396-477976733.jpg',0,NULL,'2026-07-26 06:14:24'),
(38,16,'signature','1785046464403-197958121.png',0,NULL,'2026-07-26 06:14:24'),
(39,16,'birth_certificate','1785046464460-699886082.pdf',0,NULL,'2026-07-26 06:14:24'),
(40,16,'tc','1785046464481-540925508.pdf',0,NULL,'2026-07-26 06:14:24'),
(41,16,'marksheet','1785046464495-468920977.pdf',0,NULL,'2026-07-26 06:14:24'),
(42,16,'aadhaar','1785046464509-469670599.pdf',0,NULL,'2026-07-26 06:14:24'),
(43,17,'photo','1785047458482-634664900.jpg',0,NULL,'2026-07-26 06:30:58'),
(44,17,'signature','1785047458540-856820897.jpg',0,NULL,'2026-07-26 06:30:58'),
(45,17,'birth_certificate','1785047458563-465101845.pdf',0,NULL,'2026-07-26 06:30:58'),
(46,17,'tc','1785047458611-194063022.pdf',0,NULL,'2026-07-26 06:30:58'),
(47,17,'marksheet','1785047458613-899118141.pdf',0,NULL,'2026-07-26 06:30:58'),
(48,17,'aadhaar','1785047458617-341139615.pdf',0,NULL,'2026-07-26 06:30:58'),
(49,18,'photo','1785049389666-203669572.jpg',0,NULL,'2026-07-26 07:03:09'),
(50,18,'signature','1785049389728-502437337.png',0,NULL,'2026-07-26 07:03:09'),
(51,18,'birth_certificate','1785049389790-590479867.pdf',0,NULL,'2026-07-26 07:03:09'),
(52,18,'tc','1785049389792-740569075.pdf',0,NULL,'2026-07-26 07:03:09'),
(53,18,'marksheet','1785049389795-957742795.pdf',0,NULL,'2026-07-26 07:03:09'),
(54,18,'aadhaar','1785049389797-126008559.pdf',0,NULL,'2026-07-26 07:03:09');
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES
(1,NULL,'2027','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2007-07-08','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','arabic-awal','Al-Jamia Ratabari',NULL,NULL,NULL,'Approved','2026-07-18 18:59:42'),
(2,NULL,'2027','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2026-07-19','Male','9577986639','abusahedarafathh@gmail.com','Kachukhouri','','Al-Jamia Ratabari',NULL,NULL,NULL,'Approved','2026-07-18 19:10:38'),
(3,'ANI-2027-879467','2027','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2026-07-25','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','arabic_awal','Al-Jamia Ratabari','77272828','72727277287282','737377373773','Approved','2026-07-19 11:51:19'),
(4,'ANI-2027-269971','2027','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2026-07-19','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','arabic_awal','Al-Jamia Ratabari','77272828','72727277287282','737377373773','Approved','2026-07-19 11:57:49'),
(5,'ANI-2027-318710','2027','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2026-07-19','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','arabic_awal','Al-Jamia Ratabari','77272828','72727277287282','737377373773','Approved','2026-07-19 11:58:38'),
(6,'ANI202700001','2027','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2026-07-20','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','ETFC','Al-Jamia Ratabari','266266262662','7373737377372','377373737','Approved','2026-07-20 12:20:55'),
(7,'ANI202700002','2027','Bshshsnn','Hshsjhshhshs','Sggshsh','2007-07-17','Male','9577986639','abusahedarafathh@gmail.com','Kachukhouri','Arabic Awal','Al-Jamia Ratabari','626626272','727272772','979796884731','Approved','2026-07-20 12:37:04'),
(8,'ANI202700003','2027','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2015-07-01','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','Arabic Awal','Al-Jamia Ratabari','6262717772772','727277272','979796884731','Approved','2026-07-20 13:00:49'),
(9,'ANI202700004','2027','Abu Sahed Arafath','Jamal Ahmed','Sofiya Begum','2019-07-22','Male','9577986639','abusahedarafathh@gmail.com','Kachukhouri','Arabic Awal','Al-Jamia Ratabari','677777777','77777777777','5555555555','Approved','2026-07-21 19:56:15'),
(10,'ANI202700005','2027','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','1997-07-26','Male','9577986639','abusahedarafathh@gmail.com','Kachukhouri','Arabic Awal','Al-Jamia Ratabari','77272828','77777777777','737377373773','Rejected','2026-07-26 02:16:01'),
(11,'ANI202700006','2027','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2014-07-26','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','Arabic Awal','Al-Jamia Ratabari','77272828','77777777777','737377373773','Approved','2026-07-26 02:34:14'),
(12,'ANI202700007','2027','Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2003-07-26','Male','9577986639','abusahedarafathh@gmail.com','Kachukhouri','DCSE','Al-Jamia Ratabari','Were 66666','55434555','Ddf34444','Approved','2026-07-26 03:06:31'),
(13,'ANI202700008','2027','Abu Sahed Arafath','Jamal Ahmed','Sofiya Begum','1998-07-26','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','DCFC','Al-Jamia Ratabari','Were 66666','77777777777','5555555555','Approved','2026-07-26 05:45:25'),
(14,'ANI202700009','2027','Abu Sahed Arafath','Yas','Hahahsua','1998-07-26','Female','6901646612','abusahedarafathh@gmail.com','Kachukhouri','ETFC','Hwyw','77272828','72727277287282','737377373773','Approved','2026-07-26 05:55:54'),
(15,'ANI202700010','2027','Heheh','Shhshs','Gssghshwhs','1991-07-26','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','Arabic Awal','Al-Jamia Ratabari','77272828','77777777777','5555555555','Approved','2026-07-26 06:12:11'),
(16,'ANI202700011','2027','7h8hw8h8','8wj8wj8w','W99nw9','2002-07-26','Female','6901646612','abusahedarafathh@gmail.com','Kachukhouri','DCFC','Al-Jamia Ratabari','Were 66666','77777777777','5555555555','Approved','2026-07-26 06:14:24'),
(17,'ANI202700012','2027','Ndjdnsnjsnns','Hshshsh','Hdhdjd','1998-07-26','Male','9577986639','bjwjana@gmail.com','Vullz hajsn hjznsj','ETFC','Al-Jamia Ratabari','77272828','77777777777','5555555555','Approved','2026-07-26 06:30:58'),
(18,'ANI202600001','2026','Reshma Khanam','Who are you ','Jjjjjjjjjjj','1994-07-26','Male','9577986639','','Usjsj','ETFC','Hwyw','77272828','77777777777','5555555555','Approved','2026-07-26 07:03:09');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chairman_message`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `chairman_message` WRITE;
/*!40000 ALTER TABLE `chairman_message` DISABLE KEYS */;
INSERT INTO `chairman_message` VALUES
(1,'AFTAB UDDIN','CHAIRMAN','Chairman\'s Message\r\nAssalamu Alaikum Wa Rahmatullahi Wa Barakatuh,\r\nIt is my great pleasure to welcome you to Al-Najat National Institution. Our institution was established with the vision of providing quality education while nurturing strong moral values, discipline, and a lifelong passion for learning. We believe that education is the most powerful tool for building responsible individuals and creating a progressive society.\r\nAt Al-Najat National Institution, we strive to create an environment where every student can develop academically, intellectually, morally, and socially. Our dedicated teachers, modern teaching methods, and student-friendly atmosphere are designed to help learners realize their full potential and become confident, responsible citizens.\r\nAlong with academic excellence, we place great emphasis on character building, respect for humanity, leadership, and ethical values. We encourage our students to think critically, work diligently, and contribute positively to their families, communities, and the nation.\r\nI sincerely appreciate the trust and support of our parents, teachers, well-wishers, and the entire school community. Your continued cooperation inspires us to improve every day and achieve greater milestones together.\r\nI invite you to become a part of the Al-Najat family and join us in our mission of empowering young minds with knowledge, wisdom, and integrity. May Almighty Allah bless our efforts and guide us toward excellence in both this world and the Hereafter.\r\nThank you.\r\nWith best wishes,\r\nAFTAB UDDIN\r\nChairman\r\nAl-Najat National Institution','1785332955683-482264951.jpg','2026-07-25 15:14:56','2026-07-29 13:50:01');
/*!40000 ALTER TABLE `chairman_message` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_albums`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `gallery_albums` WRITE;
/*!40000 ALTER TABLE `gallery_albums` DISABLE KEYS */;
INSERT INTO `gallery_albums` VALUES
(4,'Hejeh','Nwnwn','1784975844658-100797901.jpg','Active','2026-07-25 10:37:24');
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
  CONSTRAINT `1` FOREIGN KEY (`album_id`) REFERENCES `gallery_albums` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_images`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `gallery_images` WRITE;
/*!40000 ALTER TABLE `gallery_images` DISABLE KEYS */;
INSERT INTO `gallery_images` VALUES
(44,4,'1784975866385-264937287.png','','2026-07-25 10:37:46'),
(45,4,'1784975866388-55747071.jpg','','2026-07-25 10:37:46'),
(46,4,'1784975866469-91925901.jpg','','2026-07-25 10:37:46'),
(47,4,'1784975866543-449136903.jpg','','2026-07-25 10:37:46'),
(48,4,'1784975866562-672323678.jpg','','2026-07-25 10:37:46'),
(49,4,'1784975866568-608816656.jpg','Hshsj','2026-07-25 10:37:46'),
(50,4,'1784975866578-606049499.jpg','','2026-07-25 10:37:46'),
(51,4,'1784975866588-756818623.png','','2026-07-25 10:37:46'),
(52,4,'1784975866603-488535661.jpg','','2026-07-25 10:37:46'),
(53,4,'1784975866618-948180354.jpg','','2026-07-25 10:37:46'),
(54,4,'1784975866620-2420850.jpg','','2026-07-25 10:37:46'),
(55,4,'1784975866622-294208494.jpg','','2026-07-25 10:37:46'),
(56,4,'1784975866633-633473505.jpg','','2026-07-25 10:37:46'),
(57,4,'1784975866646-683578644.jpg','','2026-07-25 10:37:46'),
(58,4,'1784975866648-471393997.jpg','','2026-07-25 10:37:46'),
(59,4,'1784975866654-684186515.png','','2026-07-25 10:37:46'),
(60,4,'1784975866657-48423273.jpg','','2026-07-25 10:37:46'),
(61,4,'1784975969254-630426169.jpg','','2026-07-25 10:39:29');
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_sliders`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `hero_sliders` WRITE;
/*!40000 ALTER TABLE `hero_sliders` DISABLE KEYS */;
INSERT INTO `hero_sliders` VALUES
(4,'Hshs','Hwhs','Usus','Hshs','1784991906472-369761713.png',1,'Active','2026-07-25 15:05:06','2026-07-25 15:05:18'),
(5,'Hh','','','','1784992033332-673901393.jpg',1,'Active','2026-07-25 15:07:13','2026-07-25 16:48:16');
/*!40000 ALTER TABLE `hero_sliders` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
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
  CONSTRAINT `1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `student_users` WRITE;
/*!40000 ALTER TABLE `student_users` DISABLE KEYS */;
INSERT INTO `student_users` VALUES
(1,13,'ANI20260010','$2b$10$vuFXhMV674LD8EbkMaG7LOy2a..KFqAm2zu3psUzvgDsBXt5wQznS',NULL,'2026-07-26 06:51:21'),
(2,14,'ANI20260011','$2b$10$zNfwVeIUUsri71NNWV8//.9D1vj9dR6sET/gP6QzqjcAYMMJ4M5V2',NULL,'2026-07-26 07:03:52');
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES
(1,'ANI20260002',2,'Abu Sahed Arafat','Jamal Uddin','Sultana Begum','2026-07-18','Male','9577986639','abusahedarafathh@gmail.com','Kachukhouri','','Al-Jamia Ratabari','2026-07-19','Inactive',NULL,'2026-07-18 23:05:34'),
(3,'ANI20260001',1,'Abu Sahed Arafat','Jamal Uddin','Sultana Begum','2007-07-04','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','arabic-awal','Al-Jamia Ratabari','2026-07-19','Active',NULL,'2026-07-18 23:05:53'),
(4,'ANI20260009',9,'Abu Sahed Arafath','Jamal Ahmed','Sofiya Begum','2019-07-22','Male','9577986639','abusahedarafathh@gmail.com','Kachukhouri','Arabic Awal','Al-Jamia Ratabari','2026-07-25','Active',NULL,'2026-07-25 08:19:02'),
(5,'ANI20260006',6,'Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2026-07-20','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','ETFC','Al-Jamia Ratabari','2026-07-25','Active',NULL,'2026-07-25 08:19:10'),
(6,'ANI20260005',5,'Abu Sahed Arafath','Jamal Uddin','Sultana Begum','2026-07-19','Male','6901646612','abusahedarafathh@gmail.com','Kachukhouri','arabic_awal','Al-Jamia Ratabari','2026-07-25','Active',NULL,'2026-07-25 08:19:17'),
(13,'ANI20260010',17,'Ndjdnsnjsnns','Hshshsh','Hdhdjd','1998-07-26','Male','9577986639','bjwjana@gmail.com','Vullz hajsn hjznsj','ETFC','Al-Jamia Ratabari','2026-07-26','Active',NULL,'2026-07-26 06:51:21'),
(14,'ANI20260011',18,'Reshma Khanam','Who are you ','Jjjjjjjjjjj','1994-07-26','Male','9577986639','','Usjsj','ETFC','Hwyw','2026-07-26','Active',NULL,'2026-07-26 07:03:51');
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
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `qualification` varchar(150) DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-07-30 11:06:39
