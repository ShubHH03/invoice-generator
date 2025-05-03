import React, { useState, useEffect } from "react";
import { Search, Loader2, Plus } from "lucide-react";
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
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ItemForm from "../Elements/ItemForm";

const Items = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [columns, setColumns] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0); // New state for forcing refresh

  const rowsPerPage = 10;

  // Moved fetchItems out of useEffect so it can be called from other functions
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      // Using the electron API from preload.js to get items
      const response = await window.electron.getItem();
      console.log("Items API response:", response);

      if (response.success) {
        const itemsData = response.items || [];
        console.log("Items data:", itemsData);

        // Format items if needed
        const formattedItems = itemsData.map((item) => ({
          id: item.id,
          name: item.name,
          hsnSacCode: item.hsnSacCode || "", // Add HSN/SAC code field
          description: item.description || "",
          rate:
            item.sellingPrice !== undefined ? parseFloat(item.sellingPrice) : 0,
          unit: item.unit || "",
        }));

        // Set the data
        setItemData(formattedItems);
        setFilteredData(formattedItems);

        // Dynamically determine columns from first item
        if (formattedItems.length > 0) {
          setColumns(Object.keys(formattedItems[0]));
        }
      } else {
        console.error("Failed to fetch items:", response.error);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Using refreshCounter as a dependency to trigger re-fetch
  useEffect(() => {
    fetchItems();
  }, [refreshCounter]);

  // Determine which columns are numeric
  const numericColumns = columns.filter((column) =>
    itemData.some((row) => {
      const value = String(row[column]);
      return !isNaN(Number.parseFloat(value)) && !value.includes("-");
    })
  );

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
    return [...new Set(itemData.map((row) => String(row[columnName] || "")))];
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

  // Handler for saving the item data - FIXED: uses refreshCounter to trigger a re-fetch
  const handleSaveItem = async (formData) => {
    try {
      setItemFormOpen(false);
      setIsLoading(true);

      const response = await window.electron.saveItem(formData);

      if (response.success) {
        console.log("Item saved successfully");
        await fetchItems(); // Refresh the list only after a successful save
      } else {
        console.error("Failed to save item:", response.error);
      }
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format column display name
  const formatColumnName = (columnName) => {
    if (columnName === "hsnSacCode") return "HSN/SAC Code";
    return (
      columnName.charAt(0).toUpperCase() + columnName.slice(1).toLowerCase()
    );
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
                New Item
              </Button>
              <Button variant="outline" onClick={() => clearFilters()}>
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
                        {formatColumnName(column)}
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
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      <div className="flex justify-center">
                        <Loader2 className="animate-spin h-6 w-6" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      No matching results found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((row, index) => (
                    <TableRow
                      key={row.id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"} // Alternating row colors
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={column}
                          className="max-w-[200px] group relative"
                        >
                          <div className="truncate">
                            {row[column] !== undefined ? row[column] : ""}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
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

      {/* Category Filter Modal */}
      {filterModalOpen && (
        <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                Filter {formatColumnName(currentFilterColumn)}
              </DialogTitle>
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

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-[#3498db]" />
        </div>
      )}

      {/* Item Form Component */}
      <ItemForm
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default Items;
