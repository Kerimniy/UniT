package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/gob"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/armon/go-radix"
	"github.com/gorilla/securecookie"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

var SECRET_KEY = make([]byte, 64)
var s = securecookie.New(SECRET_KEY, nil)
var history = []HistoryBlock{}
var historyMutex sync.RWMutex

var templates_cache = make(map[string]string)
var templates_lock sync.RWMutex

var radix_lock sync.RWMutex
var radix_search = radix.New()

var user_exists = false

var Title = "UniT"
var search_limit = 7
var history_limit = 20
var history_enabled = true

var s_icon_path = "static/pageicons/favicon.png"
var t_icon_path = "static/pageicons/favicon.png"

type Request struct {
	Filename string `json:"filename"`
	Md       string `json:"md"`
	Html     string `json:"html"`
	Type     string `json:"type"`
	Commit   string `json:"commit"`
}

type UserForm struct {
	Name     string `json:"login"`
	Password string `json:"password"`
}

type HistoryBlock struct {
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

type HistoruCnt struct {
	IsEnabled bool
	IsLogined bool

	S_icon string
	T_icon string

	Title string
}

type Cnt struct {
	Content template.HTML
	IsAuth  bool
	Path    string

	S_icon string
	T_icon string

	Title string

	Buttons template.HTML
}

type SettingsCnt struct {
	IsEnabled    bool
	Title        string
	HistoryLimit int
	SearchLimit  int
}

type RData struct {
	P string `json:"p"`
	N string `json:"n"`
}

var edit_tmpl = template.Must(template.ParseFiles("templates/edit.html"))
var page_tmpl = template.Must(template.ParseFiles("templates/page.html"))
var settings_tmpl = template.Must(template.ParseFiles("templates/settings.html"))
var history_tmpl = template.Must(template.ParseFiles("templates/history.html"))
var login_tmpl = template.Must(template.ParseFiles("templates/login.html"))
var reg_tmpl = template.Must(template.ParseFiles("templates/reg.html"))
var index = template.Must(template.ParseFiles("templates/index.html"))

var t404 = read_file_as_str("templates/404.html")
var t_about = read_file_as_str("templates/about.html")
var t_syntax = read_file_as_str("templates/syntax.html")
var t_user_guide = read_file_as_str("templates/user-guide.html")
var t_admin_guide = read_file_as_str("templates/admin-guide.html")
var t_attachments = read_file_as_str("templates/attachments.html")

var dict = make(map[string]any)
var db *sql.DB

func setSignedCookie(w http.ResponseWriter) {
	encoded, _ := s.Encode("session", "authorized")
	cookie := &http.Cookie{Name: "session", Value: encoded, HttpOnly: true, Path: "/", SameSite: http.SameSiteLaxMode, Expires: time.Unix(time.Now().Unix()+34560000, 0)}
	http.SetCookie(w, cookie)
}

func deleteCookie(w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     "session",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)

}

func getSignedCookie(r *http.Request, w http.ResponseWriter) string {
	if cookie, err := r.Cookie("session"); err == nil {

		var decoded string

		if err = s.Decode("session", cookie.Value, &decoded); err == nil {

			return decoded
		}
		deleteCookie(w)
	}
	return "none"
}

func test(w http.ResponseWriter, r *http.Request) {
	var t = template.Must(template.ParseFiles("templates/TEST.html"))

	t.Execute(w, nil)

}

