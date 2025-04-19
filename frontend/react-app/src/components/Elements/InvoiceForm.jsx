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
import {
  ChevronDown,
  ChevronUp,
  X,
  Download,
  Plus,
  Camera,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
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
import ItemForm from "./ItemForm";
import CompanyForm from "./CompanyForm";

const InvoiceForm = () => {
  // State for form fields
  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-000002");
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState("30"); // Default: Due On Receipt
  const [customerNotes, setCustomerNotes] = useState(
    "Thanks for your business."
  );
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [signature, setSignature] = useState(null);
  const [signatureUploadOpen, setSignatureUploadOpen] = useState(false);
  const fileInputRef = useRef(null);
  // Add this state below other state declarations (around line 74)
  const [companies, setCompanies] = useState([]);
  // Add this after the existing useEffect hooks (around line 112)
  // Change around line 94 in InvoiceForm.jsx
  useEffect(() => {
    const fetchCompaniesData = async () => {
      try {
        const response = await window.electron.getCompany();
        if (response && response.success && Array.isArray(response.companies)) {
          setCompanies(response.companies);
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (err) {
        console.error("Error fetching company data:", err);
      }
    };

    fetchCompaniesData();
  }, []);
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
  const handleSaveItem = (newItem) => {
    // You would typically add the new item to your items array here
    console.log("New item saved:", newItem);
    // You might want to implement additional logic to add the item to the list
  };

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

  // Add these functions in the InvoiceForm component
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

  const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 5;

    // Format dates properly
    const formatDate = (date) => {
      if (!date) return "";

      // If it's a Date object, format it as DD MMM YYYY
      if (date instanceof Date) {
        const options = { day: "2-digit", month: "short", year: "numeric" };
        return date.toLocaleDateString("en-US", options);
      }

      // If it's already a string, return it
      return date;
    };

    // Title
    doc.setFont(undefined, "bold");
    doc.setFontSize(14);
    doc.text("Tax Invoice", pageWidth / 2, margin - 2, { align: "center" });
    doc.setFont(undefined, "normal");

    // Main border for the entire invoice
    doc.setDrawColor(0);
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    // Top section - Company info and invoice details
    const topSectionHeight = 40;
    doc.line(
      margin,
      margin + topSectionHeight,
      pageWidth - margin,
      margin + topSectionHeight
    );

    // Vertical divider in top section
    const midX = pageWidth / 2;
    doc.line(midX, margin, midX, margin + topSectionHeight);

    // Left side - Company info with logo
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Ace Mobile Manufacturer Pvt Ltd", margin + 5, margin + 10);
    doc.setFont(undefined, "normal");
    doc.text("B-209, Park Plaza,", margin + 5, margin + 15);
    doc.text("Krishna Nagar", margin + 5, margin + 20);
    doc.text("Lucknow", margin + 5, margin + 25);
    doc.text("GSTIN/UIN: 09AAPCS1342B1ZS", margin + 5, margin + 30);
    doc.text("State Name: Uttar Pradesh, Code: 09", margin + 5, margin + 35);
    // doc.text("E-Mail: info@ace.com", margin + 5, margin + 40);

    // Right side - Invoice details in table format
    const rightX = midX + 5;
    let rightY = margin + 10;

    // Create right side grid
    // First row - headers
    doc.setFontSize(8);
    doc.rect(midX, margin, (pageWidth - margin - midX) / 2, 10);
    doc.rect(
      midX + (pageWidth - margin - midX) / 2,
      margin,
      (pageWidth - margin - midX) / 2,
      10
    );
    // doc.text("Invoice No.", rightX, rightY);
    doc.text("Invoice No.", rightX, margin + 5);
    rightY += 5;

    // Second row - invoice number and e-way bill
    doc.rect(midX, margin + 10, (pageWidth - margin - midX) / 2, 10);
    doc.rect(
      midX + (pageWidth - margin - midX) / 2,
      margin + 10,
      (pageWidth - margin - midX) / 2,
      10
    );
    doc.text(invoice.invoiceNumber || "ACM/2019/20", rightX, rightY);
    // doc.text("09100023E", midX + (pageWidth - margin - midX) / 2 + 5, rightY);
    rightY += 10;

    // Third row - headers
    doc.rect(midX, margin + 20, (pageWidth - margin - midX) / 2, 10);
    doc.rect(
      midX + (pageWidth - margin - midX) / 2,
      margin + 20,
      (pageWidth - margin - midX) / 2,
      10
    );
    doc.text("Supplier's Ref", rightX, rightY);
    // doc.text("Other Reference(s)", midX + (pageWidth - margin - midX) / 2 + 5, rightY);
    rightY += 10;

    // Fourth row
    // doc.rect(midX, margin + 30, (pageWidth - margin - midX) / 2, 10);
    // doc.rect(midX + (pageWidth - margin - midX) / 2, margin + 30, (pageWidth - margin - midX) / 2, 10);
    // doc.text("Terms of Delivery", rightX, rightY);
    // doc.text("Destination", midX + (pageWidth - margin - midX) / 2 + 5, rightY);
    // rightY += 10;

    // Separate grid for date
    doc.rect(midX, margin, (pageWidth - margin - midX) / 2, 10);
    doc.rect(
      midX + (pageWidth - margin - midX) / 2,
      margin,
      (pageWidth - margin - midX) / 2,
      10
    );
    doc.text("Dated", midX + (pageWidth - margin - midX) / 2 + 5, margin + 5);

    // Format the invoice date properly
    const formattedInvoiceDate = formatDate(invoice.invoiceDate);
    doc.text(
      formattedInvoiceDate || "15 Apr 2019",
      midX + (pageWidth - margin - midX) / 2 + 5,
      margin + 15
    );

    // Second row right column
    doc.text(
      "Mode/Terms of Payment",
      midX + (pageWidth - margin - midX) / 2 + 5,
      margin + 25
    );

    // Buyer section
    const buyerY = margin + topSectionHeight;
    const buyerHeight = 40;
    doc.line(
      margin,
      buyerY + buyerHeight,
      pageWidth - margin,
      buyerY + buyerHeight
    );

    // Vertical divider in buyer section
    doc.line(midX, buyerY, midX, buyerY + buyerHeight);

    // Buyer info
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.text("Buyer", margin + 5, buyerY + 5);
    doc.setFont(undefined, "normal");
    doc.text("The Mobile Planet", margin + 5, buyerY + 10);
    doc.text("251-1", margin + 5, buyerY + 15);
    doc.text("Krishana Palace Road", margin + 5, buyerY + 20);
    doc.text("Faizabad", margin + 5, buyerY + 25);
    doc.text("GSTIN/UIN: 09AAQCA1554H1ZQ", margin + 5, buyerY + 30);
    doc.text("State Name: Uttar Pradesh, Code: 09", margin + 5, buyerY + 35);

    // Buyer's order details
    const buyerRightX = midX + 5;
    let buyerRightY = buyerY + 5;

    // Create right side grid for buyer section
    doc.setFontSize(8);
    doc.rect(midX, buyerY, (pageWidth - margin - midX) / 2, 10);
    doc.rect(
      midX + (pageWidth - margin - midX) / 2,
      buyerY,
      (pageWidth - margin - midX) / 2,
      10
    );
    doc.text("Buyer's Order No.", buyerRightX, buyerRightY);
    doc.text("Dated", midX + (pageWidth - margin - midX) / 2 + 5, buyerRightY);
    buyerRightY += 10;

    // Second row
    doc.rect(midX, buyerY + 10, (pageWidth - margin - midX) / 2, 10);
    doc.rect(
      midX + (pageWidth - margin - midX) / 2,
      buyerY + 10,
      (pageWidth - margin - midX) / 2,
      10
    );
    doc.text("Despatch Document No.", buyerRightX, buyerRightY);
    doc.text(
      "Delivery Note Date",
      midX + (pageWidth - margin - midX) / 2 + 5,
      buyerRightY
    );
    buyerRightY += 10;

    // Third row
    doc.rect(midX, buyerY + 20, (pageWidth - margin - midX) / 2, 15);
    doc.rect(
      midX + (pageWidth - margin - midX) / 2,
      buyerY + 20,
      (pageWidth - margin - midX) / 2,
      15
    );
    doc.text("Despatched through", buyerRightX, buyerRightY);
    doc.text(
      "Destination",
      midX + (pageWidth - margin - midX) / 2 + 5,
      buyerRightY
    );

    // Items table section
    const tableY = buyerY + buyerHeight;
    const tableHeaderHeight = 10;

    // Adjusted column widths to fit the page
    const colWidths = {
      slNo: 5,
      description: 100,
      hsn: 20,
      quantity: 15,
      rate: 15,
      per: 10,
      amount: 25,
    };

    let currentX = margin;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(currentX, tableY, colWidths.slNo, tableHeaderHeight, "S");
    currentX += colWidths.slNo;
    doc.rect(currentX, tableY, colWidths.description, tableHeaderHeight, "S");
    currentX += colWidths.description;
    doc.rect(currentX, tableY, colWidths.hsn, tableHeaderHeight, "S");
    currentX += colWidths.hsn;
    doc.rect(currentX, tableY, colWidths.quantity, tableHeaderHeight, "S");
    currentX += colWidths.quantity;
    doc.rect(currentX, tableY, colWidths.rate, tableHeaderHeight, "S");
    currentX += colWidths.rate;
    doc.rect(currentX, tableY, colWidths.per, tableHeaderHeight, "S");
    currentX += colWidths.per;
    doc.rect(currentX, tableY, colWidths.amount, tableHeaderHeight, "S");

    doc.setFontSize(8);
    doc.setFont(undefined, "bold");

    // Redraw header text with new positioning
    currentX = margin;
    doc.text("Sl", currentX + 1, tableY + 6);
    currentX += colWidths.slNo;
    doc.text("Particulars", currentX + 20, tableY + 6);
    currentX += colWidths.description;
    doc.text("HSN/SAC", currentX + 5, tableY + 6);
    currentX += colWidths.hsn;
    doc.text("Qty", currentX + 5, tableY + 6);
    currentX += colWidths.quantity;
    doc.text("Rate", currentX + 5, tableY + 6);
    currentX += colWidths.rate;
    doc.text("Per", currentX + 3, tableY + 6);
    currentX += colWidths.per;
    doc.text("Amount", currentX + 5, tableY + 6);

    doc.setFont(undefined, "normal");

    // Table rows for items
    let itemY = tableY + tableHeaderHeight;
    const itemHeight = 50; // Reduced height

    // Display items or a sample item if none provided
    const itemsToDisplay =
      invoice.items && invoice.items.length > 0
        ? invoice.items
        : [
            {
              id: 1,
              details: "Ace A1-Smartphone",
              hsn: "8517",
              quantity: "500 Nos",
              rate: "6,000.00",
              per: "Nos",
              amount: "30,00,000.00",
            },
            {
              id: 2,
              details: "Ace A1 Plus-Smartphone",
              hsn: "8517",
              quantity: "800 Nos",
              rate: "7,000.00",
              per: "Nos",
              amount: "56,00,000.00",
            },
          ];

    itemsToDisplay.forEach((item, index) => {
      currentX = margin;

      // Draw item rows with adjusted widths
      doc.rect(currentX, itemY, colWidths.slNo, itemHeight, "S");
      currentX += colWidths.slNo;
      doc.rect(currentX, itemY, colWidths.description, itemHeight, "S");
      currentX += colWidths.description;
      doc.rect(currentX, itemY, colWidths.hsn, itemHeight, "S");
      currentX += colWidths.hsn;
      doc.rect(currentX, itemY, colWidths.quantity, itemHeight, "S");
      currentX += colWidths.quantity;
      doc.rect(currentX, itemY, colWidths.rate, itemHeight, "S");
      currentX += colWidths.rate;
      doc.rect(currentX, itemY, colWidths.per, itemHeight, "S");
      currentX += colWidths.per;
      doc.rect(currentX, itemY, colWidths.amount, itemHeight, "S");

      // Reset currentX for text positioning
      currentX = margin;

      // Item details
      doc.text(`${index + 1}`, currentX + 1, itemY + 10);
      currentX += colWidths.slNo;
      doc.text(item.details || `Item ${index + 1}`, currentX + 5, itemY + 10);

      if (index === 0) {
        doc.text("Batch: Batch1", currentX + 5, itemY + 15);
      } else if (index === 1) {
        doc.text("Batch: Batch1/01", currentX + 5, itemY + 15);
      }

      currentX += colWidths.description;
      doc.text(item.hsn || "8517", currentX + 5, itemY + 10);
      currentX += colWidths.hsn;
      doc.text(item.quantity || "0 Nos", currentX + 5, itemY + 10);
      currentX += colWidths.quantity;
      doc.text(item.rate || "0.00", currentX + 5, itemY + 10);
      currentX += colWidths.rate;
      doc.text(item.per || "Nos", currentX + 3, itemY + 10);
      currentX += colWidths.per;
      doc.text(item.amount || "0.00", currentX + 5, itemY + 10);

      // Output CGST and SGST rows
      const taxY = itemY + 35;
      currentX = margin;

      doc.setFont(undefined, "normal");
      doc.text("Output CGST", currentX + 8, taxY);
      currentX +=
        colWidths.slNo +
        colWidths.description +
        colWidths.hsn +
        colWidths.quantity +
        colWidths.rate +
        colWidths.per;
      doc.text("5,16,000.00", currentX + 5, taxY);

      const sgstY = taxY + 5;
      currentX = margin;
      doc.text("Output SGST", currentX + 8, sgstY);
      currentX +=
        colWidths.slNo +
        colWidths.description +
        colWidths.hsn +
        colWidths.quantity +
        colWidths.rate +
        colWidths.per;
      doc.text("5,16,000.00", currentX + 5, sgstY);

      const totalY = itemY + 45;
      currentX = margin;

      // Total row
      doc.setFont(undefined, "bold");
      doc.text("Total", currentX + 8, totalY);

      // Total Quantity
      currentX += colWidths.slNo + colWidths.description + colWidths.hsn;
      doc.text("1,300", currentX + 5, totalY);

      // Total Amount
      currentX += colWidths.quantity + colWidths.rate + colWidths.per;
      doc.text("96,32,000.00", currentX + 5, totalY);

      itemY += itemHeight;
    });

    doc.setFontSize(8);
    doc.text("Amount Chargeable (in words)", margin + 5, itemY + 7);
    doc.setFont(undefined, "bold");
    doc.text(
      "INR Ninety Six Lakh Thirty Two Thousand Only",
      margin + 80,
      itemY + 7
    );
    doc.text("E & O.E", pageWidth - margin - 10, itemY + 7, {
      align: "right",
    });
    doc.setFont(undefined, "normal");

    // Tax details table - adjusted positioning and layout
    const taxTableY = itemY + 12; // Adjusted Y position
    const fullWidth = pageWidth - 2 * margin;
    const colWidth = fullWidth / 5;

    // Main header row
    doc.rect(margin, taxTableY, colWidth, 15, "S"); // HSN/SAC
    doc.rect(margin + colWidth, taxTableY, colWidth, 15, "S"); // Taxable Value
    doc.rect(margin + colWidth * 2, taxTableY, colWidth, 15, "S"); // Central Tax
    doc.rect(margin + colWidth * 3, taxTableY, colWidth, 15, "S"); // State Tax
    doc.rect(margin + colWidth * 4, taxTableY, colWidth, 15, "S"); // Total

    // Headers
    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.text("HSN/SAC", margin + colWidth / 2 - 10, taxTableY + 10);
    doc.text("Taxable Value", margin + colWidth * 1.5 - 10, taxTableY + 10);
    doc.text("Central Tax", margin + colWidth * 2.5 - 8, taxTableY + 10);
    doc.text("State Tax", margin + colWidth * 3.5 - 8, taxTableY + 10);
    doc.text("Total Tax Amount", margin + colWidth * 4.5 - 10, taxTableY + 10);

    // Sub-headers for tax columns
    const subHeaderY = taxTableY + 15;
    // Central Tax sub-headers
    doc.rect(margin + colWidth * 2, subHeaderY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 2.5, subHeaderY, colWidth / 2, 10, "S");
    doc.text("Rate", margin + colWidth * 2.25 - 2, subHeaderY + 7);
    doc.text("Amount", margin + colWidth * 2.75 - 5, subHeaderY + 7);

    // State Tax sub-headers
    doc.rect(margin + colWidth * 3, subHeaderY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 3.5, subHeaderY, colWidth / 2, 10, "S");
    doc.text("Rate", margin + colWidth * 3.25 - 2, subHeaderY + 7);
    doc.text("Amount", margin + colWidth * 3.75 - 5, subHeaderY + 7);

    // Data row
    const dataY = subHeaderY + 10;
    doc.setFont(undefined, "normal");
    doc.rect(margin, dataY, colWidth, 10, "S");
    doc.rect(margin + colWidth, dataY, colWidth, 10, "S");
    doc.rect(margin + colWidth * 2, dataY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 2.5, dataY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 3, dataY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 3.5, dataY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 4, dataY, colWidth, 10, "S");

    // Data values
    doc.text("8517", margin + 20, dataY + 7);
    doc.text("86,00,000.00", margin + colWidth + 10, dataY + 7);
    doc.text("6%", margin + colWidth * 2.25 - 2, dataY + 7);
    doc.text("5,16,000.00", margin + colWidth * 2.75 - 7, dataY + 7);
    doc.text("6%", margin + colWidth * 3.25 - 2, dataY + 7);
    doc.text("5,16,000.00", margin + colWidth * 3.75 - 7, dataY + 7);
    doc.text("10,32,000.00", margin + colWidth * 4.5 - 10, dataY + 7);

    // Total row
    const totalY = dataY + 10;
    doc.rect(margin, totalY, colWidth, 10, "S");
    doc.rect(margin + colWidth, totalY, colWidth, 10, "S");
    doc.rect(margin + colWidth * 2, totalY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 2.5, totalY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 3, totalY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 3.5, totalY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 4, totalY, colWidth, 10, "S");

    doc.setFont(undefined, "bold");
    doc.text("Total", margin + 20, totalY + 7);
    doc.text("86,00,000.00", margin + colWidth + 10, totalY + 7);
    doc.text("5,16,000.00", margin + colWidth * 2.75 - 7, totalY + 7);
    doc.text("5,16,000.00", margin + colWidth * 3.75 - 7, totalY + 7);
    doc.text("10,32,000.00", margin + colWidth * 4.5 - 10, totalY + 7);

    // Tax amount in words
    const taxWordsY = totalY + 15;
    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.text("Tax Amount (in words) :", margin + 5, taxWordsY);
    doc.setFont(undefined, "bold");
    doc.text("INR Ten Lakh Thirty Two Thousand Only", margin + 80, taxWordsY);

    // Declaration section
    const declarationY = taxTableY + 95;
    const declarationHeight = 20;

    doc.rect(
      margin,
      declarationY,
      (2 * (pageWidth - 2 * margin)) / 3,
      declarationHeight,
      "S"
    );
    doc.rect(
      margin + (2 * (pageWidth - 2 * margin)) / 3,
      declarationY,
      (pageWidth - 2 * margin) / 3,
      declarationHeight,
      "S"
    );

    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.text("Declaration", margin + 5, declarationY + 5);
    doc.setFont(undefined, "normal");
    doc.text(
      "We declare that this invoice shows the actual price of the",
      margin + 5,
      declarationY + 10
    );
    doc.text(
      "goods described and that all particulars are true and correct",
      margin + 5,
      declarationY + 15
    );

    // Add signature if available
    if (signature) {
      // Position for signature image (adjust as needed)
      const signatureX = pageWidth - margin - 50;
      const signatureY = declarationY + 5;
      const signatureWidth = 40;
      const signatureHeight = 15;

      // Add signature image
      doc.addImage(
        signature,
        "PNG", // or appropriate format
        signatureX,
        signatureY,
        signatureWidth,
        signatureHeight
      );
    }

    // Add "Authorized Signatory" text below where the signature would be
    doc.text(
      "Authorized Signatory",
      pageWidth - margin - 35,
      declarationY + 25
    );

    // Computer generated invoice text at bottom
    doc.setFontSize(9);
    doc.text(
      "This is a Computer Generated Invoice",
      pageWidth / 2,
      pageHeight - margin - 5,
      { align: "center" }
    );

    return doc;
  };

  // Handle saving new customer
  const handleSaveCustomer = (customerData) => {
    // Process the new customer data
    console.log("New customer data:", customerData);

    // Here you would typically add the customer to your data source
    // For example:
    // setCustomerData(prevData => [...prevData, customerData]);
    // refreshCustomerList();

    // Additional logic for saving customer to backend, etc.
  };
  // Handle form submission
  const handleSubmit = (isDraft = false) => {
    // Create the invoice object
    const invoice = {
      customerName,
      invoiceNumber,
      invoiceDate,
      dueDate,
      items,
      subtotal,
      total,
      customerNotes,
      termsAndConditions,
      status: isDraft ? "draft" : "sent",
    };

    console.log("Saving invoice:", invoice);

    // Save the invoice (to backend in a real app)
    setSavedInvoice(invoice);

    try {
      // Generate PDF with signature
      const doc = generateInvoicePDF({ ...invoice, signature });
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      // Show download dialog
      setShowDownloadDialog(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
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

      // Close dialog
      setShowDownloadDialog(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    console.log("Cancelled");
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
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select or add company" />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <Command className="rounded-md border-none bg-background">
                        <div className="p-2 border-b flex gap-2">
                          <div className="relative flex-1">
                            <CommandInput
                              placeholder="Search companies..."
                              className="h-10"
                            />
                          </div>
                          <Button
                            size="sm"
                            className="h-10"
                            onClick={() => setCompanyFormOpen(true)}
                          >
                            {/* Add company */}
                            <Plus className="h-4 w-4" /> Add
                          </Button>
                        </div>
                        <CommandEmpty>
                          <div className="p-4 max-w-[600px] text-center text-muted-foreground">
                            <p className="text-md">
                              No matching companies found
                            </p>
                            <p className="text-sm mt-1">
                              Click the{" "}
                              <Plus className="h-3 w-3 inline-block mx-1" />{" "}
                              icon above to add a new company
                            </p>
                          </div>
                        </CommandEmpty>
                        <div className="max-h-[200px] overflow-y-auto">
                          <CommandGroup>
                            {companies.length > 0 ? (
                              companies.map((company) => (
                                <CommandItem
                                  key={company.id}
                                  className="flex items-center"
                                  onSelect={() => {
                                    // Here you can handle what happens when a company is selected
                                    console.log("Selected company:", company);
                                    // You might want to store the selected company in state
                                  }}
                                >
                                  <div className="flex-1">
                                    <Check className="mr-2 h-4 w-4 opacity-0" />
                                    {company.companyName}
                                  </div>
                                </CommandItem>
                              ))
                            ) : (
                              <CommandItem>No companies found</CommandItem>
                            )}
                          </CommandGroup>
                        </div>
                      </Command>
                    </SelectContent>
                  </Select>
                </div>
                {/* Render the CompanyForm dialog */}
                <CompanyForm
                  open={companyFormOpen}
                  onOpenChange={setCompanyFormOpen}
                  onSave={(newCompany) => {
                    console.log("New company saved:", newCompany);
                    // Add the new company to the companies state
                    setCompanies((prevCompanies) => [
                      ...prevCompanies,
                      newCompany,
                    ]);
                  }}
                />
                <Label htmlFor="customerName" className="w-30 pt-2 ml-6">
                  Customer Name
                </Label>
                <div className="flex-1">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select or add customer" />
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
                            <CommandItem className="flex items-center">
                              <div className="flex-1">
                                <Check className="mr-2 h-4 w-4 opacity-0" />
                                Customer Name
                              </div>
                            </CommandItem>
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
                <div className="flex-1 relative">
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
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
                        {invoiceDate
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
                    onValueChange={handleTermsChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Due On Receipt</SelectItem>
                      <SelectItem value="15">Net 15</SelectItem>
                      <SelectItem value="30">Net 30</SelectItem>
                      <SelectItem value="45">Net 45</SelectItem>
                      <SelectItem value="60">Net 60</SelectItem>
                      <SelectItem value="90">Net 90</SelectItem>
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
                        {dueDate ? format(dueDate, "dd/MM/yyyy") : "DD/MM/YYYY"}
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
                            <Select className="w-full">
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select or add item" />
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
                                    <div className="p-4 max-w-600 text-center text-muted-foreground">
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
                                  <div className="max-h-200 overflow-y-auto">
                                    <CommandGroup>
                                      <CommandItem className="flex items-center">
                                        <div className="flex-1">
                                          <Check className="mr-2 h-4 w-4 opacity-0" />
                                          Item Name
                                        </div>
                                      </CommandItem>
                                    </CommandGroup>
                                  </div>
                                </Command>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>

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
                  {/* Render the ItemForm dialog */}
                  <ItemForm
                    open={itemFormOpen}
                    onOpenChange={setItemFormOpen}
                    onSave={handleSaveItem}
                  />
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
                {/* <div className="flex-1">
                  <p className="text-gray-500 text-sm mb-2">
                    Upload an image of your signature to be included in the PDF.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={triggerFileInput}
                    className="text-blue-500"
                  >
                    Upload Signature
                  </Button>
                </div> */}
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

      {/* <CustomerForm
        open={customerFormOpen}
        onOpenChange={setCustomerFormOpen}
        onSave={handleSaveCustomer}
      /> */}
    </div>
  );
};

export default InvoiceForm;
