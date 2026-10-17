package transport

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"kerimniy.qzz.io/vebvy/internal/config"
	"kerimniy.qzz.io/vebvy/internal/services"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("FRONTEND"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func ListenAndServeHTTP(ctx context.Context) {
	mux := http.NewServeMux()

	mux.HandleFunc("/auth/register", services.Register)
	mux.HandleFunc("/auth/login", services.Login)
	mux.HandleFunc("/auth/logout", services.Logout)
	mux.HandleFunc("/auth/reset", services.ResetPassword)
	mux.HandleFunc("/auth/change", services.Change_password)
	mux.HandleFunc("/auth/me", services.GetUser)
	mux.HandleFunc("/auth/code", services.RequestConfirmCode)

	mux.HandleFunc("/manage/upload", services.UploadHandle)
	mux.HandleFunc("/manage/upload-multiple", services.UploadMultipleHandle)
	mux.HandleFunc("/manage/delete", services.DeleteHandle)
	mux.HandleFunc("/manage/delete-all", services.DeleteAllHandle)
	mux.HandleFunc("/manage/rename", services.RenameHandle)

	mux.HandleFunc("/info/upload-limit", getUploadLimit)
	mux.HandleFunc("/info/search-limit", getSearchLimit)
	mux.HandleFunc("/info/result-limit", getResultLimit)

	mux.HandleFunc("/", indexPage)

	srv := &http.Server{
		Addr:    os.Getenv("HOST"),
		Handler: corsMiddleware(mux),
	}

	go func() {
		if os.Getenv("CERT") != "" && os.Getenv("KEY") != "" {
			fmt.Println("Listening at: ", os.Getenv("HOST"), ", TLS enabled")

			err := srv.ListenAndServeTLS(os.Getenv("CERT"), os.Getenv("KEY"))

			if err != nil {
				log.Fatal(0, err)
			}
		} else {
			fmt.Println("Listening at: ", os.Getenv("HOST"), ", TLS disabled")

			err := srv.ListenAndServe()

			if err != nil {
				log.Fatal(0, err)
			}
		}
	}()

	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()
	fmt.Println("Shutting down...")
	srv.Shutdown(shutdownCtx)
}

func getUploadLimit(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, strconv.Itoa(config.AppConf.UploadLimit))

}

func getSearchLimit(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, strconv.Itoa(config.AppConf.SearchResultCount))
}

func getResultLimit(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, strconv.Itoa(config.AppConf.ResultCount))
}

func indexPage(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, os.Getenv("FRONTEND"), 308)
}
