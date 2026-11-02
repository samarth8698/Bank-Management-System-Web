import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const downloadStatement = (account, transactions) => {
  const doc = new jsPDF();

  const customer = account.customer || {};

  // Bank Header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("SecureBank", 14, 17);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Bank Account Statement", 14, 27);

  // Customer Details
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Account Information", 14, 50);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const customerName =
    `${customer.firstName || ""} ${customer.lastName || ""}`.trim();

  doc.text(`Customer Name: ${customerName || "N/A"}`, 14, 60);
  doc.text(`Account Number: ${account.accountNumber || "N/A"}`, 14, 68);
  doc.text(`Account Type: ${account.accountType || "N/A"}`, 14, 76);
  doc.text(`Account Status: ${account.status || "N/A"}`, 14, 84);

  doc.text(
    `Statement Date: ${new Date().toLocaleDateString("en-IN")}`,
    14,
    92
  );

  // Calculate Opening Balance
  const totalCredit = transactions.reduce((total, transaction) => {
    const type = transaction.transactionType;

    if (["DEPOSIT", "TRANSFER_CREDIT"].includes(type)) {
      return total + Number(transaction.amount);
    }

    return total;
  }, 0);

  const totalDebit = transactions.reduce((total, transaction) => {
    const type = transaction.transactionType;

    if (["WITHDRAWAL", "TRANSFER_DEBIT"].includes(type)) {
      return total + Number(transaction.amount);
    }

    return total;
  }, 0);

  const closingBalance = Number(account.balance || 0);
  const openingBalance = closingBalance - totalCredit + totalDebit;

  // Balance Summary
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, 101, 182, 25, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text(
    `Opening Balance: Rs. ${openingBalance.toFixed(2)}`,
    19,
    111
  );

  doc.text(
    `Total Credit: Rs. ${totalCredit.toFixed(2)}`,
    19,
    120
  );

  doc.text(
    `Total Debit: Rs. ${totalDebit.toFixed(2)}`,
    110,
    111
  );

  doc.text(
    `Closing Balance: Rs. ${closingBalance.toFixed(2)}`,
    110,
    120
  );

  // Transaction Table
  const tableRows = transactions.map((transaction) => {
    const type = transaction.transactionType;

    const credit = ["DEPOSIT", "TRANSFER_CREDIT"].includes(type);

    return [
      transaction.id,
      transaction.transactionDate
        ? new Date(transaction.transactionDate).toLocaleString("en-IN")
        : "N/A",
      type,
      credit
        ? `+ Rs. ${Number(transaction.amount).toFixed(2)}`
        : `- Rs. ${Number(transaction.amount).toFixed(2)}`,
      transaction.description || "N/A",
      transaction.referenceNumber || "N/A",
    ];
  });

  autoTable(doc, {
    startY: 135,
    head: [[
      "ID",
      "Date",
      "Type",
      "Amount",
      "Description",
      "Reference Number",
    ]],
    body: tableRows,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 28 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 42 },
      5: { cellWidth: 52 },
    },
  });

  // Footer on Every Page
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);

    doc.text(
      "This is a computer-generated bank statement.",
      14,
      pageHeight - 10
    );

    doc.text(
      `Page ${i} of ${pageCount}`,
      180,
      pageHeight - 10
    );
  }

  // Download PDF
  doc.save(`SecureBank_Statement_${account.accountNumber}.pdf`);
};

export default downloadStatement;