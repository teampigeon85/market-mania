import React, { useState, useEffect, useCallback } from "react";

// --- Comprehensive Game Data (Based on your JSON files) ---

const ALL_COMPANIES = [
    { name: "Reliance Industries (RIL)", price: 2950.75, pe: 29, sectors: ["Oil & Gas", "Retail", "Digital Payments", "E-commerce"], totalVolume: 500000, volatility: 0.02 },
    { name: "HDFC Bank", price: 1650.20, pe: 21, sectors: ["Banks", "Digital Payments"], totalVolume: 750000, volatility: 0.018 },
    { name: "ICICI Bank", price: 1105.40, pe: 19, sectors: ["Banks", "Insurance", "Digital Payments"], totalVolume: 800000, volatility: 0.021 },
    { name: "Infosys", price: 1650.80, pe: 27, sectors: ["IT"], totalVolume: 600000, volatility: 0.025 },
    { name: "Bharti Airtel", price: 1215.60, pe: 35, sectors: ["IT", "E-commerce", "Digital Payments"], totalVolume: 700000, volatility: 0.028 },
    { name: "Larsen & Toubro", price: 3600.00, pe: 32, sectors: ["Infrastructure", "Defense"], totalVolume: 400000, volatility: 0.022 },
    { name: "ITC", price: 430.50, pe: 25, sectors: ["FMCG", "Hotels", "Retail"], totalVolume: 900000, volatility: 0.015 },
    { name: "Tata Consultancy Services", price: 3900.25, pe: 31, sectors: ["IT"], totalVolume: 550000, volatility: 0.024 },
    { name: "State Bank of India (SBI)", price: 830.10, pe: 11, sectors: ["PSU Banks", "Banks", "Insurance", "Digital Payments"], totalVolume: 1200000, volatility: 0.026 },
    { name: "Axis Bank", price: 1150.70, pe: 15, sectors: ["Banks", "Digital Payments"], totalVolume: 850000, volatility: 0.023 },
    { name: "Bajaj Finance", price: 7200.40, pe: 36, sectors: ["Banks", "Digital Payments"], totalVolume: 300000, volatility: 0.03 },
    { name: "Hindustan Unilever", price: 2550.00, pe: 58, sectors: ["FMCG", "Retail"], totalVolume: 450000, volatility: 0.014 },
    { name: "Maruti Suzuki", price: 12500.80, pe: 30, sectors: ["Automobiles"], totalVolume: 200000, volatility: 0.027 },
    { name: "Mahindra & Mahindra", price: 2300.50, pe: 22, sectors: ["Automobiles", "Defense"], totalVolume: 350000, volatility: 0.026 },
    { name: "Kotak Bank", price: 1750.90, pe: 24, sectors: ["Banks", "Digital Payments"], totalVolume: 650000, volatility: 0.022 },
    { name: "Sun Pharmaceutical", price: 1500.20, pe: 38, sectors: ["Pharma", "Healthcare"], totalVolume: 500000, volatility: 0.029 },
    { name: "HCL Technologies", price: 1450.00, pe: 23, sectors: ["IT"], totalVolume: 580000, volatility: 0.026 },
    { name: "UltraTech Cement", price: 10500.00, pe: 42, sectors: ["Cement", "Infrastructure"], totalVolume: 150000, volatility: 0.024 },
    { name: "Adani Ports", price: 1350.70, pe: 39, sectors: ["Logistics", "Infrastructure"], totalVolume: 450000, volatility: 0.035 },
    { name: "Apollo Hospitals", price: 6200.40, pe: 80, sectors: ["Healthcare", "Pharma"], totalVolume: 250000, volatility: 0.031 },
    { name: "Asian Paints", price: 2900.80, pe: 55, sectors: ["FMCG", "Real Estate", "Retail"], totalVolume: 300000, volatility: 0.019 },
    { name: "Bajaj Auto", price: 9100.30, pe: 34, sectors: ["Automobiles"], totalVolume: 220000, volatility: 0.028 },
    { name: "Bajaj Finserv", price: 1600.50, pe: 37, sectors: ["Banks", "Insurance", "Digital Payments"], totalVolume: 400000, volatility: 0.032 },
    { name: "Bharat Electronics (BEL)", price: 280.00, pe: 50, sectors: ["Defense", "Aerospace"], totalVolume: 1500000, volatility: 0.038 },
    { name: "Cipla", price: 1400.10, pe: 33, sectors: ["Pharma", "Healthcare"], totalVolume: 520000, volatility: 0.027 },
    { name: "Coal India", price: 450.60, pe: 9, sectors: ["Oil & Gas", "Infrastructure"], totalVolume: 1800000, volatility: 0.033 },
    { name: "Dr. Reddy's Laboratories", price: 6250.90, pe: 25, sectors: ["Pharma", "Healthcare"], totalVolume: 280000, volatility: 0.026 },
    { name: "Eicher Motors", price: 4700.70, pe: 31, sectors: ["Automobiles"], totalVolume: 260000, volatility: 0.034 },
    { name: "Grasim Industries", price: 2400.40, pe: 20, sectors: ["Cement", "Infrastructure", "FMCG"], totalVolume: 320000, volatility: 0.029 },
    { name: "HDFC Life Insurance", price: 580.80, pe: 85, sectors: ["Insurance"], totalVolume: 950000, volatility: 0.03 },
    { name: "Hero MotoCorp", price: 5400.20, pe: 28, sectors: ["Automobiles"], totalVolume: 240000, volatility: 0.029 },
    { name: "Hindalco Industries", price: 670.50, pe: 14, sectors: ["Infrastructure", "Real Estate"], totalVolume: 1000000, volatility: 0.036 },
    { name: "IndusInd Bank", price: 1550.00, pe: 13, sectors: ["Banks", "Digital Payments"], totalVolume: 780000, volatility: 0.028 },
    { name: "Jio Financial Services", price: 350.30, pe: 150, sectors: ["Digital Payments", "E-commerce"], totalVolume: 2000000, volatility: 0.045 },
    { name: "JSW Steel", price: 900.90, pe: 18, sectors: ["Infrastructure", "Real Estate"], totalVolume: 950000, volatility: 0.037 },
    { name: "Nestle India", price: 2500.00, pe: 75, sectors: ["FMCG", "Retail"], totalVolume: 150000, volatility: 0.016 },
    { name: "NTPC", price: 360.60, pe: 11, sectors: ["Oil & Gas", "Infrastructure"], totalVolume: 1600000, volatility: 0.025 },
    { name: "ONGC", price: 270.80, pe: 7, sectors: ["Oil & Gas", "Infrastructure"], totalVolume: 1700000, volatility: 0.031 },
    { name: "Power Grid Corporation of India", price: 300.20, pe: 10, sectors: ["Infrastructure"], totalVolume: 1400000, volatility: 0.023 },
    { name: "SBI Life Insurance", price: 1450.50, pe: 70, sectors: ["Insurance"], totalVolume: 600000, volatility: 0.029 },
    { name: "Shriram Finance", price: 2500.00, pe: 15, sectors: ["Banks", "Digital Payments"], totalVolume: 350000, volatility: 0.033 },
    { name: "Tata Consumer Products", price: 1150.80, pe: 90, sectors: ["FMCG", "Retail", "E-commerce"], totalVolume: 650000, volatility: 0.021 },
    { name: "Tata Motors", price: 980.40, pe: 16, sectors: ["Automobiles", "Defense"], totalVolume: 1100000, volatility: 0.039 },
    { name: "Tata Steel", price: 165.70, pe: -50, sectors: ["Infrastructure", "Real Estate"], totalVolume: 2500000, volatility: 0.04 },
    { name: "Tech Mahindra", price: 1300.90, pe: 22, sectors: ["IT"], totalVolume: 620000, volatility: 0.028 },
    { name: "Titan Company", price: 3550.00, pe: 88, sectors: ["Retail", "E-commerce"], totalVolume: 300000, volatility: 0.025 },
    { name: "Trent", price: 4500.60, pe: 120, sectors: ["Retail", "E-commerce"], totalVolume: 200000, volatility: 0.035 },
    { name: "Wipro", price: 480.20, pe: 21, sectors: ["IT"], totalVolume: 1300000, volatility: 0.027 },
    { name: "Zomato", price: 180.50, pe: 110, sectors: ["E-commerce", "Retail", "Digital Payments"], totalVolume: 3000000, volatility: 0.05 },
    { name: "Adani Enterprises", price: 3200.80, pe: 95, sectors: ["Infrastructure", "Logistics", "Cement", "E-commerce"], totalVolume: 400000, volatility: 0.048 }
];

