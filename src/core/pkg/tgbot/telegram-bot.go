package tgbot

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

type AdminStructTG struct {
	ChatID   int64  `json:"chat_id"`
	UserName string `json:"username"`
}

type Code struct {
	c   string
	exp time.Time
}

var sendedCode = Code{}

var AdminTG AdminStructTG = AdminStructTG{ChatID: -1}
var b *bot.Bot

func InitTGBot(ctx context.Context) {

	InitChatID()

	opts := []bot.Option{
		bot.WithDefaultHandler(handler),
	}
	var err error
	b, err = bot.New(os.Getenv("TELEGRAM_BOT_TOKEN"), opts...)
	if nil != err {

		panic(err)
	}

	go func() {
		b.Start(ctx)
	}()

}

func SaveChatID() {
	b, err := json.Marshal(AdminTG)

	if err != nil {
		log.Fatalln("could not serialize admin data")
	}

	f, err := os.Create(".TG_CHAT_ID")

	if err != nil {
		log.Fatalln("Could not write chat id file")
	}

	_, err = f.Write(b)
	if err != nil {
		log.Fatalln("Could not write chat id file")
	}
}

func InitChatID() {
	f, err := os.Open(".TG_CHAT_ID")
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return
		} else {
			log.Fatalln("Could not open chat id file")
		}

	}

	b, err := io.ReadAll(f)

	if err != nil {
		log.Fatalln("Could not read chat id file", err)
	}

	err = json.Unmarshal(b, &AdminTG)

	if err != nil {
		os.Remove(".TG_CHAT_ID")
		log.Fatalln("Invalid chat id")

	}

}

func SendCode(code string, exp time.Time) error {

	sendedCode = Code{c: code, exp: exp}

	kb := &models.ReplyKeyboardMarkup{
		Keyboard: [][]models.KeyboardButton{
			{
				{
					Text: "Get code",
				},
			},
		},
		ResizeKeyboard:  true,
		OneTimeKeyboard: false,
	}

	_, err := b.SendMessage(context.Background(), &bot.SendMessageParams{
		ChatID:      AdminTG.ChatID,
		Text:        fmt.Sprintf("Your code: %s", code),
		ReplyMarkup: kb,
	})

	return err

}

func handler(ctx context.Context, b *bot.Bot, update *models.Update) {
	kb := &models.ReplyKeyboardMarkup{
		Keyboard: [][]models.KeyboardButton{
			{
				{
					Text: "Get code",
				},
			},
		},
		ResizeKeyboard:  true,
		OneTimeKeyboard: false,
	}

	if update.Message != nil {

		if AdminTG.ChatID == -1 || AdminTG.UserName == "" {

			AdminTG.ChatID = update.Message.Chat.ID
			AdminTG.UserName = update.Message.Chat.Username

			SaveChatID()

			b.SendMessage(ctx, &bot.SendMessageParams{
				ChatID:      update.Message.Chat.ID,
				Text:        fmt.Sprintf("Admin registered, chat ID: %d, username: %s", update.Message.Chat.ID, update.Message.Chat.Username),
				ReplyMarkup: kb,
			})
		} else if AdminTG.ChatID == update.Message.Chat.ID && AdminTG.UserName == update.Message.Chat.Username {

			msg := "No code for now"

			if time.Now().Before(sendedCode.exp) {
				msg = fmt.Sprintf("Your code: %s", sendedCode.c)
			}

			b.SendMessage(ctx, &bot.SendMessageParams{
				ChatID:      update.Message.Chat.ID,
				Text:        msg,
				ReplyMarkup: kb,
			})
		}

	}
}
