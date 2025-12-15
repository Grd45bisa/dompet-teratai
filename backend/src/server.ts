import { createServer } from 'http';
import app from './app';
import { initializeSocket } from './config/socket';

const PORT = process.env.PORT || 3100;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`
🚀 Server is running!
📡 Local: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health

API Endpoints:
  POST   /api/auth/google     - Google OAuth login
  GET    /api/auth/me         - Get current user
  PUT    /api/auth/profile    - Update profile
  
  GET    /api/expenses        - Get expenses
  POST   /api/expenses        - Create expense
  PUT    /api/expenses/:id    - Update expense
  DELETE /api/expenses/:id    - Delete expense
  
  GET    /api/categories      - Get categories
  POST   /api/categories      - Create category
  PUT    /api/categories/:id  - Update category
  DELETE /api/categories/:id  - Delete category

WebSocket Events (emitted to user room):
  expense:created   - New expense added
  expense:updated   - Expense modified
  expense:deleted   - Expense removed
  category:created  - New category added
  category:updated  - Category modified
  category:deleted  - Category removed
`);
});