func main() {

	var host string
	host = read_file_as_str("HOST")

	if host == "" {
		host = "127.0.0.1:6060"
	}

	file, f_err := os.Open("SECRET_KEY")
	if f_err != nil {
		_, e := rand.Read(SECRET_KEY)
		f, err := os.Create("SECRET_KEY")
		_, e1 := f.Write(SECRET_KEY)
		if e != nil || err != nil || e1 != nil {
			log.Fatal(e)
		}

	} else {
		_, err2 := file.Read(SECRET_KEY)
		if err2 != nil {
			_, e := rand.Read(SECRET_KEY)
			f, err := os.Create("SECRET_KEY")
			_, e1 := f.Write(SECRET_KEY)
			if e != nil || err != nil || e1 != nil {
				log.Fatal(e)
			}

		}
	}
	s = securecookie.New(SECRET_KEY, nil)

	file.Close()
	gob.Register(UserForm{})
	var err error
	db, err = sql.Open("sqlite3", "db/main.db?_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		log.Fatal(err)
	}

	defer func() {
		err0 := db.Close()
		if err0 != nil {
			fmt.Println("Error: ", err0)
		}
	}()

	_, de0 := db.Exec("CREATE TABLE IF NOT EXISTS users (login TEXT NOT NULL UNIQUE,password TEXT NOT NULL,PRIMARY KEY (login))")
	_, de1 := db.Exec("CREATE TABLE IF NOT EXISTS history (message TEXT NOT NULL ,timestamp TEXT NOT NULL)")
	_, de2 := db.Exec("CREATE TABLE IF NOT EXISTS service (title TEXT NOT NULL ,search_limit INTEGER NOT NULL,history_limit INTEGER NOT NULL,history_enabled INTEGER NOT NULL, t_icon INTEGER NOT NULL, s_icon INTEGER NOT NULL)")
	rows, e := db.Query("SELECT * FROM users")

	if e != nil || de0 != nil || de1 != nil || de2 != nil {
		log.Fatal(e, de0, de1, de2)
	}
	defer func() {
		err0 := rows.Close()
		if err0 != nil {
			fmt.Println("Error: ", err0)
		}
	}()

	for rows.Next() {
		user_exists = true
		break
	}

	service_rows, e2 := db.Query("SELECT * FROM service;")

	if e2 != nil {
		log.Fatal(e2)
	}
	defer func() {
		err0 := service_rows.Close()
		if err0 != nil {
			fmt.Println("Error: ", err0)
		}
	}()
	exists := false
	for service_rows.Next() {

		err = service_rows.Scan(&Title, &search_limit, &history_limit, &history_enabled, &t_icon_path, &s_icon_path)
		if err != nil {
			fmt.Println(err)
			continue
		}
		exists = true
		break
	}
	if !exists {
		_, err1 := db.Exec("INSERT INTO service (title, search_limit,history_limit,history_enabled, t_icon, s_icon) VALUES (?, ?,?,?,?,?);", Title, search_limit, history_limit, history_enabled, t_icon_path, s_icon_path)
		if err1 != nil {
			fmt.Println("Error:", err1)
		}
	}

	history_rows, e1 := db.Query("SELECT * FROM history ORDER BY timestamp DESC LIMIT ? ;", history_limit)

	if e1 != nil {
		log.Fatal(e1)
	}
	defer func() {
		err0 := history_rows.Close()
		if err0 != nil {
			fmt.Println("Error: ", err0)
		}
	}()

	for history_rows.Next() {
		var temp HistoryBlock
		err = history_rows.Scan(&temp.Message, &temp.Timestamp)
		if err != nil {
			fmt.Println(err)
			continue
		}
		history = append(history, temp)
	}
	if len(history) > 0 {
		reverseArray(history)

		_, err0 := db.Exec("Delete from history WHERE timestamp < $1", history[0].Timestamp)
		if err0 != nil {
			fmt.Println("Error:", err0)
		}
	}

	entries, err := os.ReadDir("./pages/html")

	if err != nil {
		log.Fatal(err)
	}

	var files = make([]string, len(entries))

	for i, e := range entries {
		files[i] = strings.ReplaceAll(e.Name(), "($)", "/")
	}

	var files_el = [][]string{}

	for _, element := range files {

		files_el = append(files_el, strings.Split(element, "/"))
	}

	for _, element := range files_el {

		var last = dict
		for i, e := range element {

			radix_lock.Lock()
			radix_search.Insert(e, strings.Join(element[0:i+1], "/"))
			radix_lock.Unlock()
			var n = "\x01" + e + "/"
			_, ok := last[n]

			if strings.Contains(e, ".") {

				last[strings.Replace(e, ".html", "", 1)] = ""
				continue
			}

			if !ok {
				last[n] = map[string]any{}
			}

			last = last[n].(map[string]any)

		}

	}

	http.HandleFunc("/-/api/create-page", create_new_page)
	http.HandleFunc("/-/api/add-att", add_attachment)
	http.HandleFunc("/-/api/get-page", get_page_source)
	http.HandleFunc("/-/api/get-index-pages", get_index_pages)
	http.HandleFunc("/-/index", page_indexies)
	http.HandleFunc("/-/about", render_about)
	http.HandleFunc("/-/help/md-syntax", render_syntax)
	http.HandleFunc("/-/help/a-guide", render_admin_guide)
	http.HandleFunc("/-/help/u-guide", render_user_guide)
	http.HandleFunc("/-/load", render_load_att)
	http.HandleFunc("/-/search", search_request)
	http.HandleFunc("/-/edit", render_edit)
	http.HandleFunc("/-/login", render_login)
	http.HandleFunc("/-/api/registrate", registration)
	http.HandleFunc("/-/api/history", get_history)
	http.HandleFunc("/-/history-delete", delete_history)
	http.HandleFunc("/-/history-toggle", toggle_history)
	http.HandleFunc("/-/api/login", login)
	http.HandleFunc("/-/api/rename", rename)
	http.HandleFunc("/-/logout", logout)
	http.HandleFunc("/-/history", render_history)
	http.HandleFunc("/-/delete-page", delete_page)
	http.HandleFunc("/-/settings", render_settings)
	http.HandleFunc("/-/api/settings", settings)
	http.HandleFunc("/-/test", test)
	http.HandleFunc("/{p...}", get_page)
	fs := http.FileServer(http.Dir("./"))
	http.Handle("/static/", fs)
	fmt.Printf("Listening on %s\n", host)
	log.Fatal(http.ListenAndServe(host, nil))

}

