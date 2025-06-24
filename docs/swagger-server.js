const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const baseDir = __dirname;
const services = [];

fs.readdirSync(baseDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && !['node_modules'].includes(dirent.name))
  .forEach(dirent => {
    const service = dirent.name;
    const yamlPath = path.join(baseDir, service, 'openapi.yaml');
    if (fs.existsSync(yamlPath)) {
      const doc = YAML.load(yamlPath);
      app.use(
        `/docs/${service}`,
        swaggerUi.serveFiles(doc, {}),
        swaggerUi.setup(doc)
      );
      services.push(service);
      console.log(`✓ Swagger loaded for /docs/${service}`);
    }
  });

// Homepage
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>🧭 API Documentation Hub</title>
      <style>
        body {
          margin: 0;
          font-family: 'Segoe UI', sans-serif;
          background: #f3f4f6;
          color: #111827;
        }
        header {
          background-color: #111827;
          color: #f9fafb;
          padding: 2rem;
          text-align: center;
        }
        main {
          padding: 2rem;
          max-width: 800px;
          margin: auto;
        }
        h1 {
          font-size: 2rem;
        }
        p {
          color: #4b5563;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          background: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          margin: 1rem 0;
          transition: transform 0.2s ease;
        }
        li:hover {
          transform: translateY(-2px);
        }
        a {
          display: block;
          padding: 1rem;
          text-decoration: none;
          color: #1f2937;
          font-weight: 500;
        }
        a:hover {
          background: #f9fafb;
        }
        .icon {
          margin-right: 0.5rem;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>🧭 CodeMaster API Documentation Hub</h1>
        <p>Welcome! Select a microservice below to explore its documentation.</p>
      </header>
      <main>
        <ul>
          ${services.map(s => {
    const icon = {
      authentication: '🔐',
      user: '👤',
      codequest: '📦',
      solution: '💳',
      community: '🛍️'
    }[s] || '📄'
    return `<li><a href="/docs/${s}">${icon} <span class="icon"></span>${s}</a></li>`
  }).join('')}
        </ul>
      </main>
    </body>
    </html>
  `;
  res.send(html);
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