const COMPANY_EVENTS = [
  { company: "Reliance Industries (RIL)", event: "partners with foreign companies", impact: { priceChange: -1 } },
  { company: "Reliance Industries (RIL)", event: "announces strong quarterly results", impact: { priceChange: 11 } },
  { company: "HDFC Bank", event: "launches a new digital banking platform, receives positive reviews", impact: { priceChange: 8 } },
  { company: "ICICI Bank", event: "benefits from government policy support", impact: { priceChange: 12 } },
  { company: "Infosys", event: "announces major acquisition or merger", impact: { priceChange: 11 } },
  { company: "Bharti Airtel", event: "faces regulatory scrutiny from SEBI", impact: { priceChange: -12 } },
  { company: "Larsen & Toubro", event: "wins a massive government infrastructure contract", impact: { priceChange: 15 } },
  { company: "ITC", event: "reports record profits in FMCG division", impact: { priceChange: 9 } },
  { company: "Tata Consultancy Services", event: "secures a major multi-year deal with a European client", impact: { priceChange: 10 } },
  { company: "State Bank of India (SBI)", event: "announces major acquisition or merger", impact: { priceChange: 12 } },
]; // A smaller, representative sample

const GENERAL_EVENTS = [
  { event: "Union Budget announced with a focus on Infrastructure", sectorImpact: { "Infrastructure": 7, "PSU Banks": 6, "Healthcare": 3 } },
  { event: "Crude oil prices surge globally", sectorImpact: { "Oil & Gas": 10, "Airlines": -12, "Logistics": -8, "Automobiles": -5 } },
  { event: "Festive season sales boom", sectorImpact: { "FMCG": 8, "Retail": 10, "E-commerce": 12, "Banks": 5 } },
  { event: "RBI cuts interest rates to boost economy", sectorImpact: { "Banks": 5, "Real Estate": 7, "Automobiles": 4 } },
  { event: "Technology adoption wave sweeps the nation", sectorImpact: { "IT": 9, "Digital Payments": 8, "E-commerce": 6 } },
];

