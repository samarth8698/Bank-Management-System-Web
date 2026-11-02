-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: bank_management_system
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account_opening_requests`
--

DROP TABLE IF EXISTS `account_opening_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_opening_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_type` varchar(255) NOT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `request_date` datetime(6) DEFAULT NULL,
  `reviewed_date` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `customer_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKnvgjepry4jhjynq3er9n334ar` (`customer_id`),
  CONSTRAINT `FKnvgjepry4jhjynq3er9n334ar` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_opening_requests`
--

LOCK TABLES `account_opening_requests` WRITE;
/*!40000 ALTER TABLE `account_opening_requests` DISABLE KEYS */;
INSERT INTO `account_opening_requests` VALUES (1,'SAVINGS',NULL,'2026-11-01 18:07:31.101014','2026-11-01 18:13:28.062629','APPROVED',10),(2,'CURRENT','Current account eligibility criteria not met.','2026-11-02 10:40:38.433015','2026-11-02 10:42:52.916035','REJECTED',10);
/*!40000 ALTER TABLE `account_opening_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_number` varchar(255) NOT NULL,
  `account_type` varchar(255) DEFAULT NULL,
  `balance` decimal(38,2) DEFAULT NULL,
  `opening_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `customer_id` bigint NOT NULL,
  `pin` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6kplolsdtr3slnvx97xsy2kc8` (`account_number`),
  KEY `FKn6x8pdp50os8bq5rbb792upse` (`customer_id`),
  CONSTRAINT `FKn6x8pdp50os8bq5rbb792upse` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'1000000002','SAVINGS',4000.00,'2026-10-30','ACTIVE',2,NULL),(2,'1000000003','SAVINGS',800.00,'2026-10-30','ACTIVE',3,'$2a$10$Jx/FUnjGbAJ41VOey1l2iuo82WZbCbXPI3t2OYDx1hhKjm/zU2grO'),(3,'1000000005','SAVINGS',500.00,'2026-10-31','ACTIVE',6,'$2a$10$SA3DCe3uo1DNSLIakDXLEeROqAxuIUmSxpWF73UnkPAcpvkLqpHei'),(4,'1000000006','SAVINGS',100.00,'2026-10-31','ACTIVE',6,NULL),(5,'1000000007','SAVINGS',0.00,'2026-10-31','ACTIVE',6,NULL),(6,'1000000008','SAVINGS',150.00,'2026-10-31','ACTIVE',9,'$2a$10$trD99i.BcuwIXZXtKzLwEOKmxSVsHKHmCz1h87Pin7DXJvn9PzAlC'),(9,'SB179353700796423DB','SAVINGS',0.00,'2026-11-01','ACTIVE',10,NULL);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `pincode` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKrfbvkrffamfql7cjmen8v976v` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (2,'Pune','Pune','amit.sharma@gmail.com','Amit','Sharma','9876543211','411001','Maharashtra',NULL,'CUSTOMER'),(3,'New Address','Pune','raj.sharma@gmail.com','Raj','Sharma','9999999999','411001','Maharashtra','$2a$10$GYL2sdU0J3HqhrLQUDAMY.Gw4PI25QmCFz.pVdFhittRG/mfJsY.i','CUSTOMER'),(4,'Pune','Pune','test.customer01@gmail.com','Test','Customer','9876543210','411001','Maharashtra','$2a$10$dVioyQllfhW8nrZQYHTjzeuhX9x7YixRIlLkMZY8G.oPj1Pd16IZy','CUSTOMER'),(6,'Pune','Pune','samarthadhao2019@gmail.com','Samarth','Adhao','1234567890','411001','Maharashtra','$2a$10$5vHe8Ef10MmcA3QBp7NV9OSXApTPGjxNTfEP813Eo6TOh4WYOzdEm','ADMIN'),(7,'Pune','Pune','testuser@gmail.com','Test','User','9876543210','411001','Maharashtra','$2a$10$IKIRB0tbhf7U7mKLA6ttA.BD3SwvcDQSzOf/rPN1zMCLfgm8vQ24e','CUSTOMER'),(8,'Pune','Pune','तुझा दुसरा Email Address','Test','Customer','9876543210','411001','Maharashtra','$2a$10$qdX1cx1gz9n2j7xYz38kfuAPD6coSxCWogsntWeLi6vP/SGgQc.QO','CUSTOMER'),(9,'Pune','Pune','samarthadhao2019+test@gmail.com','Test','Customer','9876543210','411001','Maharashtra','$2a$10$pLuQEPl.KHncxPTv6sjbCuuTaeZ8HqxInX9piL/sVFNtERuEfXlCG','CUSTOMER'),(10,'Pune','Pune','amol@gmail.com','Amol','Patil','1234567890','411001','Maharashtra','$2a$10$5hL9T6988Ni265WX77YaLOOncMyqpPDNydOY4msRcFA2VTuFgvHKm','CUSTOMER');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `expiry_time` datetime(6) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfpgiit0i40arv0kvwm8gaylwy` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verifications`
--

LOCK TABLES `otp_verifications` WRITE;
/*!40000 ALTER TABLE `otp_verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_failures`
--

DROP TABLE IF EXISTS `transaction_failures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_failures` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint DEFAULT NULL,
  `account_id` bigint DEFAULT NULL,
  `operation` varchar(30) NOT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `reason` varchar(500) NOT NULL,
  `occurred_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_failures`
--

LOCK TABLES `transaction_failures` WRITE;
/*!40000 ALTER TABLE `transaction_failures` DISABLE KEYS */;
INSERT INTO `transaction_failures` VALUES (1,6,3,'WITHDRAWAL',1000.00,'FAILED','Insufficient balance!','2026-10-31 15:18:50'),(2,9,6,'FUND_TRANSFER',50.00,'FAILED','Incorrect ATM PIN!','2026-10-31 17:58:59'),(3,9,6,'FUND_TRANSFER',50.00,'FAILED','Incorrect ATM PIN!','2026-10-31 17:59:06'),(4,9,6,'FUND_TRANSFER',50.00,'FAILED','Incorrect ATM PIN!','2026-11-01 09:27:40'),(5,9,6,'FUND_TRANSFER',50.00,'FAILED','Incorrect ATM PIN!','2026-11-01 09:27:53'),(6,9,6,'FUND_TRANSFER',50.00,'FAILED','Incorrect ATM PIN!','2026-11-01 09:28:48'),(7,9,6,'FUND_TRANSFER',50.00,'FAILED','Incorrect ATM PIN!','2026-11-01 09:28:56'),(8,9,6,'FUND_TRANSFER',50.00,'FAILED','Incorrect ATM PIN!','2026-11-01 09:32:28'),(9,9,6,'FUND_TRANSFER',NULL,'FAILED','Amount must be greater than zero!','2026-11-01 09:33:10');
/*!40000 ALTER TABLE `transaction_failures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(15,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `transaction_date` datetime(6) DEFAULT NULL,
  `transaction_type` varchar(255) DEFAULT NULL,
  `account_id` bigint NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'SUCCESS',
  PRIMARY KEY (`id`),
  KEY `FK20w7wsg13u9srbq3bd7chfxdh` (`account_id`),
  CONSTRAINT `FK20w7wsg13u9srbq3bd7chfxdh` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,5000.00,'Money deposited','d24b7ad4-a298-4322-8d4d-58e2d849e707','2026-10-30 16:23:21.255659','DEPOSIT',1,'SUCCESS'),(2,1000.00,'Money withdrawn','d96f94c6-6ac3-4acc-af7b-7d235c8c711d','2026-10-30 16:23:50.255370','WITHDRAWAL',1,'SUCCESS'),(3,500.00,'Money deposited','8ab63687-2d99-4b9f-9d83-86d5945358fc','2026-10-30 22:35:15.650538','DEPOSIT',2,'SUCCESS'),(4,1000.00,'Money deposited','26baf67b-8573-441a-b303-88e0719eb1e8','2026-10-30 22:43:20.578928','DEPOSIT',2,'SUCCESS'),(5,500.00,'Money withdrawn','896a3598-a605-43f4-aecc-eebfc73de35d','2026-10-30 22:49:17.940329','WITHDRAWAL',2,'SUCCESS'),(6,500.00,'Money withdrawn','df4a499a-e929-48a2-87d7-1ea3f2fdf02e','2026-10-30 23:00:48.628190','WITHDRAWAL',2,'SUCCESS'),(7,1000.00,'Money deposited','5f2a60a1-dad4-452d-81d0-4f38e262de95','2026-10-31 11:59:09.475666','DEPOSIT',3,'SUCCESS'),(8,200.00,'Money withdrawn','2baa839f-c4af-4459-8aa5-2d40b6c952db','2026-10-31 11:59:54.900096','WITHDRAWAL',3,'SUCCESS'),(9,500.00,'Money withdrawn','d62af2c3-a3d6-477d-bedb-f8780971bf4f','2026-10-31 12:01:08.113104','WITHDRAWAL',3,'SUCCESS'),(10,100.00,'Money transferred to account 1000000003','e527372f-4469-4030-8e30-3a64be0c20a9','2026-10-31 13:33:13.847396','TRANSFER_DEBIT',3,'SUCCESS'),(11,100.00,'Money received from account 1000000005','e527372f-4469-4030-8e30-3a64be0c20a9','2026-10-31 13:33:14.153907','TRANSFER_CREDIT',2,'SUCCESS'),(12,100.00,'Money transferred to account 1000000003','4b14ec1e-cf7c-4c54-86d4-6c272c41573f','2026-10-31 13:37:23.223636','TRANSFER_DEBIT',3,'SUCCESS'),(13,100.00,'Money received from account 1000000005','4b14ec1e-cf7c-4c54-86d4-6c272c41573f','2026-10-31 13:37:23.281285','TRANSFER_CREDIT',2,'SUCCESS'),(14,100.00,'Money transferred to account 1000000003','7b818295-b326-4ca3-a665-f96b1a77920b','2026-10-31 13:53:30.437388','TRANSFER_DEBIT',3,'SUCCESS'),(15,100.00,'Money received from account 1000000005','7b818295-b326-4ca3-a665-f96b1a77920b','2026-10-31 13:53:30.490054','TRANSFER_CREDIT',2,'SUCCESS'),(16,500.00,'Money deposited','445e3e9d-3982-4947-be4e-02011632f71c','2026-10-31 15:17:08.880604','DEPOSIT',3,'SUCCESS'),(17,100.00,'Money deposited','8d46b811-bdf2-46bc-b026-0371294bff44','2026-10-31 17:40:02.562159','DEPOSIT',4,'SUCCESS'),(18,50.00,'Money withdrawn','68ab2cc5-d3c7-4168-8322-975f0a8623c2','2026-10-31 17:43:02.540384','WITHDRAWAL',4,'SUCCESS'),(19,100.00,'Money deposited','79287730-3a22-4b2d-867a-01aec53c6779','2026-10-31 17:56:50.215056','DEPOSIT',6,'SUCCESS'),(20,100.00,'Money deposited','8785317e-a15e-49cc-875c-6daffebd7289','2026-11-01 09:28:01.439336','DEPOSIT',6,'SUCCESS'),(21,50.00,'Money transferred to account 1000000006','0b1a86b9-2b6a-4860-8ccb-0d54bdc3fe85','2026-11-01 09:35:16.580907','TRANSFER_DEBIT',6,'SUCCESS'),(22,50.00,'Money received from account 1000000008','0b1a86b9-2b6a-4860-8ccb-0d54bdc3fe85','2026-11-01 09:35:16.586749','TRANSFER_CREDIT',4,'SUCCESS');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-02 16:21:56
