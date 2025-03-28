import React, { useState, useEffect } from "react";
import InvoiceForm from "../Elements/InvoiceForm";
import DataTable from "./TableData";

export default function GenerateReport() {
  const [invoices, setInvoices] = useState([]);

  // Load invoices from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem("invoices");
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  // Function to add a new invoice
  const addInvoice = (newInvoice) => {
    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices)); // Save to localStorage
  };

  return (
    <div className="p-8 pt-4 space-y-6 bg-white dark:bg-black">
      <h2 className="text-3xl font-bold tracking-tight">Invoice Generator</h2>

      <div>
        <InvoiceForm onAddInvoice={addInvoice} />
      </div>

      <div>
        <DataTable data={invoices} title="Recent Invoices" />
      </div>
    </div>
  );
}
