// script.js (replace the file contents with this)
const generateBtn = document.getElementById("generateBtn");
const resultImg = document.getElementById("resultImg");
const loader = document.getElementById("loader");

function showLoader(show) {
  loader.style.display = show ? "block" : "none";
  resultImg.style.display = show ? "none" : "block";
}

generateBtn.addEventListener("click", async () => {
  const faith = document.getElementById("faith").value.trim();
  const sdg = document.getElementById("sdg").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!faith || !sdg) {
    alert("Please enter both Faith and SDG goal.");
    return;
  }

  showLoader(true);

  try {
    const payload = { faith, sdg, description };
    const resp = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // If response is HTML (unexpected), resp.json() will fail with Unexpected token '<'
    const data = await resp.json();

    showLoader(false);

    if (resp.ok && data.url) {
      resultImg.src = data.url;
      resultImg.style.display = "block";
      resultImg.alt = "Generated Infographic";
    } else {
      console.error("API returned error:", data);
      alert("Failed to generate image: " + (data.error || JSON.stringify(data)));
    }
  } catch (error) {
    showLoader(false);
    console.error("Error:", error);
    alert(
      "Error generating image. Open the browser console and server terminal for details. (" +
        error.message +
        ")"
    );
  }
});
