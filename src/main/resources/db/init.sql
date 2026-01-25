/* 테이블 초기화 */
-- member 테이블 생성
DROP TABLE IF EXISTS `member`;

CREATE TABLE `member` (
  `memberId` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nickname` varchar(45) DEFAULT NULL,
  `job` varchar(45) DEFAULT NULL,
  `major` varchar(45) DEFAULT NULL,
  `summary` varchar(45) DEFAULT NULL,
  `role` varchar(45) DEFAULT 'ROLE_USER',
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`memberId`),
  KEY `idx_nickname` (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- website 테이블 생성
DROP TABLE IF EXISTS `website`;

CREATE TABLE `website` (
  `websiteId` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `k_name` varchar(255) DEFAULT NULL,
  `description` text,
  `url` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `subcategory` varchar(255) DEFAULT NULL,
  `rating` int DEFAULT '0',
  PRIMARY KEY (`websiteId`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- board 테이블 생성
DROP TABLE IF EXISTS `board`;

CREATE TABLE `board` (
  `boardId` int NOT NULL AUTO_INCREMENT,
  `member_memberId` int DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `title` varchar(45) NOT NULL,
  `summary` varchar(150) DEFAULT NULL,
  `description` text,
  `hashtags` varchar(255) DEFAULT NULL,
  `likes_count` int DEFAULT '0',
  `comments_count` int DEFAULT '0',
  `bookmarks_count` int DEFAULT '0',
  `views_count` int DEFAULT '0',
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`boardId`),
  KEY `memberId_idx` (`member_memberId`),
  KEY `idx_created_date` (`created_date` DESC),
  CONSTRAINT `memberId` FOREIGN KEY (`member_memberId`) REFERENCES `member` (`memberId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- likes 테이블 생성
DROP TABLE IF EXISTS `likes`;

CREATE TABLE `likes` (
  `likesId` int NOT NULL AUTO_INCREMENT,
  `board_boardId` int NOT NULL,
  `member_memberId` int NOT NULL,
  `is_Liked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`likesId`),
  UNIQUE KEY `unique_board_member` (`board_boardId`,`member_memberId`),
  KEY `member_memberId_idx` (`member_memberId`) /*!80000 INVISIBLE */,
  KEY `board_boardId` (`board_boardId`),
  CONSTRAINT `fk_like_board` FOREIGN KEY (`board_boardId`) REFERENCES `board` (`boardId`) ON DELETE CASCADE,
  CONSTRAINT `fk_like_member` FOREIGN KEY (`member_memberId`) REFERENCES `member` (`memberId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- folder 테이블 생성
DROP TABLE IF EXISTS `folder`;

CREATE TABLE `folder` (
  `folderId` int NOT NULL AUTO_INCREMENT,
  `member_memberId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `tag` varchar(45) DEFAULT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`folderId`),
  KEY `fk_folder_member_idx` (`member_memberId`),
  CONSTRAINT `fk_folder_member` FOREIGN KEY (`member_memberId`) REFERENCES `member` (`memberId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- bookmark 테이블 생성
DROP TABLE IF EXISTS `bookmark`;

CREATE TABLE `bookmark` (
  `bookmarkId` int NOT NULL AUTO_INCREMENT,
  `member_memberId` int NOT NULL,
  `nickname` varchar(45) DEFAULT NULL,
  `website_websiteId` int DEFAULT NULL,
  `board_boardId` int DEFAULT NULL,
  `folder_folderId` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `url` varchar(255) DEFAULT NULL,
  `modified_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tag` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`bookmarkId`),
  KEY `fk_bookmark_member_idx` (`member_memberId`),
  KEY `fk_bookmark_website1_idx` (`website_websiteId`),
  KEY `fk_bookmark_board_idx` (`board_boardId`),
  KEY `fk_bookmark_folder_idx` (`folder_folderId`),
  CONSTRAINT `fk_bookmark_board` FOREIGN KEY (`board_boardId`) REFERENCES `board` (`boardId`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookmark_member` FOREIGN KEY (`member_memberId`) REFERENCES `member` (`memberId`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookmark_website1` FOREIGN KEY (`website_websiteId`) REFERENCES `website` (`websiteId`),
  CONSTRAINT `fk_bookmark_folder` FOREIGN KEY (`folder_folderId`) REFERENCES `folder` (`folderId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- comment 테이블 생성
DROP TABLE IF EXISTS `comment`;

CREATE TABLE `comment` (
  `commentId` int NOT NULL AUTO_INCREMENT,
  `board_boardId` int NOT NULL,
  `member_memberId` int DEFAULT NULL,
  `member_nickname` varchar(45) NOT NULL,
  `member_job` varchar(45) DEFAULT NULL,
  `member_major` varchar(45) DEFAULT NULL,
  `content` text,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`commentId`),
  KEY `board_boardId_idx` (`board_boardId`),
  KEY `member_memberId_idx` (`member_memberId`),
  CONSTRAINT `fk_comment_board` FOREIGN KEY (`board_boardId`) REFERENCES `board` (`boardId`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_member` FOREIGN KEY (`member_memberId`) REFERENCES `member` (`memberId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;