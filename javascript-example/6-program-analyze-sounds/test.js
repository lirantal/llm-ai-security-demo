import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("./cat.mp3"),
//   file: fs.createReadStream("./mixkit-cat2.wav"),
  model: "gpt-4o-transcribe",
});

console.log(transcription.text);