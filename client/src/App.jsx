import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/index.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
