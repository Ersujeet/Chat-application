import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/');
  jest.clearAllMocks();
});

test('renders PulseChat navbar and Sign In form by default', () => {
  render(<App />);
  expect(screen.getByText('PulseChat')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
});

test('toggles dark and light theme from navbar', () => {
  render(<App />);
  const toggleBtn = screen.getByRole('button', { name: /switch to light mode/i });
  fireEvent.click(toggleBtn);
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  expect(
    screen.getByRole('button', { name: /switch to dark mode/i })
  ).toBeInTheDocument();
});

test('validates empty login submission cleanly', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(
    screen.getByText(/please enter both your email and password/i)
  ).toBeInTheDocument();
});

test('navigates to Create account page and validates password length', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: /create one/i }));
  expect(
    screen.getByRole('heading', { name: /create account/i })
  ).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: 'Alex' },
  });
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: 'alex@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/^password$/i), {
    target: { value: '123' },
  });
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  expect(
    screen.getByText(/password must be at least 6 characters/i)
  ).toBeInTheDocument();
});

test('renders groups, filters search, and loads messages when authenticated', async () => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('userid', 'user-1');

  axios.get.mockImplementation((url) => {
    if (url.includes('/groups/list')) {
      return Promise.resolve({
        data: [
          { _id: 'g1', groupName: 'Design Team' },
          { _id: 'g2', groupName: 'Engineering' },
        ],
      });
    }
    if (url.includes('/message/g1')) {
      return Promise.resolve({
        data: [
          {
            _id: 'm1',
            messageText: 'Hello team!',
            userId: { _id: 'user-2', username: 'Maya' },
            timestamp: '10:00 AM',
          },
        ],
      });
    }
    return Promise.resolve({ data: [] });
  });

  render(<App />);

  expect(await screen.findByText('Design Team')).toBeInTheDocument();
  expect(screen.getByText('Engineering')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/search groups/i), {
    target: { value: 'Design' },
  });
  expect(screen.getByText('Design Team')).toBeInTheDocument();
  expect(screen.queryByText('Engineering')).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('Design Team'));
  await waitFor(() => {
    expect(screen.getByText('Hello team!')).toBeInTheDocument();
  });
  expect(screen.getByText('Maya')).toBeInTheDocument();
});
