package main

import (
	"context"
	"encoding/json"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
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

func (a *App) SelectFile() string {
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select a video file",
	})
	if err != nil {
		return err.Error()
	}

	// get file info from file path
	fileInfo, err := os.Lstat(file)

	if err != nil {
		return err.Error()
	}

	jsonObj := map[string]interface{}{
		"success":  true,
		"fileName": fileInfo.Name(),
		"fileSize": fileInfo.Size(),
		"filePath": file,
	}

	jsonBytes, err := json.Marshal(jsonObj)
	if err != nil {
		return err.Error()
	}

	go ProcessFFmpegVideo(file, KB, a.ctx)
	return string(jsonBytes)

}

func (a *App) OpenFilePath(filepath string) {
	runtime.BrowserOpenURL(a.ctx, filepath)
}
