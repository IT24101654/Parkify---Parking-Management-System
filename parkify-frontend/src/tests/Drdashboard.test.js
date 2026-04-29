import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Drdashboard from '../Pages/Driver/Drdashboard';

// Mocking dependencies to ensure tests pass without complex setup
import axios from 'axios';
jest.mock('axios');

jest.mock('../Pages/Driver/VehicleManagement', () => () => <div data-testid="vehicle-management">Vehicle Management</div>);
jest.mock('../Pages/Driver/DrProfile', () => () => <div data-testid="dr-profile">Dr Profile</div>);
jest.mock('../Pages/Driver/VoiceWave', () => () => <div data-testid="voice-wave">Voice Wave</div>);
jest.mock('../Pages/Driver/DriverMap', () => () => <div data-testid="driver-map">Driver Map</div>);
jest.mock('../Components/Inventory/InventoryDashboard', () => () => <div data-testid="inventory">Inventory</div>);
jest.mock('../Pages/Driver/ServiceAppointmentDashboard', () => () => <div data-testid="service-dashboard">Service Dashboard</div>);
jest.mock('../Components/Driver/ReservationManagement', () => () => <div data-testid="reservation-management">Reservation Management</div>);
jest.mock('../Components/Driver/CheckoutPayment', () => () => <div data-testid="checkout-payment">Checkout Payment</div>);
jest.mock('../Components/Driver/TransactionHistory', () => () => <div data-testid="transaction-history">Transaction History</div>);

describe('Driver Dashboard Tests', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: [] });
        axios.post.mockResolvedValue({ data: {} });
        axios.put.mockResolvedValue({ data: {} });
        axios.delete.mockResolvedValue({ data: {} });

        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('userId', '123');
        localStorage.setItem('userName', 'John Doe');
        localStorage.setItem('userRole', 'DRIVER');
    });

    test('renders dashboard successfully without crashing', async () => {
        render(
            <BrowserRouter>
                <Drdashboard />
            </BrowserRouter>
        );
        expect(await screen.findByText(/Overview/i)).toBeInTheDocument();
    });
});
