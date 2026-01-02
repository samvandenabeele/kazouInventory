# Kazou Inventory

A full-stack inventory management system built with React (TypeScript) and Flask (Python).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Kazou Inventory is a modern inventory management application that allows you to track and manage your inventory items efficiently. The application features a React-based frontend with a Flask RESTful API backend, both containerized with Docker for easy deployment.

It is made specifically for Kazou, but can be used elsewhere too. In this organisation, it aims to get rid of endless non-centralised excel sheets that can't easily be accessed by everyone.

> [!NOTE]
> this is a student project, done for free, out of passion for the organisation. It is in no way perfect, nor can I guarantee the safety. If not using appropriate database backups and docker volumes, data loss may occur on container shutdown or server failure.

## Features

- Inventory item management (Create, Read, Update, Delete)
- Search and filter capabilities
- Real-time inventory tracking
- Dockerized architecture for easy deployment
- Comprehensive test coverage
- Secure API endpoints
- Responsive design

## Tech Stack

### Frontend
- **React** with **TypeScript**
- **Vite** - Build tool and development server
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Nginx** - Production web server

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database management
- **Python 3.x** - Programming language
- **PostgreSQL/SQLite** - Database (configurable)

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **GitHub Actions** - CI/CD pipeline

## Project Structure

```
kazouInventory/
├── client/                 # Frontend React application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── mock-server/       # Mock API server for development
│   ├── coverage/          # Test coverage reports
│   ├── Dockerfile         # Frontend container configuration
│   └── package.json       # Node dependencies
├── server/                # Backend Flask application
│   ├── app.py            # Flask application factory
│   ├── models.py         # Database models
│   ├── routes.py         # API routes
│   ├── run.py            # Application entry point
│   ├── server_test.py    # Backend tests
│   ├── Dockerfile        # Backend container configuration
│   └── requirements.txt  # Python dependencies
├── .github/              # GitHub Actions workflows
├── docker-compose.yml    # Multi-container orchestration
└── README.md            # This file
```

## Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js** (v18 or higher) and **npm** for local development
- **Python** (v3.9 or higher) for local development

## Getting Started

### Using Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/samvandenabeele/kazouInventory.git
   cd kazouInventory
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000

### Local Development

#### Frontend Setup

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run build:server
   ```

#### Backend Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env  # Create and edit .env file
   ```

5. **Run the server:**
   ```bash
   python run.py
   ```


6. **Access the application:**
   - Frontend: http://localhost:5000 (see the terminal output for a different port)



## Development

### Available Scripts

#### Frontend (client/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests with Vitest
- `npm run lint` - Run ESLint

#### Backend (server/)
- `python run.py` - Start Flask development server
- `python server_test.py` - Run backend tests
- `python -m pytest` - Run tests with pytest (if configured)

### Environment Variables

Create a [.env](server/.env) file in the `server/` directory:

```env
FLASK_ENV=development
DATABASE_URL=sqlite:///inventory.db
SECRET_KEY=your-secret-key-here
```

## Testing

### Frontend Tests
```bash
cd client
npm run test
npm run test:coverage  # Generate coverage report
```

### Backend Tests
```bash
cd server
python server_test.py
```

### Run All Tests with Docker
```bash
docker-compose run --rm client npm test
docker-compose run --rm server python server_test.py
```

## Deployment

### Production Build

1. **Build Docker images:**
   ```bash
   docker-compose build
   ```

2. **Deploy using Docker Compose:**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

### Environment Configuration

Update the [docker-compose.yml](docker-compose.yml) file with production environment variables and configurations before deployment.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Bug Reports

If you discover any bugs, please create an issue on GitHub with detailed information about the bug and steps to reproduce it.

## Contact

**Sam Vandenabeele** - [@samvandenabeele](https://github.com/samvandenabeele)

**Project Link:** [https://github.com/samvandenabeele/kazouInventory](https://github.com/samvandenabeele/kazouInventory)