import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomerCardProps {
  id: string;
  name: string;
  phone: string;
  orderStatus?: "new" | "measuring" | "cutting" | "stitching" | "ready" | "delivered";
  lastUpdated: string;
  onView?: () => void;
  onEdit?: () => void;
}

const statusConfig = {
  new: { label: "New Order", color: "bg-blue-500" },
  measuring: { label: "Measuring", color: "bg-yellow-500" },
  cutting: { label: "Cutting", color: "bg-orange-500" },
  stitching: { label: "Stitching", color: "bg-purple-500" },
  ready: { label: "Ready", color: "bg-green-500" },
  delivered: { label: "Delivered", color: "bg-gray-500" },
};

export function CustomerCard({
  id,
  name,
  phone,
  orderStatus = "new",
  lastUpdated,
  onView,
  onEdit,
}: CustomerCardProps) {
  const status = statusConfig[orderStatus];
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card className="p-4 hover-elevate" data-testid={`card-customer-${id}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate" data-testid={`text-customer-name-${id}`}>
                {name}
              </h3>
              <p className="text-sm text-muted-foreground">{phone}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-customer-menu-${id}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView} data-testid={`button-view-${id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit} data-testid={`button-edit-${id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">
              <span className={`h-2 w-2 rounded-full ${status.color} mr-1.5`}></span>
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Updated {lastUpdated}</p>
        </div>
      </div>
    </Card>
  );
}
