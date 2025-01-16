package util

import (
	_ "embed"
	"fmt"
	"os"
	"os/user"
	"path/filepath"
)

//go:embed assets/icon.png
var iconData []byte

func AddDesktopItem() error {
	content := map[string]string{
		"Type":       "Application",
		"Name":       "Dark Scanner",
		"Comment":    "Tiny network scanner application",
		"Categories": "Network;",
		"Terminal":   "false", // Use "true" if the application runs in a terminal
	}
	filename := "dark-scanner.desktop"
	// Get the current user's home directory
	usr, err := user.Current()
	if err != nil {
		return fmt.Errorf("failed to get current user: %w", err)
	}
	desktopDir := filepath.Join(usr.HomeDir, ".local", "share", "applications")
	iconDir := filepath.Join(usr.HomeDir, ".local", "share", "icons")

	// Ensure the directories exist
	err = os.MkdirAll(desktopDir, 0755)
	if err != nil {
		return fmt.Errorf("failed to create applications directory: %w", err)
	}
	err = os.MkdirAll(iconDir, 0755)
	if err != nil {
		return fmt.Errorf("failed to create icons directory: %w", err)
	}

	// Copy the icon to the icons directory
	iconDestPath := filepath.Join(iconDir, "dark-scanner.png")
	err = os.WriteFile(iconDestPath, iconData, 0644)

	// Get the path of the current executable
	execPath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("failed to get current executable path: %w", err)
	}

	// Path to the .desktop file
	desktopFilePath := filepath.Join(desktopDir, filename)
	if filepath.Ext(desktopFilePath) != ".desktop" {
		desktopFilePath += ".desktop"
	}

	// Add the executable path and icon path to the content map
	content["Exec"] = execPath
	content["Icon"] = iconDestPath

	// Create the content of the .desktop file
	desktopContent := "[Desktop Entry]\n"
	for key, value := range content {
		desktopContent += fmt.Sprintf("%s=%s\n", key, value)
	}

	// Write the content to the .desktop file
	err = os.WriteFile(desktopFilePath, []byte(desktopContent), 0644)
	if err != nil {
		return fmt.Errorf("failed to write desktop file: %w", err)
	}

	return nil
}
