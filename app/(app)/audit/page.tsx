import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAuditSummary, getAuditTrail } from "@/lib/inventory-service";

function severityVariant(severity: "info" | "warning" | "critical") {
  if (severity === "critical") {
    return "destructive" as const;
  }

  if (severity === "warning") {
    return "outline" as const;
  }

  return "secondary" as const;
}

export default async function AuditTrailPage() {
  const [auditEvents, summary] = await Promise.all([
    getAuditTrail(),
    getAuditSummary(),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Audit Trail
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">System Audit Events</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Immutable-style operational trace including stock movements, location
          updates, and auth events.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.totalEvents}</p>
            <p className="text-xs text-muted-foreground">
              Combined movement and system events.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.warningCount}</p>
            <p className="text-xs text-muted-foreground">
              Potential risk conditions detected.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Critical Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.criticalCount}</p>
            <p className="text-xs text-muted-foreground">
              High-severity security or operations events.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Audit Event Log</CardTitle>
          <CardDescription>
            Time-ordered event history with entity and actor context.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="whitespace-nowrap">{event.date}</TableCell>
                  <TableCell>
                    <Badge variant={severityVariant(event.severity)}>
                      {event.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{event.action}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.entityType} ({event.entityId})
                  </TableCell>
                  <TableCell className="text-muted-foreground">{event.actor}</TableCell>
                  <TableCell className="max-w-[420px] text-muted-foreground">
                    {event.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
