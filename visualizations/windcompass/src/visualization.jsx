import { Component } from 'react';
import { WindCompass } from './components/WindCompass.jsx';
import { createRoot } from 'react-dom/client';
import './visualization.css';

/**
 * A try/catch around <WindCompass /> would catch nothing: creating the element
 * never throws, and React runs the render itself afterwards. Only a real error
 * boundary intercepts a render-phase failure, which is the difference between
 * the panel showing a readable message and showing nothing at all.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        const { error } = this.state;
        if (!error) {
            return this.props.children;
        }
        return (
            <div className="wind-compass wind-compass--empty">
                <div className="wind-compass__message" style={{ color: '#e74c3c' }}>
                    Visualization error: {error.message || String(error)}
                </div>
            </div>
        );
    }
}

const rootElement = document.getElementById('root') || document.body;
createRoot(rootElement).render(
    <ErrorBoundary>
        <WindCompass />
    </ErrorBoundary>,
);
