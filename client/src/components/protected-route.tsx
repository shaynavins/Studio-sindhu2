import { useAuth } from "@/lib/auth-context";
import { Redirect } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // TEMPORARILY DISABLED FOR TESTING - REMOVE THIS AFTER TESTING
  return <>{children}</>;
  
  // Uncomment below to re-enable authentication
  /*
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/tailor/login" />;
  }

  return <>{children}</>;
  */
}
