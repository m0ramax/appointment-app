import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AppointmentList from './AppointmentList';

vi.mock('../../lib/api/appointments', () => ({
  appointmentService: {
    getUserAppointments: vi.fn().mockResolvedValue([]),
    getBusinessAppointmentsForWeek: vi.fn().mockResolvedValue([]),
    confirmAppointment: vi.fn(),
    completeAppointment: vi.fn(),
    cancelAppointment: vi.fn(),
    updateAppointment: vi.fn(),
  },
}));

vi.mock('../../lib/api/auth', () => ({
  authService: {
    getProfile: vi.fn().mockResolvedValue({ id: 1, email: 'owner@test.com', role: 'OWNER' }),
  },
}));

vi.mock('../../lib/api/work-schedule', () => ({
  workScheduleService: {
    getTeam: vi.fn().mockResolvedValue([]),
  },
}));

// Re-import after mocks are set up
import { appointmentService } from '../../lib/api/appointments';
import { authService } from '../../lib/api/auth';
import { workScheduleService } from '../../lib/api/work-schedule';

beforeEach(() => {
  vi.clearAllMocks();
  // Default: OWNER profile, empty team, empty appointments
  vi.mocked(authService.getProfile).mockResolvedValue({ id: 1, email: 'owner@test.com', role: 'OWNER' });
  vi.mocked(workScheduleService.getTeam).mockResolvedValue([]);
  vi.mocked(appointmentService.getBusinessAppointmentsForWeek).mockResolvedValue([]);
  vi.mocked(appointmentService.getUserAppointments).mockResolvedValue([]);
});

describe('AppointmentList', () => {
  it('shows loading state initially', () => {
    render(<AppointmentList />);
    expect(screen.getByText('Cargando citas...')).toBeInTheDocument();
  });

  it('shows "No hay citas" when appointments array is empty after loading', async () => {
    render(<AppointmentList />);
    await screen.findByText('No hay citas');
    expect(screen.getByText('No hay citas')).toBeInTheDocument();
  });

  it('renders appointment titles when data loads', async () => {
    const mockAppointments = [
      {
        id: 1,
        title: 'Corte de cabello',
        dateTime: '2026-04-20T10:00:00.000Z',
        durationMinutes: 30,
        status: 'CONFIRMED' as const,
        clientId: 10,
        providerId: 2,
        createdAt: '2026-04-14T00:00:00.000Z',
        updatedAt: '2026-04-14T00:00:00.000Z',
        client: { id: 10, email: 'client@test.com' },
        provider: { id: 2, email: 'provider@test.com' },
      },
      {
        id: 2,
        title: 'Masaje relajante',
        dateTime: '2026-04-21T11:00:00.000Z',
        durationMinutes: 60,
        status: 'PENDING' as const,
        clientId: 11,
        providerId: 2,
        createdAt: '2026-04-14T00:00:00.000Z',
        updatedAt: '2026-04-14T00:00:00.000Z',
        client: { id: 11, email: 'client2@test.com' },
        provider: { id: 2, email: 'provider@test.com' },
      },
    ];
    vi.mocked(appointmentService.getBusinessAppointmentsForWeek).mockResolvedValue(mockAppointments);

    render(<AppointmentList />);

    await screen.findByText('Corte de cabello');
    expect(screen.getByText('Corte de cabello')).toBeInTheDocument();
    expect(screen.getByText('Masaje relajante')).toBeInTheDocument();
  });

  it('shows provider name for OWNER role', async () => {
    const mockAppointments = [
      {
        id: 1,
        title: 'Consulta',
        dateTime: '2026-04-20T10:00:00.000Z',
        durationMinutes: 30,
        status: 'CONFIRMED' as const,
        clientId: 10,
        providerId: 2,
        createdAt: '2026-04-14T00:00:00.000Z',
        updatedAt: '2026-04-14T00:00:00.000Z',
        client: { id: 10, email: 'client@test.com' },
        provider: { id: 2, email: 'miprovider@test.com' },
      },
    ];
    vi.mocked(appointmentService.getBusinessAppointmentsForWeek).mockResolvedValue(mockAppointments);

    render(<AppointmentList />);

    await screen.findByText('Consulta');
    // The component renders "Proveedor:" label and the provider email prefix (before @)
    expect(screen.getByText('Proveedor:')).toBeInTheDocument();
    expect(screen.getByText('miprovider')).toBeInTheDocument();
  });
});
