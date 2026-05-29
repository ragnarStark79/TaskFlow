import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', transition: 'background-color 0.3s ease' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: 76 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;