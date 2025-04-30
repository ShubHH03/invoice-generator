import React, { useEffect, useState } from "react";
import InvoiceForm from "../Elements/InvoiceForm";
import DataTable from "./TableData";
import { Loader2 } from "lucide-react";

export default function GenerateReport() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await window.electron.getAllInvoices();

        if (response.success) {
          const invoiceList = response.invoices;
          invoiceList.sort(
            (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
          );

          const withCustomerNames = await Promise.all(
            invoiceList.map(async (invoice) => {
              let customerName = "Unknown"; // Replace if needed
              const dueDateObj = new Date(invoice.dueDate);
              const today = new Date();
              const diffTime = dueDateObj - today;
              const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return {
                invoiceNo: invoice.invoiceNo,
                invoiceDate: formatDate(invoice.invoiceDate),
                dueDate: formatDate(invoice.dueDate),
                amount: invoice.totalAmount,
                customerName,
                daysUntilDue,
              };
            })
          );

          setInvoices(withCustomerNames);
        } else {
          console.error("Failed to fetch invoices:", response.error);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const columns = [
    { header: "Invoice No.", accessor: "invoiceNo" },
    { header: "Invoice Date", accessor: "invoiceDate" },
    { header: "Due Date", accessor: "dueDate" },
    { header: "Amount", accessor: "amount" },
    { header: "Customer Name", accessor: "customerName" },
    {
      header: "Days Until Due",
      accessor: "daysUntilDue",
      cell: (value) => (
        <span className={value <= 0 ? "text-red-600 font-bold" : ""}>
          {value <= 0
            ? `Overdue by ${Math.abs(value)} day(s)`
            : `${value} day(s)`}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8 pt-4 space-y-6 bg-white dark:bg-black">
      <h2 className="text-3xl font-bold tracking-tight">Invoice Generator</h2>

      <div>
        <InvoiceForm />
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center items-center h-40 space-x-2 text-primary">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading invoices...</span>
          </div>
        ) : (
          <DataTable
            data={invoices}
            columns={columns}
            title="Recent Invoices"
          />
        )}
      </div>
    </div>
  );
}
