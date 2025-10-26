import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import NewCustomer from "@/pages/new-customer";
import EditCustomer from "@/pages/edit-customer";
import CustomerDetails from "@/pages/customer-details";
import NewOrder from "@/pages/new-order";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin-login";
import TailorLogin from "@/pages/tailor-login";

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/tailor/login" component={TailorLogin} />
      <Route path="/" exact>
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/customers">
        <ProtectedRoute>
          <Customers />
        </ProtectedRoute>
      </Route>
      <Route path="/new-customer">
        <ProtectedRoute>
          <NewCustomer />
        </ProtectedRoute>
      </Route>
      <Route path="/edit-customer/:id">
        <ProtectedRoute>
          <EditCustomer />
        </ProtectedRoute>
      </Route>
      <Route path="/customer/:id">
        <ProtectedRoute>
          <CustomerDetails />
        </ProtectedRoute>
      </Route>
      <Route path="/new-order">
        <ProtectedRoute>
          <NewOrder />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isLoginPage = location.includes('/login');

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isLoginPage) {
    return (
      <>
        <Router />
        <Toaster />
      </>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar 
          userRole={user?.role || "tailor"} 
          userName={user?.name || "User"} 
        />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Router />
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
