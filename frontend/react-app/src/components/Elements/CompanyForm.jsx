import React, { useState } from "react";
import { Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const CompanyForm = ({ open, onOpenChange, onSave }) => {
  const [companyType, setCompanyType] = useState("manufacturer");
  const [gstApplicable, setGstApplicable] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    currency: "INR",
    invoiceDueDays: "30",
    gstin: "",
    stateCode: "",
    country: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    city: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      companyType,
      gstApplicable,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">Company Type</Label>

            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="companyType"
                  value="manufacturer"
                  checked={companyType === "manufacturer"}
                  onChange={() => setCompanyType("manufacturer")}
                />
                <span>Manufacturer</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="companyType"
                  value="trader"
                  checked={companyType === "trader"}
                  onChange={() => setCompanyType("trader")}
                />
                <span>Trader</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="companyType"
                  value="services"
                  checked={companyType === "services"}
                  onChange={() => setCompanyType("services")}
                />
                <span>Services</span>
              </label>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex flex-col space-y-1 w-1/2">
              <Label className="text-sm font-medium">Company Name</Label>
              <Input 
                placeholder="Company Name" 
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-1 w-1/2">
              <Label className="text-sm font-medium">Currency</Label>
              <Select 
                disabled 
                value={formData.currency} 
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="INR - Indian Rupee" />
                </SelectTrigger>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Label className="text-sm font-medium">Is GST Applicable?</Label>
            <input
              type="radio"
              name="gstApplicable"
              value="yes"
              checked={gstApplicable === true}
              onChange={() => setGstApplicable(true)}
            />{" "}
            Yes
            <input
              type="radio"
              name="gstApplicable"
              value="no"
              checked={gstApplicable === false}
              onChange={() => setGstApplicable(false)}
            />{" "}
            No
          </div>

          {gstApplicable && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">GSTIN/UIN</Label>
                <Input 
                  placeholder="GST Number" 
                  value={formData.gstin}
                  onChange={(e) => handleInputChange("gstin", e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">State Code</Label>
                <Input 
                  placeholder="State Code" 
                  value={formData.stateCode}
                  onChange={(e) => handleInputChange("stateCode", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <div className="flex flex-col space-y-1">
              <Label className="text-sm font-medium">Country/Region</Label>
              <Select 
                value={formData.country}
                onValueChange={(value) => handleInputChange("country", value)}
              >
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

            <div className="flex space-x-4">
              <div className="flex flex-col space-y-1 w-1/2">
                <Label className="text-sm font-medium">Address Line 1</Label>
                <Textarea
                  placeholder="Street Address, Building Name"
                  rows={2}
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-1 w-1/2">
                <Label className="text-sm font-medium">Address Line 2</Label>
                <Textarea 
                  placeholder="Locality, Area" 
                  rows={2}
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">State</Label>
                <Select 
                  value={formData.state}
                  onValueChange={(value) => handleInputChange("state", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="karnataka">Karnataka</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">City</Label>
                <Select 
                  value={formData.city}
                  onValueChange={(value) => handleInputChange("city", value)}
                >
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
            </div>

            <div className="flex space-x-4">
              <div className="flex flex-col space-y-1 w-1/2">
                <div className="flex items-center space-x-1">
                  <Label className="text-sm font-medium">Email Address</Label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    className="pl-10 w-full"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1 w-1/2">
                <div className="flex items-center space-x-1">
                  <Label className="text-sm font-medium">Contact No.</Label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="h-4 w-4" />
                  </div>
                  <Input 
                    className="pl-10 w-full" 
                    placeholder="Phone" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

  export default CompanyForm;