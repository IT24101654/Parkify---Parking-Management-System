import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Pages/Register';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Navbar to simplify
jest.mock('../Components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('axios');

describe('Registration Page Tests', () => {
    test('renders role selection on initial load', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
        expect(screen.getByText(/Join Parkify as a.../i)).toBeInTheDocument();
        expect(screen.getByText(/Driver/i)).toBeInTheDocument();
        expect(screen.getByText(/Parking Owner/i)).toBeInTheDocument();
    });

    test('navigates to step 2 when Driver is selected', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
        const driverBox = screen.getAllByText(/Driver/i)[0].closest('.role-box');
        fireEvent.click(driverBox);
        expect(screen.getAllByText(/Create Account/i)[0]).toBeInTheDocument();
    });

    test('shows validation error for short password', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
        // Go to step 2
        fireEvent.click(screen.getByText(/Driver/i).closest('.role-box'));
        
        const passwordInput = screen.getByPlaceholderText(/Create Password/i);
        fireEvent.change(passwordInput, { target: { value: '123' } });
        
        expect(screen.getByText(/Minimum 8 characters required/i)).toBeInTheDocument();
    });
});
