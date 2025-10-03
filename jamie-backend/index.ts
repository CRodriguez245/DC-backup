import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
const chatRouter = require('./routes/chat');

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/chat', chatRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});