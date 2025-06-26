const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello from GCP Cloud Run!');
});

app.get('/time', (req, res) => {
  const { timezone } = req.query;
  let now = new Date();
  if (timezone) {
    try {
      now = new Date().toLocaleString('en-US', { timeZone: timezone });
      res.send(`Current server time in ${timezone}: ${now}`);
    } catch (e) {
      res.status(400).send('Invalid timezone');
    }
  } else {
    res.send(`Current server time is: ${now.toLocaleString()}`);
  }
});

app.get('/random', (req, res) => {
  const min = parseInt(req.query.min) || 0;
  const max = parseInt(req.query.max) || 1000;
  if (min > max) return res.status(400).send('min cannot be greater than max');
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  res.send(`Your random number between ${min} and ${max} is: ${randomNum}`);
});

app.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  const { style } = req.query;
  let greeting;
  switch (style) {
    case 'formal':
      greeting = `Good day, ${name}.`;
      break;
    case 'casual':
      greeting = `Hey ${name}, what's up?`;
      break;
    default:
      greeting = `Hello, ${name}! Welcome to Cloud Run.`;
  }
  res.send(greeting);
});

app.get('/api/status', (req, res) => {
  const { detail } = req.query;
  const baseResponse = {
    status: 'ok',
    timestamp: Date.now()
  };
  if (detail === 'full') {
    baseResponse.uptime = process.uptime();
    baseResponse.memoryUsage = process.memoryUsage();
  }
  res.json(baseResponse);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
