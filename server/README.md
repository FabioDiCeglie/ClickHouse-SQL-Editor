## Prerequisites

- Docker and Docker Compose
- Node.js 20 or higher
- TypeScript

## Setup

1. Start the Docker containers:
`docker compose up -d`

2. Install the dependencies:
`npm i`

## Development

Start the application in development mode:

`npm run start`

## Testing

Run tests in watch mode:

`npm run test:watch`

## API Documentation

You can find example API requests in the `requests.http` file. This file can be used directly with REST Client extensions in VS Code or similar IDEs.

## Environment Variables

Create a `.env` file in the root directory (see `.env.example` for reference).