func add_attachment(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(405)
		return
	} else if !is_logined(r, w) {
		http.Error(w, "Error 401", http.StatusUnauthorized)
		return
	} else {
		r.ParseMultipartForm(10 << 25)
		file, handler, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Error retrieving file", http.StatusInternalServerError)
			return
		}
		defer file.Close()
		dst, err := os.Create(filepath.Join("static/att/", handler.Filename))
		if err != nil {
			http.Error(w, "Error creating file", http.StatusInternalServerError)
			return
		}
		defer dst.Close()
		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "Error writing file", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(200)
		if history_enabled {
			go update_history("", "New attachement", fmt.Sprint("Attached ", handler.Filename))
		}
	}
}

func rename(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if !is_logined(r, w) {
		http.Redirect(w, r, "/-/login", http.StatusUnauthorized)
		return
	}
	var data RData
	err := json.NewDecoder(r.Body).Decode(&data)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println(err)
		return
	}

	p := strings.Trim(data.P, "/")
	n := strings.Trim(data.N, "/")
	if strings.Contains(p, "..") || strings.Contains(n, "..") {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	p_s := strings.ReplaceAll(p, "/", "($)")
	_, e := os.Stat(fmt.Sprintf("pages/md/%s.md", p_s))
	if e != nil {
		fmt.Println("Error:", e)
		w.WriteHeader(http.StatusBadRequest)

		return
	}

	n_s := strings.ReplaceAll(n, "/", "($)")
	e = os.Rename(fmt.Sprintf("pages/md/%s.md", p_s), fmt.Sprintf("pages/md/%s.md", n_s))
	e1 := os.Rename(fmt.Sprintf("pages/html/%s.html", p_s), fmt.Sprintf("pages/html/%s.html", n_s))

	if e1 != nil || e != nil {
		fmt.Println("Error2:", e)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	templates_lock.Lock()
	v := templates_cache[p]
	delete(templates_cache, p)
	templates_cache[n] = v
	templates_lock.Unlock()

	path_el := strings.Split(p, "/")
	dict_p := dict
	delete_r(dict_p, path_el, 0)

	fmt.Println(dict)
	radix_lock.Lock()
	radix_search.Delete(p)
	radix_lock.Unlock()

	update_with(strings.Split(n+".html", "/"))
	update_history("r", n, p)

}

func delete_r(p map[string]any, key []string, idx int) {
	if idx == len(key)-1 {
		delete(p, key[idx])
		return
	}
	prev := p

	var ok bool
	p, ok = p[fmt.Sprintf("\x01%s/", key[idx])].(map[string]any)
	if !ok {
		return
	}
	delete_r(p, key, idx+1)
	if len(p) < 1 {
		delete(prev, fmt.Sprintf("\x01%s/", key[idx]))
	}

}

func settings(w http.ResponseWriter, r *http.Request) {
	if !is_logined(r, w) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	favicon, _, err := r.FormFile("favicon")
	if err == nil {
		dst, err := os.Create("static/pageicons/favicon.png")
		if err == nil {
			if _, err := io.Copy(dst, favicon); err == nil {

			}
		}
		fmt.Println(err)
		defer func() {
			err0 := favicon.Close()
			if err0 != nil {
				fmt.Println("Error: ", err0)
			}
		}()
	}

	title_icon, t_handler, err := r.FormFile("image1")
	if err == nil {
		path := fmt.Sprintf("static/pageicons/%s", t_handler.Filename)
		dst, err := os.Create(path)
		if err == nil {
			if _, err := io.Copy(dst, title_icon); err == nil {
				e := os.Remove(t_icon_path)
				if e != nil {
					fmt.Println(e)
				}
				_, e1 := db.Exec("UPDATE service SET t_icon = ? ", path)
				if e1 != nil {
					fmt.Println("Error:", e1)
				}
				t_icon_path = path
			}

		}

		defer func() {
			err0 := title_icon.Close()
			if err0 != nil {
				fmt.Println("Error: ", err0)
			}
		}()

	}

	side_icon, s_handler, err := r.FormFile("image2")
	if err == nil {
		path := fmt.Sprintf("static/pageicons/%s", s_handler.Filename)
		dst, err := os.Create(path)
		if err == nil {
			if _, err := io.Copy(dst, side_icon); err == nil {
				e := os.Remove(s_icon_path)
				if e != nil {
					fmt.Println(e)
				}
				_, e1 := db.Exec("UPDATE service SET s_icon = ? ", path)
				if e1 != nil {
					fmt.Println("Error:", e1)
				}
				s_icon_path = path
			}
		}
		defer func() {
			err0 := dst.Close()
			if err0 != nil {
				fmt.Println("Error: ", err0)
			}
		}()
		defer func() {
			err0 := side_icon.Close()
			if err0 != nil {
				fmt.Println("Error: ", err0)
			}
		}()

	}

	Title = r.FormValue("text")
	he := r.FormValue("history_enabled")

	history_enabled, err = strconv.ParseBool(he)

	history_limit, err = strconv.Atoi(r.FormValue("history_limit"))
	search_limit, err = strconv.Atoi(r.FormValue("search_limit"))
	_, e1 := db.Exec("UPDATE service SET title = ?, search_limit = ?,history_limit=?,history_enabled=? ", Title, search_limit, history_limit, history_enabled)
	if e1 != nil {
		fmt.Println("Error:", e1)
	}
}

func render_settings(w http.ResponseWriter, r *http.Request) {
	if !is_logined(r, w) {
		http.Redirect(w, r, "/-/login", http.StatusUnauthorized)
		return
	}

	e := settings_tmpl.Execute(w, SettingsCnt{Title: Title, IsEnabled: history_enabled, HistoryLimit: history_limit, SearchLimit: search_limit})
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_, e1 := fmt.Fprint(w, "500")
		if e1 != nil {

		}
	}
}

