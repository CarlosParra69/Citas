import { useAuthContext } from '../context/AuthContext';

const useAuth = () => {
  const context = useAuthContext();
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return {
    ...context,
    isAuthenticated: !!context.user,
  };
};

export default useAuth;
