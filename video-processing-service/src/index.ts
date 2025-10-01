import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express();
app.use(express.json());

// Endpoint to process video
app.post('/process-video', (req, res) => {
  //get path of the input video from the request body
  const inputFilePath = req.body.inputFilePath;
  // Define the output path for the processed video
  const outputFilePath = req.body.outputFilePath;

  if (!inputFilePath || !outputFilePath) {
    return res.status(400).send('Bad Request: Missing input or output file path');
  }

  ffmpeg(inputFilePath)
    .outputOptions("-vf", "scale=-1:360")
    .on('end', () => {
      res.status(200).send('Video processed successfully');
    })
    .on('error', (err) => {
      console.error(`An Error occured:', ${err.message}`);
      res.status(500).send(`Internal Server Error: `);
    })
    .save(outputFilePath);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `Video processing service listening at http://localhost:${port}`);
});