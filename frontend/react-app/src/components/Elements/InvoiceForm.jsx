import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";
import { X, Download, Plus, Camera } from "lucide-react";
import { format, addDays } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { jsPDF } from "jspdf";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Check } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import CustomerForm from "./CustomerForm";
import CompanyForm from "./CompanyForm";
import ItemForm from "./ItemForm";
import generateInvoicePDF from "./generateInvoicePDF";
// import { addDays } from "date-fns";

const InvoiceForm = () => {
  // State for form fields
  const [customerName, setCustomerName] = useState("");
  // const [invoiceNumber, setInvoiceNumber] = useState("INV-000002");
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState("30"); // Default: Due On Receipt
  const [customerNotes, setCustomerNotes] = useState(
    "Thanks for your business."
  );
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  // Add at the top of your component after the useState declarations
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [dbItems, setDbItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [signature, setSignature] = useState(null);
  // const [signatureUploadOpen, setSignatureUploadOpen] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const fileInputRef = useRef(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [companySelectOpen, setCompanySelectOpen] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [itemSelectsOpen, setItemSelectsOpen] = useState({});
  const [termSelectOpen, setTermSelectOpen] = useState(false);
  // const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [companyInitials, setCompanyInitials] = useState("");
  const [invoiceSequence, setInvoiceSequence] = useState("0001");
  const [companySignature, setCompanySignature] = useState(null);
  // Change this line
  const [invoiceNumber, setInvoiceNumber] = useState(""); // Remove the default "INV-000002"

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        // Assuming you're using electron's contextBridge to expose this API
        const response = await window.electron.getCompany();
        console.log("API response:", response);

        if (response.success) {
          // Make sure this matches the actual response structure
          const companiesData = response.companies || response.data || [];
          console.log("Companies data:", companiesData);

          // Check if each company has necessary fields
          const validCompanies = companiesData.map((company) => {
            // Log to see what fields are available
            console.log("Company fields:", Object.keys(company));
            return company;
          });

          setCompanies(validCompanies);
        } else {
          console.error("Failed to fetch companies:", response.error);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoadingItems(true);
      try {
        // Using the electron API from preload.js to get items
        const response = await window.electron.getItem();
        console.log("Items API response:", response);

        if (response.success) {
          // Make sure this matches the actual response structure
          const itemsData = response.items || response.data || [];
          console.log("Items data:", itemsData);

          // Transform the items to match the format needed for the dropdown
          const formattedItems = itemsData.map((item) => ({
            id: item.id,
            name: item.name,
            rate: item.sellingPrice?.toString() || "0.00",
            description: item.description || "",
            unit: item.unit || "",
          }));

          setDbItems(formattedItems);
          // Replace the static itemsList with the database items
          setItemsList(formattedItems);
        } else {
          console.error("Failed to fetch items:", response.error);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchItems();
  }, []);
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        // Using the electron API from preload.js to get customers
        const response = await window.electron.getCustomer();
        console.log("Customers API response:", response);

        if (response.success) {
          // Make sure this matches the actual response structure
          const customersData = response.customers || response.data || [];
          console.log("Customers data:", customersData);

          setCustomers(customersData);
        } else {
          console.error("Failed to fetch customers:", response.error);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);
  // Add this with your other useEffects
  useEffect(() => {
    if (companyInitials) {
      setInvoiceNumber(`${companyInitials}-${invoiceSequence}`);
    }
  }, [companyInitials, invoiceSequence]);

  // State for invoice items
  const [items, setItems] = useState([
    { id: 1, details: "", quantity: "1.00", rate: "0.00", amount: "0.00" },
  ]);

  const [itemsList, setItemsList] = useState([
    { id: 1, name: "Item 1", rate: "100.00" },
    { id: 2, name: "Item 2", rate: "200.00" },
    { id: 3, name: "Item 3", rate: "300.00" },
    { id: 4, name: "Item 4", rate: "400.00" },
    { id: 5, name: "Item 5", rate: "500.00" },
    { id: 6, name: "Item 6", rate: "600.00" },
    { id: 7, name: "Item 7", rate: "700.00" },
  ]);

  // State for calculations
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Customers data
  const [customers, setCustomers] = useState([
    { id: "customer1", name: "Customer 1" },
    { id: "customer2", name: "Customer 2" },
  ]);

  // State for download dialog
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [savedInvoice, setSavedInvoice] = useState(null);

  // Effect to calculate amounts when items change
  useEffect(() => {
    calculateTotals();
  }, [items]);

  // Calculate due date based on selected payment terms
  useEffect(() => {
    if (invoiceDate && paymentTerms) {
      const days = parseInt(paymentTerms, 10);
      const newDueDate = addDays(new Date(invoiceDate), days);
      setDueDate(newDueDate);
    }
  }, [invoiceDate, paymentTerms]);

  // Handle payment terms change
  const handleTermsChange = (value) => {
    setPaymentTerms(value);
  };

  // Cleanup effect for PDF URL
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Calculate item amount when quantity or rate changes
  const updateItemAmount = (id, quantity, rate) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const parsedQuantity = parseFloat(quantity) || 0;
        const parsedRate = parseFloat(rate) || 0;
        const amount = (parsedQuantity * parsedRate).toFixed(2);
        return { ...item, quantity, rate, amount };
      }
      return item;
    });

    setItems(updatedItems);
  };

  // Calculate totals (subtotal, taxes, total)
  const calculateTotals = () => {
    const calculatedSubtotal = items.reduce((sum, item) => {
      return sum + parseFloat(item.amount || 0);
    }, 0);

    setSubtotal(calculatedSubtotal);
    setTotal(calculatedSubtotal); // Add taxes here if needed
  };

  // Add a new row to the items table
  const addNewRow = () => {
    const newId =
      items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
    setItems([
      ...items,
      {
        id: newId,
        details: "",
        quantity: "1.00",
        rate: "0.00",
        amount: "0.00",
      },
    ]);
  };

  // Remove a row from the items table
  const removeRow = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignature(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeSignature = () => {
    setSignature(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  // Handle saving new customer
  const handleSaveCustomer = (customerData) => {
    console.log("New customer data:", customerData);
  };
  // Add after your other handler functions
  const handleCompanySelect = (companyId) => {
    console.log("Selecting company with ID:", companyId);

    // Find the company
    const company = companies.find(
      (company) => String(company.id) === String(companyId)
    );

    if (company) {
      // Make sure we store the complete company object
      setSelectedCompany(company);

      // Generate and set company initials
      const initials = generateCompanyInitials(company.companyName);
      setCompanyInitials(initials);

      // Update invoice number format
      setInvoiceNumber(`${initials}-${invoiceSequence}`);

      // Update other fields if needed
      if (company.defaultTerms) {
        setPaymentTerms(company.defaultTerms);
      }

      console.log("Selected company:", company);
      console.log("Logo available:", !!company.logo);
      console.log("Logo path:", company.logoPath);
    }
  };
  const handleSequenceChange = (value) => {
    setInvoiceSequence(value);
    setInvoiceNumber(`${companyInitials}-${value}`);
  };
  const handleItemSelect = (rowId, itemId) => {
    console.log("Selecting item with ID:", itemId, "for row:", rowId);

    // Find the selected item
    const selectedItem = dbItems.find((item) => item.id === parseInt(itemId));
    console.log("Found item:", selectedItem);

    if (selectedItem) {
      // Update the items array with selected item details
      const updatedItems = items.map((item) => {
        if (item.id === rowId) {
          return {
            ...item,
            details: selectedItem.name,
            rate: selectedItem.rate || "0.00",
            amount: (
              (parseFloat(item.quantity) || 1) *
              (parseFloat(selectedItem.rate) || 0)
            ).toFixed(2),
          };
        }
        return item;
      });

      setItems(updatedItems);

      // Close this specific item's dropdown
      setItemSelectsOpen((prev) => ({
        ...prev,
        [rowId]: false,
      }));
    }
  };
  const handleCustomerSelect = (customerId) => {
    console.log("Selecting customer with ID:", customerId);

    // Find the customer
    const customer = customers.find(
      (customer) => String(customer.id) === String(customerId)
    );

    if (customer) {
      setSelectedCustomer(customer);

      // Create a full name from firstName and lastName, or use the name field if available
      const fullName =
        customer.firstName || customer.lastName
          ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
          : customer.name || "";

      setCustomerName(fullName);

      // You can set additional customer details here if needed
      // For example, you might want to populate address fields, etc.
    }
  };
  const handleSaveItem = (newItem) => {
    // You would typically add the new item to your items array here
    console.log("New item saved:", newItem);
    // You might want to implement additional logic to add the item to the list
  };
  // Handle form submission
  const handleSubmit = async (isDraft = false) => {
    if (!selectedCompany) {
      alert("Please select a company before saving the invoice");
      return;
    }

    if (!selectedCustomer) {
      alert("Please select a customer before saving the invoice");
      return;
    }

    // Calculate tax amounts for display and database
    const calculatedCgst = subtotal * 0.09;
    const calculatedSgst = subtotal * 0.09;
    const calculatedTotal = subtotal + calculatedCgst + calculatedSgst;

    // Create the invoice object with proper field names to match the backend
    const invoice = {
      companyId: selectedCompany.id,
      customerId: selectedCustomer.id,
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
      dueDate: dueDate,
      paymentTerms: paymentTerms,
      incomeLedger: document.getElementById("incomeLedger").value,
      items: items.map((item) => ({
        id: item.id || 0,
        description: item.description || item.name || "",
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
        amount: parseFloat(item.amount) || 0,
      })),
      subtotal: subtotal,
      cgstRate: 9,
      sgstRate: 9,
      cgstAmount: calculatedCgst,
      sgstAmount: calculatedSgst,
      totalAmount: calculatedTotal,
      customerNotes: customerNotes,
      termsAndConditions: termsAndConditions,
      status: isDraft ? "draft" : "sent",
      signature: signature, // Add the signature data
    };

    console.log("Saving invoice:", invoice);

    try {
      // Save the invoice and its items to the database using the IPC channel
      const result = await window.electron.addInvoice(invoice);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Set the saved invoice with the database ID included
      setSavedInvoice({ ...invoice, id: result.data.id });

      // Generate PDF
      const doc = generateInvoicePDF(invoice);

      // Handle PDF generation success
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      // Show download dialog
      setShowDownloadDialog(true);
      setShowPdfPreview(false);
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(`There was an error saving the invoice: ${error.message}`);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (pdfUrl && savedInvoice) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Invoice-${savedInvoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show PDF preview after download
      setShowPdfPreview(true);

      // Keep the dialog open, but modify to show preview option
      // setShowDownloadDialog(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    console.log("Cancelled");
  };

  // Add this after your useState declarations
  const generateCompanyInitials = (companyName) => {
    if (!companyName) return "";

    // Split the company name by spaces and take first letter of each word
    return companyName
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("")
      .substring(0, 3); // Limit to 3 characters
  };

  return (
    <div className="rounded-xl mt-2 space-y-6">
      <Card className="w-full shadow-sm border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle>New Invoice</CardTitle>
          <CardDescription>
            Fill in the details to create a new invoice
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-6">
              {/* Company Name and Customer Name */}
              <div className="flex items-start gap-4">
                <Label htmlFor="companyName" className="w-32 pt-2">
                  Company Name
                </Label>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {/* Add logo display here */}
                    {selectedCompany && selectedCompany.logo && (
                      <div className="h-10 w-10 flex-shrink-0 rounded-md border overflow-hidden">
                        <img
                          src={selectedCompany.logo}
                          alt={`${selectedCompany.companyName} logo`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    <Select
                      open={companySelectOpen}
                      onOpenChange={setCompanySelectOpen}
                      onValueChange={(value) => {
                        handleCompanySelect(value);
                        setCompanySelectOpen(false);
                      }}
                      className="flex-1"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            selectedCompany
                              ? selectedCompany.companyName
                              : isLoadingCompanies
                              ? "Loading companies..."
                              : "Select company"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="p-0">
                        <Command className="rounded-md border-none bg-background">
                          <div className="p-2 border-b flex gap-2">
                            <div className="relative flex-1">
                              <CommandInput
                                placeholder="Search customers..."
                                className="h-10"
                              />
                            </div>
                            <Button
                              size="sm"
                              className="h-10"
                              onClick={() => setCompanyFormOpen(true)}
                            >
                              <Plus className="h-4 w-4" /> Add
                            </Button>
                          </div>
                          <CommandEmpty>
                            <div className="p-4 max-w-[600px] text-center text-muted-foreground">
                              <p className="text-md">
                                No matching customers found
                              </p>
                              <p className="text-sm mt-1">
                                Click the{" "}
                                <Plus className="h-3 w-3 inline-block mx-1" />{" "}
                                icon above to add a new customer
                              </p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {companies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={String(company.id)}
                                onSelect={(value) => {
                                  handleCompanySelect(value);
                                  setCompanySelectOpen(false);
                                }}
                                className="flex items-center"
                              >
                                {/* Add logo in dropdown list */}
                                {company.logo && (
                                  <div className="h-6 w-6 mr-2 rounded overflow-hidden flex-shrink-0">
                                    <img
                                      src={company.logo}
                                      alt={`${company.companyName} logo`}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  {company.companyName}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Render the CompanyForm dialog */}
                <CompanyForm
                  open={companyFormOpen}
                  onOpenChange={setCompanyFormOpen}
                  onSave={(newCompany) => {
                    console.log("New customer saved:", newCompany);
                    // Additional logic to add the customer to your list
                  }}
                />

                <Label htmlFor="customerName" className="w-30 pt-2 ml-6">
                  Customer Name
                </Label>
                <div className="flex-1">
                  {/* Customer Name Dropdown */}
                  <Select
                    open={customerSelectOpen}
                    onOpenChange={setCustomerSelectOpen}
                    onValueChange={(value) => {
                      handleCustomerSelect(value);
                      setCustomerSelectOpen(false);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          selectedCustomer
                            ? `${selectedCustomer.firstName || ""} ${
                                selectedCustomer.lastName || ""
                              }`.trim()
                            : "Select or add customer"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <Command className="rounded-md border-none bg-background">
                        <div className="p-2 border-b flex gap-2">
                          <div className="relative flex-1">
                            <CommandInput
                              placeholder="Search customers..."
                              className="h-10"
                            />
                          </div>
                          <Button
                            size="sm"
                            className="h-10"
                            onClick={() => setCustomerFormOpen(true)}
                          >
                            <Plus className="h-4 w-4" /> Add
                          </Button>
                        </div>
                        <CommandEmpty>
                          <div className="p-4 max-w-[600px] text-center text-muted-foreground">
                            <p className="text-md">
                              No matching customers found
                            </p>
                            <p className="text-sm mt-1">
                              Click the{" "}
                              <Plus className="h-3 w-3 inline-block mx-1" />{" "}
                              icon above to add a new customer
                            </p>
                          </div>
                        </CommandEmpty>
                        <div className="max-h-[200px] overflow-y-auto">
                          <CommandGroup>
                            {isLoadingCustomers ? (
                              <CommandItem disabled>
                                Loading customers...
                              </CommandItem>
                            ) : customers.length === 0 ? (
                              <CommandItem disabled>
                                No customers found
                              </CommandItem>
                            ) : (
                              customers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={String(customer.id)}
                                  onSelect={(value) => {
                                    handleCustomerSelect(value);
                                    setCustomerSelectOpen(false);
                                  }}
                                  className="flex items-center"
                                >
                                  <div className="flex-1">
                                    {/* Display combined first name and last name */}
                                    {`${customer.firstName || ""} ${
                                      customer.lastName || ""
                                    }`.trim() ||
                                      customer.name ||
                                      "Unnamed Customer"}
                                  </div>
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        </div>
                      </Command>
                    </SelectContent>
                  </Select>
                </div>
                {/* Render the CustomerForm dialog */}
                <CustomerForm
                  open={customerFormOpen}
                  onOpenChange={setCustomerFormOpen}
                  onSave={(newCustomer) => {
                    console.log("New customer saved:", newCustomer);
                    // Additional logic to add the customer to your list
                  }}
                />
              </div>

              {/* Invoice Number */}
              <div className="flex items-start gap-4">
                <Label htmlFor="invoiceNumber" className="w-32 pt-2">
                  Invoice No.
                </Label>
                <div className="flex-1 relative flex">
                  {/* Company Initials (static part) */}
                  <div className="flex-shrink-0 bg-gray-100 border border-r-0 rounded-l-md flex items-center px-3">
                    <span className="text-gray-700">{companyInitials}-</span>
                  </div>
                  {/* Sequence Number (editable part) */}
                  <Input
                    id="invoiceSequence"
                    value={invoiceSequence}
                    onChange={(e) => handleSequenceChange(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>

                <Label htmlFor="incomeLedger" className="w-28 pt-2 ml-6">
                  Ledger
                </Label>
                <div className="flex-1 relative">
                  <Input id="incomeLedger" />
                </div>
              </div>

              {/* Invoice Date and Terms */}
              <div className="flex items-start gap-4">
                <Label htmlFor="invoiceDate" className="w-32 pt-2">
                  Invoice Date
                </Label>
                <div className="flex-1 relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        id="invoiceDate"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 justify-between items-center"
                      >
                        {invoiceDate instanceof Date && !isNaN(invoiceDate)
                          ? format(invoiceDate, "dd/MM/yyyy")
                          : "DD/MM/YYYY"}

                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={invoiceDate}
                        onSelect={setInvoiceDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Label htmlFor="terms" className="w-28 pt-2 ml-6">
                  Terms
                </Label>
                <div className="flex-1 relative">
                  <Select
                    value={paymentTerms}
                    onValueChange={(value) => {
                      setPaymentTerms(value);
                      if (invoiceDate) {
                        const newDueDate = addDays(
                          new Date(invoiceDate),
                          parseInt(value)
                        );
                        setDueDate(newDueDate);
                      }
                    }}
                    open={termSelectOpen}
                    onOpenChange={setTermSelectOpen}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select or enter terms"
                        // 👇 Add this line
                        children={
                          paymentTerms ? `Net ${paymentTerms}` : undefined
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <Command className="rounded-md border-none bg-background">
                        <div className="p-2 border-b flex gap-2">
                          <div className="relative flex-1">
                            <CommandInput
                              placeholder="Enter custom days..."
                              className="h-10"
                              onValueChange={(val) => {
                                const days = parseInt(val);
                                if (!isNaN(days)) {
                                  setPaymentTerms(days.toString());
                                  if (invoiceDate) {
                                    const newDueDate = addDays(
                                      new Date(invoiceDate),
                                      days
                                    );
                                    setDueDate(newDueDate);
                                  }
                                  setTermSelectOpen(false);
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          <CommandGroup>
                            {["0", "15", "30", "45", "60", "90"].map((term) => (
                              <CommandItem
                                key={term}
                                onSelect={() => {
                                  setPaymentTerms(term);
                                  if (invoiceDate) {
                                    const newDueDate = addDays(
                                      new Date(invoiceDate),
                                      parseInt(term)
                                    );
                                    setDueDate(newDueDate);
                                  }
                                  setTermSelectOpen(false);
                                }}
                              >
                                Net {term}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </div>
                      </Command>
                    </SelectContent>
                  </Select>
                </div>

                <Label htmlFor="dueDate" className="w-28 pt-2 ml-6">
                  Due Date
                </Label>
                <div className="flex-1 relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        id="dueDate"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 justify-between items-center"
                      >
                        {dueDate instanceof Date && !isNaN(dueDate)
                          ? format(dueDate, "dd/MM/yyyy")
                          : "DD/MM/YYYY"}

                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Item Table */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-lg">Item Table</h3>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[50%]">ITEM DETAILS</TableHead>
                      <TableHead className="text-center">QUANTITY</TableHead>
                      <TableHead className="text-center">RATE</TableHead>
                      <TableHead className="text-center">AMOUNT</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="w-full">
                            <Select
                              open={itemSelectsOpen[item.id] || false}
                              onOpenChange={(open) => {
                                setItemSelectsOpen((prev) => ({
                                  ...prev,
                                  [item.id]: open,
                                }));
                              }}
                              onValueChange={(value) => {
                                handleItemSelect(item.id, value);
                                setItemSelectsOpen((prev) => ({
                                  ...prev,
                                  [item.id]: false,
                                }));
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={
                                    isLoadingItems
                                      ? "Loading items..."
                                      : item.details || "Select or add item"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent className="p-0">
                                <Command className="rounded-md border-none bg-background">
                                  <div className="p-2 border-b flex gap-2">
                                    <div className="relative flex-1">
                                      <CommandInput
                                        placeholder="Search items..."
                                        className="h-10"
                                      />
                                    </div>
                                    <Button
                                      size="sm"
                                      className="px-2 h-10"
                                      onClick={() => setItemFormOpen(true)}
                                    >
                                      <Plus className="h-4 w-4" /> Add
                                    </Button>
                                  </div>
                                  <CommandEmpty>
                                    <div className="p-4 max-w-[600px] text-center text-muted-foreground">
                                      <p className="text-md">
                                        No matching items found
                                      </p>
                                      <p className="text-sm mt-1">
                                        Click the{" "}
                                        <Plus className="h-3 w-3 inline-block mx-1" />{" "}
                                        icon above to add a new item
                                      </p>
                                    </div>
                                  </CommandEmpty>
                                  <div className="max-h-[200px] overflow-y-auto">
                                    <CommandGroup>
                                      {dbItems.map((dbItem) => (
                                        <CommandItem
                                          key={dbItem.id}
                                          value={String(dbItem.id)}
                                          onSelect={(value) => {
                                            handleItemSelect(item.id, value);
                                            // Close the popover
                                            document.body.click();
                                          }}
                                          className="flex items-center justify-between"
                                        >
                                          <div className="flex-1">
                                            {dbItem.name}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            ₹{dbItem.rate}
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </div>
                                </Command>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <ItemForm
                          open={itemFormOpen}
                          onOpenChange={setItemFormOpen}
                          onSave={handleSaveItem}
                        />

                        <TableCell className="text-center">
                          <Input
                            value={item.quantity}
                            className="text-center"
                            onChange={(e) => {
                              updateItemAmount(
                                item.id,
                                e.target.value,
                                item.rate
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            value={item.rate}
                            className="text-center"
                            onChange={(e) => {
                              updateItemAmount(
                                item.id,
                                item.quantity,
                                e.target.value
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            value={item.amount}
                            className="text-center"
                            readOnly
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeRow(item.id)}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex gap-4 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-50 border-gray-200 text-blue-500 flex items-center gap-1"
                    onClick={addNewRow}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Row</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-50 border-gray-200 text-blue-500 flex items-center gap-1"
                    onClick={() => {
                      // Add multiple empty rows
                      const newRows = Array.from({ length: 5 }, (_, index) => ({
                        id: items.length + index + 1,
                        details: "",
                        quantity: "1.00",
                        rate: "0.00",
                        amount: "0.00",
                      }));
                      setItems([...items, ...newRows]);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Items in Bulk</span>
                  </Button>
                </div>

                {/* Total Section with GST */}
                <div className="flex justify-between items-center mt-6 border-t pt-4">
                  <div></div>
                  <div className="w-1/3">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-black">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    {/* CGST */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-black">CGST (9%)</span>
                      <span>₹{(subtotal * 0.09).toFixed(2)}</span>
                    </div>

                    {/* SGST */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-black">SGST (9%)</span>
                      <span>₹{(subtotal * 0.09).toFixed(2)}</span>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center mb-2 border-t pt-2">
                      <span className="text-black font-bold">Total ( ₹ )</span>
                      <span className="font-medium">
                        ₹{(subtotal + subtotal * 0.18).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/*  Customer Notes */}
              <div className="mt-6">
                <Label htmlFor="customerNotes" className="block mb-2">
                  Narration
                </Label>
                <Textarea
                  id="customerNotes"
                  placeholder="Thanks for your business."
                  className="max-w-[500px]"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
                <p className="text-gray-500 text-xs mt-1">
                  Will be displayed on the invoice
                </p>
              </div>

              {/* Terms and Conditions */}
              {showTerms && (
                <div className="mt-6">
                  <Label htmlFor="termsAndConditions" className="block mb-2">
                    Terms and Conditions
                  </Label>
                  <Textarea
                    id="termsAndConditions"
                    placeholder="Enter your terms and conditions here."
                    className="max-w-[500px]"
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                  />
                </div>
              )}

              {/* Additional Options */}
              <div className="space-y-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-50 border-gray-200 text-blue-500 flex items-center gap-1"
                  onClick={() => setShowTerms(!showTerms)}
                >
                  <Plus className="h-4 w-4" />
                  <span>{showTerms ? "Hide" : "Add"} Terms and conditions</span>
                </Button>
              </div>
            </div>
            {/* Signature Upload */}
            <div className="mt-6">
              <Label htmlFor="signature" className="block mb-2">
                Authorized Signature
              </Label>
              <div className="flex items-start gap-4">
                <div className="border rounded-md p-4 w-64 h-32 flex flex-col items-center justify-center relative">
                  {signature ? (
                    <>
                      <img
                        src={signature}
                        alt="Signature"
                        className="max-w-full max-h-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                        onClick={removeSignature}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center h-full w-full cursor-pointer"
                      onClick={triggerFileInput}
                    >
                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Click to upload signature
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleSignatureUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex gap-2 border-t pt-4 justify-end">
          <Button onClick={() => handleSubmit(true)}>Save</Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </CardFooter>

        {/* Download Invoice Dialog */}
        <AlertDialog
          open={showDownloadDialog}
          onOpenChange={setShowDownloadDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Invoice Saved Successfully</AlertDialogTitle>
              <AlertDialogDescription>
                Your invoice has been saved. Would you like to download a PDF
                copy?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <Button
                variant="outline"
                onClick={() => setShowPdfPreview(true)}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Quick View
              </Button>
              <AlertDialogAction
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Invoice
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
      <AlertDialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <AlertDialogHeader className="p-4 border-b">
            <div className="flex justify-between items-center w-full">
              <AlertDialogTitle>Invoice Preview</AlertDialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPdfPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDialogHeader>
          <div className="flex-1 min-h-[70vh] bg-gray-100 overflow-auto">
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="Invoice Preview"
              />
            )}
          </div>
          <AlertDialogFooter className="p-4 border-t">
            <AlertDialogCancel onClick={() => setShowPdfPreview(false)}>
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoiceForm;
