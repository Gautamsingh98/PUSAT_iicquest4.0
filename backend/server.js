import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import OpenAI from "openai";
import fs from "fs";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* ==========================
   OPENAI
========================== */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ==========================
   MYSQL
========================== */

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

/* ==========================
   MULTER
========================== */

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
});

/* ==========================
   HEALTH CHECK
========================== */

app.get("/", (req, res) => {
  res.json({
    status: "Server Running",
  });
});

/* ==========================
   GET LEADS
========================== */

app.get("/leads", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM leads ORDER BY id DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch leads",
    });
  }
});

/* ==========================
   AUDIO → GPT → MYSQL
========================== */

app.post(
  "/upload-audio",
  upload.single("audio"),
  async (req, res) => {
    let uploadedFilePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No audio file uploaded",
        });
      }

      uploadedFilePath = req.file.path;

      /* ==========================
         STEP 1: TRANSCRIBE AUDIO
      ========================== */

      const transcription =
        await openai.audio.transcriptions.create({
          file: fs.createReadStream(uploadedFilePath),
          model: "gpt-4o-mini-transcribe",
        });

      const transcriptText = transcription.text;

      console.log("Transcript:");
      console.log(transcriptText);

      /* ==========================
         STEP 2: EXTRACT LEAD
      ========================== */

      const prompt = `
Extract CRM lead information from this sales call transcript.

Return ONLY valid JSON.

Schema:

{
  "name": "",
  "phone": "",
  "location": "",
  "interest": "",
  "notes": "",
  "source": "Audio Call",
  "stage": "Contacted"
}

Rules:
- Return valid JSON only.
- No markdown.
- No explanation.
- If a value is missing use empty string.
- source must always be "Audio Call".
- stage must always be "Contacted".

Transcript:
${transcriptText}
`;

      const completion =
        await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "You are a CRM lead extraction assistant. Return only JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

      const rawResponse =
        completion.choices[0].message.content;

      console.log("GPT Response:");
      console.log(rawResponse);

      /* ==========================
         STEP 3: PARSE JSON
      ========================== */

      let lead;

      try {
        lead = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);

        return res.status(500).json({
          success: false,
          error: "Invalid JSON returned by GPT",
          rawResponse,
        });
      }

      /* ==========================
         STEP 4: INSERT MYSQL
      ========================== */

      const query = `
        INSERT INTO leads
        (
          name,
          phone,
          location,
          interest,
          notes,
          source,
          stage
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        lead.name || "",
        lead.phone || "",
        lead.location || "",
        lead.interest || "",
        lead.notes || "",
        "Audio Call",
        "Contacted",
      ];

      const [result] = await db.execute(
        query,
        values
      );

      /* ==========================
         STEP 5: RETURN RESPONSE
      ========================== */

      res.json({
        success: true,
        leadId: result.insertId,
        transcript: transcriptText,
        lead,
      });
    } catch (error) {
      console.error("Upload Error:", error);

      res.status(500).json({
        success: false,
        error: error.message,
      });
    } finally {
      if (
        uploadedFilePath &&
        fs.existsSync(uploadedFilePath)
      ) {
        fs.unlinkSync(uploadedFilePath);
      }
    }
  }
);

/* ==========================
   DELETE LEAD
========================== */

app.delete("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute(
      "DELETE FROM leads WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Lead deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Delete failed",
    });
  }
});

/* ==========================
   START SERVER
========================== */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});