func get_history(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	historyMutex.RLock()
	e := json.NewEncoder(w).Encode(history)
	historyMutex.RUnlock()
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func render_edit(w http.ResponseWriter, r *http.Request) {
	if !is_logined(r, w) {
		http.Redirect(w, r, "/-/login", http.StatusUnauthorized)
		return
	}
	var content = Cnt{IsAuth: is_logined(r, w), T_icon: t_icon_path, S_icon: s_icon_path, Title: Title}

	e := edit_tmpl.Execute(w, content)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_, e1 := fmt.Fprint(w, "500")
		if e1 != nil {

		}
	}
}

func render_history(w http.ResponseWriter, r *http.Request) {
	hc := HistoruCnt{IsEnabled: history_enabled, IsLogined: is_logined(r, w), Title: Title, S_icon: s_icon_path, T_icon: t_icon_path}
	e := history_tmpl.Execute(w, hc)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_, e1 := fmt.Fprint(w, "500")
		if e1 != nil {

		}
	}
}

func logout(w http.ResponseWriter, r *http.Request) {
	deleteCookie(w)
	v := strings.Trim(r.URL.Query().Get("next"), "/")
	http.Redirect(w, r, fmt.Sprintf("/%s", v), http.StatusSeeOther)
}

func is_logined(r *http.Request, w http.ResponseWriter) bool {
	return getSignedCookie(r, w) == "authorized"
}

func toggle_history(w http.ResponseWriter, r *http.Request) {
	if !is_logined(r, w) {
		http.Redirect(w, r, "/-/login", http.StatusUnauthorized)
		return
	}
	history_enabled = !history_enabled
	_, e := db.Exec("UPDATE service SET history_enabled = ? ", history_enabled)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		w.WriteHeader(http.StatusOK)
	}
}

