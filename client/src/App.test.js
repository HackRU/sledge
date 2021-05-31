import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const welcomeMessage = screen.getByText(/welcome to sledge/i);
  expect(welcomeMessage).toBeInTheDocument();
});
