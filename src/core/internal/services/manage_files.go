package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"kerimniy.qzz.io/vebvy/internal/config"
)

var repoMu sync.Mutex

type UploadData struct {
	NewName string `json:"newName"`
	Content string `json:"content"`
}

func httpErr(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(code)
	_, _ = io.WriteString(w, msg)
}

func requireMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method != method {
		w.Header().Set("Allow", method)
		httpErr(w, http.StatusMethodNotAllowed, "method not allowed")
		return false
	}
	return true
}

func requireAdmin(w http.ResponseWriter, r *http.Request) bool {
	if !config.Admin.Exist || config.Admin.Email == "" || !checkAdmin(w, r) {
		httpErr(w, http.StatusForbidden, "forbidden")
		return false
	}
	return true
}

func normalizePageName(raw string) (string, error) {
	name := strings.Trim(strings.TrimSpace(raw), "/")
	if name == "" {
		name = "index"
	}
	name = filepath.ToSlash(name)

	for _, seg := range strings.Split(name, "/") {
		if seg == ".." {
			return "", errors.New("path traversal is not allowed")
		}
	}
	name = path.Clean(name)

	if name == "." || name == "" {
		return "", errors.New("empty path")
	}
	if strings.ContainsFunc(name, func(r rune) bool { return r < 0x20 || r == ':' }) {
		return "", errors.New("invalid character in path")
	}
	for _, seg := range strings.Split(name, "/") {
		if seg == ".git" {
			return "", errors.New(".git is internal")
		}
	}
	if name == "index.json" {
		return "", errors.New("index.json is an internal file")
	}
	if name == "-" || strings.HasPrefix(name, "-/") {
		return "", errors.New("/-/ is reserved for built-in pages")
	}
	return name, nil
}

func repoPath(name string) (string, error) {
	p := filepath.Join(config.AppConf.RepoDir, filepath.FromSlash(name))
	rel, err := filepath.Rel(config.AppConf.RepoDir, p)
	if err != nil || rel == "." || rel == ".." ||
		strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", errors.New("path escapes repository")
	}
	return p, nil
}

func mutateIndex(fn func(set map[string]bool)) error {
	config.AppConf.Index.Mu.Lock()
	defer config.AppConf.Index.Mu.Unlock()

	if config.AppConf.Index.Set == nil {
		config.AppConf.Index.Set = make(map[string]bool)
	}
	fn(config.AppConf.Index.Set)

	b, err := json.Marshal(config.AppConf.Index.Set)
	if err != nil {
		return err
	}
	tmp, err := os.CreateTemp(config.AppConf.RepoDir, ".index-*.tmp")
	if err != nil {
		return err
	}
	tmpName := tmp.Name()
	defer os.Remove(tmpName)

	if _, err := tmp.Write(b); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmpName, filepath.Join(config.AppConf.RepoDir, "index.json"))
}

func commitMsg(action, name string) string {
	return fmt.Sprintf("%s %s. T=%s", action, name, time.Now().UTC().Format(time.RFC3339))
}

