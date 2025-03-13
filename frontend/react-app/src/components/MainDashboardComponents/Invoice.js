import React, { useState } from "react";
import InvoiceForm from "../Elements/InvoiceForm";
import DataTable from "./TableData";

const customerData = [
  {
    invoiceNo: "INV-001",
    date: "01/07/2024",
    customerName: "John Doe",
    dueDate: "31/07/2024",
    amount: 5000.00
  },
  {
    invoiceNo: "INV-002",
    date: "05/07/2024",
    customerName: "Jane Smith",
    dueDate: "04/08/2024",
    amount: 3500.00
  },
  {
    invoiceNo: "INV-003",
    date: "10/07/2024",
    customerName: "Mike Johnson",
    dueDate: "09/08/2024",
    amount: 7200.00
  },
  {
    invoiceNo: "INV-004",
    date: "15/07/2024",
    customerName: "Sarah Wilson",
    dueDate: "14/08/2024",
    amount: 2800.00
  },
  {
    invoiceNo: "INV-005",
    date: "20/07/2024",
    customerName: "David Brown",
    dueDate: "19/08/2024",
    amount: 6100.00
  }
];

export default function GenerateReport() {

  return (
    <div className="p-8 pt-4 space-y-6 bg-white dark:bg-black">
        <h2 className="text-3xl font-bold tracking-tight">Invoice Generator</h2>


      <div>
        <InvoiceForm />
      </div>

      <div>
        <DataTable data={customerData} title="Recent Invoices" />
      </div>
    </div>
  );
}
