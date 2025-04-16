import React, { useState, useEffect } from "react";
import { Search, Loader2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
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
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const itemData = [
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

const Items = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(itemData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [customerType, setCustomerType] = useState("business");
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [itemType, setItemType] = useState("goods");
  const rowsPerPage = 10;

  // Get dynamic columns from first data item
  const columns = itemData.length > 0 ? Object.keys(itemData[0]) : [];

  // Determine which columns are numeric
  const numericColumns = columns.filter((column) =>
    itemData.some((row) => {
      const value = String(row[column]);
      return !isNaN(Number.parseFloat(value)) && !value.includes("-");
    })
  );

  useEffect(() => {
    setFilteredData(itemData);
  }, []);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredData(itemData);
      setCurrentPage(1);
      return;
    }

    const filtered = itemData.filter((row) =>
      Object.entries(row).some(([key, value]) => 
        String(value).toLowerCase().includes(searchValue.toLowerCase())
      )
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    const visibleCategories = getFilteredUniqueValues(currentFilterColumn);
    const allSelected = visibleCategories.every((cat) => selectedCategories.includes(cat));
    setSelectedCategories(allSelected ? [] : visibleCategories);
  };

  const handleColumnFilter = () => {
    if (selectedCategories.length === 0) {
      setFilteredData(itemData);
    } else {
      const filtered = itemData.filter((row) => 
        selectedCategories.includes(String(row[currentFilterColumn]))
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilteredData(itemData);
    setCurrentPage(1);
    setSelectedCategories([]);
    setCategorySearchTerm("");
  };

  const getUniqueValues = (columnName) => {
    return [...new Set(itemData.map((row) => String(row[columnName])))];
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
              <CardTitle>Recent Items</CardTitle>
              <CardDescription>View and manage your items</CardDescription>
            </div>
            <div className="relative flex items-center gap-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-[400px]"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Button variant="default" onClick={() => setItemFormOpen(true)}>
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
                        {column.charAt(0).toUpperCase() + column.slice(1).toLowerCase()}
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
                        <TableCell key={column} className="max-w-[200px] group relative">
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
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
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
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Filter Modal */}
      {filterModalOpen && (
        <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Filter {currentFilterColumn}</DialogTitle>
              <p className="text-sm text-gray-600">Make changes to your filter here. Click save when you're done.</p>
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
                <label key={value} className="flex items-center gap-1 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
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
              <Button variant="default" className="bg-black hover:bg-gray-800" onClick={handleColumnFilter}>
                Save changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-[#3498db]" />
        </div>
      )}
      <Dialog open={itemFormOpen} onOpenChange={setItemFormOpen}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          {/* Item Type */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">Item Type</Label>
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="itemType"
                  value="goods"
                  checked={itemType === "goods"}
                  onChange={() => setItemType("goods")}
                />
                <span>Goods</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="itemType"
                  value="service"
                  checked={itemType === "service"}
                  onChange={() => setItemType("service")}
                />
                <span>Service</span>
              </label>
            </div>
          </div>

          {/* Item Name */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">Item Name</Label>
            </div>
            <Input placeholder="" />
          </div>

          {/* Unit */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">Unit Type</Label>
            </div>
            <Input placeholder="e.g. Box" />
          </div>

          {/* Selling Price */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">Selling Price</Label>
            </div>
            <div className="flex">
              <div className="bg-gray-100 border border-r-0 rounded-l px-3 flex items-center text-gray-500">
                INR
              </div>
              <Input className="rounded-l-none" placeholder="" />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">Description</Label>
            </div>
            <Textarea placeholder="" rows={3} />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setItemFormOpen(false)}>
            Cancel
          </Button>
          <Button variant="default">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
   </div>
 );
};

export default Items;
