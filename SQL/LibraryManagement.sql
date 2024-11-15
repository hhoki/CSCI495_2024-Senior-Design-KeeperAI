CREATE DATABASE  IF NOT EXISTS `librarymanagement` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `librarymanagement`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: librarymanagement
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_performance`
--

DROP TABLE IF EXISTS `ai_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_performance` (
  `performance_id` int NOT NULL AUTO_INCREMENT,
  `model_used` varchar(45) DEFAULT NULL,
  `detection_count` int DEFAULT NULL,
  `accuracy` float DEFAULT NULL,
  `avg_response_time` float DEFAULT NULL,
  `session_time` datetime DEFAULT NULL,
  PRIMARY KEY (`performance_id`),
  KEY `model_used` (`model_used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_performance`
--

LOCK TABLES `ai_performance` WRITE;
/*!40000 ALTER TABLE `ai_performance` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_performance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `book_detections`
--

DROP TABLE IF EXISTS `book_detections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_detections` (
  `detection_id` int NOT NULL AUTO_INCREMENT,
  `detection_time` datetime DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `model_used` varchar(45) DEFAULT NULL,
  `book_id` int DEFAULT NULL,
  PRIMARY KEY (`detection_id`),
  KEY `book_id_idx` (`book_id`),
  CONSTRAINT `book_id` FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book_detections`
--

LOCK TABLES `book_detections` WRITE;
/*!40000 ALTER TABLE `book_detections` DISABLE KEYS */;
/*!40000 ALTER TABLE `book_detections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `book`
--

DROP TABLE IF EXISTS `book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book` (
  `book_id` int NOT NULL AUTO_INCREMENT,
  `shelf_id` int NOT NULL,
  `title` varchar(225) DEFAULT NULL,
  `author` varchar(225) DEFAULT NULL,
  `published_date` varchar(225) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `rating` varchar(45) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `user_notes` TEXT DEFAULT NULL,
  `reading_status` ENUM('unset', 'completed', 'paused', 'reading', 'favorite', 'dropped') DEFAULT 'unset',
  `cover` varchar(255) DEFAULT NULL,
  `shelf_location` varchar(45) DEFAULT NULL,
  `date_added` datetime DEFAULT CURRENT_TIMESTAMP,
  `genres` JSON DEFAULT NULL,
  `publisher` VARCHAR(255) NULL DEFAULT NULL,
  `page_count` INT NULL DEFAULT NULL,
  'last_updated' TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`book_id`),
  KEY `shelf_id` (`shelf_id`),
  CONSTRAINT `shelf_id` FOREIGN KEY (`shelf_id`) REFERENCES `shelf` (`shelf_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book`
--


/* Table structure for `shelf` */
DROP TABLE IF EXISTS `shelf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shelf` (
  `shelf_id` int NOT NULL AUTO_INCREMENT,
  `shelf_name` varchar(100) DEFAULT NULL,
  `shelf_description` TEXT DEFAULT NULL,
  PRIMARY KEY (`shelf_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




LOCK TABLES `book` WRITE;
/*!40000 ALTER TABLE `book` DISABLE KEYS */;
/*!40000 ALTER TABLE `book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_configurations`
--

DROP TABLE IF EXISTS `model_configurations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model_configurations` (
  `config_id` int NOT NULL,
  `model_used` varchar(45) DEFAULT NULL,
  `version` varchar(45) DEFAULT NULL,
  `config_params` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_configurations`
--

LOCK TABLES `model_configurations` WRITE;
/*!40000 ALTER TABLE `model_configurations` DISABLE KEYS */;
/*!40000 ALTER TABLE `model_configurations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-09 23:27:04
