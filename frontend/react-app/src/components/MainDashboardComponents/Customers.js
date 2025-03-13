import React from "react";
// import RecentReports from "./RecentReports";
import DataTable from "./TableData";

const customerData = [
  {
    name: "John Doe",
    companyName: "ABC Corp",
    email: "john@abccorp.com",
    phone: "+1-234-567-8901",
    receivables: 5000
  },
  {
    name: "Jane Smith",
    companyName: "XYZ Industries",
    email: "jane@xyz.com",
    phone: "+1-234-567-8902",
    receivables: 3500
  },
  {
    name: "Mike Johnson",
    companyName: "Tech Solutions",
    email: "mike@techsol.com",
    phone: "+1-234-567-8903",
    receivables: 7200
  },
  {
    name: "Sarah Wilson",
    companyName: "Global Services",
    email: "sarah@global.com",
    phone: "+1-234-567-8904",
    receivables: 2800
  },
  {
    name: "David Brown",
    companyName: "Innovation Ltd",
    email: "david@innovation.com",
    phone: "+1-234-567-8905",
    receivables: 6100
  }
];

const Customers = () => {
  return (
    <div className="p-8 pt-4 space-y-8">
      <DataTable data={customerData} title="Recent Customers" />
    </div>
  );
};

export default Customers;
