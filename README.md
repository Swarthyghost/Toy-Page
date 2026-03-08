# PleasureToys GH - E-commerce Platform

A premium, modern e-commerce platform for PleasureToys GH featuring a dark aesthetic, smooth animations, and seamless WhatsApp ordering.

## Features

- **Full-Stack Architecture**: Express.js backend with Vite frontend integration.
- **Database**: SQLite (better-sqlite3) for persistent product management.
- **Admin Dashboard**: Full CRUD capabilities for products.
- **WhatsApp Ordering**: Automated message generation for orders.
- **Responsive Design**: Mobile-first UI using Tailwind CSS 4.
- **Modern Animations**: Powered by Motion (formerly Framer Motion).

## Getting Started in VS Code

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [VS Code](https://code.visualstudio.com/)

### Installation

1. Open the project folder in VS Code.
2. Open the terminal (`Ctrl + ` ` or `Cmd + ` `).
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the development server (both backend and frontend):

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Project Structure

- `server.ts`: Express server and API endpoints.
- `src/`: React frontend source code.
  - `components/`: Reusable UI components.
  - `context/`: State management (Cart).
  - `services/`: API communication layer.
  - `data/`: Initial seed data.
- `pleasuretoys.db`: SQLite database file (generated on first run).

## Admin Access

You can access the Admin Portal by clicking the "Admin Portal" link in the footer of the website.

## Deployment

To build the application for production:

```bash
npm run build
npm start
```

## License

MIT
