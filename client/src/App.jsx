import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

/**
 * Root application component.
 *
 * Wraps the entire route tree inside an AuthProvider so that
 * every page can access authentication state through the useAuth hook.
 */
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

