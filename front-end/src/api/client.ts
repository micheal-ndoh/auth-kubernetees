import { Configuration } from './configuration';
import { AuthApi, ProtectedApi } from './api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create API instances
const authApi = new AuthApi(new Configuration({
    basePath: API_BASE_URL,
}));

const protectedApi = new ProtectedApi(new Configuration({
    basePath: API_BASE_URL,
}));

// Example login function
async function login() {
    try {
        const response = await authApi.login({ 
            email: 'admin@example.com', 
            password: 'password' 
        });
        console.log('Token:', response.data.token);
        return response.data.token;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

// Example register function
async function register() {
    try {
        const response = await authApi.register({
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            password: 'password123'
        });
        console.log('User registered:', response.data);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
}

// Example admin route access
async function accessAdminRoute(token: string) {
    try {
        const response = await protectedApi.adminRoute({
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Admin access granted:', response.data);
        return response.data;
    } catch (error) {
        console.error('Admin access failed:', error);
        throw error;
    }
}

// Example usage
async function main() {
    try {
        // First register a user
        await register();
        
        // Then login
        const token = await login();
        
        // Try to access admin route
        await accessAdminRoute(token);
    } catch (error) {
        console.error('Main execution failed:', error);
    }
}

// Run the example
main();
