const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 8000;

app.use(cors());

// Middleware to parse JSON data
app.use(bodyParser.json());

// Sample data
let jsonData = [];

// GET endpoint to retrieve data
app.get("/api/data", (req, res) => {
  res.json(jsonData);
});

// POST endpoint to add data
app.post("/api/data", (req, res) => {
  const newData = req.body;
  jsonData.push(newData);
  res.json(newData);
});

// DELETE endpoint to remove data
app.delete("/api/data/:id", (req, res) => {
  const id = req.params.id;
  const index = jsonData.findIndex((item) => item.id === id);
  if (index !== -1) {
    const deletedData = jsonData.splice(index, 1)[0];
    res.json(deletedData);
  } else {
    res.status(404).json({ error: "Data not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
