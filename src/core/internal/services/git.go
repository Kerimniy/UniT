package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"

	git "github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	"kerimniy.qzz.io/vebvy/internal/config"
)

var GIT_REPO_TOKEN string
var GIT_REPO_URL string
var repo *git.Repository

func InitGit() error {

	GIT_REPO_TOKEN = os.Getenv("GIT_REPO_TOKEN")
	GIT_REPO_URL = os.Getenv("GIT_REPO_URL")

	if GIT_REPO_TOKEN == "" {
		return fmt.Errorf("GIT_TOKEN is not set")
	}

	if GIT_REPO_URL == "" {
		return fmt.Errorf("GIT_REPO_URL is not set")
	}
	var err error
	repo, err = openOrClone(
		GIT_REPO_URL,
		config.AppConf.RepoDir,
	)
	if err != nil {
		return err
	}

	err = pull(repo)

	if err != nil {
		return err
	}

	err = loadIndex()

	if err != nil {
		return err
	}
	return nil
}

func openOrClone(repoURL, localPath string) (*git.Repository, error) {
	repo, err := git.PlainOpen(localPath)
	if err == nil {
		return repo, nil
	}

	if errors.Is(err, git.ErrRepositoryNotExists) {
		return git.PlainClone(localPath, false, &git.CloneOptions{
			URL: repoURL,
		})
	}

	return nil, fmt.Errorf("open repository: %w", err)
}

func pull(repo *git.Repository) error {
	wt, err := repo.Worktree()
	if err != nil {
		return err
	}

	err = wt.Pull(&git.PullOptions{
		RemoteName: "origin",
	})
	if err != nil && !errors.Is(err, git.NoErrAlreadyUpToDate) {
		return fmt.Errorf("pull: %w", err)
	}

	return nil
}
func UpdateIndex(path string, isDelete bool) error {
	p := filepath.Join(config.AppConf.RepoDir, "index.json")
	file, err := os.Create(p)

	if err != nil {
		return err
	}
	defer file.Close()

	config.AppConf.Index.Mu.Lock()
	if isDelete {
		delete(config.AppConf.Index.Set, path)
	} else {
		config.AppConf.Index.Set[path] = true
	}
	config.AppConf.Index.Mu.Unlock()

	b, err := json.Marshal(config.AppConf.Index.Set)

	if err != nil {
		return err
	}

	_, err = file.Write(b)

	if err != nil {
		return err
	}
	return nil
}

func loadIndex() error {
	p := filepath.Join(config.AppConf.RepoDir, "index.json")
	file, err := os.Open(p)

	if err != nil {
		if os.IsNotExist(err) {
			f, err := os.Create(p)
			if err != nil {
				log.Fatal(err)
				return err
			}

			defer f.Close()
			f.WriteString("{}")

		} else {
			return err
		}
		return nil
	} else {
		b, err := io.ReadAll(file)
		if err != nil {
			log.Fatal(err)
			return err
		}
		err = json.Unmarshal(b, &config.AppConf.Index.Set)
		if err != nil {
			log.Fatal(err)
			return err
		}
	}
	defer file.Close()

	return nil
}

func commitAndPush(
	message string,
) error {
	wt, err := repo.Worktree()
	if err != nil {
		return err
	}

	if err = wt.AddWithOptions(&git.AddOptions{All: true}); err != nil {
		return fmt.Errorf("add: %w", err)
	}

	status, err := wt.Status()
	if err != nil {
		return err
	}

	if status.IsClean() {
		return nil
	}

	_, err = wt.Commit(message, &git.CommitOptions{
		Author: &object.Signature{
			Name:  "Vebvy",
			Email: "dummy@dummy.org",
			When:  time.Now(),
		},
	})
	if err != nil {
		return fmt.Errorf("commit: %w", err)
	}

	err = repo.Push(&git.PushOptions{
		RemoteName: "origin",
		Auth: &http.BasicAuth{
			Username: "Vebvy",
			Password: GIT_REPO_TOKEN,
		},
	})
	if err != nil && err != git.NoErrAlreadyUpToDate {
		return fmt.Errorf("push: %w", err)
	}

	return nil
}
