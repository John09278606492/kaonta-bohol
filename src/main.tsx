import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './lib/serviceWorker';

// Register service worker for offline caching of restaurant details
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
