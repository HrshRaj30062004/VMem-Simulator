const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { simulateFIFO, simulateLRU, simulateOptimal } = require("./simulator");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/simulate", (req, res) => {
  const { refs, frames, algorithm } = req.body;

    let result;
    switch (algorithm) {
    case "FIFO":
      result = simulateFIFO(refs, frames);
      break;
    case "LRU":
      result = simulateLRU(refs, frames);
      break;
    case "Optimal":
      result = simulateOptimal(refs, frames);
      break;
    default:
      return res.status(400).json({ error: "Algorithm not supported yet." });
  }

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`VMem+ backend running on http://localhost:${PORT}`);
});
