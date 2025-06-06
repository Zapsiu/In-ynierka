const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/inzynierka", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Połączono z MongoDB'))
  .catch(err => console.error(err));

app.use('/api/auth', require('./routes/auth'));
app.use("/api/teams", require("./routes/team"));
app.listen(5000, () => console.log('Backend działa na porcie 5000'));
