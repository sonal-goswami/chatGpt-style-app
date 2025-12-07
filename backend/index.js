const express = require("express");
const cors = require('cors');
const app = express();
const chatRoutes = require('./routes/chatRoutes');

// default route
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.use('/api', chatRoutes);
// server listen
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
