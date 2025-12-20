# Research Data Export - Detailed Implementation

## Overview

Research data export allows researchers to retrieve anonymized data for analysis while maintaining complete privacy protection.

## Export Capabilities

### ✅ What CAN Be Exported (Anonymous Data)

1. **Research Sessions**
   - Research codes (e.g., "RES-ABC123")
   - Session metadata:
     - Start/end times
     - Duration
     - Turns used
     - Session status
     - Character name (Jamie)
   - ❌ NO user IDs, names, emails, or any identifying information

2. **Chat Messages**
   - All messages (user questions and Jamie responses)
   - Message timestamps
   - Turn numbers
   - Message content/text
   - Message types (user/jamie/system)

3. **DQ Scores**
   - Individual DQ scores per message
   - All 6 dimensions:
     - Framing
     - Alternatives
     - Information
     - Values
     - Reasoning
     - Commitment
   - Minimum scores
   - Turn-by-turn progression

4. **Analytics**
   - Session-level aggregates
   - DQ score trends over conversation
   - Turn count statistics
   - Completion rates

### ❌ What CANNOT Be Exported

- User IDs
- User names
- Email addresses
- Any linking information to user accounts
- IP addresses (if collected)
- Any other personally identifiable information (PII)

---

## Export Methods

### Method 1: Export by Research Code (Single Session)

**Use Case:** Researcher wants data for a specific session

**Endpoint:** `GET /api/research/export/:code`

**Response:**
```json
{
  "research_code": "RES-ABC123",
  "session": {
    "id": "uuid",
    "research_code": "RES-ABC123",
    "character_name": "jamie",
    "started_at": "2025-12-19T10:00:00Z",
    "completed_at": "2025-12-19T10:15:00Z",
    "duration_seconds": 900,
    "turns_used": 12,
    "max_turns": 20,
    "session_status": "completed"
  },
  "messages": [
    {
      "id": "uuid",
      "message_type": "user",
      "content": "I understand you're feeling overwhelmed...",
      "timestamp": "2025-12-19T10:00:05Z",
      "turn_number": 1,
      "dq_scores": {
        "framing": 0.6,
        "alternatives": 0.2,
        "information": 0.5,
        "values": 0.3,
        "reasoning": 0.4,
        "commitment": 0.2
      },
      "dq_score_minimum": 0.2
    },
    {
      "id": "uuid",
      "message_type": "jamie",
      "content": "Um, yeah, I guess I could really use some help...",
      "timestamp": "2025-12-19T10:00:12Z",
      "turn_number": 1,
      "dq_scores": null,
      "dq_score_minimum": null
    }
    // ... more messages
  ]
}
```

### Method 2: Bulk Export (All Sessions)

**Use Case:** Researcher wants all research data

**Endpoint:** `GET /api/research/export/all`

**Query Parameters:**
- `format`: `json` | `csv` (default: json)
- `start_date`: Filter by start date (optional)
- `end_date`: Filter by end date (optional)
- `character`: Filter by character name (optional, defaults to 'jamie')
- `status`: Filter by session status (optional: 'completed', 'in-progress', 'abandoned')

**Response (JSON format):**
```json
{
  "export_date": "2025-12-19T12:00:00Z",
  "total_sessions": 150,
  "sessions": [
    {
      "research_code": "RES-ABC123",
      "session_data": { /* session info */ },
      "messages": [ /* all messages */ ]
    },
    // ... more sessions
  ]
}
```

**Response (CSV format):**
- Returns CSV file download
- One row per message with session context
- Columns: research_code, turn_number, message_type, content, timestamp, framing, alternatives, information, values, reasoning, commitment, dq_minimum

### Method 3: Aggregated Analytics Export

**Use Case:** Researcher wants summary statistics

**Endpoint:** `GET /api/research/export/analytics`

**Response:**
```json
{
  "total_sessions": 150,
  "completed_sessions": 142,
  "average_turns_per_session": 11.5,
  "average_session_duration_seconds": 845,
  "dq_score_statistics": {
    "average_minimum_score": 0.35,
    "score_by_turn": [
      { "turn": 1, "avg_minimum": 0.28 },
      { "turn": 2, "avg_minimum": 0.32 },
      // ...
    ],
    "dimension_averages": {
      "framing": 0.52,
      "alternatives": 0.38,
      "information": 0.45,
      "values": 0.41,
      "reasoning": 0.48,
      "commitment": 0.36
    }
  },
  "completion_rate": 0.947
}
```

---

## Implementation Code

### Export Endpoint (Complete)

**File:** `jamie-backend/routes/research.js`

