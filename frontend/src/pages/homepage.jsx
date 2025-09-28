import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-200 p-6">
      <Card className="w-[500px] shadow-xl rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-indigo-700">
            🎯 Welcome to Market-Mania
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <p className="text-gray-700 text-lg text-center">
            A financial trading game where you learn, trade, and compete with
            friends in a fun virtual market!
          </p>

          <div className="flex gap-4">
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/register">Register</a>
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-500 text-center">
            Practice trading, test strategies, and become the top investor 🚀
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
