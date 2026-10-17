package db

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"kerimniy.qzz.io/vebvy/internal/models"

)

var Db *gorm.DB

func InitDb() {

	_db, err := gorm.Open(sqlite.Open(".main.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Db error: %v", err)
	}
	_db.AutoMigrate(&models.User{})

	Db = _db
}
