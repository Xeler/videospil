-- --------------------------------------------------------
-- Vært:                         127.0.0.1
-- Server-version:               5.7.14 - MySQL Community Server (GPL)
-- ServerOS:                     Win64
-- HeidiSQL Version:             9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for druk
CREATE DATABASE IF NOT EXISTS `druk` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `druk`;

-- Dumping structure for tabel druk.chatlog
CREATE TABLE IF NOT EXISTS `chatlog` (
  `lobby_id` int(11) DEFAULT NULL,
  `player_id` int(11) DEFAULT NULL,
  `message` text,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for tabel druk.gamelog
CREATE TABLE IF NOT EXISTS `gamelog` (
  `lobbyid` int(11) DEFAULT NULL,
  `player` int(11) DEFAULT NULL,
  `fnc` text,
  `cmd1` text,
  `cmd2` text,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for tabel druk.games
CREATE TABLE IF NOT EXISTS `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `min_players` int(11) NOT NULL DEFAULT '0',
  `max_players` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for tabel druk.lobbies
CREATE TABLE IF NOT EXISTS `lobbies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `min_players` int(11) NOT NULL DEFAULT '1',
  `max_players` int(11) NOT NULL DEFAULT '1',
  `current_players` int(11) NOT NULL DEFAULT '1',
  `game_id` int(11) NOT NULL DEFAULT '1',
  `started` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4418212 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
