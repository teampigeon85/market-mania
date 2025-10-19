import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams, Navigate } from 'react-router-dom';
import ChatPage from './ChatPage';
import RoundLeaderboard from '../components/RoundLeaderboard';
import FinalLeaderboard from '../components/FinalLeaderboard';
import { io } from "socket.io-client";

// --- UI Components (no changes) ---
const Button = ({ children, onClick, variant, className = "", disabled }) => {
  const base = "px-4 py-2 text-sm rounded-md font-semibold text-white shadow-sm transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = variant === "destructive" ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" : variant === "secondary" ? "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500" : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
  return (<button onClick={onClick} className={`${base} ${styles} ${className}`} disabled={disabled}>{children}</button>);
};
const Input = (props) => (<input {...props} className={`p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className}`}/>);
const Card = ({ children, className = "" }) => (<div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>{children}</div>);
const CardHeader = ({ children }) => <div className="p-3 border-b border-gray-200">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-base font-bold text-gray-900">{children}</h3>;
const CardContent = ({ children }) => <div className="p-3">{children}</div>;
const ScrollArea = ({ children, className = "" }) => (<div className={`overflow-y-auto ${className}`}>{children}</div>);


// --- Main Game Component ---
export default function GameArena() {
  const location = useLocation();
  const { gameId } = useParams();
  const [initialStocks, setInitialStocks] = useState(null);
  const [socket, setSocket] = useState(null);

  const roomSettings = location.state?.roomSettings;

  if (!roomSettings) {
    return <Navigate to="/user-home" replace />;
  }
  
  const [quantity, setQuantity] = useState({});
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRoundLeaderboardOpen, setIsRoundLeaderboardOpen] = useState(false);
  const [isFinalLeaderboardOpen, setIsFinalLeaderboardOpen] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showRoundEndModal, setShowRoundEndModal] = useState(false);

  const [round, setRound] = useState(0);
  const [money, setMoney] = useState(parseInt(roomSettings.initialMoney, 10));
  const [stocks, setStocks] = useState([]);
  const [notices, setNotices] = useState(["Waiting for the game to start..."]);
  const [holdings, setHoldings] = useState({});
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [netWorth, setNetWorth] = useState(parseInt(roomSettings.initialMoney, 10));

  // Refs to hold the latest state for submission
  const moneyRef = useRef(money);
  const portfolioValueRef = useRef(portfolioValue);
  const netWorthRef = useRef(netWorth);

  useEffect(() => {
    moneyRef.current = money;
    portfolioValueRef.current = portfolioValue;
    netWorthRef.current = netWorth;
  });

  const submitScore = useCallback(async (roundNumber) => {
    if (!currentUserId || !gameId) {
      return;
    }
    
    setIsSubmittingScore(true);
    const scoreData = {
      userId: currentUserId,
      roundNumber: roundNumber,
      cashAmount: moneyRef.current,
      portfolioValue: portfolioValueRef.current,
      netWorth: netWorthRef.current
    };
    
    console.log('Submitting score for round', roundNumber, scoreData);
    
    try {
      const response = await fetch(`http://localhost:3000/api/game/${gameId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
      });
       if (!response.ok) {
        throw new Error('Failed to submit score to server');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setIsSubmittingScore(false);
    }
  }, [currentUserId, gameId]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);
    
    newSocket.emit('join-lobby', gameId);

    const fetchInitialStocks = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/game/${gameId}/stocks`);
        if (!res.ok) throw new Error("Failed to fetch game stocks");
        const data = await res.json();

        const parsedData = data.map(stock => ({
          ...stock,
          price: parseFloat(stock.price),
          pe: parseFloat(stock.pe),
          volatility: parseFloat(stock.volatility),
          totalVolume: parseInt(stock.total_volume, 10) || stock.totalVolume
        }));
        setInitialStocks(parsedData);
        setStocks(parsedData);
        
        const initialHoldings = {};
        parsedData.forEach(s => initialHoldings[s.name] = 0);
        setHoldings(initialHoldings);

      } catch (error) {
        console.error(error);
      }
    }
    fetchInitialStocks();

    newSocket.on('new-round', (newRound) => {
        if (newRound > 1) {
            submitScore(newRound - 1);
        }
        setRound(newRound);
    });

    newSocket.on('news-update', (newNotices) => {
        setNotices(newNotices);
    });
    
    newSocket.on('price-update', (updatedStocks) => {
        setStocks(updatedStocks);
        setShowRoundEndModal(true);
        setTimeout(() => {
            setShowRoundEndModal(false);
            if (round >= 1) {
                setIsRoundLeaderboardOpen(true);
            }
        }, 3000);
    });
    
    newSocket.on('game-over', () => {
        setGameCompleted(true);
        submitFinalScore();
    });

    return () => {
        newSocket.off('new-round');
        newSocket.off('news-update');
        newSocket.off('price-update');
        newSocket.off('game-over');
        newSocket.disconnect();
    }
  }, [gameId, submitScore]);

  useEffect(() => {
    if (!stocks || stocks.length === 0) return;
    const newPortfolioValue = stocks.reduce(
        (total, stock) => total + (holdings[stock.name] || 0) * stock.price,
        0
    );
    setPortfolioValue(newPortfolioValue);
    setNetWorth(money + newPortfolioValue);
  }, [stocks, holdings, money]);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      setCurrentUserId(user.user_id);
    }
  }, []);

  const submitFinalScore = async () => {
    if (!currentUserId || !gameId) return;
    
    // Submit score for the final round before showing final leaderboard
    await submitScore(parseInt(roomSettings.numRounds, 10));

    setIsSubmittingScore(true);
    try {
      await fetch(`http://localhost:3000/api/game/${gameId}/final-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          finalNetWorth: netWorthRef.current
        }),
      });
      setIsFinalLeaderboardOpen(true);
    } catch (error) {
      console.error('Error submitting final score:', error);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const handleQuantityChange = (stock, val) => {
    if (/^\d*$/.test(val)) setQuantity({ ...quantity, [stock]: val });
  };

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  };

  const executeTrade = useCallback(
    (stockName, quantity, sign) => {
      const numQuantity = parseInt(quantity, 10);
      if (isNaN(numQuantity) || numQuantity <= 0)
        return { success: false, message: "Invalid quantity." };

      let stockToTrade = stocks.find((s) => s.name === stockName);
      if (!stockToTrade) return { success: false, message: "Stock not found."};

      const cost = stockToTrade.price * numQuantity;

      if (sign === 1 && money < cost) return { success: false, message: "Not enough money!" };
      if (sign === -1 && (holdings[stockName] || 0) < numQuantity)
        return { success: false, message: "Not enough shares." };

      setMoney((m) => m - cost * sign);
      setHoldings((h) => ({
        ...h,
        [stockName]: (h[stockName] || 0) + numQuantity * sign,
      }));

      const action = sign === 1 ? "Bought" : "Sold";
      return { success: true, message: `${action} ${numQuantity} of ${stockName}.` };
    },
    [money, stocks, holdings]
  );

  const buyStock = (stockName, quantity) => executeTrade(stockName, quantity, 1);
  const sellStock = (stockName, quantity) => executeTrade(stockName, quantity, -1);

  const handleAction = (actionFn, stockName) => {
    const result = actionFn(stockName, quantity[stockName] || 0);
    showFeedback(result.message, result.success ? "success" : "error");
  };

  const holdingsList = Object.entries(holdings)
    .filter(([_, qty]) => qty > 0)
    .map(([name, qty]) => ({
      name, qty, value: (stocks.find((s) => s.name === name)?.price || 0) * qty,
    }));

  if (!initialStocks) {
    return <div className="flex items-center justify-center h-screen">Loading game data...</div>
  }
  
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-full md:w-1/3 lg:w-1/4 p-4 bg-white border-r border-gray-200 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-indigo-700">Dalal Street Simulator</h2>
        <div className="text-base p-3 bg-gray-100 rounded-lg shadow-inner">
          <p>Round: <span className="font-semibold">{round}</span> of <span className="font-semibold">{roomSettings.numRounds}</span></p>
          <p>Cash: <span className="font-semibold text-green-600">₹{money.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></p>
          <p>Holdings: <span className="font-semibold">₹{portfolioValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></p>
          <p className="text-lg font-bold">Net Worth: <span className="text-indigo-800">₹{netWorth.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></p>
        </div>
        <ScrollArea className="flex-1 -mx-4 px-4">
          {stocks.map((stock) => (
            <Card key={stock.name} className="mb-3">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{stock.name}</CardTitle>
                  <span className="text-lg font-bold text-gray-800">₹{stock.price.toFixed(2)}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>PE: {stock.pe}</span>
                  <span className="font-semibold">Owned: {holdings[stock.name] || 0}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Input type="text" placeholder="Qty" className="w-20 text-center" value={quantity[stock.name] || ""} onChange={(e) => handleQuantityChange(stock.name, e.target.value)} />
                  <Button onClick={() => handleAction(buyStock, stock.name)}>Buy</Button>
                  <Button variant="destructive" onClick={() => handleAction(sellStock, stock.name)}>Sell</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-end gap-4">
            <Button 
              variant="secondary" 
              onClick={() => setIsRoundLeaderboardOpen(true)}
              disabled={isSubmittingScore || round < 1}
            >
              🏆 Round Leaderboard
            </Button>
           <Button variant="secondary" onClick={() => setIsChatOpen(true)}>💬 Chat</Button>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2">Market News Feed</h2>
          <ScrollArea className="h-80 border rounded-lg p-3 bg-white shadow-inner">
            {notices.map((notice, index) => {
              const isGood = notice.includes("📈");
              const isBad = notice.includes("📉");
              const colorClass = isGood ? "bg-green-50 text-green-800" : isBad ? "bg-red-50 text-red-800" : "bg-gray-50 text-gray-700";
              return (<p key={index} className={`mb-2 p-2 text-sm rounded-md ${colorClass}`}>{notice}</p>);
            })}
          </ScrollArea>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">My Portfolio</h2>
          <Card className="p-3 h-full">
            <ScrollArea className="h-full">
              {holdingsList.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {holdingsList.map((item) => (
                    <li key={item.name} className="flex justify-between items-center py-2">
                      <span className="font-bold text-base">{item.name}</span>
                      <span>{item.qty} shares</span>
                      <span className="text-gray-800 font-semibold">₹{item.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 pt-10">You do not own any stocks. Start buying!</p>
              )}
            </ScrollArea>
          </Card>
        </div>
      </main>

      {feedback.message && (
        <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-2xl text-white font-bold transition-opacity duration-300 ${feedback.message ? "opacity-100" : "opacity-0"} ${feedback.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {feedback.message}
        </div>
      )}
      
      {showRoundEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-10 rounded-xl shadow-2xl text-center transform animate-scale-in">
                <h2 className="text-4xl font-bold text-indigo-700">Round {round} Completed!</h2>
                <p className="mt-2 text-gray-600">Updating prices and preparing next round...</p>
            </div>
        </div>
      )}

      {/* Round Leaderboard */}
      <RoundLeaderboard
        gameId={gameId}
        roundNumber={round > 1 ? round - 1 : 1}
        isOpen={isRoundLeaderboardOpen}
        onClose={() => setIsRoundLeaderboardOpen(false)}
        userId={currentUserId}
      />

      {/* Final Leaderboard */}
      <FinalLeaderboard
        gameId={gameId}
        isOpen={isFinalLeaderboardOpen}
        userId={currentUserId}
      />

      <ChatPage
        gameId={gameId}
        chatOpen={isChatOpen}
        setChatOpen={setIsChatOpen}
      />
    </div>
  );
}