# Chat Appraisal Insights System

A comprehensive AI-powered employee self-appraisal system with role-based access control, real-time chat interface, and advanced analytics.

## 🚀 Quick Start

### Login Credentials

Use these credentials to access the system:

| Role          | Email                   | Password   | Access Level                       |
| ------------- | ----------------------- | ---------- | ---------------------------------- |
| **Team Lead** | `lead@keyvalue.systems` | `password` | Team management & reviews          |
| **Employee**  | `employee@gmail.com`    | `password` | Self-appraisal & submissions       |
| **HR**        | `hr@keyvalue.systems`   | `password` | System-wide analytics & management |

### System Flow Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Employee      │    │   Team Lead      │    │       HR        │
│   Login         │    │   Login          │    │   Login         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Chat Appraisal  │    │ Review Dashboard │    │ HR Dashboard    │
│ Interface       │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Submit Appraisal│    │ Review & Approve │    │ Analytics &     │
│                 │    │                  │    │ Insights        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 Features

### 🤖 AI-Powered Chat Interface

- **OpenAI GPT-4o-mini Integration**: Intelligent follow-up questions based on responses
- **Dynamic Question Generation**: Personalized questions based on competency areas
- **Conversation History**: Maintains context throughout the appraisal process
- **Smart Analysis**: AI analyzes completed appraisals for insights and trends

### 📊 Competency-Based Assessment

The system evaluates employees across four key competency areas:

1. **Technical Skills** (`technical`)

   - Technical contributions and achievements
   - Problem-solving abilities
   - Technical knowledge application

2. **Functional Understanding** (`functional`)

   - Business requirement comprehension
   - Process understanding
   - Domain knowledge

3. **Communication** (`communication`)

   - Team collaboration effectiveness
   - Stakeholder communication
   - Documentation and presentation skills

4. **Energy & Drive** (`energy`)
   - Initiative and proactivity
   - Learning and development
   - Motivation and engagement

### 🎯 User Experience

- **Progress Tracking**: Visual progress indicators for each competency area
- **Real-time Saving**: Automatic saving of responses as you type
- **Cancel Functionality**: Easy cancellation and restart of appraisal chats
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Role-based Navigation**: Different dashboards for each user role

### 🔧 Technical Features

- **Supabase Integration**: Real-time database with PostgreSQL
- **TypeScript**: Full type safety throughout the application
- **React 18**: Modern React with hooks and context
- **Tailwind CSS**: Beautiful, responsive UI components
- **Shadcn/ui**: High-quality, accessible UI components
- **React Router**: Client-side routing with protected routes

## 🏗️ System Architecture

### Database Schema

#### Core Tables

**`user_profiles`**

