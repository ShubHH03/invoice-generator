import { jsPDF } from "jspdf";

/**
 * Generate an invoice PDF document based on provided invoice data
 * @param {Object} invoice - Invoice data object containing company, customer, items, and other details
 * @returns {jsPDF} - The generated PDF document object
 */
export const generateInvoicePDF = (invoice) => {
  console.log("PDF Generation - Company Info:", invoice.company);
  console.log("PDF Generation - Customer Info:", invoice.customerName);
  console.log("PDF Generation - Signature:", invoice.signature);
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
  // Improved number to words conversion for Indian currency format
  const numberToWords = (num) => {
    if (isNaN(num)) return "Zero";

    // Handle decimal part separately
    let decimal = "";
    let numStr = num.toString();

    if (numStr.includes(".")) {
      const parts = numStr.split(".");
      numStr = parts[0];
      decimal = parts[1];

      // Format decimal as paise if needed
      if (decimal && decimal.length > 0) {
        // Ensure we only use up to 2 decimal places
        decimal = decimal.padEnd(2, "0").substring(0, 2);
      }
    }

    // Arrays for number words
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

    // Function to convert 3-digit groups
    const convertLessThanThousand = (n) => {
      if (n === 0) return "";

      if (n < 20) {
        return single[n] + " ";
      } else if (n < 100) {
        return tens[Math.floor(n / 10)] + " " + single[n % 10] + " ";
      } else {
        return (
          single[Math.floor(n / 100)] +
          " Hundred " +
          convertLessThanThousand(n % 100)
        );
      }
    };

    // Indian numbering system: lakhs and crores
    const indianNumbering = (n) => {
      if (n === 0) return "Zero";

      let words = "";

      // Handle crores (10^7)
      if (n >= 10000000) {
        words += convertLessThanThousand(Math.floor(n / 10000000)) + "Crore ";
        n %= 10000000;
      }

      // Handle lakhs (10^5)
      if (n >= 100000) {
        words += convertLessThanThousand(Math.floor(n / 100000)) + "Lakh ";
        n %= 100000;
      }

      // Handle thousands
      if (n >= 1000) {
        words += convertLessThanThousand(Math.floor(n / 1000)) + "Thousand ";
        n %= 1000;
      }

      // Handle remaining part
      words += convertLessThanThousand(n);

      return words.trim();
    };

    // Main conversion logic
    let result = indianNumbering(parseInt(numStr, 10));

    // Add paise part if present
    if (decimal && decimal !== "00") {
      const paiseInWords = indianNumbering(parseInt(decimal, 10));
      result += " and " + paiseInWords + " Paise";
    }

    return result + " Only";
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
  // Add company logo if provided
  // if (invoice.company?.logo) {
  //   // Define logo dimensions and position
  function getImageTypeFromPath(path) {
    if (!path) return "PNG";
    const extension = path.split(".").pop().toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
        return "JPEG";
      case "png":
        return "PNG";
      default:
        return "PNG";
    }
  }
  // Update the logo and company info section
  if (invoice.company?.logo) {
    const logoWidth = 25; // Slightly smaller logo
    const logoHeight = 25;
    const logoX = margin + 5;
    const logoY = margin + 5;

    try {
      // Add logo
      doc.addImage(
        invoice.company.logo,
        getImageTypeFromPath(invoice.company.logo),
        logoX,
        logoY,
        logoWidth,
        logoHeight
      );

      // Adjust text positioning to the right of the logo
      const textX = logoX + logoWidth + 3;
      const maxTextWidth = midX - textX - 5;

      doc.setFontSize(9);
      doc.setFont(undefined, "bold");

      // Split company name into multiple lines if needed
      const companyName = invoice.company?.companyName || "Company Name";
      const companyNameLines = doc.splitTextToSize(companyName, maxTextWidth);
      doc.text(companyNameLines, textX, margin + 8);

      // Calculate new Y position based on number of lines
      let nextY = margin + 8 + companyNameLines.length * 4;

      doc.setFont(undefined, "normal");

      // Apply similar approach to address lines
      const address1 = invoice.company?.addressLine1 || "Address Line 1";
      const address1Lines = doc.splitTextToSize(address1, maxTextWidth);
      doc.text(address1Lines, textX, nextY);

      nextY += address1Lines.length * 4;

      const address2 = invoice.company?.addressLine2 || "Address Line 2";
      const address2Lines = doc.splitTextToSize(address2, maxTextWidth);
      doc.text(address2Lines, textX, nextY);

      nextY += address2Lines.length * 4;

      const cityText = invoice.company?.city || "City";
      doc.text(cityText, textX, nextY);
      nextY += 4;

      const gstinText = `GSTIN/UIN: ${invoice.company?.gstin || "GSTIN"}`;
      doc.text(gstinText, textX, nextY);
      nextY += 4;

      const stateText = `State Name: ${
        invoice.company?.state || "State"
      }, Code: ${invoice.company?.stateCode || "Code"}`;
      doc.text(stateText, textX, nextY);
    } catch (error) {
      console.error("Error adding logo:", error);
      // Fallback to text-only if logo fails
      defaultCompanyText();
    }
  } else {
    // Default layout without logo
    defaultCompanyText();
  }

  // Function for default company text layout (without logo)
  // Modify the defaultCompanyText function to better wrap text and adjust positioning
  function defaultCompanyText() {
    doc.setFontSize(9); // Slightly smaller font
    doc.setFont(undefined, "bold");

    // Break company name into multiple lines if needed
    const companyName = invoice.company?.companyName || "Company Name";
    const maxWidth = midX - margin - 10; // Maximum width for company text

    const companyNameLines = doc.splitTextToSize(companyName, maxWidth);
    doc.text(companyNameLines, margin + 5, margin + 8);

    // Calculate new Y position based on number of lines
    let nextY = margin + 8 + companyNameLines.length * 4;

    doc.setFont(undefined, "normal");
    // Apply similar approach to address lines
    const address1 = invoice.company?.addressLine1 || "Address Line 1";
    const address1Lines = doc.splitTextToSize(address1, maxWidth);
    doc.text(address1Lines, margin + 5, nextY);

    nextY += address1Lines.length * 4;

    const address2 = invoice.company?.addressLine2 || "Address Line 2";
    const address2Lines = doc.splitTextToSize(address2, maxWidth);
    doc.text(address2Lines, margin + 5, nextY);

    nextY += address2Lines.length * 4;

    const cityText = invoice.company?.city || "City";
    doc.text(cityText, margin + 5, nextY);
    nextY += 4;

    const gstinText = `GSTIN/UIN: ${invoice.company?.gstin || "GSTIN"}`;
    doc.text(gstinText, margin + 5, nextY);
    nextY += 4;

    const stateText = `State Name: ${
      invoice.company?.state || "State"
    }, Code: ${invoice.company?.stateCode || "Code"}`;
    doc.text(stateText, margin + 5, nextY);
  }

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
  let currentPage = 1;
  const itemsPerPage = 7; // Set limit to 7 items per page

  // Use actual invoice items
  const itemsToDisplay =
    invoice.items && invoice.items.length > 0 ? invoice.items : [];

  // Process each item in the invoice
  itemsToDisplay.forEach((item, index) => {
    // Check if we need a new page
    if (index > 0 && index % itemsPerPage === 0) {
      // Add a new page
      doc.addPage();
      currentPage++;

      // Reset Y position for new page
      itemY = margin + tableHeaderHeight;

      // Redraw table header on new page
      let headerX = margin;
      doc.setFillColor(240, 240, 240);

      // Draw table header cells
      doc.rect(headerX, margin, colWidths.slNo, tableHeaderHeight, "S");
      headerX += colWidths.slNo;
      doc.rect(headerX, margin, colWidths.description, tableHeaderHeight, "S");
      headerX += colWidths.description;
      doc.rect(headerX, margin, colWidths.hsn, tableHeaderHeight, "S");
      headerX += colWidths.hsn;
      doc.rect(headerX, margin, colWidths.quantity, tableHeaderHeight, "S");
      headerX += colWidths.quantity;
      doc.rect(headerX, margin, colWidths.rate, tableHeaderHeight, "S");
      headerX += colWidths.rate;
      doc.rect(headerX, margin, colWidths.per, tableHeaderHeight, "S");
      headerX += colWidths.per;
      doc.rect(headerX, margin, colWidths.amount, tableHeaderHeight, "S");

      doc.setFontSize(8);
      doc.setFont(undefined, "bold");

      // Draw header text
      headerX = margin;
      doc.text("Sl", headerX + 1, margin + 6);
      headerX += colWidths.slNo;
      doc.text("Particulars", headerX + 20, margin + 6);
      headerX += colWidths.description;
      doc.text("HSN/SAC", headerX + 5, margin + 6);
      headerX += colWidths.hsn;
      doc.text("Qty", headerX + 5, margin + 6);
      headerX += colWidths.quantity;
      doc.text("Rate", headerX + 5, margin + 6);
      headerX += colWidths.rate;
      doc.text("Per", headerX + 3, margin + 6);
      headerX += colWidths.per;
      doc.text("Amount", headerX + 5, margin + 6);

      doc.setFont(undefined, "normal");
    }

    let currentX = margin;

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
    doc.text(String(index + 1), currentX + 1, itemY + 5);
    currentX += colWidths.slNo;

    // Item description - handle multiline if needed
    const description = item.details || item.name || `Item ${index + 1}`;
    doc.text(String(description), currentX + 5, itemY + 5);

    // Add batch info if available
    if (item.batch) {
      doc.text(
        String(item.batch ? `Batch: ${item.batch}` : ""),
        currentX + 5,
        itemY + 10
      );
    }

    currentX += colWidths.description;
    doc.text(String(item.hsn || ""), currentX + 5, itemY + 5);
    currentX += colWidths.hsn;
    doc.text(String(item.quantity || "0"), currentX + 5, itemY + 5);
    currentX += colWidths.quantity;
    doc.text(String(formatCurrency(item.rate || 0)), currentX + 5, itemY + 5);
    currentX += colWidths.rate;
    doc.text(String(item.per || "Nos"), currentX + 3, itemY + 5);
    currentX += colWidths.per;
    doc.text(
      String(formatCurrency(item.amount || item.quantity * item.rate || 0)),
      currentX + 5,
      itemY + 5
    );

    itemY += itemHeight;
  });
  // Only add the footer elements on the last page
  // Check if we're on the last page before drawing summary content
  if (currentPage === Math.ceil(itemsToDisplay.length / itemsPerPage)) {
    // Output CGST and SGST rows
    const taxY = itemY + 10;
    let currentX = margin;

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
    // In the "Amount in words" section
    doc.setFontSize(8);
    doc.text("Amount Chargeable (in words)", margin + 5, totalY + 10);
    doc.setFont(undefined, "bold");

    // Use the improved numberToWords function
    const amountInWords = numberToWords(totals.grandTotal);
    const amountLines = doc.splitTextToSize(
      "INR " + amountInWords,
      pageWidth - margin - 100
    );
    doc.text(amountLines, margin + 80, totalY + 10);

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
  }
};
export default generateInvoicePDF;
