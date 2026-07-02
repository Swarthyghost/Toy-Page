# PleasureToys GH - E-commerce Platform

A premium, modern e-commerce platform for PleasureToys GH featuring a dark aesthetic, smooth animations, and seamless WhatsApp ordering.

## Features

- **Next.js 15 App Router**: Server-side rendering, dynamic routes, and fast client navigation.
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
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Project Structure

- `src/app/`: Next.js page components, layout, and API route handlers.
- `src/components/`: Reusable UI components.
- `src/context/`: State management (Cart, Admin Auth, Site Settings).
- `src/services/`: Firebase API communication layer.
- `src/utils/`: Shared utilities and animations.

## Admin Access

You can access the Admin Portal by clicking the "Admin Portal" link in the footer of the website.

## Deployment

To build and start the application for production:

```bash
npm run build
npm start
```

## License

MIT
