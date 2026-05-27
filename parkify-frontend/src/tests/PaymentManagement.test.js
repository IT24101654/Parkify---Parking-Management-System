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

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import CheckoutPayment from '../Components/Driver/CheckoutPayment';

jest.mock('axios');

describe('Payment Management Tests', () => {
    const mockReservationId = '12345';
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        localStorage.setItem('token', 'fake-token');
    });

    test('renders payment method options', () => {
        render(<CheckoutPayment reservationId={mockReservationId} onCancel={mockOnCancel} />);
        
        expect(screen.getByText(/Pay with Stripe/i)).toBeInTheDocument();
        expect(screen.getByText(/Cash on Arrival/i)).toBeInTheDocument();
        // There are multiple elements with reservation ID, so use getAllByText
        const elements = screen.getAllByText(/Reservation #12345/i);
        expect(elements.length).toBeGreaterThan(0);
        expect(elements[0]).toBeInTheDocument();
    });

    test('handles cash payment success', async () => {
        axios.post.mockResolvedValue({ data: { status: 'success' } });

        render(<CheckoutPayment reservationId={mockReservationId} onCancel={mockOnCancel} />);
        
        // Select Cash method
        fireEvent.click(screen.getByText(/Cash on Arrival/i));
        
        // Click confirm
        fireEvent.click(screen.getByText(/Confirm Cash Booking/i));
        
        await waitFor(() => {
            expect(screen.getByText(/Booking Confirmed!/i)).toBeInTheDocument();
        });
        
        expect(screen.getByText(/Cash on Arrival/i)).toBeInTheDocument();
        expect(screen.getByText(/An SMS notification has been sent/i)).toBeInTheDocument();
    });
});
