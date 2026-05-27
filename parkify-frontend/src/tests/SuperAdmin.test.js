import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Dashboard from '../Pages/Super-Admin/Dashboard';

jest.mock('axios');
jest.mock('../Pages/Super-Admin/ManageUsers', () => () => <div>Manage Users</div>);
jest.mock('../Pages/Super-Admin/AdminProfile', () => () => <div>Admin Profile</div>);

// Necessary mocks for browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserver;

describe('Super Admin Dashboard Tests', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('userId', '1');
        axios.get.mockResolvedValue({
            data: {
                id: 1,
                name: 'Super Admin',
                email: 'admin@parkify.ai',
                profilePicture: null
            }
        });
    });

    test('renders super admin dashboard and manage users section', async () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(await screen.findByText(/Super Admin Dashboard/i)).toBeInTheDocument();
        const userSections = await screen.findAllByText(/Manage Users/i);
        expect(userSections.length).toBeGreaterThan(0);
    });
});
