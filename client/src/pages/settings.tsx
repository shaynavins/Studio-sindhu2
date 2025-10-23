import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
    console.log('Settings saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Google Drive Integration</CardTitle>
            <CardDescription>Configure where customer photos are stored</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drive-folder">Root Folder ID</Label>
              <Input
                id="drive-folder"
                placeholder="Enter Google Drive folder ID"
                defaultValue="1a2b3c4d5e6f7g8h9i0j"
                data-testid="input-drive-folder"
              />
              <p className="text-xs text-muted-foreground">
                Customer folders will be created inside this folder
              </p>
            </div>
            <Button variant="outline" data-testid="button-test-drive">Test Connection</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Sheets Integration</CardTitle>
            <CardDescription>Configure where measurements are stored</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-id">Master Sheet ID</Label>
              <Input
                id="sheet-id"
                placeholder="Enter Google Sheets ID"
                defaultValue="9i8h7g6f5e4d3c2b1a0"
                data-testid="input-sheet-id"
              />
              <p className="text-xs text-muted-foreground">
                Each customer will get a new tab in this sheet
              </p>
            </div>
            <Button variant="outline" data-testid="button-test-sheets">Test Connection</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when order status changes
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-order-updates" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Customers</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when a new customer is added
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-new-customers" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Delivery Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Remind me about upcoming deliveries
                </p>
              </div>
              <Switch data-testid="switch-delivery-reminders" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} data-testid="button-save-settings">
            Save Changes
          </Button>
          <Button variant="outline" data-testid="button-cancel-settings">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
