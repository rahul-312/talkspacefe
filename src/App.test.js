import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page for signed-out visitors', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
});