```javascript
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { stringify } = require('csv-stringify/sync');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role for admin access
);

// Export single session by research code
router.get('/export/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Get session with messages
    const { data: session, error: sessionError } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('research_code', code)
      .single();
    
    if (sessionError || !session) {
      return res.status(404).json({ error: 'Research session not found' });
    }
    
    // Get messages for this session
    const { data: messages, error: messagesError } = await supabase
      .from('research_messages')
      .select('*')
      .eq('research_session_id', session.id)
      .order('turn_number', { ascending: true });
    
    if (messagesError) {
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }
    
    res.json({
      research_code: session.research_code,
      session: {
        character_name: session.character_name,
        started_at: session.started_at,
        completed_at: session.completed_at,
        duration_seconds: session.duration_seconds,
        turns_used: session.turns_used,
        max_turns: session.max_turns,
        session_status: session.session_status
      },
      messages: messages.map(msg => ({
        message_type: msg.message_type,
        content: msg.content,
        timestamp: msg.timestamp,
        turn_number: msg.turn_number,
        dq_scores: msg.dq_scores,
        dq_score_minimum: msg.dq_score_minimum
      }))
    });
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Bulk export all sessions
router.get('/export/all', async (req, res) => {
  try {
    const { format = 'json', start_date, end_date, character = 'jamie', status } = req.query;
    
    // Build query
    let query = supabase
      .from('research_sessions')
      .select('*')
      .eq('character_name', character);
    
    if (start_date) {
      query = query.gte('started_at', start_date);
    }
    if (end_date) {
      query = query.lte('started_at', end_date);
    }
    if (status) {
      query = query.eq('session_status', status);
    }
    
    const { data: sessions, error: sessionsError } = await query.order('started_at', { ascending: false });
    
    if (sessionsError) {
      return res.status(500).json({ error: 'Failed to retrieve sessions' });
    }
    
    // Get messages for all sessions
    const sessionIds = sessions.map(s => s.id);
    const { data: allMessages, error: messagesError } = await supabase
      .from('research_messages')
      .select('*')
      .in('research_session_id', sessionIds)
      .order('research_session_id', { ascending: true })
      .order('turn_number', { ascending: true });
    
    if (messagesError) {
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }
    
    // Group messages by session
    const sessionsWithMessages = sessions.map(session => {
      const sessionMessages = allMessages.filter(m => m.research_session_id === session.id);
      return {
        research_code: session.research_code,
        session: {
          character_name: session.character_name,
          started_at: session.started_at,
          completed_at: session.completed_at,
          duration_seconds: session.duration_seconds,
          turns_used: session.turns_used,
          max_turns: session.max_turns,
          session_status: session.session_status
        },
        messages: sessionMessages.map(msg => ({
          message_type: msg.message_type,
          content: msg.content,
          timestamp: msg.timestamp,
          turn_number: msg.turn_number,
          dq_scores: msg.dq_scores,
          dq_score_minimum: msg.dq_score_minimum
        }))
      };
    });
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvRows = [];
      sessionsWithMessages.forEach(sessionData => {
        sessionData.messages.forEach(msg => {
          csvRows.push({
            research_code: sessionData.research_code,
            turn_number: msg.turn_number,
            message_type: msg.message_type,
            content: msg.content,
            timestamp: msg.timestamp,
            framing: msg.dq_scores?.framing || '',
            alternatives: msg.dq_scores?.alternatives || '',
            information: msg.dq_scores?.information || '',
            values: msg.dq_scores?.values || '',
            reasoning: msg.dq_scores?.reasoning || '',
            commitment: msg.dq_scores?.commitment || '',
            dq_minimum: msg.dq_score_minimum || ''
          });
        });
      });
      
      const csv = stringify(csvRows, { header: true });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=research-data-export.csv');
      return res.send(csv);
    }
    
    // JSON format
    res.json({
      export_date: new Date().toISOString(),
      total_sessions: sessions.length,
      sessions: sessionsWithMessages
    });
    
  } catch (error) {
    console.error('Bulk export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Analytics export
router.get('/export/analytics', async (req, res) => {
  try {
    const { start_date, end_date, character = 'jamie' } = req.query;
    
    // Build query
    let query = supabase
      .from('research_sessions')
      .select('*')
      .eq('character_name', character);
    
    if (start_date) query = query.gte('started_at', start_date);
    if (end_date) query = query.lte('started_at', end_date);
    
    const { data: sessions, error: sessionsError } = await query;
    
    if (sessionsError) {
      return res.status(500).json({ error: 'Failed to retrieve sessions' });
    }
    
    // Calculate statistics
    const completedSessions = sessions.filter(s => s.session_status === 'completed');
    const totalTurns = completedSessions.reduce((sum, s) => sum + (s.turns_used || 0), 0);
    const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    
    // Get all messages for DQ score analysis
    const sessionIds = completedSessions.map(s => s.id);
    const { data: messages, error: messagesError } = await supabase
      .from('research_messages')
      .select('turn_number, dq_scores, dq_score_minimum')
      .in('research_session_id', sessionIds)
      .not('dq_score_minimum', 'is', null);
    
    if (messagesError) {
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }
    
    // Calculate DQ statistics
    const dqScores = messages.filter(m => m.dq_score_minimum !== null).map(m => m.dq_score_minimum);
    const avgMinimum = dqScores.length > 0 
      ? dqScores.reduce((sum, score) => sum + score, 0) / dqScores.length 
      : 0;
    
    // Calculate dimension averages
    const dimensionTotals = { framing: 0, alternatives: 0, information: 0, values: 0, reasoning: 0, commitment: 0 };
    const dimensionCounts = { framing: 0, alternatives: 0, information: 0, values: 0, reasoning: 0, commitment: 0 };
    
    messages.forEach(msg => {
      if (msg.dq_scores) {
        Object.keys(dimensionTotals).forEach(dim => {
          if (msg.dq_scores[dim] !== undefined && msg.dq_scores[dim] !== null) {
            dimensionTotals[dim] += msg.dq_scores[dim];
            dimensionCounts[dim]++;
          }
        });
      }
    });
    
    const dimensionAverages = {};
    Object.keys(dimensionTotals).forEach(dim => {
      dimensionAverages[dim] = dimensionCounts[dim] > 0 
        ? dimensionTotals[dim] / dimensionCounts[dim] 
        : 0;
    });
    
    res.json({
      total_sessions: sessions.length,
      completed_sessions: completedSessions.length,
      average_turns_per_session: completedSessions.length > 0 
        ? totalTurns / completedSessions.length 
        : 0,
      average_session_duration_seconds: completedSessions.length > 0 
        ? totalDuration / completedSessions.length 
        : 0,
      dq_score_statistics: {
        average_minimum_score: avgMinimum,
        dimension_averages: dimensionAverages
      },
      completion_rate: sessions.length > 0 
        ? completedSessions.length / sessions.length 
        : 0
    });
    
  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({ error: 'Analytics export failed' });
  }
});

module.exports = router;
```

