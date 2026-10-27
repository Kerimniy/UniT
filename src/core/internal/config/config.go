package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"sync"

	"github.com/joho/godotenv"
)

type IndexStruct struct {
	Mu  sync.RWMutex
	Set map[string]bool
}

type Config struct {
	UploadLimit int
	RepoDir     string
	Index       IndexStruct
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

	_repo_dir := os.Getenv("GIT_REPO_PATH")

	if _repo_dir == "" {
		fmt.Println("INFO: no GIT_REPO_PATH in .env, ''./data'' will be used insteed")
		_repo_dir = "./data"
	}

	AppConf = Config{UploadLimit: _upload_limit, RepoDir: _repo_dir}

}
