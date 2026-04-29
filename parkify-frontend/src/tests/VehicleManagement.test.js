import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VehicleManagement from '../Pages/Driver/VehicleManagement';

// Mock axios
import axios from 'axios';
jest.mock('axios');

describe('Vehicle Management Tests', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: [] });
        axios.post.mockResolvedValue({ data: {} });
        axios.put.mockResolvedValue({ data: {} });
        axios.delete.mockResolvedValue({ data: {} });

        localStorage.setItem('userId', '123');
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('selectedVehicles', JSON.stringify(['Car', 'Van']));
    });

    test('renders add vehicle button when list is empty', async () => {
        render(<VehicleManagement />);
        expect(await screen.findByText(/Add New Vehicle/i)).toBeInTheDocument();
    });

    test('shows add vehicle form when button is clicked', async () => {
        render(<VehicleManagement />);
        const addButton = await screen.findByText(/Add New Vehicle/i);
        fireEvent.click(addButton);
        expect(screen.getAllByText(/Add a Vehicle/i)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/License Plate Number/i)[0]).toBeInTheDocument();
    });

    test('renders fuel type options correctly', async () => {
        render(<VehicleManagement />);
        fireEvent.click(await screen.findByText(/Add New Vehicle/i));
        expect(screen.getByText(/Petrol/i)).toBeInTheDocument();
        expect(screen.getByText(/Diesel/i)).toBeInTheDocument();
        expect(screen.getByText(/Electric \(EV\)/i)).toBeInTheDocument();
    });
});
