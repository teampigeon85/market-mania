import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams, Navigate } from 'react-router-dom';
import ALL_COMPANIES from "../Companysectors.json";
import COMPANY_EVENTS from "../companyEvents.json";
import GENERAL_EVENTS from "../generalEvents.json";
import HISTORICAL_EVENTS from "../eventsforall.json";
import ChatPage from './ChatPage';
import RoundLeaderboard from '../components/RoundLeaderboard';
import FinalLeaderboard from '../components/FinalLeaderboard';

// --- Helper function to shuffle an array ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


// --- Game Logic Hook ---
function useGameLogic(INITIAL_MONEY, ROUND_DURATION_MS, TOTAL_ROUNDS, numCompanies) {
  const [round, setRound] = useState(1);
  const [money, setMoney] = useState(INITIAL_MONEY);
  
  const [gameData] = useState(() => {
    const selectedCompanies = shuffleArray(ALL_COMPANIES).slice(0, numCompanies);
    const companyNames = new Set(selectedCompanies.map(c => c.name));
    const filteredCompanyEvents = COMPANY_EVENTS.filter(event => companyNames.has(event.company));
    
    return {
      companies: selectedCompanies,
      companyEvents: filteredCompanyEvents,
    };
  });

  const [stocks, setStocks] = useState(gameData.companies);
  const [notices, setNotices] = useState(["Welcome to the Dalal Street Simulator!"]);
  const [holdings, setHoldings] = useState(() => {
    const h = {};
    gameData.companies.forEach((s) => (h[s.name] = 0));
    return h;
  });
  const [showRoundEndModal, setShowRoundEndModal] = useState(false);
  const gameLoopTimer = useRef(null);

  const runMarketEvents = useCallback(() => {
    let eventNotice = "";
    const eventType = Math.random();

    setStocks((prevStocks) => {
      let updatedStocks = [...prevStocks];

      if (eventType < 0.6 && gameData.companyEvents.length > 0) {
        const event = gameData.companyEvents[Math.floor(Math.random() * gameData.companyEvents.length)];
        eventNotice = `[${event.company}] ${event.event}`;
        updatedStocks = updatedStocks.map((stock) => {
          if (stock.name === event.company) {
            const priceChangePercentage = event.impact.priceChange / 100;
            return { ...stock, price: stock.price * (1 + priceChangePercentage) };
          }
          return stock;
        });
      } else if (eventType < 0.95) {
        const event = GENERAL_EVENTS[Math.floor(Math.random() * GENERAL_EVENTS.length)];
        eventNotice = `[SECTOR NEWS] ${event.event}`;
        updatedStocks = updatedStocks.map((stock) => {
          let priceChangePercentage = 0;
          for (const sector of stock.sectors) {
            if (event.sectorImpact[sector]) {
              priceChangePercentage += event.sectorImpact[sector];
            }
          }
          if (priceChangePercentage !== 0) {
            return { ...stock, price: stock.price * (1 + priceChangePercentage / 100) };
          }
          return stock;
        });
      } else {
        const event = HISTORICAL_EVENTS[Math.floor(Math.random() * HISTORICAL_EVENTS.length)];
        eventNotice = `[MARKET SHOCK] ${event.event}`;
        updatedStocks = updatedStocks.map((stock) => {
          let priceChangePercentage = event.movePercent;
          for (const sector of stock.sectors) {
            if (event.sectorImpact[sector]) {
              priceChangePercentage = event.sectorImpact[sector];
              break;
            }
          }
          return { ...stock, price: stock.price * (1 + priceChangePercentage / 100) };
        });
      }

      return updatedStocks.map((stock) => {
        const randomFluctuation = (Math.random() - 0.5) * stock.volatility;
        const newPrice = stock.price * (1 + randomFluctuation);
        return { ...stock, price: Math.max(0.01, newPrice) };
      });
    });

    const isGood =
      eventNotice.toLowerCase().includes("strong") ||
      eventNotice.toLowerCase().includes("boom") ||
      eventNotice.toLowerCase().includes("wins");
    const isBad =
      eventNotice.toLowerCase().includes("crash") ||
      eventNotice.toLowerCase().includes("scrutiny") ||
      eventNotice.toLowerCase().includes("shock");
    const noticePrefix = isGood ? "📈" : isBad ? "📉" : "📰";
    setNotices((prev) => [`${noticePrefix} ${eventNotice}`, ...prev.slice(0, 50)]);
  }, [gameData.companyEvents]);

  useEffect(() => {
    if (round > TOTAL_ROUNDS) {
      setNotices((prev) => ["🏁 Game Over! Check your final net worth.", ...prev]);
      return;
    }

    gameLoopTimer.current = setTimeout(() => {
      runMarketEvents();
      setShowRoundEndModal(true);
      gameLoopTimer.current = setTimeout(() => {
        setShowRoundEndModal(false);
        setRound((r) => r + 1);
      }, 3000);
    }, ROUND_DURATION_MS);

    return () => clearTimeout(gameLoopTimer.current);
  }, [round, ROUND_DURATION_MS, TOTAL_ROUNDS, runMarketEvents]);

  const executeTrade = useCallback(
    (stockName, quantity, sign) => {
      const numQuantity = parseInt(quantity, 10);
      if (isNaN(numQuantity) || numQuantity <= 0)
        return { success: false, message: "Invalid quantity." };

      let stockToTrade = stocks.find((s) => s.name === stockName);
      const cost = stockToTrade.price * numQuantity;

      if (sign === 1 && money < cost) return { success: false, message: "Not enough money!" };
      if (sign === -1 && (holdings[stockName] || 0) < numQuantity)
        return { success: false, message: "Not enough shares." };

      setMoney((m) => m - cost * sign);
      setHoldings((h) => ({
        ...h,
        [stockName]: (h[stockName] || 0) + numQuantity * sign,
      }));

      const k = 0.05;
      const V = numQuantity;
      const Q = stockToTrade.totalVolume;
      const priceImpactFactor = sign * k * Math.pow(V / Q, 0.5);
      const newPrice = stockToTrade.price * (1 + priceImpactFactor);

      setStocks((currentStocks) =>
        currentStocks.map((s) =>
          s.name === stockName
            ? { ...s, price: newPrice, totalVolume: s.totalVolume + V }
            : s
        )
      );

      const action = sign === 1 ? "Bought" : "Sold";
      return { success: true, message: `${action} ${numQuantity} of ${stockName}.` };
    },
    [money, stocks, holdings]
  );

  const buyStock = (stockName, quantity) => executeTrade(stockName, quantity, 1);
  const sellStock = (stockName, quantity) => executeTrade(stockName, quantity, -1);

  const portfolioValue = stocks.reduce(
    (total, stock) => total + (holdings[stock.name] || 0) * stock.price,
    0
  );
  const netWorth = money + portfolioValue;

  return { round, money, stocks, holdings, notices, portfolioValue, netWorth, buyStock, sellStock, showRoundEndModal };
}

