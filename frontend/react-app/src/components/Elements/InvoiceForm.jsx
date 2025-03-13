"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Textarea } from "../ui/textarea"
import { Search, RefreshCw, Plus, ChevronDown, ChevronUp, X } from "lucide-react"
import { format } from "date-fns"

const InvoiceForm = () => {
  // State for form fields
  const [showTotalSummary, setShowTotalSummary] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("INV-000002")
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "dd/MM/yyyy"))
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), "dd/MM/yyyy"))
  const [customerNotes, setCustomerNotes] = useState("Thanks for your business.")
  const [termsAndConditions, setTermsAndConditions] = useState("")
  const [showTerms, setShowTerms] = useState(false)
  
  // State for invoice items
  const [items, setItems] = useState([
    { id: 1, details: "", quantity: "1.00", rate: "0.00", amount: "0.00" }
  ])

  // State for calculations
  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)

  // Customers data
  const [customers, setCustomers] = useState([
    { id: "customer1", name: "Customer 1" },
    { id: "customer2", name: "Customer 2" }
  ])

  // Effect to calculate amounts when items change
  useEffect(() => {
    calculateTotals()
  }, [items])

  // Calculate item amount when quantity or rate changes
  const updateItemAmount = (id, quantity, rate) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const parsedQuantity = parseFloat(quantity) || 0
        const parsedRate = parseFloat(rate) || 0
        const amount = (parsedQuantity * parsedRate).toFixed(2)
        return { ...item, quantity, rate, amount }
      }
      return item
    })
    
    setItems(updatedItems)
  }

  // Calculate totals (subtotal, taxes, total)
  const calculateTotals = () => {
    const calculatedSubtotal = items.reduce((sum, item) => {
      return sum + parseFloat(item.amount || 0)
    }, 0)
    
    setSubtotal(calculatedSubtotal)
    setTotal(calculatedSubtotal) // Add taxes here if needed
  }

  // Add a new row to the items table
  const addNewRow = () => {
    const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
    setItems([...items, { id: newId, details: "", quantity: "1.00", rate: "0.00", amount: "0.00" }])
  }

  // Remove a row from the items table
  const removeRow = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

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
      status: isDraft ? "draft" : "sent"
    }
    
    console.log("Saving invoice:", invoice)
    
    // Here you would typically send this to your backend
    alert(`Invoice ${isDraft ? "saved as draft" : "saved and sent"}!`)
  }

  // Handle cancel
  const handleCancel = () => {
    console.log("Cancelled");
  }

  return (
    <Card className="w-full shadow-sm border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle>New Invoice</CardTitle>
        <CardDescription>Fill in the details to create a new invoice</CardDescription>
      </CardHeader>
      <CardContent className="mt-4">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-6">
            {/* Customer Name */}
            <div className="flex items-start gap-4">
              <Label htmlFor="customerName" className="w-40 pt-2">
                Customer Name
              </Label>
              <div className="flex-1 flex gap-2">
                <Select value={customerName} onValueChange={setCustomerName}>
                  <SelectTrigger id="customerName" className="flex-1">
                    <SelectValue placeholder="Select or add a customer" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {customers.map(customer => (
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
              <Label htmlFor="invoiceNumber" className="w-40 pt-2">
                Invoice No.
              </Label>
              <div className="flex-1 relative">
                <Input 
                  id="invoiceNumber" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Invoice Date and Terms */}
            <div className="flex items-start gap-4">
              <Label htmlFor="invoiceDate" className="w-40 pt-2">
                Invoice Date
              </Label>
              <div className="flex-1 flex gap-4">
                <Input 
                  id="invoiceDate" 
                  type="text" 
                  placeholder="DD/MM/YYYY" 
                  className="flex-1"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />

                <Label htmlFor="dueDate" className="w-24 pt-2">
                  Due Date
                </Label>
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
                        <Input 
                          placeholder="Type or click to select an item." 
                          className="border-0 bg-transparent" 
                          value={item.details}
                          onChange={(e) => {
                            const updatedItems = items.map(i => 
                              i.id === item.id ? { ...i, details: e.target.value } : i
                            )
                            setItems(updatedItems)
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input 
                          value={item.quantity} 
                          className="text-center border-0 bg-transparent" 
                          onChange={(e) => {
                            updateItemAmount(item.id, e.target.value, item.rate)
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input 
                          value={item.rate} 
                          className="text-center border-0 bg-transparent" 
                          onChange={(e) => {
                            updateItemAmount(item.id, item.quantity, e.target.value)
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
                    const newRows = Array.from({ length: 5 }, (_, index) => ({
                      id: items.length + index + 1,
                      details: "",
                      quantity: "1.00",
                      rate: "0.00",
                      amount: "0.00"
                    }))
                    setItems([...items, ...newRows])
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
                    <span className="text-gray-600">Total (₹)</span>
                    <span className="font-medium">{total.toFixed(2)}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-black flex items-center gap-1 p-0 h-auto hover:bg-white"
                    onClick={() => setShowTotalSummary(!showTotalSummary)}
                  >
                    <span>Show Total Summary</span>
                    {showTotalSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
              <p className="text-gray-500 text-xs mt-1">Will be displayed on the invoice</p>
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
        </form>
      </CardContent>
      <CardFooter className="flex gap-2 border-t pt-4 justify-end">
        <Button onClick={() => handleSubmit(true)}>
          Save
        </Button>
        {/* <div className="relative">
          <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => handleSubmit(false)}>
            Save and Send
          </Button>
        </div> */}
        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
      </CardFooter>
    </Card>
  )
}

export default InvoiceForm