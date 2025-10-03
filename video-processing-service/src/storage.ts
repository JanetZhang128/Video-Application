// Storage service for managing video files
// 1. GCS (Google Cloud Storage) file interactions
// 2. Local filesystem storage interactions (for development/testing)

import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "xyz-1001-raw-videos";// download the user uploaded raw video from this bucket
const processedVideoBucketName = "xyz-1001-processed-videos";// upload the processed video to this bucket

// after uploading the processed video to GCS, the video will be deleted from local storage
const localRawVideoPath = "./raw-videos/";
const localProcessedVideoPath = "./processed-videos/";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setUpDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360")
        .on('end', () => {
          console.log('Video processed successfully');
          resolve();
    })
    .on('error', (err) => {
      console.error(`An Error occured:', ${err.message}`);
      reject(err);
    })
    .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

/** Download the raw video from GCS to local storage.
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string): Promise<void> {
    await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({
        destination: `${localRawVideoPath}/${fileName}`
    });

    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */

export async function uploadProcessedVideo(fileName: string): Promise<void> {
    await storage.bucket(processedVideoBucketName)
    .upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName,
    });

    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
    );

    //set the video to be publicly accessible
    await storage.bucket(processedVideoBucketName).file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */
export async function deleteLocalRawVideo(fileName: string): Promise<void> {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
* @param fileName - The name of the file to delete from the
* {@link localProcessedVideoPath} folder.
* @returns A promise that resolves when the file has been deleted.
* 
*/
export async function deleteProcessedVideo(fileName: string): Promise<void> {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(
            `Failed to delete file at ${filePath}, err: ${err.message}`
          );
          reject(err);
        } else {
          console.log(`File at ${filePath} deleted.`);
          resolve();
        }
      });
    } else {
      console.log(`File not found at ${filePath},skipping delete.`);
      resolve();
    }
  });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
    console.log(`Directory created at ${dirPath}`);
  }
}