// --- UI Components (no changes) ---
const Button = ({ children, onClick, variant, className = "" }) => {
  const base = "px-4 py-2 text-sm rounded-md font-semibold text-white shadow-sm transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles = variant === "destructive" ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" : variant === "secondary" ? "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500" : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
  return (<button onClick={onClick} className={`${base} ${styles} ${className}`}>{children}</button>);
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

  // 1. Get the settings from the navigation state
  const roomSettings = location.state?.roomSettings;

  // 2. Add a safeguard: if settings don't exist, redirect to the lobby
  if (!roomSettings) {
    return <Navigate to="/lobby" replace />;
  }
  
  const [quantity, setQuantity] = useState({});
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRoundLeaderboardOpen, setIsRoundLeaderboardOpen] = useState(false);
  const [isFinalLeaderboardOpen, setIsFinalLeaderboardOpen] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 3. Destructure the settings received from the router, NOT the defaults.
  const { numRounds, roundTime, initialMoney, numStocks, name } = roomSettings;
  
  const ROUND_DURATION_MS = parseInt(roundTime, 10) * 1000;
  const TOTAL_ROUNDS = parseInt(numRounds, 10);
  const INITIAL_MONEY = parseInt(initialMoney, 10);
  
  const {
    round, money, stocks, holdings, notices, netWorth, portfolioValue, buyStock, sellStock, showRoundEndModal,
  } = useGameLogic(INITIAL_MONEY, ROUND_DURATION_MS, TOTAL_ROUNDS, parseInt(numStocks, 10));

  // Get current user ID from localStorage
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      setCurrentUserId(user.user_id);
    }
  }, []);

  // Submit score after each round
  const submitScore = async (roundNumber) => {
    if (!currentUserId || !gameId) {
      console.error('Missing userId or gameId:', { currentUserId, gameId });
      return;
    }
    
    setIsSubmittingScore(true);
    const scoreData = {
      userId: currentUserId,
      roundNumber: roundNumber,
      cashAmount: money,
      portfolioValue: portfolioValue,
      netWorth: netWorth
    };
    
    console.log('Submitting score:', scoreData);
    
    try {
      const response = await fetch(`http://localhost:3000/api/game/${gameId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit score: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Score submitted successfully for round', roundNumber, result);
    } catch (error) {
      console.error('Error submitting score:', error);
      showFeedback(`Failed to submit score: ${error.message}`, 'error');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // Submit final score and show final leaderboard
  const submitFinalScore = async () => {
    if (!currentUserId || !gameId) return;
    
    setIsSubmittingScore(true);
    try {
      const response = await fetch(`http://localhost:3000/api/game/${gameId}/final-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          finalNetWorth: netWorth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit final score');
      }

      const data = await response.json();
      console.log('Final score submitted successfully');
      setGameCompleted(true);
      setIsFinalLeaderboardOpen(true);
    } catch (error) {
      console.error('Error submitting final score:', error);
      showFeedback('Failed to submit final score', 'error');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // Handle round completion
  useEffect(() => {
    if (showRoundEndModal && round <= TOTAL_ROUNDS) {
      // Submit score for the completed round and wait for it to complete
      const handleRoundEnd = async () => {
        await submitScore(round);
        
        // Start countdown from 10 seconds
        setCountdown(10);
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setIsRoundLeaderboardOpen(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      };
      
      handleRoundEnd();
    }
  }, [showRoundEndModal, round]);

  // Handle game completion
  useEffect(() => {
    if (round > TOTAL_ROUNDS && !gameCompleted) {
      // Submit final score
      submitFinalScore();
    }
  }, [round, gameCompleted]);

  const handleQuantityChange = (stock, val) => {
    if (/^\d*$/.test(val)) setQuantity({ ...quantity, [stock]: val });
  };

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  };

  const handleAction = (actionFn, stockName) => {
    const result = actionFn(stockName, quantity[stockName] || 0);
    showFeedback(result.message, result.success ? "success" : "error");
  };

  const holdingsList = Object.entries(holdings)
    .filter(([_, qty]) => qty > 0)
    .map(([name, qty]) => ({
      name, qty, value: (stocks.find((s) => s.name === name)?.price || 0) * qty,
    }));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-full md:w-1/3 lg:w-1/4 p-4 bg-white border-r border-gray-200 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-indigo-700">Dalal Street Simulator</h2>
        <div className="text-base p-3 bg-gray-100 rounded-lg shadow-inner">
          <p>Round: <span className="font-semibold">{round}</span> of <span className="font-semibold">{TOTAL_ROUNDS}</span></p>
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
              disabled={isSubmittingScore}
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
            {isSubmittingScore ? (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Submitting score...</p>
              </div>
            ) : countdown > 0 ? (
              <div className="mt-4">
                <div className="text-6xl font-bold text-indigo-600 mb-2">{countdown}</div>
                <p className="text-gray-600">Preparing leaderboard...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait while we process all scores</p>
              </div>
            ) : (
              <p className="mt-2 text-gray-600">Preparing leaderboard...</p>
            )}
          </div>
        </div>
      )}

      {/* Game completion modal */}
      {round > TOTAL_ROUNDS && !gameCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-10 rounded-xl shadow-2xl text-center transform animate-scale-in">
            <h2 className="text-4xl font-bold text-green-700">🎉 Game Complete! 🎉</h2>
            {isSubmittingScore ? (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Calculating final results...</p>
              </div>
            ) : (
              <p className="mt-2 text-gray-600">Preparing final leaderboard...</p>
            )}
          </div>
        </div>
      )}

      {/* Round Leaderboard */}
      <RoundLeaderboard
        gameId={gameId}
        roundNumber={round}
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

