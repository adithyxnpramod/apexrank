import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ActiveTripScreen } from './screens/ActiveTripScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { DriverCompareScreen } from './screens/DriverCompareScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PublicShareScreen } from './screens/PublicShareScreen';
import { TripDetailsScreen } from './screens/TripDetailsScreen';
import { TripHistoryScreen } from './screens/TripHistoryScreen';

export const App: React.FC = () => {
  const location = useLocation();
  const isPublicShare = location.pathname.startsWith('/t/');

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col selection:bg-apex-cyan selection:text-dark-950">
      {/* Hide primary navbar on public share screen */}
      {!isPublicShare && <Navbar />}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/drive" element={<ActiveTripScreen />} />
          <Route path="/compare" element={<DriverCompareScreen />} />
          <Route path="/trips/:id" element={<TripDetailsScreen />} />
          <Route path="/history" element={<TripHistoryScreen />} />
          <Route path="/leaderboard" element={<LeaderboardScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/t/:shareCode" element={<PublicShareScreen />} />
        </Routes>
      </main>
    </div>
  );
};
export default App;
