import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatPhp } from "@/lib/format";

const mockEmployees = [
  {
    id: 1,
    name: "Maria Santos",
    role: "Bar Manager",
    schedule: "Mon–Sat · 6pm–3am",
    monthlySalaryInCentavos: 4500000,
  },
  {
    id: 2,
    name: "Juan dela Cruz",
    role: "Head Bartender",
    schedule: "Wed–Sun · 7pm–3am",
    monthlySalaryInCentavos: 2800000,
  },
  {
    id: 3,
    name: "Liza Reyes",
    role: "Bartender",
    schedule: "Thu–Mon · 7pm–3am",
    monthlySalaryInCentavos: 2200000,
  },
  {
    id: 4,
    name: "Marco Aquino",
    role: "Server",
    schedule: "Tue–Sat · 7pm–3am",
    monthlySalaryInCentavos: 1800000,
  },
  {
    id: 5,
    name: "Bea Cruz",
    role: "Cashier",
    schedule: "Wed–Sun · 6pm–2am",
    monthlySalaryInCentavos: 1900000,
  },
];

export default function PayrollPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <Badge variant="outline">Coming Soon</Badge>
        <p className="text-sm text-muted-foreground">
          Employee compensation tracking — preview
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead className="text-right">Monthly Salary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockEmployees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell>{employee.role}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {employee.schedule}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatPhp(employee.monthlySalaryInCentavos)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
