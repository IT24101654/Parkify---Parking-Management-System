import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReservationManagement from '../Components/Driver/ReservationManagement';

// Mock axios
import axios from 'axios';
jest.mock('axios');

describe('Reservation Management Tests', () => {
    const mockUserData = { id: '123', name: 'John Doe' };

    beforeEach(() => {
        axios.get.mockResolvedValue({ data: [] });
        axios.post.mockResolvedValue({ data: {} });
        axios.put.mockResolvedValue({ data: {} });
        axios.delete.mockResolvedValue({ data: {} });

        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('userId', '123');
    });

    test('renders reservation stats strip', async () => {
        render(<ReservationManagement userData={mockUserData} />);
        expect(await screen.findByText(/Total/i)).toBeInTheDocument();
    });

    test('shows empty state when no reservations exist', async () => {
        render(<ReservationManagement userData={mockUserData} />);
        expect(await screen.findByText(/No reservations yet/i)).toBeInTheDocument();
    });

    test('opens create reservation modal when button is clicked', async () => {
        render(<ReservationManagement userData={mockUserData} />);
        const createBtn = await screen.findByText(/Create Reservation/i);
        fireEvent.click(createBtn);
        expect(screen.getAllByText(/New Reservation/i)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Driver Information/i)[0]).toBeInTheDocument();
    });

    test('displays duration and total amount fields', async () => {
        render(<ReservationManagement userData={mockUserData} />);
        fireEvent.click(await screen.findByText(/Create Reservation/i));
        expect(screen.getByText(/Duration \(hours\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Amount \(Rs.\)/i)).toBeInTheDocument();
    });
});
