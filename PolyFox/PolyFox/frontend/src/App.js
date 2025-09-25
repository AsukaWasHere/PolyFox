import React, { useState } from 'react';
import './App.css';

// A reusable loading spinner component for better user feedback.
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Please wait while our AI analyzes your profile...</p>
  </div>
);

// A reusable card for displaying different types of insights clearly.
const InsightCard = ({ title, content, type, icon }) => (
  <div className={`insight-card ${type}`}>
    <h3>{icon} {title}</h3>
    <p>{content}</p>
  </div>
);

// The main application component.
function App() {
  // State to manage form inputs. Pre-filled with example data for convenience.
  const [formData, setFormData] = useState({
    age: '30',
    income: '8000000', // Example: 80 Lakhs per annum
    goals: 'Retirement in 20 years and a down payment for a house in Gurugram.',
    current_investments: '5 Lakhs in various Equity Mutual Funds, 2 Lakhs in tech stocks, and some FDs.',
  });

  // State to store the AI's response.
  const [aiInsight, setAiInsight] = useState(null);
  // State to manage the loading spinner's visibility.
  const [isLoading, setIsLoading] = useState(false);
  // State to display any errors that occur.
  const [error, setError] = useState('');

  // Updates the form data state as the user types.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handles the form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAiInsight(null);

    // This is the URL of your live backend running on Render.
    // It's securely read from an environment variable.
    const apiUrl = `${process.env.REACT_APP_API_URL}/api/analyze`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          income: parseInt(formData.income),
          goals: formData.goals,
          current_investments: formData.current_investments
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok. Please ensure the backend server is running and accessible.');
      }

      const data = await response.json();
      setAiInsight(data.insight);

    } catch (error) {
      setError(error.message);
      console.error("There was an error fetching the insight:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Personal AI Financial Advisor</h1>
        <p>Enter your details to receive a personalized financial insight powered by AI.</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="age">Your Age</label>
          <input type="number" id="age" name="age" value={formData.age} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="income">Annual Income (in INR)</label>
          <input type="number" id="income" name="income" value={formData.income} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="goals">Primary Financial Goal</label>
          <textarea id="goals" name="goals" value={formData.goals} onChange={handleInputChange} placeholder="e.g., Retirement, Buy a house in 5 years" required />
        </div>
        <div className="form-group">
          <label htmlFor="current_investments">Current Investments</label>
          <textarea id="current_investments" name="current_investments" value={formData.current_investments} onChange={handleInputChange} placeholder="e.g., Mutual Funds (5 Lakhs), Stocks (2 Lakhs)" required />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Get My AI Insight'}
        </button>
      </form>

      {/* Conditionally render the error message if it exists */}
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</p>}

      {/* Conditionally render the loading spinner */}
      {isLoading && <LoadingSpinner />}

      {/* Conditionally render the results container if an insight has been received */}
      {aiInsight && (
        <div className="results-container">
          <h2>Your Personalized Insight</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}><strong>{aiInsight.summary}</strong></p>
          
          <InsightCard 
            title="Opportunity Identified"
            content={aiInsight.opportunity}
            type="opportunity"
            icon="💡"
          />
          
          <InsightCard 
            title="Risk Assessment"
            content={aiInsight.risk_assessment}
            type="risk"
            icon="🛡️"
          />

          <InsightCard 
            title="Suggested Action"
            content={aiInsight.suggested_action}
            type="action"
            icon="▶️"
          />
        </div>
      )}
    </div>
  );
}

export default App;
