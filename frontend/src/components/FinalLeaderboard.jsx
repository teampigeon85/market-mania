import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { useNavigate } from 'react-router-dom';

const FinalLeaderboard = ({ gameId, isOpen, userId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && gameId) {
      fetchFinalLeaderboard();
    }
  }, [isOpen, gameId]);

  const fetchFinalLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3000/api/game/${gameId}/final-leaderboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch final leaderboard');
      }
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to load final leaderboard');
      console.error('Error fetching final leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}.`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600';
      case 2: return 'text-gray-500';
      case 3: return 'text-orange-600';
      default: return 'text-gray-700';
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const handleExit = () => {
    navigate('/user-home');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <div className="text-center">
              <CardTitle className="text-4xl font-bold mb-2">
                🎉 Game Complete! 🎉
              </CardTitle>
              <p className="text-xl opacity-90">Final Leaderboard</p>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500"></div>
                <span className="ml-4 text-xl text-gray-600">Calculating final results...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-red-500 text-xl mb-6">⚠️ {error}</div>
                <Button onClick={fetchFinalLeaderboard} className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 text-lg">
                  Retry
                </Button>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-500 text-xl">No final scores available</div>
                <div className="text-gray-400 text-sm mt-2">Something went wrong with score calculation</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Winner announcement */}
                {leaderboard.length > 0 && (
                  <div className="text-center mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-2xl font-bold text-yellow-700 mb-1">
                      Congratulations {leaderboard[0].username}!
                    </div>
                    <div className="text-lg text-gray-600">
                      You won with a net worth of {formatCurrency(leaderboard[0].final_net_worth)}
                    </div>
                  </div>
                )}

                {/* Leaderboard */}
                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <div 
                      key={player.user_id}
                      className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                        player.user_id === userId 
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                          : player.final_rank <= 3
                          ? 'border-yellow-300 bg-yellow-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-6">
                        <div className={`text-3xl font-bold ${getRankColor(player.final_rank)}`}>
                          {getRankIcon(player.final_rank)}
                        </div>
                        <div>
                          <div className={`font-bold text-xl ${
                            player.user_id === userId ? 'text-indigo-700' : 'text-gray-800'
                          }`}>
                            {player.username}
                            {player.user_id === userId && (
                              <span className="ml-3 text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Final Net Worth
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          player.user_id === userId ? 'text-indigo-700' : 'text-gray-800'
                        }`}>
                          {formatCurrency(player.final_net_worth)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Rank #{player.final_rank}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Performance summary */}
                {leaderboard.length > 0 && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Game Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">{leaderboard.length}</div>
                        <div className="text-sm text-gray-600">Players</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(leaderboard[0]?.final_net_worth || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Highest Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(leaderboard[leaderboard.length - 1]?.final_net_worth || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Lowest Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(
                            leaderboard.reduce((sum, p) => sum + parseFloat(p.final_net_worth), 0) / leaderboard.length
                          )}
                        </div>
                        <div className="text-sm text-gray-600">Average Score</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-8 flex justify-center">
              <Button 
                onClick={handleExit}
                className="bg-red-600 hover:bg-red-700 text-white px-12 py-3 text-lg font-bold"
              >
                Exit Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinalLeaderboard;

