import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`
🚀 Server is running!
📡 Local: http://localhost:${PORT}
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
`);
});
