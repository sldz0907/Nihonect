import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Frontend from './frontend.tsx';
import './frontend.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Frontend />
    </BrowserRouter>
  </StrictMode>,
);
