import React, { useState, useEffect } from 'react';

const Button = ({ children, onClick, variant, className = '', disabled, ...props }) => {
  const base = "px-6 py-3 rounded-lg font-semibold text-white shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
  const styles = variant === 'destructive' 
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" 
    : variant === 'success'
    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`} {...props}>{children}</button>;
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-2xl font-bold text-gray-900">{children}</h3>;
const CardContent = ({ children }) => <div className="p-6">{children}</div>;

export default function GameLobby({ roomSettings, roomID, onStartGame, onNavigateToGame }) {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [players, setPlayers] = useState([
    { id: 1, name: "Host (You)", isReady: true, isHost: true }
  ]);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-start when timer reaches 0
      handleStartGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleStartGame = () => {
    if (onStartGame) {
      onStartGame(roomSettings, roomID);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 60) return "text-green-600";
    if (timeLeft > 30) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Game Lobby</CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Room Code:</span>
                <span className="text-2xl font-bold tracking-widest bg-white px-4 py-2 rounded-lg shadow-inner text-indigo-700">
                  {roomID}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Timer Section */}
            <div className="mb-8 text-center">
              <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-xl">
                <p className="text-white text-sm uppercase tracking-wider mb-2">Game starts in</p>
                <div className={`text-6xl font-bold ${getTimerColor()} bg-white rounded-xl px-8 py-4 shadow-inner`}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-white text-xs mt-3 opacity-80">or when host clicks start</p>
              </div>
            </div>

            {/* Game Settings */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Game Settings</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-600 mb-1">Room Name</p>
                  <p className="text-lg font-bold text-gray-900">{roomSettings.name}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Initial Money</p>
                  <p className="text-lg font-bold text-gray-900">₹{parseInt(roomSettings.initialMoney).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Number of Rounds</p>
                  <p className="text-lg font-bold text-gray-900">{roomSettings.numRounds}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-1">Time per Round</p>
                  <p className="text-lg font-bold text-gray-900">{roomSettings.roundTime}s</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Number of Stocks</p>
                  <p className="text-lg font-bold text-gray-900">{roomSettings.numStocks}</p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                  <p className="text-sm text-gray-600 mb-1">Max Players</p>
                  <p className="text-lg font-bold text-gray-900">{roomSettings.maxPlayers}</p>
                </div>
              </div>
            </div>

            {/* Players List */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Players ({players.length}/{roomSettings.maxPlayers})
              </h3>
              <div className="space-y-3">
                {players.map(player => (
                  <div key={player.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{player.name}</p>
                        {player.isHost && <p className="text-xs text-indigo-600">👑 Host</p>}
                      </div>
                    </div>
                    <div>
                      {player.isReady ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          ✓ Ready
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                          ⏳ Waiting
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="flex justify-center">
              <Button 
                variant="success" 
                onClick={handleStartGame}
                className="text-lg px-12 py-4"
              >
                🚀 Start Game Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}