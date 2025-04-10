import React, { useState, useEffect } from "react";
import { Search, Plus, Phone, Mail, Calendar } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const customerData = [
  {
    name: "John Doe",
    companyName: "ABC Corp",
    email: "john@abccorp.com",
    phone: "+1-234-567-8901",
  },
  {
    name: "Jane Smith",
    companyName: "XYZ Industries",
    email: "jane@xyz.com",
    phone: "+1-234-567-8902",
  },
  {
    name: "Mike Johnson",
    companyName: "Tech Solutions",
    email: "mike@techsol.com",
    phone: "+1-234-567-8903",
  },
  {
    name: "Sarah Wilson",
    companyName: "Global Services",
    email: "sarah@global.com",
    phone: "+1-234-567-8904",
  },
  {
    name: "David Brown",
    companyName: "Innovation Ltd",
    email: "david@innovation.com",
    phone: "+1-234-567-8905",
  },
];

const Company = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(customerData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [companyType, setCompanyType] = useState("manufacturer");
  const [gstApplicable, setGstApplicable] = useState();
  const [invoiceDueDays, setInvoiceDueDays] = useState("30"); // Default 30 days`

  const rowsPerPage = 10;

  // Get dynamic columns from first data item
  const columns = customerData.length > 0 ? Object.keys(customerData[0]) : [];

  // Determine which columns are numeric
  const numericColumns = columns.filter((column) =>
    customerData.some((row) => {
      const value = String(row[column]);
      return !isNaN(Number.parseFloat(value)) && !value.includes("-");
    })
  );

  useEffect(() => {
    setFilteredData(customerData);
  }, []);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredData(customerData);
      setCurrentPage(1);
      return;
    }

    const filtered = customerData.filter((row) =>
      Object.entries(row).some(([key, value]) =>
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
      setFilteredData(customerData);
    } else {
      const filtered = customerData.filter((row) =>
        selectedCategories.includes(String(row[currentFilterColumn]))
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilteredData(customerData);
    setCurrentPage(1);
    setSelectedCategories([]);
    setCategorySearchTerm("");
  };

  const getUniqueValues = (columnName) => {
    return [...new Set(customerData.map((row) => String(row[columnName])))];
  };

  const getFilteredUniqueValues = (columnName) => {
    const uniqueValues = getUniqueValues(columnName);
    if (!categorySearchTerm) return uniqueValues;
    return uniqueValues.filter((value) =>
      value.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
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
              <CardTitle>Recent Companies</CardTitle>
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
                onClick={() => setCustomerFormOpen(true)}
              >
                <Plus className="h-5 w-5" />
                New
              </Button>
              <Button variant="default" onClick={() => clearFilters()}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>
                      <div className="flex items-center gap-2">
                        {column.charAt(0).toUpperCase() +
                          column.slice(1).toLowerCase()}
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
                    <TableCell colSpan={columns.length} className="text-center">
                      No matching results found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell
                          key={column}
                          className="max-w-[200px] group relative"
                        >
                          <div className="truncate">{row[column]}</div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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
              <DialogTitle>Filter {currentFilterColumn}</DialogTitle>
              <p className="text-sm text-gray-600">
                Make changes to your filter here. Click save when you're done.
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
                Select All
              </Button>
              <Button
                variant="default"
                className="bg-black hover:bg-gray-800"
                onClick={handleColumnFilter}
              >
                Save changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Customer Form Dialog */}
      <Dialog open={customerFormOpen} onOpenChange={setCustomerFormOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="flex items-center space-x-4">
              {/* Label */}
              <Label className="text-sm font-medium">Company Type</Label>

              {/* Radio Buttons */}
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="companyType"
                    value="manufacturer"
                    checked={companyType === "manufacturer"}
                    onChange={() => setCompanyType("manufacturer")}
                  />
                  <span>Manufacturer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="companyType"
                    value="trader"
                    checked={companyType === "trader"}
                    onChange={() => setCompanyType("trader")}
                  />
                  <span>Trader</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="companyType"
                    value="services"
                    checked={companyType === "services"}
                    onChange={() => setCompanyType("services")}
                  />
                  <span>Services</span>
                </label>
              </div>
            </div>
            <div className="flex space-x-4">
              {/* Company Name */}
              <div className="flex flex-col space-y-1 w-1/2">
                <Label className="text-sm font-medium">Company Name</Label>
                <Input placeholder="Company Name" />
              </div>

              {/* Currency */}
              <div className="flex flex-col space-y-1 w-1/2">
                <Label className="text-sm font-medium">Currency</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="INR - Indian Rupee" />
                  </SelectTrigger>
                </Select>
              </div>
            </div>
  
            {/* Due Date */}
            {/* <div className="flex flex-col space-y-1">
              <Label className="text-sm font-medium">
                Default Invoice Due Date
              </Label>
              <Select value={invoiceDueDays} onValueChange={setInvoiceDueDays}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select due period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="45">45 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-gray-500">
                Days after invoice date
              </span>
            </div> */}

            <div className="flex items-center space-x-2 mb-4">
              <Label className="text-sm font-medium">Is GST Applicable?</Label>
              <input
                type="radio"
                name="gstApplicable"
                value="yes"
                onChange={(e) => setGstApplicable(e.target.value === "yes")}
              />{" "}
              Yes
              <input
                type="radio"
                name="gstApplicable"
                value="no"
                defaultChecked
                onChange={(e) => setGstApplicable(e.target.value === "yes")}
              />{" "}
              No
            </div>

            {gstApplicable && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <Label className="text-sm font-medium">GSTIN/UIN</Label>
                  <Input placeholder="GST Number" />
                </div>

                <div className="flex flex-col space-y-1">
                  <Label className="text-sm font-medium">State Code</Label>
                  <Input placeholder="State Code" />
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">Country/Region</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4 ">
                <div className="flex flex-col space-y-1 w-1/2">
                  <Label className="text-sm font-medium">Address Line 1</Label>
                  <Textarea
                    placeholder="Street Address, Building Name"
                    rows={2}
                  />
                </div>

                <div className="flex flex-col space-y-1 w-1/2">
                  <Label className="text-sm font-medium">Address Line 2</Label>
                  <Textarea placeholder="Locality, Area" rows={2} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <Label className="text-sm font-medium">State</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-1">
                  <Label className="text-sm font-medium">City</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="pune">Pune</SelectItem>
                      <SelectItem value="nagpur">Nagpur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-4">
                {/* Email Address */}
                <div className="flex flex-col space-y-1 w-1/2">
                  <div className="flex items-center space-x-1">
                    <Label className="text-sm font-medium">Email Address</Label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      className="pl-10 w-full"
                      placeholder="Email Address"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col space-y-1 w-1/2">
                  <div className="flex items-center space-x-1">
                    <Label className="text-sm font-medium">Contact No.</Label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="h-4 w-4" />
                    </div>
                    <Input className="pl-10 w-full" placeholder="Phone" />
                  </div>
                </div>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCustomerFormOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="default">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Company;
