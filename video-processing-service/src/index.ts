import express from 'express';
import { convertVideo, deleteLocalRawVideo, deleteProcessedVideo, downloadRawVideo, setUpDirectories, uploadProcessedVideo } from './storage.js';

setUpDirectories();

const app = express();
app.use(express.json());

// Endpoint to process video
app.post('/process-video', async(req, res) => {
    // Get the bucket and file name from the Cloud Pub/Sub message(like message queue)
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if(!data.name) {
            throw new Error("Invalid message payload received. Missing 'name' field.");
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send('Bad Request: missing file name.');
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;
    
    // download the raw video from GCS
    await downloadRawVideo(inputFileName)

    // convert the video to 360p
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (err) {
        Promise.all([
            deleteLocalRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        console.error(err);
        return res.status(500).send('Internal Server Error: video conversion failed.');
    }

    // upload the processed video to GCS
    await uploadProcessedVideo(outputFileName);

    await Promise.all([
        deleteLocalRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send('Video processed successfully.');
});

const port = Number(process.env.PORT) || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log(
    `Video processing service listening at http://0.0.0.0:${port}`);
});