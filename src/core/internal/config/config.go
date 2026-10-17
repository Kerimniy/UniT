package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	UploadLimit       int
	ExposingDir string
}

type AdminStruct struct {
	Exist bool
	Email string
}

var AppConf = Config{}
var Admin AdminStruct

func InitConf() {

	err := godotenv.Load("./../.env")

	if err != nil {
		panic(err)
	}

	
	_upload_limit, err := strconv.Atoi(os.Getenv("UPLOAD_LIMIT"))

	if err != nil {
		log.Fatal("ERROR 62 (get limit) ", err)
	}

	AppConf = Config{UploadLimit: _upload_limit}

}
