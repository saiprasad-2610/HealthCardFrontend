import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Download, Printer, Loader2, Zap } from 'lucide-react';

// Base structure for a Line Item
const initialItem = {
  description: '',
  quantity: 1,
  unitPrice: 0.0,
  lineTotal: 0.0,
};

// Base structure for the entire Invoice State
const initialInvoiceState = {
  customerName: 'Acme Corp',
  customerAddress: '123 Main Street, Suite 100, Anytown, CA 90210',
  gstRate: 18.0, // Default GST rate
  items: [
    { ...initialItem, description: 'Software Development Fee', quantity: 1, unitPrice: 500.0, lineTotal: 500.0 },
  ],
  subTotal: 0.0,
  gstAmount: 0.0,
  totalAmount: 0.0,
};

// Mock Backend Endpoint (The user needs to match this in their Spring Boot Controller)
const API_URL = '/api/invoices/generate-pdf';

const App = () => {
  const [invoice, setInvoice] = useState(initialInvoiceState);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Calculation Logic ---

  const calculateTotals = useCallback(() => {
    const newSubTotal = invoice.items.reduce((sum, item) => sum + item.lineTotal, 0);
    const newGstAmount = (newSubTotal * invoice.gstRate) / 100;
    const newTotalAmount = newSubTotal + newGstAmount;

    setInvoice(prev => ({
      ...prev,
      subTotal: newSubTotal,
      gstAmount: newGstAmount,
      totalAmount: newTotalAmount,
    }));
  }, [invoice.items, invoice.gstRate]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...invoice.items];
    const item = items[index];

    let numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) numericValue = 0;

    // Update quantity or unitPrice
    if (name === 'quantity') {
      item.quantity = Math.max(1, parseInt(value, 10) || 0);
    } else if (name === 'unitPrice') {
      item.unitPrice = numericValue;
    } else {
      item[name] = value;
    }

    // Recalculate line total immediately
    item.lineTotal = item.quantity * item.unitPrice;

    setInvoice(prev => ({
      ...prev,
      items,
    }));
  };

  const handleAddItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { ...initialItem, description: 'New Service/Product' }],
    }));
  };

  const handleRemoveItem = (index) => {
    const items = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({
      ...prev,
      items,
    }));
  };

  const handleGeneratePdf = async () => {
    setIsLoading(true);
    setError(null);
    setPdfUrl(null);

    // 1. Serialize items array into the JSON string the backend expects
    const payloadItemsJson = JSON.stringify(invoice.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })));

    // 2. Construct the full payload for the backend
    const payload = {
      customerName: invoice.customerName,
      customerAddress: invoice.customerAddress,
      gstRate: invoice.gstRate,
      subTotal: invoice.subTotal,
      gstAmount: invoice.gstAmount,
      totalAmount: invoice.totalAmount,
      itemsJson: payloadItemsJson, // Send the serialized JSON string
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
      }

      // 3. Receive PDF byte array as Blob
      const pdfBlob = await response.blob();
      
      // 4. Create a URL for the Blob and set it for the iframe
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF. Check network and backend logs.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clean up the URL when the component unmounts or a new PDF is generated
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 flex items-center">
        <Zap className="mr-3 h-8 w-8 text-indigo-500" />
        Invoice PDF Generator (React + Spring/iText)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Input Form (Col 1 & 2) --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Invoice Details</h2>

          {/* Customer Info */}
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Client Information</h3>
            <label className="block">
              <span className="text-sm font-medium text-gray-600">Customer/Firm Name</span>
              <input
                type="text"
                name="customerName"
                value={invoice.customerName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                placeholder="Client Name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-600">Customer Address</span>
              <textarea
                name="customerAddress"
                value={invoice.customerAddress}
                onChange={handleInputChange}
                rows="2"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-none"
                placeholder="Street, City, Postal Code"
              />
            </label>
          </div>

          {/* Line Items Table */}
          <h3 className="text-lg font-medium text-gray-700 mb-3">Line Items</h3>
          <div className="overflow-x-auto shadow-md rounded-lg mb-6 border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Description</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-indigo-50 transition duration-150">
                    <td className="p-3">
                      <input
                        type="text"
                        name="description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full text-sm border-none p-1 focus:ring-0"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        min="1"
                        className="w-16 text-sm text-right border-none p-1 focus:ring-0"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        name="unitPrice"
                        value={item.unitPrice.toFixed(2)}
                        onChange={(e) => handleItemChange(index, e)}
                        min="0"
                        step="0.01"
                        className="w-24 text-sm text-right border-none p-1 focus:ring-0"
                      />
                    </td>
                    <td className="p-3 text-right text-sm font-semibold text-gray-700">
                      ${item.lineTotal.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemoveItem(index)}
                        disabled={invoice.items.length === 1}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-300 transition duration-150 p-1 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button
            onClick={handleAddItem}
            className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition duration-150 mb-6 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Line Item
          </button>
          
          {/* GST Rate Input */}
          <div className="flex justify-end mb-6">
            <label className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">GST Rate (%)</span>
              <input
                type="number"
                name="gstRate"
                value={invoice.gstRate}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-20 rounded-lg border-gray-300 shadow-sm p-2 text-right focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
            </label>
          </div>
          
          {/* Final Totals Readout */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm">
              <div className="space-y-2 text-right text-gray-700">
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Subtotal:</span>
                  <span>${invoice.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">GST ({invoice.gstRate}%):</span>
                  <span>${invoice.gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 text-indigo-700 bg-indigo-50 p-2 rounded-lg">
                  <span>GRAND TOTAL:</span>
                  <span>${invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- PDF Preview (Col 3) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-2xl sticky top-8 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <Printer className="mr-2 h-5 w-5" /> PDF Preview
            </h2>
            
            {/* Action Button */}
            <button
              onClick={handleGeneratePdf}
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl shadow-lg transition duration-300 ${
                isLoading
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Generate PDF
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                Error: {error}
              </div>
            )}
            
            {/* PDF Viewer */}
            <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden h-96 bg-gray-100">
              {pdfUrl ? (
                <iframe 
                  src={pdfUrl} 
                  className="w-full h-full" 
                  title="PDF Preview"
                ></iframe>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-center p-4">
                  Click 'Generate PDF' to see the document here.
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