func delete_history(w http.ResponseWriter, r *http.Request) {
	if !is_logined(r, w) {
		http.Redirect(w, r, "/-/login", http.StatusUnauthorized)
		return
	}
	historyMutex.Lock()
	_, e := db.Exec("DELETE FROM  history")
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
		historyMutex.Unlock()
		return
	}

	history = []HistoryBlock{}
	historyMutex.Unlock()
	w.WriteHeader(http.StatusOK)
	return
}

func login(w http.ResponseWriter, r *http.Request) {
	var data UserForm

	err := json.NewDecoder(r.Body).Decode(&data)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var rows, err1 = db.Query("SELECT password FROM users WHERE login = ?", data.Name)

	if err1 != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var hash string
	for rows.Next() {
		err2 := rows.Scan(&hash)
		if err2 != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		if bcrypt.CompareHashAndPassword([]byte(hash), []byte(data.Password)) == nil {
			setSignedCookie(w)
			return
		}
	}
	w.WriteHeader(http.StatusBadRequest)

}

func registration(w http.ResponseWriter, r *http.Request) {
	var data UserForm
	if user_exists {
		http.Redirect(w, r, "/-/login", http.StatusSeeOther)
	}
	err := json.NewDecoder(r.Body).Decode(&data)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	_, err = db.Exec("INSERT INTO users(login,password) VALUES(?,?)", data.Name, string(hash))

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	setSignedCookie(w)
	user_exists = true

}

func render_login(w http.ResponseWriter, r *http.Request) {

	if !user_exists {
		e := reg_tmpl.Execute(w, nil)
		if e != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_, e1 := fmt.Fprint(w, "500")
			if e1 != nil {

			}
		}
		return
	} else {
		e := login_tmpl.Execute(w, nil)
		if e != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_, e1 := fmt.Fprint(w, "500")
			if e1 != nil {

			}
		}
	}

}

func search_request(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	rsp := make(map[string]string)
	if query == "" || query == " " {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")

		e := json.NewEncoder(w).Encode(rsp)
		if e != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	var c = 0
	radix_search.WalkPrefix(query, func(key string, value interface{}) bool {
		rsp[key] = value.(string)
		c++
		if c >= search_limit {
			return true
		}
		return false
	})
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	e := json.NewEncoder(w).Encode(rsp)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}

}

func update_with(element []string) {

	var last = dict
	for i, e := range element {

		radix_lock.Lock()
		radix_search.Insert(e, strings.Join(element[0:i+1], "/"))
		radix_lock.Unlock()

		var n = "\x01" + e + "/"
		_, ok := last[n]

		if strings.Contains(e, ".") {

			last[strings.Replace(e, ".html", "", 1)] = ""
			continue
		}

		if !ok {
			last[n] = map[string]any{}
		}

		last = last[n].(map[string]any)

	}

}

func get_index_pages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	p := r.URL.Query().Get("p")
	if p == "" {
		e := json.NewEncoder(w).Encode(dict)
		if e != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	var dict_pointer = dict
	var path_el = strings.Split(p, "/")
	for i := range path_el {
		if i == len(path_el)-1 {
			break
		}
		s, e := dict_pointer[path_el[i]+"/"].(map[string]any)
		if !e {

			rsp := map[string]string{"status": "400"}
			e := json.NewEncoder(w).Encode(rsp)
			if e != nil {
				w.WriteHeader(http.StatusInternalServerError)
			}
			return
		}
		dict_pointer = s
	}

	e := json.NewEncoder(w).Encode(dict_pointer)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}

}

func page_indexies(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	var content = Cnt{IsAuth: is_logined(r, w), T_icon: t_icon_path, S_icon: s_icon_path, Title: Title}

	e := index.Execute(w, content)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}

}

