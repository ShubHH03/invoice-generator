import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Phone, Mail } from "lucide-react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const CustomerForm = ({ open, onOpenChange, onSave }) => {
  const [customerType, setCustomerType] = useState("business");
  const [gstApplicable, setGstApplicable] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    // Add other form fields as needed
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Close the dialog
    onOpenChange(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Customer Type */}
          <div className="flex items-center space-x-4">
            {/* Label */}
            <Label className="text-sm font-medium">Customer Type</Label>

            {/* Radio Buttons */}
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="customerType"
                  value="business"
                  checked={customerType === "business"}
                  onChange={() => setCustomerType("business")}
                />
                <span>Business</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="customerType"
                  value="individual"
                  checked={customerType === "individual"}
                  onChange={() => setCustomerType("individual")}
                />
                <span>Individual</span>
              </label>
            </div>
          </div>

          {/* Primary Contact */}
          <div className="flex space-x-4">
            {/* Customer Name */}
            <div className="flex flex-col space-y-1 w-5/6">
              <div className="flex items-center space-x-1">
                <Label className="text-sm font-medium">Customer Name</Label>
              </div>
              <div className="flex space-x-2">
                <Select defaultValue="mr">
                  <SelectTrigger className="max-w-20">
                    <SelectValue placeholder="Title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Mr.</SelectItem>
                    <SelectItem value="ms">Ms.</SelectItem>
                    <SelectItem value="mrs">Mrs.</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="First Name" 
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
                <Input 
                  placeholder="Last Name"
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
              </div>
            </div>

            {/* PAN Number */}
            <div className="flex flex-col space-y-1 w-1/2">
              <div className="flex items-center space-x-1">
                <Label className="text-sm font-medium">PAN No.</Label>
              </div>
              <Input 
                placeholder="Enter PAN Number" 
                className="w-full"
                onChange={(e) => handleInputChange("panNumber", e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            {/* Company Name */}
            <div className="flex flex-col space-y-1 w-1/2">
              <Label className="text-sm font-medium">Company Name</Label>
              <Input 
                placeholder="Company Name"
                onChange={(e) => handleInputChange("company", e.target.value)}
              />
            </div>

            {/* Currency */}
            <div className="flex flex-col space-y-1 w-1/2">
              <Label className="text-sm font-medium">Currency</Label>
              <Select onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Label className="text-sm font-medium">Is GST Applicable?</Label>
            <input
              type="radio"
              name="gstApplicable"
              value="yes"
              onChange={(e) => setGstApplicable(e.target.value === "yes")}
            />{" "}
            Yes
            <input
              type="radio"
              name="gstApplicable"
              value="no"
              onChange={(e) => setGstApplicable(e.target.value === "yes")}
            />{" "}
            No
          </div>

          {gstApplicable && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">GSTIN/UIN</Label>
                <Input 
                  placeholder="GST Number"
                  onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">State Code</Label>
                <Input 
                  placeholder="State Code"
                  onChange={(e) => handleInputChange("stateCode", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Addresses - New Section */}
          <div className="pt-2">
            <Tabs defaultValue="billing">
              <TabsList className="grid w-[300px] grid-cols-2 pb-10">
                <TabsTrigger value="billing">Billing Address</TabsTrigger>
                <TabsTrigger value="shipping">Shipping Address</TabsTrigger>
              </TabsList>

              <TabsContent value="billing" className="ml-2 mt-4">
                <div className="flex flex-col space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium">
                        Country/Region
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("billingCountry", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium">State</Label>
                      <Select onValueChange={(value) => handleInputChange("billingState", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maharashtra">
                            Maharashtra
                          </SelectItem>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="karnataka">Karnataka</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex space-x-4 ">
                    <div className="flex flex-col space-y-1 w-1/2">
                      <Label className="text-sm font-medium">
                        Address Line 1
                      </Label>
                      <Textarea
                        placeholder="Street Address, Building Name"
                        rows={2}
                        onChange={(e) => handleInputChange("billingAddress1", e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col space-y-1 w-1/2">
                      <Label className="text-sm font-medium">
                        Address Line 2
                      </Label>
                      <Textarea 
                        placeholder="Locality, Area" 
                        rows={2}
                        onChange={(e) => handleInputChange("billingAddress2", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium">City</Label>
                      <Select onValueChange={(value) => handleInputChange("billingCity", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mumbai">Mumbai</SelectItem>
                          <SelectItem value="pune">Pune</SelectItem>
                          <SelectItem value="nagpur">Nagpur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-1">
                        <Label className="text-sm font-medium">
                          Contact No.
                        </Label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Phone className="h-4 w-4" />
                        </div>
                        <Input 
                          className="pl-10 w-full" 
                          placeholder="Phone"
                          onChange={(e) => handleInputChange("billingPhone", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    {/* Email Address */}
                    <div className="flex flex-col space-y-1 w-1/2">
                      <div className="flex items-center space-x-1">
                        <Label className="text-sm font-medium">
                          Email Address
                        </Label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail className="h-4 w-4" />
                        </div>
                        <Input
                          className="pl-10 w-full"
                          placeholder="Email Address"
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col space-y-1 w-1/2">
                      <div className="flex items-center space-x-1">
                        <Label className="text-sm font-medium">
                          Alternate Contact No.
                        </Label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Phone className="h-4 w-4" />
                        </div>
                        <Input 
                          className="pl-10 w-full" 
                          placeholder="Phone"
                          onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="ml-2 mt-4">
                {/* Similar structure to billing address with shipping-specific field names */}
                <div className="flex flex-col space-y-3">
                  {/* For brevity, I've only included state management for shipping fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium">
                        Country/Region
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("shippingCountry", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium">State</Label>
                      <Select onValueChange={(value) => handleInputChange("shippingState", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maharashtra">
                            Maharashtra
                          </SelectItem>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="karnataka">Karnataka</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Rest of shipping address form similar to billing */}
                  {/* Additional fields would go here */}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerForm;