# Express TypeScript Server

This is an Express server built with TypeScript for the Pyodide React application.

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/packages` - Get a list of Python packages
- `POST /api/execute` - Execute Python code (mock implementation)

## Environment Variables

Create a `.env` file in the root of the server directory with the following variables:

```
PORT=5000
NODE_ENV=development
```

## Project Structure

```
server/
├── dist/               # Compiled JavaScript files
├── src/                # TypeScript source files
│   ├── routes/         # API route definitions
│   │   └── api.ts      # API routes
│   └── index.ts        # Main server file
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
``` 