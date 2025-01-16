package settings

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNew(t *testing.T) {
	// ... (rest of the test remains the same)

	// Test happy path: file exists and can be unmarshaled
	tmpDir, err := os.MkdirTemp("", "dark-scanner-test")
	assert.NoError(t, err)
	defer os.RemoveAll(tmpDir)

	settingsFile := filepath.Join(tmpDir, "settings.json")

	// Create default settings and write to file
	defaultSettingsCopy := *defaultSettings
	b, err := json.MarshalIndent(defaultSettingsCopy, "", "  ")
	assert.NoError(t, err)
	err = os.WriteFile(settingsFile, b, 0644)
	assert.NoError(t, err)

	// Load settings from file and compare with default settings
	loadedSettings, err := New()
	assert.NoError(t, err)
	assert.NotNil(t, loadedSettings)
	assert.Equal(t, defaultSettingsCopy, loadedSettings)
}

func TestLoad(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "dark-scanner-test")
	assert.NoError(t, err)
	defer os.RemoveAll(tmpDir)

	settingsFile := filepath.Join(tmpDir, "settings.json")

	// Create default settings and write to file
	defaultSettingsCopy, err := New()

	b, err := json.MarshalIndent(defaultSettingsCopy, "", "  ")
	assert.NoError(t, err)
	err = os.WriteFile(settingsFile, b, 0644)
	assert.NoError(t, err)
	defaultSettingsCopy.Save()
	// Load settings from file and compare with default settings
	loadedSettings, err := New()
	assert.NoError(t, err)
	assert.NotNil(t, loadedSettings)
	assert.Equal(t, defaultSettingsCopy, loadedSettings)
}
