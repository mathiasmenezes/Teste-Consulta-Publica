# Construtor de Formulários PWA

Uma aplicação web progressiva (PWA) sofisticada para criar, gerenciar e responder formulários com funcionalidade de arrastar e soltar, agora alimentada por um banco de dados SQLite real.

## Features

### 🎯 Funcionalidades Principais
- **Construtor de Formulários Drag & Drop**: Crie formulários com uma interface intuitiva de arrastar e soltar
- **Múltiplos Tipos de Campo**: Texto, email, número, área de texto, lista suspensa, botões de opção, caixas de seleção e seletor de data
- **Visualização em Tempo Real**: Visualize formulários como aparecerão para os usuários
- **Validação de Formulários**: Validação integrada com mensagens de erro personalizadas
- **Resposta Única**: Usuários só podem responder cada formulário uma vez
- **Banco de Dados Real**: Banco de dados SQLite com persistência adequada de dados e relacionamentos

### 👥 Gerenciamento de Usuários
- **Acesso Baseado em Função**: Interfaces separadas para Administradores e Usuários Regulares
- **Autenticação de Usuários**: Sistema de login seguro com hash de senha bcrypt
- **Login Social**: Integração OAuth do Google e Facebook
- **Registro de Usuários**: Novos usuários podem registrar contas
- **Redefinição de Senha**: Funcionalidade segura de redefinição de senha com verificação baseada em token
- **Armazenamento no Banco**: Todos os dados do usuário armazenados com segurança no SQLite com Prisma ORM

### 📊 Recursos de Administrador
- **Gerenciamento de Formulários**: Crie, edite e exclua formulários com persistência no banco de dados
- **Análise de Respostas**: Visualize todas as respostas dos formulários com análises detalhadas
- **Exportação CSV**: Exporte respostas dos formulários para formato CSV
- **Estatísticas do Painel**: Visão geral em tempo real de formulários, respostas e atividade do usuário
- **Gerenciamento de Usuários**: Visualize todos os usuários registrados e sua atividade

### 👤 Recursos do Usuário
- **Descoberta de Formulários**: Navegue pelos formulários disponíveis com indicadores de status
- **Preenchimento de Formulários**: Preencha formulários com validação e tratamento de erros
- **Acompanhamento de Progresso**: Acompanhe formulários concluídos vs pendentes
- **Histórico de Respostas**: Visualize respostas previamente enviadas

### 🎨 Recursos de UI/UX
- **Design Moderno**: Interface limpa e responsiva construída com Tailwind CSS
- **Suporte PWA**: Instalável como aplicativo nativo
- **Responsivo para Mobile**: Otimizado para todos os tamanhos de dispositivo
- **Estados de Carregamento**: Animações suaves de carregamento e feedback
- **Notificações Toast**: Feedback em tempo real para ações do usuário

## Technology Stack

- **Frontend**: React 18 with Hooks
- **Backend**: Node.js with Express
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **Drag & Drop**: react-beautiful-dnd
- **Icons**: Lucide React
- **Notifications**: react-hot-toast
- **Form Handling**: react-hook-form
- **Authentication**: JWT-based authentication
- **Password Hashing**: bcryptjs
- **Social Auth**: Google and Facebook OAuth
- **PWA**: Service Worker support

## Database Schema

The application uses SQLite with Prisma ORM with the following structure:

### Users Table
- `id` (String, Primary Key, CUID)
- `email` (String, Unique)
- `password` (String, hashed with bcrypt, nullable for social login)
- `name` (String)
- `role` (Enum: 'ADMIN' or 'USER')
- `socialProvider` (String, 'google', 'facebook', or null)
- `socialId` (String, social provider user ID, nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Forms Table
- `id` (String, Primary Key, CUID)
- `title` (String)
- `description` (String, nullable)
- `fields` (JSON)
- `isActive` (Boolean, default: true)
- `createdBy` (String, Foreign Key to users.id)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Form Responses Table
- `id` (String, Primary Key, CUID)
- `formId` (String, Foreign Key to forms.id)
- `userId` (String, Foreign Key to users.id)
- `data` (JSON)
- `submittedAt` (DateTime, default: now())
- Unique constraint on (formId, userId)

### Password Reset Tokens Table
- `id` (String, Primary Key, CUID)
- `token` (String, Unique)
- `userId` (String, Foreign Key to users.id)
- `expiresAt` (DateTime)
- `createdAt` (DateTime, default: now())

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd form-builder-pwa
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up the database**
   ```bash
   cd backend
   # Update the DATABASE_URL in config.env with your PostgreSQL connection string
   # Example: DATABASE_URL="postgresql://username:password@localhost:5432/formbuilder?schema=public"
   
   # Generate Prisma client
   npm run db:generate
   
   # Push the schema to your database
   npm run db:push
   
   # Seed the database with demo data
   npm run db:seed
   cd ..
   ```

5. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start the frontend development server**
   ```bash
   npm start
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

### Demo Accounts

The application comes with pre-configured demo accounts (automatically created when you run the database seed):

**Conta de Administrador:**
- Email: `admin@example.com`
- Senha: `admin123`

**Conta de Usuário:**
- Email: `user@example.com`
- Senha: `user123`

**Additional User:**
- Email: `user2@example.com`
- Password: `user123`

## Database Features

### Automatic Setup
- PostgreSQL database with Prisma ORM for robust data management
- Database schema is automatically created and migrated
- Initial demo data is seeded automatically
- Proper relationships and constraints ensure data integrity

### Data Persistence
- All data is stored in PostgreSQL database
- Data persists across all sessions and users
- Proper relationships ensure data integrity
- Unique constraints prevent duplicate responses

### Security
- Passwords are hashed using bcrypt with salt rounds
- SQL injection protection through parameterized queries
- Input validation and sanitization
- Role-based access control
- Secure password reset tokens with expiration
- Token-based password reset verification
- OAuth 2.0 secure social authentication
- Social login account linking and merging

## Usage Guide

### For Administrators

1. **Login** with admin credentials
2. **Create Forms**:
   - Click "Create New Form" on the dashboard
   - Add form title and description
   - Drag field types from the sidebar to the builder area
   - Configure each field (label, description, placeholder, options, required status)
   - Use the preview mode to see how the form will appear
   - Save the form (stored in database)

3. **Manage Forms**:
   - View all created forms on the dashboard
   - Edit existing forms
   - Delete forms (with confirmation)
   - View response statistics

4. **Analyze Responses**:
   - Click "View Responses" on any form
   - See detailed response data in a table format
   - Export responses to CSV
   - View individual response details in a modal

### For Regular Users

1. **Login** with user credentials
2. **Browse Forms**:
   - View all available forms on the dashboard
   - See form status (completed/pending)
   - View response counts and creation dates

3. **Complete Forms**:
   - Click "Start Form" on any pending form
   - Fill out all required fields
   - Submit the form (one-time only, enforced by database constraint)
   - Get confirmation of successful submission

### Password Reset Process

1. **Request Reset**:
   - Click "Forgot your password?" on the login page
   - Enter your email address
   - Receive a reset token (stored in localStorage for demo)

2. **Reset Password**:
   - Use the reset link or visit `/demo-reset-link` to view the token
   - Click the reset link to set a new password
   - Enter a new password meeting security requirements
   - Confirm the new password
   - Login with the new password

**Note**: In a production environment, reset tokens would be sent via email.

### Social Login Process

1. **Choose Provider**:
   - Click "Google" or "Facebook" button on the login page
   - Demo mode uses simulated authentication

2. **OAuth Flow** (Production):
   - OAuth popup window opens
   - User authenticates with provider
   - Callback processes authentication
   - User account is created or linked

3. **Account Linking**:
   - New users are created automatically
   - Existing email accounts are linked to social login
   - Users can access the same account via email or social login

**Note**: Demo mode simulates social login. In production, configure OAuth credentials in environment variables.

## Project Structure

```
src/
├── components/
│   ├── admin/           # Admin-specific components
│   │   ├── AdminDashboard.js
│   │   ├── FormBuilder.js
│   │   └── FormResponses.js
│   ├── auth/            # Authentication components
│   │   ├── Login.js
│   │   ├── ForgotPassword.js
│   │   ├── ResetPassword.js
│   │   ├── DemoResetLink.js
│   │   ├── SocialLogin.js
│   │   ├── OAuthCallback.js
│   │   ├── UserProfile.js
│   │   └── ProtectedRoute.js
│   ├── form/            # Form-related components
│   │   └── FormField.js
│   └── user/            # User-specific components
│       ├── UserDashboard.js
│       └── FormResponse.js
├── contexts/            # React Context providers
│   ├── AuthContext.js
│   └── FormContext.js
├── services/            # API and auth services
│   ├── api.js
│   └── socialAuth.js
├── config/              # Configuration files
│   └── oauth.js
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles
```

## Key Features Explained

### Database Integration
- **PostgreSQL**: Robust, production-ready database with Prisma ORM
- **Automatic Setup**: Database schema created and migrated automatically
- **Data Relationships**: Proper foreign keys and constraints
- **Performance**: Optimized queries with Prisma's query engine
- **Security**: Password hashing, input validation, and secure token management

### Social Authentication
- **OAuth 2.0**: Secure authentication with Google and Facebook
- **Popup Flow**: OAuth popup windows for seamless authentication
- **Account Linking**: Automatic linking of social accounts to existing email accounts
- **Demo Mode**: Simulated social login for development and testing
- **User Profile**: Display social login information and account status

### Drag & Drop Form Builder
- Uses `react-beautiful-dnd` for smooth drag and drop functionality
- Field types are displayed as draggable cards in the sidebar
- Form fields can be reordered by dragging
- Real-time preview updates as you build

### Form Field Types
- **Text Input**: Single line text input
- **Email Input**: Email validation included
- **Number Input**: Numeric input with validation
- **Text Area**: Multi-line text input with configurable rows
- **Select Dropdown**: Single choice from options list
- **Radio Buttons**: Single choice from multiple options
- **Checkboxes**: Multiple choice selection
- **Date Picker**: Date selection input

### Data Persistence
- Uses PostgreSQL with Prisma ORM for robust data persistence
- Forms and responses are stored with proper relationships
- Session management for user authentication
- Automatic data persistence in database

### PWA Features
- Installable as a native app
- Offline capability (basic)
- Responsive design for all devices
- Fast loading with optimized assets

## Customization

### Adding New Field Types
1. Add the field type to the `fieldTypes` array in `FormBuilder.js`
2. Add the rendering logic in `FormField.js`
3. Update validation in `FormResponse.js`

### Database Modifications
1. Modify the `init()` method in `database.js` to add new object stores
2. Add new methods for custom queries
3. Update the context providers to use new methods

### OAuth Configuration
1. Set up Google OAuth in Google Cloud Console
2. Set up Facebook OAuth in Facebook Developers
3. Configure environment variables with OAuth credentials
4. Update OAuth redirect URIs for your domain

### Styling
- Uses Tailwind CSS for styling
- Custom CSS classes in `App.css`
- Responsive design with mobile-first approach

## Deployment

### Build for Production
```bash
npm run build
```

### Database Considerations
- The PostgreSQL database is stored on your server
- Data persists across all users and sessions
- For production deployment, use a managed PostgreSQL service
- Database backups and maintenance are handled by the hosting provider

### Deploy to Netlify/Vercel
1. Build the project
2. Set up a PostgreSQL database (e.g., Supabase, Railway, or AWS RDS)
3. Configure environment variables for database connection
4. Deploy both frontend and backend
5. Note: PostgreSQL works perfectly on all platforms including serverless

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