func UploadHandle(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}
	if !requireAdmin(w, r) {
		return
	}

	limit := int64(config.AppConf.UploadLimit)
	if limit <= 0 {
		limit = 1 << 20
	}
	r.Body = http.MaxBytesReader(w, r.Body, limit)

	b, err := io.ReadAll(r.Body)
	if err != nil {
		var tooLarge *http.MaxBytesError
		if errors.As(err, &tooLarge) {
			httpErr(w, http.StatusRequestEntityTooLarge, "upload limit exceeded")
			return
		}
		httpErr(w, http.StatusBadRequest, "read body: "+err.Error())
		return
	}
	payload := UploadData{}
	if err := json.Unmarshal(b, &payload); err != nil {
		httpErr(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	rawFile := strings.TrimSpace(r.URL.Query().Get("file"))
	rawNew := strings.TrimSpace(payload.NewName)

	targetRaw := rawNew
	if targetRaw == "" {
		targetRaw = rawFile
	}
	target, err := normalizePageName(targetRaw)
	if err != nil {
		httpErr(w, http.StatusBadRequest, "name: "+err.Error())
		return
	}
	oldName, err := normalizePageName(rawFile)
	if err != nil {
		httpErr(w, http.StatusBadRequest, "file: "+err.Error())
		return
	}

	oldProvided := strings.Trim(rawFile, "/") != ""
	renamed := oldProvided && oldName != target

	targetPath, err := repoPath(target)
	if err != nil {
		httpErr(w, http.StatusBadRequest, err.Error())
		return
	}
	oldPath, err := repoPath(oldName)
	if err != nil {
		httpErr(w, http.StatusBadRequest, err.Error())
		return
	}

	repoMu.Lock()
	defer repoMu.Unlock()

	if info, err := os.Lstat(targetPath); err == nil && info.IsDir() {
		httpErr(w, http.StatusConflict, "target is a directory")
		return
	}

	f, err := CreateFile(targetPath)
	if err != nil {
		httpErr(w, http.StatusInternalServerError, "create file: "+err.Error())
		return
	}
	if _, err := io.WriteString(f, payload.Content); err != nil {
		f.Close()
		httpErr(w, http.StatusInternalServerError, "write: "+err.Error())
		return
	}
	if err := f.Close(); err != nil {
		httpErr(w, http.StatusInternalServerError, "close: "+err.Error())
		return
	}

	if renamed {
		if info, err := os.Lstat(oldPath); err == nil && !info.IsDir() {
			if err := os.Remove(oldPath); err != nil && !os.IsNotExist(err) {
				httpErr(w, http.StatusInternalServerError, "remove old file: "+err.Error())
				return
			}
		}
	}

	err = mutateIndex(func(set map[string]bool) {
		if renamed {
			delete(set, oldName)
		}
		set[target] = true
	})
	if err != nil {
		httpErr(w, http.StatusInternalServerError, "update index: "+err.Error())
		return
	}

	if err := commitAndPush(commitMsg("Edit", target)); err != nil {
		httpErr(w, http.StatusInternalServerError, "push: "+err.Error())
		return
	}
	w.WriteHeader(http.StatusOK)
}

func DeleteHandle(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodDelete) {
		return
	}
	if !requireAdmin(w, r) {
		return
	}

	name, err := normalizePageName(r.URL.Query().Get("file"))
	if err != nil {
		httpErr(w, http.StatusBadRequest, err.Error())
		return
	}
	p, err := repoPath(name)
	if err != nil {
		httpErr(w, http.StatusBadRequest, err.Error())
		return
	}

	repoMu.Lock()
	defer repoMu.Unlock()

	info, err := os.Lstat(p)
	if err != nil {
		if os.IsNotExist(err) {
			httpErr(w, http.StatusNotFound, "page not found")
			return
		}
		httpErr(w, http.StatusInternalServerError, "stat: "+err.Error())
		return
	}

	if err := os.RemoveAll(p); err != nil {
		httpErr(w, http.StatusInternalServerError, "delete: "+err.Error())
		return
	}

	err = mutateIndex(func(set map[string]bool) {
		delete(set, name)
		if info.IsDir() {
			prefix := name + "/"
			for k := range set {
				if strings.HasPrefix(k, prefix) {
					delete(set, k)
				}
			}
		}
	})
	if err != nil {
		httpErr(w, http.StatusInternalServerError, "update index: "+err.Error())
		return
	}

	if err := commitAndPush(commitMsg("Delete", name)); err != nil {
		httpErr(w, http.StatusInternalServerError, "push: "+err.Error())
		return
	}
	w.WriteHeader(http.StatusOK)
}

func RenameHandle(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}
	if !requireAdmin(w, r) {
		return
	}

	q := r.URL.Query()
	oldName, err := normalizePageName(q.Get("file"))
	if err != nil {
		httpErr(w, http.StatusBadRequest, "file: "+err.Error())
		return
	}
	newName, err := normalizePageName(q.Get("name"))
	if err != nil {
		httpErr(w, http.StatusBadRequest, "name: "+err.Error())
		return
	}
	if oldName == newName {
		w.WriteHeader(http.StatusOK)
		return
	}

	oldPath, err := repoPath(oldName)
	if err != nil {
		httpErr(w, http.StatusBadRequest, err.Error())
		return
	}
	newPath, err := repoPath(newName)
	if err != nil {
		httpErr(w, http.StatusBadRequest, err.Error())
		return
	}

	repoMu.Lock()
	defer repoMu.Unlock()

	info, err := os.Lstat(oldPath)
	if err != nil {
		if os.IsNotExist(err) {
			httpErr(w, http.StatusNotFound, "page not found")
			return
		}
		httpErr(w, http.StatusInternalServerError, "stat: "+err.Error())
		return
	}

	if _, err := os.Lstat(newPath); err == nil {
		httpErr(w, http.StatusConflict, "target already exists")
		return
	} else if !os.IsNotExist(err) {
		httpErr(w, http.StatusInternalServerError, "stat target: "+err.Error())
		return
	}

	if info.IsDir() && strings.HasPrefix(newName+"/", oldName+"/") {
		httpErr(w, http.StatusBadRequest, "cannot move a directory into itself")
		return
	}

	if err := os.MkdirAll(filepath.Dir(newPath), 0o755); err != nil {
		httpErr(w, http.StatusInternalServerError, "mkdir: "+err.Error())
		return
	}
	if err := os.Rename(oldPath, newPath); err != nil {
		httpErr(w, http.StatusInternalServerError, "rename: "+err.Error())
		return
	}

	err = mutateIndex(func(set map[string]bool) {
		delete(set, oldName)
		set[newName] = true
		if info.IsDir() {
			prefix := oldName + "/"
			for k := range set {
				if strings.HasPrefix(k, prefix) {
					delete(set, k)
					set[newName+"/"+k[len(prefix):]] = true
				}
			}
		}
	})
	if err != nil {
		httpErr(w, http.StatusInternalServerError, "update index: "+err.Error())
		return
	}

	if err := commitAndPush(commitMsg("Rename", oldName+" -> "+newName)); err != nil {
		httpErr(w, http.StatusInternalServerError, "push: "+err.Error())
		return
	}
	w.WriteHeader(http.StatusOK)
}

func CreateFile(path string) (*os.File, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return nil, err
	}

	return os.Create(path)
}
