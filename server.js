import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import open from "open";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup directory references
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// POST /api/generate → Generate image
app.post("/api/generate", async (req, res) => {
  try {
    const { faith, sdg, description } = req.body;

    if (!faith || !sdg) {
      return res
        .status(400)
        .json({ error: "Please provide 'faith' and 'sdg' fields." });
    }

    const prompt = `Create a faith-based infographic about "${faith}" and the Sustainable Development Goal "${sdg}".
${description ? `Extra context: ${description}` : ""}
Style: modern, clean infographic with icons, short text, and balanced color scheme.`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "add your key") {
      return res
        .status(500)
        .json({ error: "OPENAI_API_KEY is not set in .env" });
    }

    // Call OpenAI Images API
    const resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        n: 1,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("OpenAI error:", resp.status, text);
      return res
        .status(502)
        .json({ error: `Image API error: ${resp.status}`, detail: text });
    }

    // Parse JSON response (declare j once!)
    const j = await resp.json();

    // Handle both possible formats: URL or base64
    let imageUrl = null;

    if (j?.data?.[0]?.url) {
      imageUrl = j.data[0].url;
    } else if (j?.data?.[0]?.b64_json) {
      const base64 = j.data[0].b64_json;
      imageUrl = `data:image/png;base64,${base64}`;
    }

    if (!imageUrl) {
      console.error(
        "❌ No image data found. Full response:",
        JSON.stringify(j, null, 2)
      );
      return res
        .status(500)
        .json({ error: "No image data returned from API", detail: j });
    }

    // Success
    return res.json({ url: imageUrl });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// Serve the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});
