import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthApi, Configuration } from '../api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const authApi = new AuthApi(new Configuration({ basePath: API_BASE_URL }));

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.error) {
      setError(location.state.error);
      // Clear the error from navigation state so it doesn't persist on next visit
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('loginTime', Date.now().toString());
      navigate('/profile');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
        <a href="/register" className="auth-link">
          Don't have an account? Register
        </a>
      </div>
    </div>
  );
} 