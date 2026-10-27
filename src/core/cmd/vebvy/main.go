package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"

	"kerimniy.qzz.io/vebvy/internal/config"
	db "kerimniy.qzz.io/vebvy/internal/database"
	"kerimniy.qzz.io/vebvy/internal/services"
	"kerimniy.qzz.io/vebvy/internal/transport"
	"kerimniy.qzz.io/vebvy/pkg/tgbot"
)

func main() {

	fmt.Println(time.Now(), "Starting... ")

	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
	)
	defer stop()

	config.InitConf()
	fmt.Println(time.Now(), "Initialized config ")

	services.InitSecretKey()
	fmt.Println(time.Now(), "Initialized secret key ")

	db.InitDb()
	fmt.Println(time.Now(), "Initialized database ")

	err:=services.InitGit()
	if err!=nil{
		log.Fatal("Git intitialization error: ",err)
		return
	} else{
		fmt.Println(time.Now(), "Initialized git service ")
	}

	tgbot.InitTGBot(ctx)
	fmt.Println(time.Now(), "Initialized tg bot service ")


	config.Admin = services.Admin_exist()
	fmt.Println(time.Now(), "Initialized admin status")

	transport.ListenAndServeHTTP(ctx)
}
