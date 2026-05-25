import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

export default function Navbar({ title }) {
  const { user } = useAuth();

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-user-avatar">{getInitials(user?.name)}</div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user?.name}</span>
            <span className="navbar-user-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
