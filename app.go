package main

import (
	"context"
	scanner "dark_scanner/pkg/scanner"
	settings "dark_scanner/pkg/settings"
	util "dark_scanner/pkg/util"
	"fmt"
	"os"
	r "runtime"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx      context.Context
	settings *settings.Settings
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
	a.settings, _ = settings.New()
	if r.GOOS == "linux" {
		util.AddDesktopItem()
	}
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
func (a *App) Exit() {
	os.Exit(0)
}

func (a *App) GetSettings() *settings.Settings {
	return a.settings
}

func (a *App) Scan(params settings.ScanParams) {
	a.settings.Range = params
	a.settings.Save()
	callbacks := scanner.Callbacks{
		OnScanStart: func() {
			runtime.EventsEmit(a.ctx, "onScanStart")
		},
		OnScanFinish: func() {
			runtime.EventsEmit(a.ctx, "onScanFinish")
		},
		OnHostFound: func(host scanner.Host) {
			runtime.EventsEmit(a.ctx, "onHostFound", host)
		},
		OnHostScanFinish: func(host scanner.Host) {
			runtime.EventsEmit(a.ctx, "OnHostScanFinish", host)
		},
		OnProgress: func(progress int) {
			runtime.EventsEmit(a.ctx, "OnProgress", progress)
		},
	}
	scanner.Scan(a.settings, callbacks)
}
