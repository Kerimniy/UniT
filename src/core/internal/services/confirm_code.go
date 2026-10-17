package services

import (
	"errors"
	"time"

	"sync"

	_ "gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"kerimniy.qzz.io/vebvy/internal/config"
	db "kerimniy.qzz.io/vebvy/internal/database"

	"kerimniy.qzz.io/vebvy/internal/models"
)

type AuthCodeStruct struct {
	mu      sync.RWMutex
	code    string
	expires time.Time
}

var AuthCode = AuthCodeStruct{}

func Admin_exist() config.AdminStruct {
	var user models.User

	err := db.Db.Limit(1).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return config.AdminStruct{Exist: false}
	}

	return config.AdminStruct{Email: user.Email, Exist: true}
}

func (a *AuthCodeStruct) Set(code string, ttl time.Duration) {
	a.mu.Lock()
	defer a.mu.Unlock()

	a.code = code
	a.expires = time.Now().Add(ttl)
}

func (a *AuthCodeStruct) Check(code string) bool {
	a.mu.RLock()
	defer a.mu.RUnlock()

	return a.code == code && time.Now().Before(a.expires)
}

func (a *AuthCodeStruct) Clear() {
	a.mu.Lock()
	defer a.mu.Unlock()

	a.code = ""
	a.expires = time.Time{}
}
