import ffmpeg from "fluent-ffmpeg";
import path from "path";


export const getVideoDuration = (videoPath) => {
  return new Promise((resolve, reject) => {
    console.log("Attempting to get duration for video path:", videoPath);

    const normalizedPath = path.resolve(videoPath);
    console.log("Normalized path:", normalizedPath);

    ffmpeg.ffprobe(normalizedPath, (err, metadata) => {
      if (err) {
        console.error("FFmpeg error:", err);

        reject(new Error(`Error extracting video duration: ${err.message}`));
      } else {
        console.log("Video metadata extracted successfully:", metadata.format);

        resolve(metadata.format.duration);
      }
    });
  });
};
