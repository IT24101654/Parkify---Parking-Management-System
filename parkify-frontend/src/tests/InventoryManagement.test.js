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
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import ManageInventory from '../Components/Inventory/ManageInventory';

jest.mock('axios');

const mockItems = [
    {
        id: 1,
        itemName: 'Test Item',
        quantity: 10,
        thresholdValue: 5,
        unitPrice: 100,
        inventoryType: 'FOOD',
        expiryDate: '2026-12-31'
    }
];

describe('Inventory Management Tests', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: mockItems });
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('userRole', 'PARKING_OWNER');
    });

    test('renders inventory table with data', async () => {
        render(
            <BrowserRouter>
                <ManageInventory selectedType="FOOD" />
            </BrowserRouter>
        );

        expect(screen.getByText(/Loading items.../i)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('Test Item')).toBeInTheDocument();
        });
        
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText(/Rs. 100.00/i)).toBeInTheDocument();
    });

    test('opens add item form when button clicked', async () => {
        render(
            <BrowserRouter>
                <ManageInventory selectedType="FOOD" />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Add New Item/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Add New Item/i));
        expect(screen.getByText(/Item Name \*/i)).toBeInTheDocument();
    });
});
