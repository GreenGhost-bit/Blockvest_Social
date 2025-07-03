const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const algosdk = require('algosdk');

const authRoutes = require('./routes/auth');
const investmentRoutes = require('./routes/investments');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blockvest', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const algodClient = new algosdk.Algodv2(
  '',
  'https://testnet-api.algonode.cloud',
  443
);

const indexerClient = new algosdk.Indexer(
  '',
  'https://testnet-idx.algonode.cloud',
  443
);

app.locals.algodClient = algodClient;
app.locals.indexerClient = indexerClient;

app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Blockvest Social API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});