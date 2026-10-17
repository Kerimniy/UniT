package services

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"math/rand"

	"kerimniy.qzz.io/vebvy/pkg/tgbot"
)

var ctx = context.Background()

func validateCode(code string) bool {

	res := AuthCode.Check(code)
	if res == true {
		AuthCode.Clear()
	}

	return res

}

func sendConfirm() error {

	code := fmt.Sprintf("%06d", rand.Intn(999999))

	AuthCode.Set(code, time.Minute*10)

	return tgbot.SendCode(code, AuthCode.expires)

}

func RequestConfirmCode(w http.ResponseWriter, r *http.Request) {

	err := sendConfirm()

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		io.WriteString(w, fmt.Sprintf("%s", err))
		return
	}

	w.WriteHeader(200)

}
