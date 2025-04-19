import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
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
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const rowsPerPage = 10;

  // Define specific columns to display
  const displayColumns = ["companyName", "companyType", "email", "phone"];

  // Display names for columns (for header display)
  const columnDisplayNames = {
    companyName: "Company Name",
    companyType: "Company Type",
    email: "Email",
    phone: "Phone Number",
  };

  // Fetch company data from database on component mount
  useEffect(() => {
    const fetchCompaniesData = async () => {
      setIsLoading(true);
      try {
        const response = await window.electron.getCompany();
        if (response && response.success && Array.isArray(response.companies)) {
          // Process the data to ensure it has all required fields
          const processedData = response.companies.map((company) => {
            // Ensure all required fields exist, provide defaults if missing
            return {
              companyName:
                company.companyName || company.name || "Unnamed Company",
              companyType:
                company.companyType || company.type || "Unknown Type",
              email: company.email || "No email provided",
              phone:
                company.phone || company.phoneNumber || "No phone provided",
              // Keep the original object as well to maintain all data
              ...company,
            };
          });

          setCompanies(processedData);
          setFilteredData(processedData);
        } else {
          console.error("Invalid response format:", response);
          setCompanies([]);
          setFilteredData([]);
        }
      } catch (err) {
        console.error("Error fetching company data:", err);
        setCompanies([]);
        setFilteredData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompaniesData();
  }, []);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredData(companies);
      setCurrentPage(1);
      return;
    }

    const filtered = companies.filter((company) =>
      // Only search in the display columns
      displayColumns.some((column) =>
        String(company[column])
          .toLowerCase()
          .includes(searchValue.toLowerCase())
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
      setFilteredData(companies);
    } else {
      const filtered = companies.filter((company) =>
        selectedCategories.includes(String(company[currentFilterColumn]))
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilteredData(companies);
    setCurrentPage(1);
    setSelectedCategories([]);
    setCategorySearchTerm("");
  };

  const getUniqueValues = (columnName) => {
    return [
      ...new Set(companies.map((company) => String(company[columnName]))),
    ];
  };

  const getFilteredUniqueValues = (columnName) => {
    const uniqueValues = getUniqueValues(columnName);
    if (!categorySearchTerm) return uniqueValues;
    return uniqueValues.filter((value) =>
      value.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  };

  // Handle form submission and refresh data
  const handleSaveCompany = async (companyData) => {
    try {
      const result = await window.electron.addCompany(companyData);

      if (result && result.success) {
        // Refresh the companies list after successful save
        const response = await window.electron.getCompany();
        if (response && response.success && Array.isArray(response.companies)) {
          const processedData = response.companies.map((company) => ({
            companyName:
              company.companyName || company.name || "Unnamed Company",
            companyType: company.companyType || company.type || "Unknown Type",
            email: company.email || "No email provided",
            phone: company.phone || company.phoneNumber || "No phone provided",
            ...company,
          }));

          setCompanies(processedData);
          setFilteredData(processedData);
        }
      }
    } catch (error) {
      console.error("Error saving company:", error);
    }
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
              <CardDescription>
                View and manage your company list
              </CardDescription>
            </div>
            <div className="relative flex items-center gap-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-10 w-[400px]"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Button
                variant="default"
                onClick={() => setCompanyFormOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Company
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
                <p>Loading companies data...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {displayColumns.map((column) => (
                      <TableHead
                        key={column}
                        className="font-medium text-gray-900"
                      >
                        <div className="flex items-center gap-2">
                          {columnDisplayNames[column]}
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
                        colSpan={displayColumns.length}
                        className="text-center py-8"
                      >
                        {companies.length === 0
                          ? "No companies found in database"
                          : "No matching results found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((company, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        {displayColumns.map((column) => (
                          <TableCell key={column} className="py-4">
                            <div
                              className={
                                column === "companyName" ? "font-medium" : ""
                              }
                            >
                              {company[column]}
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
                Filter {columnDisplayNames[currentFilterColumn]}
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Select values to include in your filter results
              </p>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Search values..."
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
                  <span className="text-gray-700 truncate">{value}</span>
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
