import { WindCompass } from './components/WindCompass.jsx';
import { createRoot } from 'react-dom/client';
import './visualization.css';

function App() {
    try {
        return <WindCompass />;
    } catch (err) {
        return (
            <div className="wind-compass wind-compass--empty">
                <div className="wind-compass__message" style={{ color: '#e74c3c' }}>
                    Visualization error: {(err && err.message) || String(err)}
                </div>
            </div>
        );
    }
}

const rootElement = document.getElementById('root') || document.body;
createRoot(rootElement).render(<App />);
