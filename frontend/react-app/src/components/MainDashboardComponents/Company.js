import React, { useState, useEffect } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import CompanyForm from "../Elements/CompanyForm";

const Company = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [columns, setColumns] = useState([]);
  const rowsPerPage = 10;

  // Display field mappings
  const fieldMappings = {
    companyName: "Company Name",
    companyType: "Company Type",
    email: "Email",
    contactNo: "Contact No",
    gstApplicable: "GST Applicable",
    gstin: "GSTIN",
    invoiceCount: "Total Invoices",
    totalInvoiceAmount: "Total Invoice Value (₹)",
  };

  // Column order (specify which fields to display and in what order)
  const columnOrder = [
    "companyName",
    "companyType",
    "email",
    "contactNo",
    "gstApplicable",
    "gstin",
    "invoiceCount",
    "totalInvoiceAmount",
  ];

  // useEffect(() => {
  //   const fetchCompanies = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await window.electron.invoke(
  //         "get-company-with-invoices"
  //       );
  //       console.log("Companies with invoices response:", response);

  //       if (response.success) {
  //         const companiesData = response.companies || [];
  //         console.log("Companies data with invoice totals:", companiesData);

  //         // Format companies with invoice data
  //         const formattedCompanies = companiesData.map((company) => ({
  //           id: company.id,
  //           companyName: company.companyName || "",
  //           companyType: company.companyType || "",
  //           email: company.email || "",
  //           contactNo: company.contactNo || "",
  //           gstApplicable: company.gstApplicable || "No",
  //           gstin: company.gstin || "N/A",
  //           invoiceCount: company.invoiceCount || 0,
  //           totalInvoiceAmount: parseFloat(company.totalInvoiceAmount) || 0,
  //         }));

  //         // Set the data
  //         setCompanyData(formattedCompanies);
  //         setFilteredData(formattedCompanies);

  //         // Set columns based on our predefined order
  //         setColumns(columnOrder);
  //       } else {
  //         console.error("Failed to fetch companies:", response.error);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching companies:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchCompanies();
  // }, []);
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        // Using the electron API from preload.js to get companies
        const response = await window.electron.getCompany();
        console.log("Companies API response:", response);

        if (response.success) {
          const companiesData = response.companies || [];
          console.log("Companies data:", companiesData);

          // Format companies if needed
          const formattedCompanies = companiesData.map((company) => ({
            id: company.id,
            companyName: company.companyName || "",
            companyType: company.companyType || "",
            email: company.email || "",
            contactNo: company.contactNo || "",
            gstApplicable: company.gstApplicable || "No",
            gstin: company.gstin || "N/A",
          }));

          // Set the data
          setCompanyData(formattedCompanies);
          setFilteredData(formattedCompanies);

          // Set columns based on our predefined order
          setColumns(columnOrder);
        } else {
          console.error("Failed to fetch companies:", response.error);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredData(companyData);
      setCurrentPage(1);
      return;
    }

    const filtered = companyData.filter((row) =>
      Object.entries(row).some(
        ([key, value]) =>
          value !== null &&
          String(value).toLowerCase().includes(searchValue.toLowerCase())
      )
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    const visibleCategories = getFilteredUniqueValues(currentFilterColumn);
    const allSelected = visibleCategories.every((cat) =>
      selectedCategories.includes(cat)
    );
    setSelectedCategories(allSelected ? [] : visibleCategories);
  };

  const handleColumnFilter = () => {
    if (selectedCategories.length === 0) {
      setFilteredData(companyData);
    } else {
      const filtered = companyData.filter((row) => {
        const value = row[currentFilterColumn];
        return value !== null && selectedCategories.includes(String(value));
      });
      setFilteredData(filtered);
    }
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilteredData(companyData);
    setCurrentPage(1);
    setSelectedCategories([]);
    setCategorySearchTerm("");
  };

  const getUniqueValues = (columnName) => {
    return [
      ...new Set(
        companyData
          .map((row) =>
            row[columnName] !== null ? String(row[columnName]) : "N/A"
          )
          .filter(Boolean)
      ),
    ];
  };

  const getFilteredUniqueValues = (columnName) => {
    const uniqueValues = getUniqueValues(columnName);
    if (!categorySearchTerm) return uniqueValues;
    return uniqueValues.filter((value) =>
      value.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  };

  const handleSaveCompany = async (companyData) => {
    try {
      // Call API to save the company
      // After saving, refresh the companies list
      const response = await window.electron.getCompany();
      if (response.success) {
        setCompanyData(response.companies || []);
        setFilteredData(response.companies || []);
      }

      // Close the form
      setCompanyFormOpen(false);
    } catch (error) {
      console.error("Error saving company:", error);
    }
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 2) {
        pageNumbers.push("ellipsis");
      }
      if (currentPage !== 1 && currentPage !== totalPages) {
        pageNumbers.push(currentPage);
      }
      if (currentPage < totalPages - 1) {
        pageNumbers.push("ellipsis");
      }
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  return (
    <div className="p-8 pt-4 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <CardTitle>Companies</CardTitle>
              <CardDescription>View and manage your companies</CardDescription>
            </div>
            <div className="relative flex items-center gap-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-[400px]"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Button
                variant="default"
                onClick={() => setCompanyFormOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                New Company
              </Button>
              <Button variant="outline" onClick={() => clearFilters()}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading companies...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column}>
                        <div className="flex items-center gap-2">
                          {fieldMappings[column] || column}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setCurrentFilterColumn(column);
                              setSelectedCategories([]);
                              setCategorySearchTerm("");
                              setFilterModalOpen(true);
                            }}
                          >
                            ▼
                          </Button>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center py-10"
                      >
                        No companies found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((row, index) => (
                      <TableRow
                        key={row.id || index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {columns.map((column) => (
                          <TableCell
                            key={column}
                            className="max-w-[200px] group relative"
                          >
                            <div className="truncate">
                              {column === "gstApplicable"
                                ? row[column] === "Yes"
                                  ? "Yes"
                                  : "No"
                                : column === "totalInvoiceAmount"
                                ? formatCurrency(row[column])
                                : row[column] || "N/A"}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={cn(
                        "cursor-pointer",
                        currentPage === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                  {getPageNumbers().map((pageNumber, index) => (
                    <PaginationItem key={index}>
                      {pageNumber === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={cn(
                        "cursor-pointer",
                        currentPage === totalPages &&
                          "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Modal */}
      {filterModalOpen && (
        <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                Filter{" "}
                {fieldMappings[currentFilterColumn] || currentFilterColumn}
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Select values to filter by{" "}
                {fieldMappings[currentFilterColumn] || currentFilterColumn}.
              </p>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Search categories..."
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-60 overflow-y-auto space-y-[1px] mb-4">
              {getFilteredUniqueValues(currentFilterColumn).map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-1 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCategories.includes(value)}
                    onCheckedChange={() => handleCategorySelect(value)}
                  />
                  <span className="text-gray-700">{value}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleSelectAll}>
                {getFilteredUniqueValues(currentFilterColumn).every((cat) =>
                  selectedCategories.includes(cat)
                )
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <Button variant="default" onClick={handleColumnFilter}>
                Apply Filter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Company Form Dialog */}
      <CompanyForm
        open={companyFormOpen}
        onOpenChange={setCompanyFormOpen}
        onSave={handleSaveCompany}
      />
    </div>
  );
};

export default Company;