const HISTORICAL_EVENTS = [
  { event: "Global Financial Crisis (Lehman Brothers collapse)", movePercent: -18.0, sectorImpact: { "Banks": -30, "Financials": -28, "Real Estate": -20, "IT": -15 } },
  { event: "COVID-19 Global Pandemic Market Crash", movePercent: -13.2, sectorImpact: { "Airlines": -25, "Hotels": -20, "Banks": -15, "Pharma": 10, "IT": 5 } },
  { event: "Corporate tax rate cut announced", movePercent: 5.0, sectorImpact: { "Banks": 6, "Automobiles": 8, "FMCG": 7, "Infrastructure": 6 } },
  { event: "India Demonetisation Announcement", movePercent: -6.0, sectorImpact: { "Real Estate": -15, "Banks": -10, "FMCG": -8, "Digital Payments": 12 } },
];

// --- Game Logic Hook (Integrated) ---

const INITIAL_MONEY = 500000;
const ROUND_DURATION_MS = 7000; // 7 seconds per round

function useGameLogic() {
  const [round, setRound] = useState(1);
  const [money, setMoney] = useState(INITIAL_MONEY);
  const [stocks, setStocks] = useState(ALL_COMPANIES);
  const [notices, setNotices] = useState(["Welcome to the Dalal Street Simulator! The market is now open."]);
  const [holdings, setHoldings] = useState(() => {
    const initialHoldings = {};
    ALL_COMPANIES.forEach(stock => { initialHoldings[stock.name] = 0; });
    return initialHoldings;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      let eventNotice = '';
      
      // Decide which type of event to trigger
      const eventType = Math.random();
      
      setStocks(prevStocks => {
        let updatedStocks = [...prevStocks];

        if (eventType < 0.6) { // 60% chance for a company-specific event
            const event = COMPANY_EVENTS[Math.floor(Math.random() * COMPANY_EVENTS.length)];
            eventNotice = `[${event.company}] ${event.event}`;
            updatedStocks = updatedStocks.map(stock => {
                if (stock.name === event.company) {
                    const priceChangePercentage = event.impact.priceChange / 100;
                    return { ...stock, price: stock.price * (1 + priceChangePercentage) };
                }
                return stock;
            });
        } else if (eventType < 0.95) { // 35% chance for a general/sector event
            const event = GENERAL_EVENTS[Math.floor(Math.random() * GENERAL_EVENTS.length)];
            eventNotice = `[SECTOR NEWS] ${event.event}`;
            updatedStocks = updatedStocks.map(stock => {
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
        } else { // 5% chance for a major historical event
            const event = HISTORICAL_EVENTS[Math.floor(Math.random() * HISTORICAL_EVENTS.length)];
            eventNotice = `[MARKET SHOCK] ${event.event}`;
            updatedStocks = updatedStocks.map(stock => {
                let priceChangePercentage = event.movePercent; // Start with the general market move
                for (const sector of stock.sectors) {
                    if (event.sectorImpact[sector]) {
                        priceChangePercentage = event.sectorImpact[sector]; // Sector impact overrides general move
                        break;
                    }
                }
                return { ...stock, price: stock.price * (1 + priceChangePercentage / 100) };
            });
        }

        // Apply small random volatility to all stocks and ensure price doesn't go below zero
        return updatedStocks.map(stock => {
            const randomFluctuation = (Math.random() - 0.5) * stock.volatility;
            const newPrice = stock.price * (1 + randomFluctuation);
            return { ...stock, price: Math.max(0.01, newPrice) }; // Price floor of 0.01
        });
      });

      const isGood = eventNotice.toLowerCase().includes('strong') || eventNotice.toLowerCase().includes('boom') || eventNotice.toLowerCase().includes('wins');
      const isBad = eventNotice.toLowerCase().includes('crash') || eventNotice.toLowerCase().includes('scrutiny') || eventNotice.toLowerCase().includes('shock');
      const noticePrefix = isGood ? '📈' : isBad ? '📉' : '📰';
      setNotices(prev => [`${noticePrefix} ${eventNotice}`, ...prev.slice(0, 50)]);
      setRound(prev => prev + 1);

    }, ROUND_DURATION_MS);

    return () => clearInterval(timer);
  }, []); // Empty dependency array to run only once

  const executeTrade = useCallback((stockName, quantity, sign) => {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) return { success: false, message: "Invalid quantity." };

    let stockToTrade = stocks.find(s => s.name === stockName);
    const cost = stockToTrade.price * numQuantity;

    if (sign === 1 && money < cost) return { success: false, message: "Not enough money!" };
    if (sign === -1 && (holdings[stockName] || 0) < numQuantity) return { success: false, message: "Not enough shares." };
    
    // Update money and holdings
    setMoney(m => m - (cost * sign));
    setHoldings(h => ({ ...h, [stockName]: (h[stockName] || 0) + (numQuantity * sign) }));

    // Price Impact Formula: P_new = P_old * [1 + d * sign * k * (V/Q)^0.5]
    const d = 1; // Direction coefficient
    const k = 0.05; // Sensitivity coefficient
    const V = numQuantity; // Trade Volume
    const Q = stockToTrade.totalVolume; // Total Market Volume
    const priceImpactFactor = d * sign * k * Math.pow(V / Q, 0.5);
    const newPrice = stockToTrade.price * (1 + priceImpactFactor);

    setStocks(currentStocks => currentStocks.map(s => {
        if (s.name === stockName) {
            return { ...s, price: newPrice, totalVolume: s.totalVolume + V };
        }
        return s;
    }));

    const action = sign === 1 ? "Bought" : "Sold";
    return { success: true, message: `${action} ${numQuantity} of ${stockName}.` };
  }, [money, stocks, holdings]);
  
  const buyStock = (stockName, quantity) => executeTrade(stockName, quantity, 1);
  const sellStock = (stockName, quantity) => executeTrade(stockName, quantity, -1);

  const portfolioValue = stocks.reduce((total, stock) => total + ((holdings[stock.name] || 0) * stock.price), 0);
  const netWorth = money + portfolioValue;

  return { round, money, stocks, holdings, notices, portfolioValue, netWorth, buyStock, sellStock };
}

