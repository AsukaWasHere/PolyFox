import React, { useState } from 'react';

// Reusable components for a clean UI
const LoadingSpinner = () => (
  <div className="text-center p-10">
    <div className="w-12 h-12 mx-auto border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
    <p className="mt-4 text-text-secondary">Please wait while our AI analyzes your profile...</p>
  </div>
);

const InsightCard = ({ title, content, icon, type }) => {
    const typeClasses = {
        opportunity: 'border-l-success bg-success/5 text-success-800',
        risk: 'border-l-warning bg-warning/5 text-warning-800',
        action: 'border-l-primary bg-primary/5 text-primary-800'
    };
    return (
        <div className={`p-4 rounded-lg border-l-4 ${typeClasses[type]}`}>
            <h3 className="font-semibold flex items-center gap-2">{icon} {title}</h3>
            <p className="text-text-secondary text-sm mt-1">{content}</p>
        </div>
    );
};

// Main Application Component
function App() {
  const [formData, setFormData] = useState({
    age: '32',
    income: '9000000',
    goals: 'Long-term wealth growth and buying a second property in 10 years.',
    current_investments: 'Mix of equity mutual funds and some government bonds.',
  });

  const [aiInsight, setAiInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAiInsight(null);

    // Use environment variable for the API URL in production
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(formData.age),
          income: parseInt(formData.income),
          goals: formData.goals,
          current_investments: formData.current_investments
        }),
      });

      if (!response.ok) {
        throw new Error(`Network error: ${response.statusText}`);
      }
      const data = await response.json();
      setAiInsight(data.insight);
    } catch (err) {
      setError(`Failed to get analysis. Please ensure the backend is running. Details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">PolyFox AI</h1>
          <p className="text-text-secondary mt-2 text-lg">Your Personal AI Financial Advisor</p>
        </header>

        <main>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-text-primary mb-1">Age</label>
                  <input type="number" name="age" id="age" value={formData.age} onChange={handleInputChange} className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
                </div>
                <div>
                  <label htmlFor="income" className="block text-sm font-medium text-text-primary mb-1">Annual Income (INR)</label>
                  <input type="number" name="income" id="income" value={formData.income} onChange={handleInputChange} className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
                </div>
              </div>
              <div>
                <label htmlFor="goals" className="block text-sm font-medium text-text-primary mb-1">Financial Goals</label>
                <textarea name="goals" id="goals" rows="3" value={formData.goals} onChange={handleInputChange} className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required></textarea>
              </div>
              <div>
                <label htmlFor="current_investments" className="block text-sm font-medium text-text-primary mb-1">Current Investments</label>
                <textarea name="current_investments" id="current_investments" rows="3" value={formData.current_investments} onChange={handleInputChange} className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required></textarea>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 disabled:bg-gray-400 transition-colors">
                {isLoading ? 'Analyzing...' : 'Generate My Financial Plan'}
              </button>
            </form>
          </div>

          <div className="mt-10">
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-center text-error font-medium">{error}</p>}
            {aiInsight && (
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-border space-y-8">
                <h2 className="text-2xl font-bold text-center text-primary">{aiInsight.summary}</h2>
                <div className="space-y-4">
                  <InsightCard title="Opportunity Identified" content={aiInsight.opportunity} icon="💡" type="opportunity" />
                  <InsightCard title="Risk Assessment" content={aiInsight.risk_assessment} icon="🛡️" type="risk" />
                  <InsightCard title="Suggested Action" content={aiInsight.suggested_action} icon="▶️" type="action" />
                </div>
                {aiInsight.graph && (
                    <div className="pt-6 border-t border-border">
                         <h3 className="text-xl font-bold text-center text-primary mb-4">AI-Generated Projection</h3>
                        <img src={aiInsight.graph} alt="AI Generated Financial Graph" className="w-full h-auto rounded-lg shadow-md" />
                    </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;