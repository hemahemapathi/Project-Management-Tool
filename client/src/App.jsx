import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext.jsx';
import LandingPage from './pages/landingpage/LandingPage.jsx';
import Login from './pages/login/Login.jsx';
import Register from './pages/register/Register.jsx';
import Home from './pages/home/Home.jsx';
import ProjectList from './components/projectlist/ProjectList.jsx';
import CreateProject from './pages/createproject/CreateProject.jsx'; 
import TaskList from './components/tasklist/TaskList.jsx';
import TeamList from './components/teamlist/TeamList.jsx';
import ReportList from './components/reportlist/ReportList.jsx';
import Sidebar from './components/sidebar/Sidebar.jsx';
import Navbar from './components/navbar/Navbar.jsx';
import Help from './pages/help/Help.jsx'
import Profile from './pages/profile/Profile.jsx';
import Notifications from './pages/notification/Notification.jsx';
import CreateReport from './pages/createreport/CreateReport.jsx';
import CreateTeam from './pages/createteam/CreateTeam.jsx'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const AppContent = () => {
    const location = useLocation();
    const hideSidebarPaths = ['/', '/register', '/login'];
    const showSidebar = !hideSidebarPaths.includes(location.pathname);
    const showNavbar = !hideSidebarPaths.includes(location.pathname);

    return (
      <NotificationProvider>
      <div className="App">
        {/* Navbar - shown on authenticated pages */}
        {showNavbar && (
          <Navbar 
            toggleSidebar={toggleSidebar} 
            isSidebarOpen={isSidebarOpen} 
          />
        )}
        
        {/* Sidebar - shown on authenticated pages */}
        {showSidebar && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar} 
          />
        )}
        
        {/* Main Content */}
        <main 
          className={`
            ${showNavbar ? 'pt-5 mt-2' : ''} 
            ${isSidebarOpen && showSidebar ? 'content-shift' : ''}
          `}
          style={{
            minHeight: showNavbar ? 'calc(100vh - 70px)' : '100vh',
            marginTop: showNavbar ? '70px' : '0'
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/team" element={<TeamList />} />
            <Route path="/team/create" element={<CreateTeam />} /> 
            <Route path="/team/edit/:id" element={<CreateTeam />} />
            <Route path="/reports" element={<ReportList />} />
             <Route path="/reports/create" element={<CreateReport />} />
            <Route path="/create/report" element={<CreateReport />} />
            <Route path="/help" element={<Help />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
      
           {/* Redirect to home for authenticated users */}
            <Route path="/dashboard" element={<Home />} />
          </Routes>
        </main>
      </div>
      </NotificationProvider>
    );
  };

  return (
    <Router>
     
        <AppContent />
    
    </Router>
  );
}

export default App;
