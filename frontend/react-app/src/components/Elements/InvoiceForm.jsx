import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Textarea } from "../ui/textarea"
import { SPlus, ChevronDown, ChevronUp, X, Download } from "lucide-react"
import { format } from "date-fns"
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

const InvoiceForm = () => {
  // State for form fields
  const [showTotalSummary, setShowTotalSummary] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-000002");
  const [invoiceDate, setInvoiceDate] = useState(
    format(new Date(), "dd/MM/yyyy")
  );
  const [dueDate, setDueDate] = useState(
    format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), "dd/MM/yyyy")
  );
  const [customerNotes, setCustomerNotes] = useState(
    "Thanks for your business."
  );
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  // State for invoice items
  const [items, setItems] = useState([
    { id: 1, details: "", quantity: "1.00", rate: "0.00", amount: "0.00" },
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

  // Generate PDF invoice
  const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;

    // Border for the entire page
    doc.setDrawColor(0);
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    // Company info in header (left side)
    doc.setFontSize(10);
    doc.text("hello", margin + 5, margin + 10);
    doc.text("Maharashtra", margin + 5, margin + 15);
    doc.text("India", margin + 5, margin + 20);
    doc.text("mac.glenn6978@gmail.com", margin + 5, margin + 25);

    // Invoice title (right side)
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("TAX INVOICE", pageWidth - margin - 30, margin + 15);
    doc.setFont(undefined, "normal");

    // Invoice info section
    const invoiceInfoY = margin + 30;
    const invoiceInfoHeight = 40;

    // Draw box for invoice info
    doc.rect(margin, invoiceInfoY, pageWidth / 2 - margin, invoiceInfoHeight);
    doc.rect(
      pageWidth / 2,
      invoiceInfoY,
      pageWidth / 2 - margin,
      invoiceInfoHeight
    );

    // Left side invoice info content
    doc.setFontSize(10);
    let yPos = invoiceInfoY + 8;

    doc.text("#", margin + 5, yPos);
    doc.text(": INV-000002", margin + 25, yPos);
    yPos += lineHeight;

    doc.text("Invoice Date", margin + 5, yPos);
    doc.text(`: ${invoice.invoiceDate}`, margin + 25, yPos);
    yPos += lineHeight;

    doc.text("Status", margin + 5, yPos);
    doc.text(": Due On Receipt", margin + 25, yPos);
    yPos += lineHeight;

    doc.text("Due Date", margin + 5, yPos);
    doc.text(`: ${invoice.dueDate}`, margin + 25, yPos);
    yPos += lineHeight;

    doc.text("P.O.#", margin + 5, yPos);
    doc.text(": SO-17", margin + 25, yPos);

    // Address section
    const addressY = invoiceInfoY + invoiceInfoHeight;
    const addressHeight = 40;

    // Draw boxes for addresses
    doc.rect(margin, addressY, pageWidth / 2 - margin, addressHeight);
    doc.rect(pageWidth / 2, addressY, pageWidth / 2 - margin, addressHeight);

    // Bill To content
    yPos = addressY + 8;
    doc.text("Bill To", margin + 5, yPos);
    yPos += lineHeight;
    doc.text("Rob & Joe Traders", margin + 5, yPos);
    yPos += lineHeight;
    doc.text("24, Richa Street", margin + 5, yPos);
    yPos += lineHeight;
    doc.text("Chennai", margin + 5, yPos);
    yPos += lineHeight;
    doc.text("631605 Tamil Nadu", margin + 5, yPos);
    yPos += lineHeight;
    doc.text("India", margin + 5, yPos);

    // Ship To content
    yPos = addressY + 8;
    doc.text("Ship To", pageWidth / 2 + 5, yPos);
    yPos += lineHeight;
    doc.text("24, Richa Street", pageWidth / 2 + 5, yPos);
    yPos += lineHeight;
    doc.text("Chennai", pageWidth / 2 + 5, yPos);
    yPos += lineHeight;
    doc.text("631605 Tamil Nadu", pageWidth / 2 + 5, yPos);
    yPos += lineHeight;
    doc.text("India", pageWidth / 2 + 5, yPos);

    // Subject section
    const subjectY = addressY + addressHeight;
    const subjectHeight = 15;

    // Draw box for subject
    doc.rect(margin, subjectY, pageWidth - 2 * margin, subjectHeight);

    yPos = subjectY + 8;
    doc.text("Subject :", margin + 5, yPos);
    doc.text("Description", margin + 40, yPos);

    // Items table
    const tableHeaderY = subjectY + subjectHeight;
    const tableWidth = pageWidth - 2 * margin;

    // Calculate column widths
    const colWidths = {
      num: 15,
      desc: 130,
      qty: 30,
      rate: 30,
      discount: 30,
      taxPct: 30,
      tax: 30,
      amount: 30,
    };

    // Draw table header cells
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, tableHeaderY, colWidths.num, 10, "F");
    doc.rect(margin + colWidths.num, tableHeaderY, colWidths.desc, 10, "F");
    doc.rect(
      margin + colWidths.num + colWidths.desc,
      tableHeaderY,
      colWidths.qty,
      10,
      "F"
    );
    doc.rect(
      margin + colWidths.num + colWidths.desc + colWidths.qty,
      tableHeaderY,
      colWidths.rate,
      10,
      "F"
    );
    doc.rect(
      margin + colWidths.num + colWidths.desc + colWidths.qty + colWidths.rate,
      tableHeaderY,
      colWidths.discount,
      10,
      "F"
    );

    // Header text
    doc.setFont(undefined, "bold");
    doc.text("#", margin + 5, tableHeaderY + 7);
    doc.text(
      "Item & Description",
      margin + colWidths.num + 5,
      tableHeaderY + 7
    );
    doc.text(
      "Qty",
      margin + colWidths.num + colWidths.desc + 10,
      tableHeaderY + 7
    );
    doc.text(
      "Rate",
      margin + colWidths.num + colWidths.desc + colWidths.qty + 10,
      tableHeaderY + 7
    );
    doc.text(
      "Discount",
      margin +
        colWidths.num +
        colWidths.desc +
        colWidths.qty +
        colWidths.rate +
        5,
      tableHeaderY + 7
    );
    doc.setFont(undefined, "normal");

    // Draw item rows
    let tableY = tableHeaderY + 10;
    const rowHeight = 10;

    // Display at least one item or the items from the invoice
    const itemsToDisplay =
      invoice.items.length > 0
        ? invoice.items
        : [
            {
              id: 1,
              details: "Item 1",
              quantity: "1.00",
              rate: "0.00",
              amount: "0.00",
            },
          ];

    itemsToDisplay.forEach((item, index) => {
      // Draw row cells
      doc.rect(margin, tableY, colWidths.num, rowHeight);
      doc.rect(margin + colWidths.num, tableY, colWidths.desc, rowHeight);
      doc.rect(
        margin + colWidths.num + colWidths.desc,
        tableY,
        colWidths.qty,
        rowHeight
      );
      doc.rect(
        margin + colWidths.num + colWidths.desc + colWidths.qty,
        tableY,
        colWidths.rate,
        rowHeight
      );
      doc.rect(
        margin +
          colWidths.num +
          colWidths.desc +
          colWidths.qty +
          colWidths.rate,
        tableY,
        colWidths.discount,
        rowHeight
      );

      // Row text
      doc.text(`${index + 1}`, margin + 5, tableY + 7);
      doc.text(
        item.details || `Item ${index + 1}`,
        margin + colWidths.num + 5,
        tableY + 7
      );
      doc.text(
        item.quantity,
        margin + colWidths.num + colWidths.desc + 10,
        tableY + 7
      );
      doc.text(
        item.rate,
        margin + colWidths.num + colWidths.desc + colWidths.qty + 10,
        tableY + 7
      );
      doc.text(
        "0.00",
        margin +
          colWidths.num +
          colWidths.desc +
          colWidths.qty +
          colWidths.rate +
          10,
        tableY + 7
      );

      tableY += rowHeight;
    });

    // Total section
    tableY += 10;

    // Left side - Total in words
    doc.text("Total In Words:", margin, tableY + 5);
    doc.setFontSize(8);
    doc.setFont(undefined, "italic");
    doc.text(
      "Indian Rupee Six Hundred Sixty-Two and Seventy-Five Paise Only",
      margin,
      tableY + 12
    );
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    // Right side - Calculations
    const rightColX = pageWidth - margin - 70;
    const valueColX = pageWidth - margin - 15;

    doc.text("Sub Total", rightColX, tableY);
    doc.text("0.00", valueColX, tableY, { align: "right" });
    tableY += 7;

    doc.text("Discount", rightColX, tableY);
    doc.text("0.00", valueColX, tableY, { align: "right" });
    tableY += 7;

    doc.text("Sample Tax1 (4.70%)", rightColX, tableY);
    doc.text("11.75", valueColX, tableY, { align: "right" });
    tableY += 7;

    doc.text("Sample Tax2 (7.00%)", rightColX, tableY);
    doc.text("21.00", valueColX, tableY, { align: "right" });
    tableY += 7;

    doc.setFont(undefined, "bold");
    doc.text("Total", rightColX, tableY);
    doc.text("0.00", valueColX, tableY, { align: "right" });
    tableY += 7;
    doc.setFont(undefined, "normal");

    doc.text("Payment Made", rightColX, tableY);
    doc.text("(-) 100.00", valueColX, tableY, { align: "right" });
    tableY += 7;

    doc.setFont(undefined, "bold");
    doc.text("Balance Due", rightColX, tableY);
    doc.text("-100.00", valueColX, tableY, { align: "right" });
    doc.setFont(undefined, "normal");

    // Notes section
    tableY += 15;
    doc.text("Notes:", margin, tableY);
    tableY += 7;
    doc.text("Thanks for your business.", margin, tableY);

    // Payment options
    tableY += 10;
    doc.text("Payment Options:", margin, tableY);

    // PayPal button
    doc.setFillColor(0, 102, 164);
    doc.rect(margin + 60, tableY - 4, 40, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("PayPal", margin + 75, tableY + 3);
    doc.setTextColor(0, 0, 0);

    // Terms and conditions
    tableY += 15;
    doc.text("Terms & Conditions:", margin, tableY);
    tableY += 7;
    doc.text(
      "Your company's Terms and Conditions will be displayed here.",
      margin,
      tableY
    );

    // Authorized signature
    doc.text(
      "Authorized Signature",
      pageWidth - margin - 40,
      pageHeight - margin - 10
    );

    return doc;
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
      // Generate PDF
      const doc = generateInvoicePDF(invoice);
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
      <Tabs defaultValue="single-stock">
        <TabsList className="grid w-[500px] grid-cols-2 pb-10">
          <TabsTrigger value="single-stock">Single-Stock</TabsTrigger>
          <TabsTrigger value="multi-stock">Multi-Stock</TabsTrigger>
        </TabsList>
        <TabsContent value="single-stock">
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
                    {/* Customer Name */}
                    <div className="flex items-start gap-4">
                      <Label htmlFor="companyName" className="w-32 pt-2">
                        Company Name
                      </Label>
                      <div className="flex-1 flex gap-2 ">
                        <Select
                          value={customerName}
                          onValueChange={setCustomerName}
                        >
                          <SelectTrigger id="customerName" className="flex-1">
                            <SelectValue placeholder="Select or add a customer" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Label htmlFor="customerName" className="w-30 pt-2 ml-6">
                        Customer Name
                      </Label>
                      <div className="flex-1 flex gap-2">
                        <Select
                          value={customerName}
                          onValueChange={setCustomerName}
                        >
                          <SelectTrigger id="customerName" className="flex-1">
                            <SelectValue placeholder="Select or add a customer" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Invoice Number */}
                    <div className="flex items-start gap-4">
                      <Label htmlFor="invoiceNumber" className="w-32 pt-2">
                        Voucher No.
                      </Label>
                      <div className="flex-1 relative">
                        <Input
                          id="invoiceNumber"
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                        />
                      </div>

                      <Label htmlFor="incomeLedger" className="w-28 pt-2 ml-6">
                        Income Ledger
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
                        <Input
                          id="invoiceDate"
                          type="text"
                          placeholder="DD/MM/YYYY"
                          className="flex-1"
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                        />
                      </div>
                      <Label htmlFor="dueDate" className="w-28 pt-2 ml-6">
                        Due Date
                      </Label>
                      <div className="flex-1 relative">
                        <Input
                          id="dueDate"
                          type="text"
                          placeholder="DD/MM/YYYY"
                          className="flex-1"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                        />
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
                            <TableHead className="w-[50%]">
                              ITEM DETAILS
                            </TableHead>
                            <TableHead className="text-center">
                              QUANTITY
                            </TableHead>
                            <TableHead className="text-center">RATE</TableHead>
                            <TableHead className="text-center">
                              AMOUNT
                            </TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Input
                                  placeholder="Type or click to select an item."
                                  className="border-0 bg-transparent"
                                  value={item.details}
                                  onChange={(e) => {
                                    const updatedItems = items.map((i) =>
                                      i.id === item.id
                                        ? { ...i, details: e.target.value }
                                        : i
                                    );
                                    setItems(updatedItems);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  value={item.quantity}
                                  className="text-center border-0 bg-transparent"
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
                                  className="text-center border-0 bg-transparent"
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
                                  className="text-center border-0 bg-transparent"
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
                            const newRows = Array.from(
                              { length: 5 },
                              (_, index) => ({
                                id: items.length + index + 1,
                                details: "",
                                quantity: "1.00",
                                rate: "0.00",
                                amount: "0.00",
                              })
                            );
                            setItems([...items, ...newRows]);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Items in Bulk</span>
                        </Button>
                      </div>

                      {/* Total Section */}
                      <div className="flex justify-between items-center mt-6 border-t pt-4">
                        <div></div>
                        <div className="w-1/3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-black font-bold">
                              Total ( ₹ )
                            </span>
                            <span className="font-medium">
                              {total.toFixed(2)}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-black flex items-center gap-1 p-0 h-auto hover:bg-white"
                            onClick={() =>
                              setShowTotalSummary(!showTotalSummary)
                            }
                          >
                            <span>Show Total Summary</span>
                            {showTotalSummary ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>

                          {showTotalSummary && (
                            <div className="mt-2 space-y-2 border-t pt-2">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                              </div>
                              {/* Add taxes or discounts here if needed */}
                              <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/*  Customer Notes */}
                    <div className="mt-6">
                      <Label htmlFor="customerNotes" className="block mb-2">
                        Customer Notes
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
                        <Label
                          htmlFor="termsAndConditions"
                          className="block mb-2"
                        >
                          Terms and Conditions
                        </Label>
                        <Textarea
                          id="termsAndConditions"
                          placeholder="Enter your terms and conditions here."
                          className="max-w-[500px]"
                          value={termsAndConditions}
                          onChange={(e) =>
                            setTermsAndConditions(e.target.value)
                          }
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
                        <span>
                          {showTerms ? "Hide" : "Add"} Terms and conditions
                        </span>
                      </Button>
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
                    <AlertDialogTitle>
                      Invoice Saved Successfully
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Your invoice has been saved. Would you like to download a
                      PDF copy?
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
          </TabsContent>

          <TabsContent value="multi-stock">
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
                    {/* Customer Name */}
                    <div className="flex items-start gap-4">
                      <Label htmlFor="companyName" className="w-32 pt-2">
                        Company Name
                      </Label>
                      <div className="flex-1 flex gap-2 ">
                        <Select
                          value={customerName}
                          onValueChange={setCustomerName}
                        >
                          <SelectTrigger id="customerName" className="flex-1">
                            <SelectValue placeholder="Select or add a customer" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Label htmlFor="customerName" className="w-28 pt-2 ml-6">
                        Party Name
                      </Label>
                      <div className="flex-1 flex gap-2">
                        <Select
                          value={customerName}
                          onValueChange={setCustomerName}
                        >
                          <SelectTrigger id="customerName" className="flex-1">
                            <SelectValue placeholder="Select or add a customer" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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

                      <Label htmlFor="voucherName" className="w-28 pt-2 ml-6">
                        Voucher Name
                      </Label>
                      <div className="flex-1 relative">
                        <Input id="voucherName" value="Sales" disabled />
                      </div>
                    </div>

                    {/* Invoice Date and Terms */}
                    <div className="flex items-start gap-4">
                      <Label htmlFor="invoiceDate" className="w-32 pt-2">
                        Invoice Date
                      </Label>
                      <div className="flex-1 relative">
                        <Input
                          id="invoiceDate"
                          type="text"
                          placeholder="DD/MM/YYYY"
                          className="flex-1"
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                        />
                      </div>
                      <Label htmlFor="dueDate" className="w-28 pt-2 ml-6">
                        Due Date
                      </Label>
                      <div className="flex-1 relative">
                        <Input
                          id="dueDate"
                          type="text"
                          placeholder="DD/MM/YYYY"
                          className="flex-1"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                        />
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
                            <TableHead className="w-[50%]">
                              ITEM DETAILS
                            </TableHead>
                            <TableHead className="text-center">
                              QUANTITY
                            </TableHead>
                            <TableHead className="text-center">RATE</TableHead>
                            <TableHead className="text-center">
                              AMOUNT
                            </TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Input
                                  placeholder="Type or click to select an item."
                                  className="border-0 bg-transparent"
                                  value={item.details}
                                  onChange={(e) => {
                                    const updatedItems = items.map((i) =>
                                      i.id === item.id
                                        ? { ...i, details: e.target.value }
                                        : i
                                    );
                                    setItems(updatedItems);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  value={item.quantity}
                                  className="text-center border-0 bg-transparent"
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
                                  className="text-center border-0 bg-transparent"
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
                                  className="text-center border-0 bg-transparent"
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
                            const newRows = Array.from(
                              { length: 5 },
                              (_, index) => ({
                                id: items.length + index + 1,
                                details: "",
                                quantity: "1.00",
                                rate: "0.00",
                                amount: "0.00",
                              })
                            );
                            setItems([...items, ...newRows]);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Items in Bulk</span>
                        </Button>
                      </div>

                      {/* Total Section */}
                      <div className="flex justify-between items-center mt-6 border-t pt-4">
                        <div></div>
                        <div className="w-1/3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-black font-bold">
                              Total ( ₹ )
                            </span>
                            <span className="font-medium">
                              {total.toFixed(2)}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-black flex items-center gap-1 p-0 h-auto hover:bg-white"
                            onClick={() =>
                              setShowTotalSummary(!showTotalSummary)
                            }
                          >
                            <span>Show Total Summary</span>
                            {showTotalSummary ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>

                          {showTotalSummary && (
                            <div className="mt-2 space-y-2 border-t pt-2">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                              </div>
                              {/* Add taxes or discounts here if needed */}
                              <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/*  Customer Notes */}
                    <div className="mt-6">
                      <Label htmlFor="customerNotes" className="block mb-2">
                        Customer Notes
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
                        <Label
                          htmlFor="termsAndConditions"
                          className="block mb-2"
                        >
                          Terms and Conditions
                        </Label>
                        <Textarea
                          id="termsAndConditions"
                          placeholder="Enter your terms and conditions here."
                          className="max-w-[500px]"
                          value={termsAndConditions}
                          onChange={(e) =>
                            setTermsAndConditions(e.target.value)
                          }
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
                        <span>
                          {showTerms ? "Hide" : "Add"} Terms and conditions
                        </span>
                      </Button>
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
                    <AlertDialogTitle>
                      Invoice Saved Successfully
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Your invoice has been saved. Would you like to download a
                      PDF copy?
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
          </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceForm;
