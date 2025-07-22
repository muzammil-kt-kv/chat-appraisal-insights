# Chat Appraisal Insights

A comprehensive employee self-appraisal system with AI-powered chat interface and analytics.

## Features

### 🤖 AI-Powered Chat Interface

- **OpenAI Integration**: Uses GPT-4o-mini for intelligent follow-up questions
- **Dynamic Question Generation**: AI generates personalized questions based on user responses
- **Conversation History**: Maintains context throughout the appraisal process
- **Smart Analysis**: AI analyzes completed appraisals for insights

### 📊 Competency-Based Assessment

- **Technical Skills**: Evaluate technical contributions and achievements
- **Functional Understanding**: Assess business requirement comprehension
- **Communication**: Review team and stakeholder communication effectiveness
- **Energy & Drive**: Measure initiative and learning proactivity

### 🎯 User Experience

- **Progress Tracking**: Visual progress indicators for each competency area
- **Real-time Saving**: Automatic saving of responses as you type
- **Cancel Functionality**: Easy cancellation of all appraisal chats
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🔧 Technical Features

- **Supabase Integration**: Real-time database with PostgreSQL
- **TypeScript**: Full type safety throughout the application
- **React 18**: Modern React with hooks and context
- **Tailwind CSS**: Beautiful, responsive UI components
- **Shadcn/ui**: High-quality, accessible UI components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd chat-appraisal-insights
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Create .env.local file
cp .env.example .env.local
```

4. Configure your environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

5. Start the development server:

```bash
npm run dev
```

## Usage

### For Employees

1. **Start Appraisal**: Navigate to the chat interface
2. **Answer Questions**: Respond to AI-generated competency questions
3. **Track Progress**: Monitor your completion status
4. **Submit**: Review and submit your completed appraisal
5. **Cancel**: Use the cancel button to start over if needed

### For Team Leads

1. **Review Submissions**: View submitted appraisals
2. **Provide Feedback**: Add comments and recommendations
3. **Approve**: Approve or request revisions

### For HR

1. **Dashboard**: Overview of all appraisal activities
2. **Analytics**: AI-generated insights and trends
3. **Management**: Oversee the entire appraisal process

## AI Integration

The application uses OpenAI's GPT-4o-mini model for:

- **Dynamic Question Generation**: Creates personalized follow-up questions
- **Response Analysis**: Analyzes completed appraisals for insights
- **Conversation Flow**: Maintains context and generates relevant questions

### AI Features

- **Contextual Questions**: Questions adapt based on previous responses
- **Competency Coverage**: Ensures all competency areas are thoroughly covered
- **Professional Tone**: Maintains appropriate professional communication
- **Behavioral Focus**: Emphasizes specific examples and outcomes

## Database Schema

### Key Tables

- `appraisal_submissions`: Main appraisal records
- `user_profiles`: Employee and manager profiles
- `ai_analysis`: AI-generated insights and analysis

### Status Flow

1. `draft` → Initial state
2. `submitted` → Employee completes appraisal
3. `team_lead_review` → Under team lead review
4. `team_lead_approved` → Approved by team lead
5. `ai_analyzed` → AI analysis completed
6. `completed` → Final state

## Development

### Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, etc.)
├── hooks/          # Custom React hooks
├── integrations/   # External service integrations
├── lib/           # Utility functions and services
├── pages/         # Page components
└── types/         # TypeScript type definitions
```

### Key Services

- `AppraisalService`: Handles appraisal operations
- `OpenAIClient`: Manages AI interactions
- `AuthContext`: User authentication and profile management

### Adding New Features

1. Create new components in `src/components/`
2. Add pages in `src/pages/`
3. Update services in `src/lib/`
4. Add types in `src/types/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
