import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function with all necessary providers
 * 
 * Wraps components with:
 * - BrowserRouter for routing
 * - Add more providers as needed (Theme, Auth, etc.)
 * 
 * @example
 * import { render, screen } from './test-utils';
 * 
 * test('renders component', () => {
 *   render(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 * });
 */

interface AllProvidersProps {
    children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllProvidersProps) => {
    return (
        <BrowserRouter>
            {children}
        </BrowserRouter>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render with our custom version
export { customRender as render };
