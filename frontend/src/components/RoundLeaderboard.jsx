import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';

const RoundLeaderboard = ({ gameId, roundNumber, isOpen, onClose, userId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && gameId && roundNumber) {
      fetchLeaderboard();
    }
  }, [isOpen, gameId, roundNumber]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      console.log(`Fetching leaderboard for game ${gameId}, round ${roundNumber}`);
      const response = await fetch(`http://localhost:3000/api/game/${gameId}/leaderboard/${roundNumber}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.status}`);
      }
      const data = await response.json();
      console.log('Leaderboard data received:', data);
      setLeaderboard(data);
    } catch (err) {
      setError(`Failed to load leaderboard: ${err.message}`);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}.`;
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                🏆 Round {roundNumber} Leaderboard
              </CardTitle>
              <Button 
                variant="secondary" 
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-lg text-gray-600">Loading leaderboard...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
                <Button onClick={fetchLeaderboard} className="bg-indigo-600 hover:bg-indigo-700">
                  Retry
                </Button>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No scores submitted yet</div>
                <div className="text-gray-400 text-sm mt-2">Waiting for players to submit their scores...</div>
                <div className="mt-4">
                  <Button onClick={fetchLeaderboard} className="bg-indigo-600 hover:bg-indigo-700">
                    Refresh Leaderboard
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Game ID: {gameId} | Round: {roundNumber}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div 
                    key={player.user_id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      player.user_id === userId 
                        ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-gray-700">
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <div className={`font-bold text-lg ${
                          player.user_id === userId ? 'text-indigo-700' : 'text-gray-800'
                        }`}>
                          {player.username}
                          {player.user_id === userId && (
                            <span className="ml-2 text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cash: {formatCurrency(player.cash_amount)} | 
                          Portfolio: {formatCurrency(player.portfolio_value)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        player.user_id === userId ? 'text-indigo-700' : 'text-gray-800'
                      }`}>
                        {formatCurrency(player.net_worth)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Net Worth
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-2"
              >
                Continue Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoundLeaderboard;
