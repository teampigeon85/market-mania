import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Sidebar } from '../components/ui/sidebar';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ gamesPlayed: 0, wins: 0, history: [] });
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            fetchProfileData(storedUser.user_id);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchProfileData = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/user/profile/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                console.error("Failed to fetch profile data");
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold text-gray-800">My Profile</h1>
                        <Button variant="destructive" onClick={handleLogout}>Logout</Button>
                    </div>

                    {/* User Info Card */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="text-lg font-semibold">{user.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-lg font-semibold">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Last Login</p>
                                <p className="text-lg font-semibold">{new Date(user.last_login).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Games Played</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold">{stats.gamesPlayed}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Wins</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold">{stats.wins}</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Learning</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <Button>Start Learning</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Game History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Game History (Last 5)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.history.length > 0 ? (
                                <ul className="space-y-4">
                                    {stats.history.map((game, index) => (
                                        <li key={index} className="flex items-center justify-between p-4 bg-gray-100 rounded-md">
                                            <div>
                                                <p className="font-semibold">Game ID: {game.game_id}</p>
                                                <p className="text-sm text-gray-500">Finished on: {new Date(game.game_completed_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className={`text-lg font-bold ${game.final_rank === 1 ? 'text-green-500' : 'text-gray-600'}`}>
                                                Rank: #{game.final_rank}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No recent games to show.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;