import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function TailorLogin() {
  const [, setLocation] = useLocation();
  const [userCode, setUserCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/auth/tailor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid user code');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.name || 'Tailor'}!`,
        });
        // Small delay to ensure session is set
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid user code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Tailor Login</CardTitle>
          <CardDescription className="text-center">
            Enter your user code to access the portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userCode">User Code</Label>
              <Input
                id="userCode"
                type="text"
                placeholder="Enter your code (e.g., SHAYNA123)"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                required
                className="text-center font-mono text-lg tracking-wider"
              />
              <p className="text-xs text-muted-foreground text-center">
                Contact admin if you don't have a code
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <a href="/admin/login" className="text-primary hover:underline">
              Admin? Login here
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