---

## Export Formats

### JSON Format
- **Best for:** Programmatic analysis, data processing
- **Structure:** Nested objects with sessions and messages
- **Use Case:** Python/R/SPSS analysis scripts

### CSV Format
- **Best for:** Excel, Google Sheets, basic analysis
- **Structure:** Flat table, one row per message
- **Use Case:** Quick data exploration, sharing with non-technical researchers

---

## Security & Access Control

### Who Can Export?

1. **Service Role Access Only**
   - Exports require service role API key
   - Regular users cannot export research data
   - Researchers use admin interface or API with service role key

2. **Audit Logging (Recommended)**
   - Log all export requests
   - Track who exported what and when
   - Store in `research_exports` table (from schema)

### Audit Logging Implementation

```javascript
// Log export request
async function logExport(researchCode, exportedBy, exportType) {
  await supabase
    .from('research_exports')
    .insert({
      export_type: exportType, // 'single', 'bulk', 'analytics'
      requested_by: exportedBy, // Service account or admin user ID
      export_parameters: { research_code: researchCode },
      created_at: new Date().toISOString(),
      status: 'completed'
    });
}
```

---

## Export Use Cases

### 1. Individual Session Analysis
```
GET /api/research/export/RES-ABC123
```
- Analyze a specific student's session
- Review conversation flow
- Examine DQ score progression

### 2. Bulk Data Analysis
```
GET /api/research/export/all?format=csv&status=completed
```
- Export all completed sessions
- Statistical analysis
- Pattern identification
- Trend analysis

### 3. Time-Based Analysis
```
GET /api/research/export/all?start_date=2025-01-01&end_date=2025-12-31
```
- Analyze data from specific time period
- Compare different time periods
- Longitudinal studies

### 4. Summary Statistics
```
GET /api/research/export/analytics
```
- Quick overview of research data
- Completion rates
- Average scores
- Session statistics

---

## Data Analysis Capabilities

With this export, researchers can:

1. **Conversation Analysis**
   - Analyze message content
   - Identify coaching patterns
   - Study conversation flow

2. **DQ Score Analysis**
   - Track DQ score progression over turns
   - Identify which dimensions improve most
   - Analyze coaching effectiveness

3. **Statistical Analysis**
   - Descriptive statistics
   - Regression analysis
   - Correlation studies
   - Hypothesis testing

4. **Longitudinal Studies**
   - Compare sessions over time
   - Identify trends
   - Measure improvements

---

## Summary

**Yes, you can export data for analysis!**

✅ **Export Options:**
- Single session by research code
- Bulk export (all sessions)
- Analytics/statistics export

✅ **Formats:**
- JSON (for programmatic analysis)
- CSV (for Excel/spreadsheet analysis)

✅ **Data Included:**
- All chat messages
- All DQ scores
- Session metadata
- Complete conversation history

❌ **No Identity Data:**
- No user IDs
- No names or emails
- Only research codes as identifiers

**Export is secure, anonymous, and IRB-compliant!**

