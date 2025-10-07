# JamieAI - AI Coaching Assistant

An AI-powered coaching platform that helps users practice coaching conversations with Jamie, a sophomore mechanical engineering student considering switching to art/design. The system provides real-time Decision Quality (DQ) scoring based on the Six Dimensions of Decision Quality.

## 🚀 Features

- **Interactive Chat Interface**: Clean, modern chat UI with typing indicators
- **Decision Quality Scoring**: Real-time analysis of coaching messages across 6 dimensions
- **User Data Collection**: Captures coach information for research purposes
- **Demo Mode**: Fallback simulation when backend is unavailable
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Backend Integration**: Connects to OpenAI-powered backend

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js/Express with OpenAI API integration
- **Deployment**: Vercel (frontend), Render.com (backend)

## 📦 Quick Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Create GitHub Repository**
   ```bash
   # Create new repository on GitHub named 'jamie-ai-frontend'
   # Clone or upload all files from this package
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Select your `jamie-ai-frontend` repository
   - Click "Deploy"

3. **That's it!** Vercel will automatically detect the React app and deploy it.

### Option 2: Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

The app is configured to connect to the backend at:
```
https://jamie-backend.onrender.com/chat
```

To change the backend URL, edit the `fetch` calls in `src/App.js`.

## 🎯 Usage

1. **User Registration**: Fill in coach information (name, email, affiliation)
2. **Start Coaching**: Begin conversation with Jamie about her academic/career concerns
3. **Receive Feedback**: Get Decision Quality scores for each coaching message
4. **Demo Mode**: Use simulated responses if backend is unavailable

## 📊 Decision Quality Dimensions

The system scores coaching messages on six dimensions:
- **Framing**: How well the problem is defined
- **Alternatives**: Generation of multiple options
- **Information**: Quality of information gathering
- **Values**: Alignment with personal values
- **Reasoning**: Logical decision-making process
- **Commitment**: Commitment to follow through

## 🔐 Backend API

The frontend expects the following API response format:

```json
{
  "session_id": "string",
  "user_id": "string", 
  "user_message": "string",
  "jamie_reply": "string",
  "dq_score": {
    "framing": number,
    "alternatives": number,
    "information": number,
    "values": number,
    "reasoning": number,
    "commitment": number
  },
  "timestamp": "ISO string"
}
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.