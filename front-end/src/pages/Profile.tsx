import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedApi, Configuration, User } from '../api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const protectedApi = new ProtectedApi(new Configuration({
  basePath: API_BASE_URL,
}));

const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutes

function getInitials(name: string | undefined, email: string): string {
  if (!name || name.trim() === '') {
    return email.charAt(0).toUpperCase();
  }
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loginTime = localStorage.getItem('loginTime');
    const now = Date.now();
    if (!token || !loginTime || now - parseInt(loginTime, 10) > SESSION_DURATION_MS) {
      localStorage.removeItem('token');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('refresh_token');
      navigate('/login', { state: { error: 'Session expired. Please log in again.' } });
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await protectedApi.meRoute({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        // Try refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (refreshRes.ok) {
              const data = await refreshRes.json();
              localStorage.setItem('token', data.token);
              localStorage.setItem('loginTime', Date.now().toString());
              // Retry fetching user with new token
              const retryRes = await protectedApi.meRoute({
                headers: {
                  Authorization: `Bearer ${data.token}`,
                },
              });
              setUser(retryRes.data);
              return;
            }
          } catch (refreshErr) {
            // fall through to logout
          }
        }
        localStorage.removeItem('token');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('refresh_token');
        navigate('/login', { state: { error: 'Session expired or unauthorized. Please log in again.' } });
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="profile-card profile-glass">
        <div className="profile-header">
          <div className="profile-avatar profile-avatar-lg">
            {getInitials(user.first_name + ' ' + user.last_name, user.email)}
          </div>
          <button onClick={handleLogout} className="btn btn-danger profile-logout-btn">
            Logout
          </button>
        </div>
        <div className="profile-info">
          <div className="profile-name">{user.first_name} {user.last_name}</div>
          <div className="profile-role">{user.role || 'User'}</div>
          <div className="profile-details">
            <div className="profile-field">
              <div className="profile-label">Email</div>
              <div className="profile-value">{user.email}</div>
            </div>
            <div className="profile-field">
              <div className="profile-label">User ID</div>
              <div className="profile-value">{user.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 