```sql
- id (UUID, Primary Key)
- user_id (UUID, References auth.users)
- role (ENUM: 'employee', 'team_lead', 'hr')
- first_name (TEXT)
- last_name (TEXT)
- department (TEXT)
- team_lead_id (UUID, Self-reference)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**`appraisal_submissions`**

```sql
- id (UUID, Primary Key)
- employee_id (UUID, References user_profiles)
- submission_date (DATE)
- raw_employee_text (JSONB)
- raw_team_lead_text (TEXT)
- status (ENUM: 'draft', 'submitted', 'team_lead_review', 'team_lead_approved', 'ai_analyzed', 'completed')
- ai_analysis (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Appraisal Status Flow

```
draft → submitted → team_lead_review → team_lead_approved → ai_analyzed → completed
```

1. **`draft`**: Employee is working on appraisal
2. **`submitted`**: Employee completes and submits appraisal
3. **`team_lead_review`**: Team lead reviews the submission
4. **`team_lead_approved`**: Team lead approves or requests changes
5. **`ai_analyzed`**: AI processes and analyzes the appraisal
6. **`completed`**: Final state with insights and recommendations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**:

```bash
git clone <repository-url>
cd chat-appraisal-insights
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

```bash
# Create .env.local file
cp .env.example .env.local
```

4. **Configure your environment variables**:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

5. **Set up Supabase database**:

```bash
# Run migrations
npx supabase db push
```

6. **Start the development server**:

```bash
npm run dev
```

7. **Create test users** (optional):

```bash
npm run create-employees
```

## 👥 User Roles & Workflows

### 👤 Employee Workflow

1. **Login**: Use employee credentials
2. **Dashboard**: View current appraisal status
3. **Start Appraisal**: Begin chat-based appraisal
4. **Answer Questions**: Respond to AI-generated competency questions
5. **Track Progress**: Monitor completion status across competency areas
6. **Submit**: Review and submit completed appraisal
7. **View Results**: Access AI-generated insights and recommendations

### 👨‍💼 Team Lead Workflow

1. **Login**: Use team lead credentials
2. **Dashboard**: Overview of team members and their appraisal status
3. **Review Submissions**: Access submitted appraisals from team members
4. **Provide Feedback**: Add comments and recommendations
5. **Approve/Request Changes**: Approve or request revisions
6. **Team Analytics**: View team-wide insights and trends

### 👩‍💼 HR Workflow

1. **Login**: Use HR credentials
2. **Dashboard**: System-wide overview and analytics
3. **User Management**: Oversee all users and their roles
4. **Analytics**: Access AI-generated insights and organizational trends
5. **System Management**: Configure system settings and parameters
6. **Reports**: Generate comprehensive reports and analytics

## 🤖 AI Integration

### OpenAI GPT-4o-mini Features

- **Dynamic Question Generation**: Creates personalized follow-up questions
- **Response Analysis**: Analyzes completed appraisals for insights
- **Conversation Flow**: Maintains context and generates relevant questions
- **Competency Coverage**: Ensures all competency areas are thoroughly covered

### AI-Powered Insights

- **Strength Identification**: Highlights employee strengths
- **Development Areas**: Identifies areas for improvement
- **Recommendations**: Provides actionable development suggestions
- **Trend Analysis**: Identifies organizational patterns and trends

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── AppHeader.tsx   # Navigation header
│   └── ProtectedRoute.tsx # Route protection
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
│   └── use-toast.ts    # Toast notifications
├── integrations/       # External service integrations
│   ├── supabase/       # Supabase client and services
│   └── openai/         # OpenAI client
├── lib/               # Utility functions and services
│   ├── auth.ts        # Authentication utilities
│   ├── appraisal.ts   # Appraisal service
│   └── utils.ts       # General utilities
├── pages/             # Page components
│   ├── Login.tsx      # Authentication page
│   ├── EmployeeDashboard.tsx # Employee dashboard
│   ├── ChatAppraisal.tsx # Chat interface
│   ├── TeamLeadDashboard.tsx # Team lead dashboard
│   ├── TeamLeadReview.tsx # Review interface
│   └── HRDashboard.tsx # HR dashboard
└── types/             # TypeScript type definitions
    └── index.ts       # Global type definitions
```

## 🔧 Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run build:dev        # Build for development
npm run lint             # Run ESLint
npm run preview          # Preview production build
npm run create-employees # Create test employee data
```

### Key Services

- **`AppraisalService`**: Handles appraisal operations and AI integration
- **`OpenAIClient`**: Manages AI interactions and question generation
- **`AuthContext`**: User authentication and profile management
- **`SupabaseClient`**: Database operations and real-time subscriptions

### Adding New Features

1. **Create Components**: Add new components in `src/components/`
2. **Add Pages**: Create new pages in `src/pages/`
3. **Update Services**: Modify services in `src/lib/`
4. **Add Types**: Define new types in `src/types/`
5. **Update Routes**: Add new routes in `src/App.tsx`

## 🔒 Security & Permissions

### Row Level Security (RLS)

The system implements comprehensive RLS policies:

- **Employees**: Can only access their own appraisals
- **Team Leads**: Can access team member appraisals and provide reviews
- **HR**: Can access all data and system-wide analytics

### Authentication Flow

1. **Email/Password**: Standard Supabase authentication
2. **Role Assignment**: Automatic role assignment based on user profile
3. **Route Protection**: Protected routes based on user roles
4. **Session Management**: Automatic session handling and renewal

## 📊 Analytics & Reporting

### AI-Generated Insights

- **Individual Insights**: Personalized recommendations for each employee
- **Team Analytics**: Team-wide performance trends and patterns
- **Organizational Insights**: Company-wide analytics and recommendations

### Dashboard Features

- **Real-time Updates**: Live data updates across all dashboards
- **Progress Tracking**: Visual progress indicators and completion status
- **Performance Metrics**: Key performance indicators and trends
- **Export Capabilities**: Data export and reporting features

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Ensure all required environment variables are set:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Database Migration

```bash
npx supabase db push
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 System Updates

### Recent Updates

- **AI Integration**: Enhanced OpenAI integration with GPT-4o-mini
- **Role-based Access**: Improved role-based navigation and permissions
- **Real-time Features**: Added real-time updates and notifications
- **Analytics Dashboard**: Comprehensive analytics and reporting features

### Upcoming Features

- **Advanced Analytics**: Enhanced AI-powered insights
- **Mobile App**: Native
