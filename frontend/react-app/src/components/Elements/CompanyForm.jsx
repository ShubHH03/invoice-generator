import React, { useState } from "react";
import { Mail, Phone, Upload } from "lucide-react";
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

const stateCityMapping = {
  "andhra pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
  "arunachal pradesh": ["Itanagar", "Tawang", "Ziro"],
  assam: ["Guwahati", "Silchar", "Dibrugarh"],
  bihar: ["Patna", "Gaya", "Bhagalpur"],
  chhattisgarh: ["Raipur", "Bhilai", "Bilaspur"],
  goa: ["Panaji", "Margao", "Vasco da Gama"],
  gujarat: ["Ahmedabad", "Surat", "Vadodara"],
  haryana: ["Gurgaon", "Faridabad", "Panipat"],
  "himachal pradesh": ["Shimla", "Manali", "Dharamshala"],
  jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad"],
  karnataka: ["Bengaluru", "Mysuru", "Hubli"],
  kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode"],
  "madhya pradesh": ["Bhopal", "Indore", "Gwalior"],
  maharashtra: ["Mumbai", "Pune", "Nagpur"],
  manipur: ["Imphal", "Thoubal", "Churachandpur"],
  meghalaya: ["Shillong", "Tura", "Jowai"],
  mizoram: ["Aizawl", "Lunglei", "Champhai"],
  nagaland: ["Kohima", "Dimapur", "Mokokchung"],
  odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
  punjab: ["Ludhiana", "Amritsar", "Jalandhar"],
  rajasthan: ["Jaipur", "Udaipur", "Jodhpur"],
  sikkim: ["Gangtok", "Namchi", "Gyalshing"],
  "tamil nadu": ["Chennai", "Coimbatore", "Madurai"],
  telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  tripura: ["Agartala", "Dharmanagar", "Udaipur"],
  "uttar pradesh": ["Lucknow", "Kanpur", "Varanasi"],
  uttarakhand: ["Dehradun", "Haridwar", "Nainital"],
  "west bengal": ["Kolkata", "Asansol", "Siliguri"],
  delhi: ["New Delhi", "Dwarka", "Karol Bagh"],
  "jammu and kashmir": ["Srinagar", "Jammu", "Leh"],
  ladakh: ["Leh", "Kargil"],
  puducherry: ["Puducherry", "Karaikal", "Yanam"],
  chandigarh: ["Chandigarh"],
  "andaman and nicobar islands": ["Port Blair"],
  "dadra and nagar haveli and daman and diu": ["Daman", "Diu", "Silvassa"],
  lakshadweep: ["Kavaratti"],
};

const indianStates = Object.keys(stateCityMapping);

const CompanyForm = ({ open, onOpenChange, onSave }) => {
  const [companyType, setCompanyType] = useState("manufacturer");
  const [gstApplicable, setGstApplicable] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
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
      ...(field === "state" && { city: "" }), // reset city if state changes
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      companyType,
      gstApplicable,
      logo,
    });
    onOpenChange(false);
    console.log("Form data:", {
      ...formData,
      companyType,
      gstApplicable,
      logo,
    });
    const result = window.electron.addCompany({
      ...formData,
      companyType,
      gstApplicable,
      logo,
    });
    if (result.success) {
      console.log("Company saved:", result.result);
      onOpenChange(false);
    } else {
      console.error("Failed to save company:", result.error);
    }
  };

  const availableCities = stateCityMapping[formData.state] || [];

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
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
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

          <div className="flex flex-col space-y-2">
            <Label className="text-sm font-medium">Company Logo</Label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Company logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <label className="cursor-pointer">
                    <span className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700">
                      Choose Logo
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                  {logoPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={handleRemoveLogo}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
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
                  onChange={(e) =>
                    handleInputChange("stateCode", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("addressLine1", e.target.value)
                  }
                />
              </div>

              <div className="flex flex-col space-y-1 w-1/2">
                <Label className="text-sm font-medium">Address Line 2</Label>
                <Textarea
                  placeholder="Locality, Area"
                  rows={2}
                  value={formData.addressLine2}
                  onChange={(e) =>
                    handleInputChange("addressLine2", e.target.value)
                  }
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
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state
                          .split(" ")
                          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">City</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => handleInputChange("city", value)}
                  disabled={!formData.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSubmit}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyForm;
