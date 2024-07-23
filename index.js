require("dotenv").config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const documentRoutes = require('./src/routes/documents');
const folderRoutes = require('./src/routes/folders');
const { authenticateToken } = require('./src/middlewares/authMiddleware');

const app = express();
const port = process.env.PORT|| 4000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
//protected routes
app.use(authenticateToken)
app.use('/documents', documentRoutes);
app.use('/folders', folderRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
