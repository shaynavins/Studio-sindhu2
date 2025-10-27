import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Phone, Mail, MapPin, Calendar } from "lucide-react";
import type { Customer, Order, Measurement } from "@shared/schema";

const statusConfig = {
  new: { label: "New Order", color: "bg-blue-500" },
  measuring: { label: "Measuring", color: "bg-yellow-500" },
  cutting: { label: "Cutting", color: "bg-orange-500" },
  stitching: { label: "Stitching", color: "bg-purple-500" },
  ready: { label: "Ready", color: "bg-green-500" },
  delivered: { label: "Delivered", color: "bg-gray-500" },
};

export default function CustomerDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: customer, isLoading: customerLoading } = useQuery<Customer>({
    queryKey: [`/api/customers/${id}`],
    enabled: !!id,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/orders?customerId=${id}`],
    enabled: !!id,
  });

  const { data: measurements = [], isLoading: measurementsLoading } = useQuery<Measurement[]>({
    queryKey: [`/api/measurements?customerId=${id}`],
    enabled: !!id,
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (customerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setLocation("/customers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">Customer not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setLocation("/customers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <Button onClick={() => setLocation(`/edit-customer/${id}`)}>
          Edit Customer
        </Button>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{customer.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{customer.phone}</span>
          </div>
          {customer.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{customer.email}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{customer.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Added {formatDate(customer.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders yet
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const status = statusConfig[order.status];
                return (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{order.orderNumber}</span>
                          <Badge variant="secondary" className="text-xs">
                            <span className={`h-2 w-2 rounded-full ${status.color} mr-1.5`}></span>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.garmentType}
                        </p>
                        {order.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            {order.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{formatDate(order.createdAt)}</div>
                        {order.deliveryDate && (
                          <div className="text-xs">
                            Due: {formatDate(order.deliveryDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card>
        <CardHeader>
          <CardTitle>Measurements ({measurements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {measurementsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No measurements recorded yet
            </div>
          ) : (
            <div className="space-y-4">
              {measurements.map((measurement) => (
                <div
                  key={measurement.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{measurement.garmentType}</h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(measurement.createdAt)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {measurement.chest && (
                      <div>
                        <span className="text-muted-foreground">Chest:</span>
                        <span className="ml-2 font-medium">{measurement.chest}</span>
                      </div>
                    )}
                    {measurement.waist && (
                      <div>
                        <span className="text-muted-foreground">Waist:</span>
                        <span className="ml-2 font-medium">{measurement.waist}</span>
                      </div>
                    )}
                    {measurement.hips && (
                      <div>
                        <span className="text-muted-foreground">Hips:</span>
                        <span className="ml-2 font-medium">{measurement.hips}</span>
                      </div>
                    )}
                    {measurement.shoulder && (
                      <div>
                        <span className="text-muted-foreground">Shoulder:</span>
                        <span className="ml-2 font-medium">{measurement.shoulder}</span>
                      </div>
                    )}
                    {measurement.sleeves && (
                      <div>
                        <span className="text-muted-foreground">Sleeves:</span>
                        <span className="ml-2 font-medium">{measurement.sleeves}</span>
                      </div>
                    )}
                    {measurement.length && (
                      <div>
                        <span className="text-muted-foreground">Length:</span>
                        <span className="ml-2 font-medium">{measurement.length}</span>
                      </div>
                    )}
                    {measurement.inseam && (
                      <div>
                        <span className="text-muted-foreground">Inseam:</span>
                        <span className="ml-2 font-medium">{measurement.inseam}</span>
                      </div>
                    )}
                  </div>
                  {measurement.notes && (
                    <p className="text-sm text-muted-foreground italic mt-3">
                      Note: {measurement.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
