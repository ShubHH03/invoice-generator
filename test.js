const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 5;

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
    doc.text("Invoice No.", rightX, rightY);
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
    doc.text(
      invoice.invoiceDate || "15 Apr 2019",
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

      // if (index === 0) {
      //   doc.text("Batch: Batch1", currentX + 5, itemY + 15);
      // } else if (index === 1) {
      //   doc.text("Batch: Batch1/01", currentX + 5, itemY + 15);
      // }

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

      itemY += itemHeight;
    });

    // Totals section after items
    doc.rect(margin, itemY, pageWidth - 2 * margin, 30, "S");

    // Tax calculation section
    if (itemsToDisplay.length === 2) {
      doc.text("86,00,000.00", margin + 250, itemY + 5);

      // Output GST/SGST
      doc.text("Output CGST", margin + 230, itemY + 15);
      doc.text("Output SGST", margin + 230, itemY + 20);

      doc.text("5,16,000.00", margin + 250, itemY + 15);
      doc.text("5,16,000.00", margin + 250, itemY + 20);
    }

    // Total line
    doc.setFont(undefined, "bold");
    doc.text("Total", margin + 220, itemY + 25);
    doc.text("1,300 Nos", margin + 200, itemY + 25);
    doc.text("₹ 96,32,000.00", margin + 250, itemY + 25);
    doc.setFont(undefined, "normal");

    // Amount in words
    doc.line(margin, itemY + 30, pageWidth - margin, itemY + 30);
    doc.rect(margin, itemY + 30, pageWidth - 2 * margin, 10, "S");
    doc.setFontSize(8);
    doc.text("Amount Chargeable (in words)", margin + 5, itemY + 36);
    doc.setFont(undefined, "bold");
    doc.text(
      "INR Ninety Six Lakh Thirty Two Thousand Only",
      margin + 80,
      itemY + 36
    );
    doc.text("E & O.E", pageWidth - margin - 10, itemY + 36, {
      align: "right",
    });
    doc.setFont(undefined, "normal");

    // Tax details table
    const taxTableY = itemY + 40;
    const taxTableHeight = 30;

    // Tax table header
    doc.rect(margin, taxTableY, 60, 10, "S");
    doc.rect(margin + 60, taxTableY, 60, 10, "S");
    doc.rect(margin + 120, taxTableY, 60, 10, "S");

    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.text("HSN/SAC", margin + 20, taxTableY + 6);
    doc.text("Taxable", margin + 75, taxTableY + 6);
    doc.text("Total", margin + 150, taxTableY + 6);
    doc.setFont(undefined, "normal");

    // Tax values
    doc.rect(margin, taxTableY + 20, 60, 10, "S");
    doc.rect(margin + 60, taxTableY + 20, 60, 10, "S");
    doc.rect(margin + 120, taxTableY + 20, 60, 10, "S");

    doc.text("8517", margin + 20, taxTableY + 25);
    doc.text("86,00,000.00", margin + 75, taxTableY + 25);
    doc.text("86,00,000.00", margin + 150, taxTableY + 25);

    // Tax total
    doc.rect(margin, taxTableY + 30, 60, 10, "S");
    doc.rect(margin + 60, taxTableY + 30, 60, 10, "S");
    doc.rect(margin + 120, taxTableY + 30, 60, 10, "S");

    doc.setFont(undefined, "bold");
    doc.text("Total", margin + 20, taxTableY + 37);
    doc.text("86,00,000.00", margin + 75, taxTableY + 37);
    doc.text("86,00,000.00", margin + 150, taxTableY + 37);
    doc.setFont(undefined, "normal");

    // Tax amount in words
    doc.rect(margin, taxTableY + 40, pageWidth - 2 * margin, 10, "S");
    doc.setFontSize(8);
    doc.text("Tax Amount (in words)", margin + 5, taxTableY + 47);
    doc.setFont(undefined, "bold");
    doc.text(
      "INR Ten Lakh Thirty Two Thousand Only",
      margin + 80,
      taxTableY + 47
    );
    doc.setFont(undefined, "normal");

    // Declaration section
    const declarationY = taxTableY + 55;
    const declarationHeight = 30;

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
    doc.text("Declaration", margin + 5, declarationY + 7);
    doc.setFont(undefined, "normal");
    doc.text(
      "We declare that this invoice shows the actual price of the",
      margin + 5,
      declarationY + 15
    );
    doc.text(
      "goods described and that all particulars are true and",
      margin + 5,
      declarationY + 20
    );
    doc.text("correct.", margin + 5, declarationY + 25);

    doc.text(
      "for Ace Mobile Manufacturer Pvt Ltd",
      pageWidth - margin - 40,
      declarationY + 15
    );
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