func update_history(Type string, name string, commit string) {
	var msg string
	if Type == "r" {
		msg = fmt.Sprintf("Renamed %s to %s", commit, name)
	} else if commit == "" {
		if Type == "a" {
			msg = fmt.Sprintf("Created %s", name)
		} else if Type == "d" {
			msg = fmt.Sprintf("Edited %s", name)
		} else {
			msg = fmt.Sprintf("Edited %s", name)
		}
	} else {
		msg = commit
	}
	historyMutex.Lock()
	timestamp := time.Now().Format(time.DateTime)
	history = append(history, HistoryBlock{Message: msg, Timestamp: timestamp})
	_, e := db.Exec("INSERT INTO history(message,timestamp) VALUES(?,?)", msg, timestamp)
	if e != nil {
		fmt.Println("Error:", e)
		historyMutex.Unlock()
		return
	}
	if len(history) > history_limit {
		tmp := make([]HistoryBlock, history_limit)
		copy(tmp, history[len(history)-history_limit:])
		history = tmp
		_, e2 := db.Exec("Delete from history WHERE timestamp < $1", history[0].Timestamp)

		if e2 != nil {
			fmt.Println("Error:", e2)
		}

	}
	historyMutex.Unlock()

}

func create_new_page(w http.ResponseWriter, r *http.Request) {
	var data Request
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if !is_logined(r, w) {
		http.Redirect(w, r, "/-/login", http.StatusMovedPermanently)
		return
	}
	err := json.NewDecoder(r.Body).Decode(&data)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println(err)
		return
	}
	if data.Filename == "" || strings.ContainsAny(data.Filename, `<>:"\|?*`) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if history_enabled {
		go update_history(data.Type, data.Filename, data.Commit)
	}
	p := strings.Trim(data.Filename, "/")
	var raw = p
	update_with(strings.Split(p+".html", "/"))

	p = strings.ReplaceAll(p, "/", "($)")

	templates_lock.Lock()
	templates_cache[raw] = data.Html
	templates_lock.Unlock()

	e1 := write_str_to_file(fmt.Sprintf("pages/md/%s.md", p), data.Md)

	e2 := write_str_to_file(fmt.Sprintf("pages/html/%s.html", p), data.Html)

	if e1 != nil || e2 != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println(err)
		return
	}

}

func delete_page(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if !is_logined(r, w) {
		http.Redirect(w, r, "/-/login", http.StatusUnauthorized)
		return
	}

	path := strings.Trim(r.URL.Query().Get("p"), "/")
	if history_enabled {
		go update_history("d", path, "")
	}
	radix_search.Delete(path)

	templates_lock.Lock()
	delete(templates_cache, strings.Trim(path, "/"))
	templates_lock.Unlock()

	delete_r(dict, strings.Split(path, "/"), 0)

	path = strings.ReplaceAll(path, "/", "($)")

	e0 := os.Remove(fmt.Sprintf("pages/md/%s.md", path))
	e1 := os.Remove(fmt.Sprintf("pages/html/%s.html", path))

	if e0 != nil || e1 != nil {
		fmt.Println(e0, "\n", e1)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)

}

func get_page(w http.ResponseWriter, r *http.Request) {
	path := r.PathValue("p")
	if path == "" {
		path = "main"
	}
	tmpl, ok := templates_cache[strings.Trim(path, "/")]
	if !ok {
		tmpl = get_html_file_from_storage(path)
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	var content = Cnt{Content: template.HTML(tmpl), IsAuth: is_logined(r, w), Path: path, T_icon: t_icon_path, S_icon: s_icon_path, Title: Title}
	e := page_tmpl.Execute(w, content)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_, e1 := fmt.Fprint(w, "500")
		if e1 != nil {

		}
	}

}

func get_html_file_from_storage(p string) string {
	p = strings.Trim(p, "/")
	var raw = p
	p = strings.ReplaceAll(p, "/", "($)")

	var tmpl = read_file_as_str(fmt.Sprintf("pages/html/%s.html", p))

	if tmpl == "" {
		tmpl = t404
	}

	templates_lock.Lock()
	if len(templates_cache) > 30 {
		templates_cache = make(map[string]string)
	}

	templates_cache[raw] = tmpl
	templates_lock.Unlock()
	return tmpl
}

func get_page_source(w http.ResponseWriter, r *http.Request) {

	p := r.URL.Query().Get("p")

	p = strings.ReplaceAll(p, "/", "($)")

	_, e := w.Write([]byte(read_file_as_str(fmt.Sprintf("pages/md/%s.md", p))))
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}

}

func read_file_as_str(path string) string {
	file, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer func() {
		if err = file.Close(); err != nil {

		}
	}()

	b, err1 := io.ReadAll(file)

	if err1 != nil {
		return ""
	}

	return string(b)
}

func write_str_to_file(path string, content string) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer func() {
		if err = file.Close(); err != nil {

		}
	}()

	_, err1 := file.WriteString(content)

	if err1 != nil {
		return err
	}
	return nil
}

