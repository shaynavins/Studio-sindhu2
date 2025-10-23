import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import emptyStateImg from "@assets/generated_images/Empty_state_illustration_f8cdad94.png";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  useImage?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, useImage = true }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {useImage ? (
        <img src={emptyStateImg} alt="Empty state" className="w-48 h-48 mb-6 opacity-50" />
      ) : Icon ? (
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      ) : null}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} data-testid="button-empty-state-action">
          {action.label}
        </Button>
      )}
    </div>
  );
}
