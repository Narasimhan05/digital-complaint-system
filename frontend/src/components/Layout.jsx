import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Digital Complaint Management" />
        <Outlet />
      </div>
    </div>
  );
}
