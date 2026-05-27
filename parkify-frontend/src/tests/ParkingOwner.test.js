import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import PODashboard from '../Pages/Parking-Owner/PODashboard';

jest.mock('axios');
jest.mock('../Pages/Parking-Owner/ParkingManagement', () => () => <div data-testid="parking-management">My Slots</div>);
jest.mock('../Pages/Parking-Owner/POProfile', () => () => <div>My Profile</div>);
jest.mock('../Components/Inventory/InventoryDashboard', () => () => <div>Inventory</div>);
jest.mock('../Components/Parking-Owner/POReservationOverview', () => () => <div>Reservations</div>);
jest.mock('../Components/Parking-Owner/RefundManagement', () => () => <div>Refunds</div>);
jest.mock('../Components/Parking-Owner/POTransactionHistory', () => () => <div>Earnings</div>);

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
    observe() { }
    unobserve() { }
    disconnect() { }
}
window.IntersectionObserver = IntersectionObserver;

describe('Parking Owner Dashboard Tests', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('userId', '2');
        axios.get.mockResolvedValue({
            data: {
                id: 2,
                name: 'Test Owner',
                email: 'owner@parkify.ai',
                hasInventory: true,
                hasServiceCenter: false
            }
        });
    });

    test('renders parking owner dashboard and features', async () => {
        render(
            <BrowserRouter>
                <PODashboard />
            </BrowserRouter>
        );

        expect(await screen.findByText(/Welcome to your Dashboard/i)).toBeInTheDocument();
        const slotSections = await screen.findAllByText(/My Slots/i);
        expect(slotSections.length).toBeGreaterThan(0);
        const invSections = await screen.findAllByText(/Inventory/i);
        expect(invSections.length).toBeGreaterThan(0);
    });
});
