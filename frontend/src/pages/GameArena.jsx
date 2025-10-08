import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";

export default function GameArena() {
  const [round, setRound] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [quantity, setQuantity] = useState({});
  const stocks = [
    { name: "Apple", pe: 28, liabilities: "High" },
    { name: "Tesla", pe: 35, liabilities: "Medium" },
    { name: "Microsoft", pe: 30, liabilities: "Low" },
  ];

  const handleQuantityChange = (stock, val) => {
    setQuantity({ ...quantity, [stock]: val });
  };

  const handleBuy = (stock) => {
    alert(`Buying ${quantity[stock] || 0} of ${stock}`);
  };

  const handleSell = (stock) => {
    alert(`Selling ${quantity[stock] || 0} of ${stock}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left side: Stock list */}
      <aside className="w-64 p-4 bg-white border-r border-gray-200 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-4">MarketMania</h2>
        <p className="text-gray-600 mb-4">Round: {round}</p>

        {stocks.map((stock) => (
          <Card key={stock.name} className="mb-2">
            <CardHeader>
              <CardTitle>{stock.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p>PE: {stock.pe}</p>
              <p>Liabilities: {stock.liabilities}</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Quantity"
                  className="w-20"
                  value={quantity[stock.name] || ""}
                  onChange={(e) => handleQuantityChange(stock.name, e.target.value)}
                />
                <Button onClick={() => handleBuy(stock.name)}>Buy</Button>
                <Button variant="destructive" onClick={() => handleSell(stock.name)}>Sell</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button className="mt-auto">My Holdings</Button>
        <p className="mt-2 text-gray-700 font-semibold">Current Money: $10000</p>
      </aside>

      {/* Middle: Notices */}
      <main className="flex-1 p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Notices</h2>
        <ScrollArea className="h-96 border rounded p-2 bg-white">
          <p>- Market opens at 9 AM</p>
          <p>- Tesla stock rising fast</p>
          <p>- Apple issued dividends</p>
          <p>- Microsoft acquired small startup</p>
          <p>- Round ends in 30 seconds</p>
        </ScrollArea>
      </main>

      {/* Right side: Chat sidebar */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogTrigger asChild>
          <Button className="fixed right-4 top-20 z-50">Chat</Button>
        </DialogTrigger>
        <DialogContent className="w-80 h-screen fixed right-0 top-0 bg-white p-4 border-l border-gray-200 flex flex-col">
          <DialogHeader>
            <DialogTitle>Group Chat</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 border rounded p-2 mb-2 overflow-y-auto">
            <p><strong>Alice:</strong> Hello!</p>
            <p><strong>Bob:</strong> Ready to trade?</p>
            <p><strong>Charlie:</strong> Let's start!</p>
          </ScrollArea>
          <div className="flex gap-2 mt-auto">
            <Input placeholder="Type a message..." />
            <Button>Send</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
