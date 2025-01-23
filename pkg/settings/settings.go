package settings

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

type Settings struct {
	Range      ScanParams
	Ports      []int
	NumWorkers int
}
type ScanParams struct {
	StartIp string
	EndIp   string
}

var defaultSettings = &Settings{
	Range: ScanParams{
		StartIp: "",
		EndIp:   "",
	},
	Ports:      []int{22, 80, 135, 139, 443, 445},
	NumWorkers: 100,
}

func New() (*Settings, error) {
	var dir, file string
	switch runtime.GOOS {
	case "linux":
		dir = filepath.Join(os.Getenv("HOME"), ".local", "share", "dark-scanner")
		file = filepath.Join(dir, "settings.json")
	default:
		fmt.Println("Warning: Settings loading is not supported on this platform.")
		return defaultSettings, nil
	}

	if _, err := os.Stat(file); os.IsNotExist(err) {
		return defaultSettings, nil
	}

	settings := &Settings{}
	b, err := os.ReadFile(file)
	if err != nil {
		return defaultSettings, err
	}

	err = json.Unmarshal(b, settings)
	if err != nil {
		return defaultSettings, err
	}

	return settings, nil
}

func (s Settings) Save() error {
	var dir, file string
	switch runtime.GOOS {
	case "linux":
		dir = filepath.Join(os.Getenv("HOME"), ".local", "share", "dark-scanner")
		file = filepath.Join(dir, "settings.json")
	default:
		fmt.Println("Warning: Settings saving is not supported on this platform.")
		return nil
	}

	if _, err := os.Stat(dir); os.IsNotExist(err) {
		err := os.MkdirAll(dir, 0755)
		if err != nil {
			return err
		}
	}

	b, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}

	err = os.WriteFile(file, b, 0644)
	if err != nil {
		return err
	}

	return nil
}