// --- UI Components ---
const Button = ({ children, onClick, variant, className = '' }) => {
  const base = "px-3 py-2 text-sm rounded-md font-semibold text-white shadow-sm transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles = variant === 'destructive' ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
  return <button onClick={onClick} className={`${base} ${styles} ${className}`}>{children}</button>;
};
const Input = (props) => <input {...props} className={`p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className}`} />;
const Card = ({ children, className = '' }) => <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="p-3 border-b border-gray-200">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-base font-bold text-gray-900">{children}</h3>;
const CardContent = ({ children }) => <div className="p-3">{children}</div>;
const ScrollArea = ({ children, className = '' }) => <div className={`overflow-y-auto ${className}`}>{children}</div>;

// --- Main Game Component ---
export default function GameArena() {
  const { round, money, stocks, holdings, notices, netWorth, portfolioValue, buyStock, sellStock } = useGameLogic();
  const [quantity, setQuantity] = useState({});
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const handleQuantityChange = (stock, val) => { if (/^\d*$/.test(val)) setQuantity({ ...quantity, [stock]: val }); };
  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };
  const handleAction = (actionFn, stockName) => {
    const result = actionFn(stockName, quantity[stockName] || 0);
    showFeedback(result.message, result.success ? 'success' : 'error');
  };
  
  const holdingsList = Object.entries(holdings).filter(([_, qty]) => qty > 0).map(([name, qty]) => ({ name, qty, value: ((stocks.find(s => s.name === name)?.price || 0) * qty) }));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans text-gray-800">
      <aside className="w-full md:w-1/3 lg:w-1/4 p-4 bg-white border-r border-gray-200 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-indigo-700">Dalal Street Simulator</h2>
        <div className="text-base p-3 bg-gray-100 rounded-lg shadow-inner">
          <p>Round: <span className="font-semibold">{round}</span></p>
          <p>Cash: <span className="font-semibold text-green-600">₹{money.toLocaleString('en-IN', {maximumFractionDigits:0})}</span></p>
          <p>Holdings: <span className="font-semibold">₹{portfolioValue.toLocaleString('en-IN', {maximumFractionDigits:0})}</span></p>
          <p className="text-lg font-bold">Net Worth: <span className="text-indigo-800">₹{netWorth.toLocaleString('en-IN', {maximumFractionDigits:0})}</span></p>
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

      <main className="flex-1 p-6 flex flex-col gap-6">
        <div>
            <h2 className="text-2xl font-bold mb-2">Market News Feed</h2>
            <ScrollArea className="h-1/2 border rounded-lg p-3 bg-white shadow-inner">
              {notices.map((notice, index) => {
                const isGood = notice.includes('📈'); const isBad = notice.includes('📉');
                const colorClass = isGood ? 'bg-green-50 text-green-800' : isBad ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-700';
                return <p key={index} className={`mb-2 p-2 text-sm rounded-md ${colorClass}`}>{notice}</p>;
              })}
            </ScrollArea>
        </div>
        <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">My Portfolio</h2>
            <Card className="p-3 h-full">
                <ScrollArea className="h-full">
                    {holdingsList.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {holdingsList.map(item => (
                                <li key={item.name} className="flex justify-between items-center py-2">
                                    <span className="font-bold text-base">{item.name}</span>
                                    <span>{item.qty} shares</span>
                                    <span className="text-gray-800 font-semibold">₹{item.value.toLocaleString('en-IN', {maximumFractionDigits:0})}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-center text-gray-500 pt-10">You do not own any stocks. Start buying!</p>}
                </ScrollArea>
            </Card>
        </div>
      </main>
      
      {feedback.message && (
        <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-2xl text-white font-bold transition-opacity duration-300 ${feedback.message ? 'opacity-100' : 'opacity-0'} ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {feedback.message}
        </div>
      )}
    </div>
  );
}

