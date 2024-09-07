import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/login';
import Signup from './components/signup';
import Dashboard from './components/dashboard';
import PrivateRoute from './components/privateroute'; // Import PrivateRoute component

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Protect the dashboard route */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
