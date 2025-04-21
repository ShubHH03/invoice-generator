import { jsPDF } from "jspdf";

/**
 * Generate an invoice PDF document based on provided invoice data
 * @param {Object} invoice - Invoice data object containing company, customer, items, and other details
 * @returns {jsPDF} - The generated PDF document object
 */
export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const lineHeight = 5;

  // Helper function to format currency values consistently
  const formatCurrency = (value) => {
    const numericValue = parseFloat(value) || 0;
    return numericValue.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  };

  // Helper function to format dates consistently
  const formatDate = (date) => {
    if (!date) return "";

    try {
      // If it's a Date object, format it as DD MMM YYYY
      if (date instanceof Date) {
        const options = { day: "2-digit", month: "short", year: "numeric" };
        return date.toLocaleDateString("en-US", options);
      }

      // If it's already a string, return it
      return date;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Convert number to words - simplified Indian numbering system
  const numberToWords = (num) => {
    // This is a simple implementation - a more comprehensive solution would be needed for production
    if (num === 0) return "Zero";

    const single = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const double = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const unitSize = ["", "Thousand", "Lakh", "Crore"];

    let words = "";
    let numStr = num.toString();
    let isNegative = false;

    if (numStr.charAt(0) === "-") {
      isNegative = true;
      numStr = numStr.slice(1);
    }

    // Handle decimals
    let decimal = "";
    if (numStr.includes(".")) {
      const parts = numStr.split(".");
      numStr = parts[0];
      decimal = parts[1];
      if (decimal) {
        decimal =
          " Point " +
          decimal
            .split("")
            .map((d) => single[parseInt(d)])
            .join(" ");
      }
    }

    // Example simple implementation - needs more work for a full solution
    if (parseFloat(numStr) < 100) {
      if (parseFloat(numStr) < 10) {
        words = single[parseFloat(numStr)];
      } else if (parseFloat(numStr) < 20) {
        words = double[parseFloat(numStr) - 10];
      } else {
        words =
          tens[Math.floor(parseFloat(numStr) / 10)] +
          " " +
          single[parseFloat(numStr) % 10];
      }
    } else {
      words = "INR " + parseFloat(numStr).toFixed(2) + " Only"; // Simplified
    }

    return (isNegative ? "Negative " : "") + words.trim() + decimal;
  };

  // Function to calculate totals from items
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => {
      const itemAmount =
        parseFloat(item.amount) ||
        parseFloat(item.quantity) * parseFloat(item.rate) ||
        0;
      return sum + itemAmount;
    }, 0);

    // Calculate tax amounts based on tax rates or use provided values
    const cgstRate = invoice.cgstRate || 9; // Default to 9% unless specified
    const sgstRate = invoice.sgstRate || 9; // Default to 9% unless specified

    const cgstAmount = subtotal * (cgstRate / 100);
    const sgstAmount = subtotal * (sgstRate / 100);
    const totalTax = cgstAmount + sgstAmount;
    const grandTotal = subtotal + totalTax;

    return {
      subtotal,
      cgstRate,
      sgstRate,
      cgstAmount,
      sgstAmount,
      totalTax,
      grandTotal,
    };
  };

  // Calculate all totals for the invoice
  const totals = calculateTotals(invoice.items || []);

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
  doc.text(
    invoice.company?.companyName || "Company Name",
    margin + 5,
    margin + 10
  );
  doc.setFont(undefined, "normal");
  doc.text(
    invoice.company?.addressLine1 || "Address Line 1",
    margin + 5,
    margin + 15
  );
  doc.text(
    invoice.company?.addressLine2 || "Address Line 2",
    margin + 5,
    margin + 20
  );
  doc.text(invoice.company?.city || "City", margin + 5, margin + 25);
  doc.text(
    `GSTIN/UIN: ${invoice.company?.gstin || "GSTIN"}`,
    margin + 5,
    margin + 30
  );
  doc.text(
    `State Name: ${invoice.company?.state || "State"}, Code: ${
      invoice.company?.stateCode || "Code"
    }`,
    margin + 5,
    margin + 35
  );

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
  doc.text("Invoice No.", rightX, margin + 5);
  rightY += 5;

  // Second row - invoice number
  doc.rect(midX, margin + 10, (pageWidth - margin - midX) / 2, 10);
  doc.rect(
    midX + (pageWidth - margin - midX) / 2,
    margin + 10,
    (pageWidth - margin - midX) / 2,
    10
  );
  doc.text(invoice.invoiceNumber || "", rightX, rightY);
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
  rightY += 10;

  // Separate grid for date
  doc.rect(midX, margin, (pageWidth - margin - midX) / 2, 10);
  doc.rect(
    midX + (pageWidth - margin - midX) / 2,
    margin,
    (pageWidth - margin - midX) / 2,
    10
  );
  doc.text("Dated", midX + (pageWidth - margin - midX) / 2 + 5, margin + 5);

  // Format the invoice date
  const formattedInvoiceDate = formatDate(invoice.invoiceDate);
  doc.text(
    formattedInvoiceDate || "",
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

  // Buyer info - Use actual customer details from invoice
  const customer = invoice.customer || {};
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("Buyer", margin + 5, buyerY + 5);
  doc.setFont(undefined, "normal");
  doc.text(
    customer.name || invoice.customerName || "Customer Name",
    margin + 5,
    buyerY + 10
  );
  doc.text(customer.addressLine1 || "", margin + 5, buyerY + 15);
  doc.text(customer.addressLine2 || "", margin + 5, buyerY + 20);
  doc.text(customer.city || "", margin + 5, buyerY + 25);
  doc.text(`GSTIN/UIN: ${customer.gstin || ""}`, margin + 5, buyerY + 30);
  doc.text(
    `State Name: ${customer.state || ""}, Code: ${customer.stateCode || ""}`,
    margin + 5,
    buyerY + 35
  );

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

  // Table header
  let currentX = margin;
  doc.setFillColor(240, 240, 240);

  // Draw table header cells
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

  // Draw header text
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
  const itemHeight = 25; // Reduced height
  let totalQuantity = 0;

  // Use actual invoice items
  const itemsToDisplay =
    invoice.items && invoice.items.length > 0 ? invoice.items : [];

  // Process each item in the invoice
  itemsToDisplay.forEach((item, index) => {
    currentX = margin;

    // Calculate quantities for totals
    const itemQty = parseFloat(item.quantity) || 0;
    totalQuantity += itemQty;

    // Draw item row cells
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
    doc.text(`${index + 1}`, currentX + 1, itemY + 5);
    currentX += colWidths.slNo;

    // Item description - handle multiline if needed
    const description = item.details || item.name || `Item ${index + 1}`;
    doc.text(description, currentX + 5, itemY + 5);

    // Add batch info if available
    if (item.batch) {
      doc.text(`Batch: ${item.batch}`, currentX + 5, itemY + 10);
    }

    currentX += colWidths.description;
    doc.text(item.hsn || "", currentX + 5, itemY + 5);
    currentX += colWidths.hsn;
    doc.text(item.quantity || "0", currentX + 5, itemY + 5);
    currentX += colWidths.quantity;
    doc.text(formatCurrency(item.rate || 0), currentX + 5, itemY + 5);
    currentX += colWidths.rate;
    doc.text(item.per || "Nos", currentX + 3, itemY + 5);
    currentX += colWidths.per;
    doc.text(
      formatCurrency(item.amount || item.quantity * item.rate || 0),
      currentX + 5,
      itemY + 5
    );

    itemY += itemHeight;
  });

  // Output CGST and SGST rows
  const taxY = itemY + 10;
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
  doc.text(formatCurrency(totals.cgstAmount), currentX + 5, taxY);

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
  doc.text(formatCurrency(totals.sgstAmount), currentX + 5, sgstY);

  const totalY = sgstY + 10;
  currentX = margin;

  // Total row
  doc.setFont(undefined, "bold");
  doc.text("Total", currentX + 8, totalY);

  // Total Quantity
  currentX += colWidths.slNo + colWidths.description + colWidths.hsn;
  doc.text(totalQuantity.toString(), currentX + 5, totalY);

  // Total Amount
  currentX += colWidths.quantity + colWidths.rate + colWidths.per;
  doc.text(formatCurrency(totals.grandTotal), currentX + 5, totalY);

  // Amount in words
  doc.setFontSize(8);
  doc.text("Amount Chargeable (in words)", margin + 5, totalY + 10);
  doc.setFont(undefined, "bold");
  doc.text(numberToWords(totals.grandTotal), margin + 80, totalY + 10);
  doc.text("E & O.E", pageWidth - margin - 10, totalY + 10, {
    align: "right",
  });
  doc.setFont(undefined, "normal");

  // Tax details table - adjusted positioning and layout
  const taxTableY = totalY + 15;
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

  // Generate aggregated tax data by HSN code
  const taxData = {};
  itemsToDisplay.forEach((item) => {
    const hsn = item.hsn || "NA";
    if (!taxData[hsn]) {
      taxData[hsn] = {
        taxableValue: 0,
        cgstAmount: 0,
        sgstAmount: 0,
      };
    }
    const itemAmount =
      parseFloat(item.amount) ||
      parseFloat(item.quantity) * parseFloat(item.rate) ||
      0;
    taxData[hsn].taxableValue += itemAmount;
    taxData[hsn].cgstAmount += itemAmount * (totals.cgstRate / 100);
    taxData[hsn].sgstAmount += itemAmount * (totals.sgstRate / 100);
  });

  // Use first HSN code as example if no items
  if (Object.keys(taxData).length === 0) {
    taxData[""] = {
      taxableValue: totals.subtotal,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
    };
  }

  // Display tax data by HSN
  let hsnY = dataY;
  Object.entries(taxData).forEach(([hsn, data]) => {
    doc.rect(margin, hsnY, colWidth, 10, "S");
    doc.rect(margin + colWidth, hsnY, colWidth, 10, "S");
    doc.rect(margin + colWidth * 2, hsnY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 2.5, hsnY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 3, hsnY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 3.5, hsnY, colWidth / 2, 10, "S");
    doc.rect(margin + colWidth * 4, hsnY, colWidth, 10, "S");

    // Data values
    doc.text(hsn, margin + 20, hsnY + 7);
    doc.text(
      formatCurrency(data.taxableValue),
      margin + colWidth + 10,
      hsnY + 7
    );
    doc.text(`${totals.cgstRate}%`, margin + colWidth * 2.25 - 2, hsnY + 7);
    doc.text(
      formatCurrency(data.cgstAmount),
      margin + colWidth * 2.75 - 7,
      hsnY + 7
    );
    doc.text(`${totals.sgstRate}%`, margin + colWidth * 3.25 - 2, hsnY + 7);
    doc.text(
      formatCurrency(data.sgstAmount),
      margin + colWidth * 3.75 - 7,
      hsnY + 7
    );
    doc.text(
      formatCurrency(data.cgstAmount + data.sgstAmount),
      margin + colWidth * 4.5 - 10,
      hsnY + 7
    );

    hsnY += 10;
  });

  // Total row
  const taxTotalY = hsnY;
  doc.rect(margin, taxTotalY, colWidth, 10, "S");
  doc.rect(margin + colWidth, taxTotalY, colWidth, 10, "S");
  doc.rect(margin + colWidth * 2, taxTotalY, colWidth / 2, 10, "S");
  doc.rect(margin + colWidth * 2.5, taxTotalY, colWidth / 2, 10, "S");
  doc.rect(margin + colWidth * 3, taxTotalY, colWidth / 2, 10, "S");
  doc.rect(margin + colWidth * 3.5, taxTotalY, colWidth / 2, 10, "S");
  doc.rect(margin + colWidth * 4, taxTotalY, colWidth, 10, "S");

  doc.setFont(undefined, "bold");
  doc.text("Total", margin + 20, taxTotalY + 7);
  doc.text(
    formatCurrency(totals.subtotal),
    margin + colWidth + 10,
    taxTotalY + 7
  );
  doc.text(
    formatCurrency(totals.cgstAmount),
    margin + colWidth * 2.75 - 7,
    taxTotalY + 7
  );
  doc.text(
    formatCurrency(totals.sgstAmount),
    margin + colWidth * 3.75 - 7,
    taxTotalY + 7
  );
  doc.text(
    formatCurrency(totals.totalTax),
    margin + colWidth * 4.5 - 10,
    taxTotalY + 7
  );

  // Tax amount in words
  const taxWordsY = taxTotalY + 15;
  doc.setFont(undefined, "normal");
  doc.setFontSize(8);
  doc.text("Tax Amount (in words) :", margin + 5, taxWordsY);
  doc.setFont(undefined, "bold");
  doc.text(numberToWords(totals.totalTax), margin + 80, taxWordsY);

  // Declaration section
  const declarationY = taxWordsY + 15;
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
  if (invoice.signature) {
    // Position for signature image
    const signatureX = pageWidth - margin - 50;
    const signatureY = declarationY + 5;
    const signatureWidth = 40;
    const signatureHeight = 15;

    // Add signature image
    doc.addImage(
      invoice.signature,
      "PNG", // or appropriate format
      signatureX,
      signatureY,
      signatureWidth,
      signatureHeight
    );
  }

  // Add customer notes if available
  if (invoice.customerNotes) {
    const notesY = declarationY + 25;
    doc.setFontSize(8);
    doc.text("Notes:", margin + 5, notesY);
    doc.text(invoice.customerNotes, margin + 20, notesY);
  }

  // Add "Authorized Signatory" text below where the signature would be
  doc.text("Authorized Signatory", pageWidth - margin - 35, declarationY + 25);

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

export default generateInvoicePDF;
