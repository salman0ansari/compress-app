package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"log"
	"strconv"
	"strings"

	ffmpeg "github.com/u2takey/ffmpeg-go"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/exp/rand"
)

type SizeUnit string

const (
	Bytes SizeUnit = "bytes"
	KB    SizeUnit = "KB"
	GB    SizeUnit = "GB"
)

func ProcessFFmpegVideo(filepath string, unit SizeUnit, ctx context.Context) {
	input := filepath

	// generate random filename
	output := "/tmp/" + "ffmpeg-compressor-" + strconv.Itoa(rand.Intn(1000)) + ".mp4"

	args := ffmpeg.KwArgs{
		"c:v":      "libx264",
		"tag:v":    "avc1",
		"movflags": "faststart",
		"crf":      "30",
		"preset":   "superfast",
	}

	err := ffmpeg.Input(input).
		Output(output, args).
		GlobalArgs("-progress", "-", "-v", "verbose").
		OverWriteOutput().
		WithOutput(parseProgress(KB, ctx)).
		Run()

	if err != nil {
		log.Fatal(err)
	}
}

func parseProgress(unit SizeUnit, ctx context.Context) io.Writer {
	reader, writer := io.Pipe()

	go func() {
		scanner := bufio.NewScanner(reader)
		// var totalSize int64

		for scanner.Scan() {
			line := scanner.Text()
			if strings.HasPrefix(line, "total_size=") {
				sizeStr := strings.TrimPrefix(line, "total_size=")
				size, err := strconv.ParseInt(sizeStr, 10, 64)
				if err == nil {
					// switch unit {
					// case KB:
					// 	totalSize = size / 1024
					// case GB:
					// 	totalSize = size / 1024 / 1024 / 1024
					// default:
					// 	totalSize = size
					// }

					// make json object
					jsonObj := map[string]interface{}{
						"totalSize": size,
					}

					runtime.EventsEmit(ctx, "processing-progress", jsonObj)
				}
			} else if strings.Contains(line, "progress=end") {
				fmt.Println("Finished processing video")
				runtime.EventsEmit(ctx, "processing-complete")
				break
			}
		}

		if err := scanner.Err(); err != nil {
			log.Printf("Error reading ffmpeg output: %v", err)
		}
	}()

	return writer
}