func render_about(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	var btns = `

		 <a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/help/md-syntax">
                <img class="img-invert" src="/static/icons/guide-md.svg">
                <span>MD Syntax</span>
		 </a>
		<a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/help/u-guide">
                <img class="img-invert" src="/static/icons/guide-u.svg">
                <span>User Guide</span>
		 </a>
		<a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/help/a-guide">
                <img class="img-invert" src="/static/icons/guide-a.svg">
                <span>Admin Guide</span>
		 </a>

	`
	var content = Cnt{Content: template.HTML(t_about), IsAuth: is_logined(r, w), Path: "", T_icon: t_icon_path, S_icon: s_icon_path, Title: Title, Buttons: template.HTML(btns)}
	e := page_tmpl.Execute(w, content)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_, e1 := fmt.Fprint(w, "500")
		if e1 != nil {

		}
	}
}

func render_load_att(w http.ResponseWriter, r *http.Request) {

	if !is_logined(r, w) {
		http.Redirect(w, r, "/-/login", http.StatusUnauthorized)
		return
	}

	t_attachments = read_file_as_str("templates/attachments.html")

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	var btns = ``

	var content = Cnt{Content: template.HTML(t_attachments), IsAuth: is_logined(r, w), Path: "", T_icon: t_icon_path, S_icon: s_icon_path, Title: Title, Buttons: template.HTML(btns)}

	e := page_tmpl.Execute(w, content)

	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_, e1 := fmt.Fprint(w, "500")
		if e1 != nil {

		}
	}
}

func render_syntax(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	var btns = `

		 <a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/about">
                <img class="img-invert" src="/static/icons/about.svg">
                <span>About An UniT</span>
		 </a>
		<a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/help/u-guide">
                <img class="img-invert" src="/static/icons/guide-u.svg">
                <span>User Guide</span>
		 </a>
		<a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/help/a-guide">
                <img class="img-invert" src="/static/icons/guide-a.svg">
                <span>Admin Guide</span>
		 </a>

	`

	var content = Cnt{Content: template.HTML(t_syntax), IsAuth: is_logined(r, w), Path: "", T_icon: t_icon_path, S_icon: s_icon_path, Title: Title, Buttons: template.HTML(btns)}
	e := page_tmpl.Execute(w, content)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_, e1 := fmt.Fprint(w, "500")
		if e1 != nil {

		}
	}
}

func render_user_guide(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	var btns = `

		 <a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/about">
                <img class="img-invert" src="/static/icons/about.svg">
                <span>About An UniT</span>
		 </a>
		 <a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/help/md-syntax">
                <img class="img-invert" src="/static/icons/guide-md.svg">
                <span>MD Syntax</span>
		 </a>
		<a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/help/a-guide">
                <img class="img-invert" src="/static/icons/guide-a.svg">
                <span>Admin Guide</span>
		 </a>

	`

	var content = Cnt{Content: template.HTML(t_user_guide), IsAuth: is_logined(r, w), Path: "", T_icon: t_icon_path, S_icon: s_icon_path, Title: Title, Buttons: template.HTML(btns)}
	e := page_tmpl.Execute(w, content)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_, e1 := fmt.Fprint(w, "500")
		if e1 != nil {

		}
	}
}

func render_admin_guide(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	var btns = `

		 <a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/about">
                <img class="img-invert" src="/static/icons/about.svg">
                <span>About An UniT</span>
		 </a>
		 <a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/help/md-syntax">
                <img class="img-invert" src="/static/icons/guide-md.svg">
                <span>MD Syntax</span>
		 </a>
		<a class="menu-item" style="margin-bottom: 1.5vh;" href="/-/help/u-guide">
                <img class="img-invert" src="/static/icons/guide-u.svg">
                <span>User Guide</span>
		 </a>

	`

	var content = Cnt{Content: template.HTML(t_admin_guide), IsAuth: is_logined(r, w), Path: "", T_icon: t_icon_path, S_icon: s_icon_path, Title: Title, Buttons: template.HTML(btns)}
	e := page_tmpl.Execute(w, content)
	if e != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_, e1 := fmt.Fprint(w, "500")
		if e1 != nil {

		}
	}
}

func reverseArray(arr []HistoryBlock) {
	for i, j := 0, len(arr)-1; i < j; i, j = i+1, j-1 {
		arr[i], arr[j] = arr[j], arr[i]
	}
}
