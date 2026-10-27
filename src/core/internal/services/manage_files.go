package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"kerimniy.qzz.io/vebvy/internal/config"
)

type UploadData struct {
	NewName string `json:"newName"`
	Content string `json:"content"`
}

func UploadHandle(w http.ResponseWriter, r *http.Request) {

	if !checkAdmin(w, r) {
		w.WriteHeader(403)
		return
	}

	filename := r.URL.Query().Get("file")
	filename = strings.Trim(strings.TrimLeft(filename, "/"), "/")

	if r.Method == "OPTIONS" {
		return
	}

	b, e := io.ReadAll(r.Body)

	if e != nil {
		fmt.Println(e)

		w.WriteHeader(500)
		return
	}
	payload := UploadData{}
	err := json.Unmarshal(b, &payload)

	if err != nil {
		fmt.Println(err)

		w.WriteHeader(500)
		return
	}

	path := filepath.Join(config.AppConf.ExposingDir, filename)

	rel, err := filepath.Rel(config.AppConf.ExposingDir, path)

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(400)
		return
	}

	newPath := filepath.Join(config.AppConf.ExposingDir, payload.NewName)

	rel, err = filepath.Rel(config.AppConf.ExposingDir, newPath)

	if err != nil {
		fmt.Println(err)

		w.WriteHeader(400)
		return
	}

	if strings.HasPrefix(rel, "..") {

		w.WriteHeader(400)
		return
	}

	file, err := CreateFile(path)

	if err != nil {
		fmt.Println(err)

		w.WriteHeader(500)
		return
	}

	_, err = io.WriteString(file, payload.Content)

	if err != nil {
		fmt.Println(err)

		w.WriteHeader(500)
		return
	}
	file.Close()

	if newPath != "" {
		err = os.Rename(path, newPath)

		if err != nil {
			fmt.Println(err)

			w.WriteHeader(500)
			return
		}

	}

	err = UpdateIndex(payload.NewName, false)

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		w.Write([]byte("Update index error"))
		return
	}

	err = commitAndPush(repo, fmt.Sprintf("Edit %s. T=%s", payload.NewName, time.Now().String()))

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		w.Write([]byte("Push error"))
		return
	}

}

func DeleteHandle(w http.ResponseWriter, r *http.Request) {

	if !checkAdmin(w, r) {
		w.WriteHeader(403)
		return
	}

	filename := r.URL.Query().Get("file")
	filename = strings.Trim(strings.TrimLeft(filename, "/"), "/")

	path := filepath.Join(config.AppConf.ExposingDir, filename)

	rel, err := filepath.Rel(config.AppConf.ExposingDir, path)

	if err != nil {
		w.WriteHeader(400)
		return
	}

	if strings.HasPrefix(rel, "..") {

		w.WriteHeader(400)
		return
	}

	err = os.RemoveAll(path)

	if err != nil {
		w.WriteHeader(500)
		return
	}

	err = UpdateIndex(filename, true)

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		w.Write([]byte("Update index error"))
		return
	}

	err = commitAndPush(repo, fmt.Sprintf("Delete %s. T=%s", filename, time.Now().String()))

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		w.Write([]byte("Push error"))
		return
	}

}

func RenameHandle(w http.ResponseWriter, r *http.Request) {

	if !checkAdmin(w, r) {
		w.WriteHeader(403)
		return
	}

	query := r.URL.Query()

	_f := strings.Trim(strings.TrimLeft(query.Get("file"), "/"), "/")
	_n := strings.Trim(strings.TrimLeft(query.Get("name"), "/"), "/")

	fileName := filepath.Join(config.AppConf.ExposingDir, _f)
	newName := filepath.Join(config.AppConf.ExposingDir, _n)

	err := os.Rename(fileName, newName)

	if err != nil {
		w.WriteHeader(500)
		io.WriteString(w, "Rename error: "+err.Error())
		return
	}

	_, err = os.Open(newName)

	if err != nil {
		w.WriteHeader(500)
		io.WriteString(w, "Rename error: "+err.Error())
		return
	}

	err = UpdateIndex(_f, true)

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		w.Write([]byte("Update index error"))
		return
	}

	err = UpdateIndex(_n, false)

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		w.Write([]byte("Update index error"))
		return
	}

	err = commitAndPush(repo, fmt.Sprintf("Renamed %s to %s. T=%s", _n, _f, time.Now().String()))

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		w.Write([]byte("Push error"))
		return
	}

}

func CreateFile(path string) (*os.File, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return nil, err
	}

	return os.Create(path)
}
