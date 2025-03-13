import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";
import DataTable from "./TableData";

const customerData = [
  {
    name: "Web Development",
    description: "Full stack web development services",
    rate: 100
  },
  {
    name: "UI/UX Design",
    description: "User interface and experience design",
    rate: 85
  },
  {
    name: "Cloud Hosting",
    description: "AWS cloud hosting services",
    rate: 150
  },
  {
    name: "Database Management",
    description: "Database administration and optimization",
    rate: 95
  },
];

export default function Items() {
  return (
    <div className="p-8 pt-4 space-y-8">
      <DataTable data={customerData} title="Recent Items"/>
    </div>
  );
}
