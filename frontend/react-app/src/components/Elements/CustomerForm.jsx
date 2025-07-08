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
import { Phone, Mail, Copy } from "lucide-react";
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
  const [formData, setFormData] = useState({
    // Customer info
    customerType: "business", // Default value
    salutation: "mr", // Default value
    firstName: "",
    lastName: "",
    panNumber: "",
    companyName: "",
    currency: "",
    gstApplicable: false, // Default value
    gstin: "",
    stateCode: "",

    // Billing address
    billingCountry: "",
    billingState: "",
    billingCity: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingContactNo: "",
    billingEmail: "",
    billingAlternateContactNo: "",

    // Shipping address
    shippingCountry: "",
    shippingState: "",
    shippingCity: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingContactNo: "",
    shippingEmail: "",
    shippingAlternateContactNo: "",
  });

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

  // Get available cities based on the selected state
  const getBillingCities = () => stateCityMapping[formData.billingState] || [];
  const getShippingCities = () =>
    stateCityMapping[formData.shippingState] || [];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset city when state changes
    if (field === "billingState") {
      setFormData((prev) => ({
        ...prev,
        billingCity: "",
      }));
    } else if (field === "shippingState") {
      setFormData((prev) => ({
        ...prev,
        shippingCity: "",
      }));
    }
  };

  const copyBillingToShipping = async () => {
    // First update the state without the city
    const updatedData = {
      ...formData,
      shippingCountry: formData.billingCountry,
      shippingState: formData.billingState,
      shippingAddressLine1: formData.billingAddressLine1,
      shippingAddressLine2: formData.billingAddressLine2,
      shippingContactNo: formData.billingContactNo,
      shippingEmail: formData.billingEmail,
      shippingAlternateContactNo: formData.billingAlternateContactNo,
    };

    // Set the form data without the city first
    setFormData(updatedData);

    // Use setTimeout to allow React to update the state and re-render
    // This ensures the city dropdown is no longer disabled
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        shippingCity: formData.billingCity,
      }));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data:", formData);

    const result = await window.electron.addCustomer(formData);
    if (result.success) {
      console.log("Customer saved:", result.result);
      if (onSave) onSave(result.result);
      onOpenChange(false);
    } else {
      console.error("Failed to save item:", result.error);
    }
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
                  checked={formData.customerType === "business"}
                  onChange={() => handleInputChange("customerType", "business")}
                />
                <span>Business</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="customerType"
                  value="individual"
                  checked={formData.customerType === "individual"}
                  onChange={() => handleInputChange("customerType", "individual")}
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
                <Select 
                  value={formData.salutation}
                  onValueChange={(value) => handleInputChange("salutation", value)}
                >
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
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
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
                value={formData.panNumber}
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
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
              />
            </div>

            {/* Currency */}
            <div className="flex flex-col space-y-1 w-1/2">
              <Label className="text-sm font-medium">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
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
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gstApplicable"
                value="yes"
                checked={formData.gstApplicable === true}
                onChange={() => handleInputChange("gstApplicable", true)}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gstApplicable"
                value="no"
                checked={formData.gstApplicable === false}
                onChange={() => handleInputChange("gstApplicable", false)}
              />
              <span>No</span>
            </label>
          </div>

          {formData.gstApplicable && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">GSTIN/UIN</Label>
                <Input
                  placeholder="GST Number"
                  value={formData.gstin}
                  onChange={(e) =>
                    handleInputChange("gstin", e.target.value)
                  }
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
                      <Select
                        value={formData.billingCountry}
                        onValueChange={(value) =>
                          handleInputChange("billingCountry", value)
                        }
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
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium">State</Label>
                      <Select
                        value={formData.billingState}
                        onValueChange={(value) =>
                          handleInputChange("billingState", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state
                                .split(" ")
                                .map(
                                  (s) => s.charAt(0).toUpperCase() + s.slice(1)
                                )
                                .join(" ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-4">
                  <div className="flex flex-col space-y-1 w-1/2">
                    <Label className="text-sm font-medium">
                      Address Line 1
                    </Label>
                    <Textarea
                      placeholder="Street Address, Building Name"
                      rows={2}
                      value={formData.billingAddressLine1}
                      onChange={(e) =>
                        handleInputChange("billingAddressLine1", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-1 w-1/2">
                    <Label className="text-sm font-medium">
                      Address Line 2
                    </Label>
                    <Textarea
                      placeholder="Locality, Area"
                      rows={2}
                      value={formData.billingAddressLine2}
                      onChange={(e) =>
                        handleInputChange("billingAddressLine2", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col space-y-1">
                    <Label className="text-sm font-medium">City</Label>
                    <Select
                      value={formData.billingCity}
                      onValueChange={(value) =>
                        handleInputChange("billingCity", value)
                      }
                      disabled={!formData.billingState}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {getBillingCities().map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-1">
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
                        value={formData.billingContactNo}
                        onChange={(e) =>
                          handleInputChange("billingContactNo", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-4">
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
                        value={formData.billingEmail}
                        onChange={(e) =>
                          handleInputChange("billingEmail", e.target.value)
                        }
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
                        value={formData.billingAlternateContactNo}
                        onChange={(e) =>
                          handleInputChange("billingAlternateContactNo", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="ml-2 mt-4">
                {/* Same as Billing Address Button */}
                <div className="mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyBillingToShipping}
                    className="flex items-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Same as Billing Address</span>
                  </Button>
                </div>

                {/* Shipping Address Form Fields */}
                <div className="flex flex-col space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium">
                        Country/Region
                      </Label>
                      <Select
                        value={formData.shippingCountry}
                        onValueChange={(value) =>
                          handleInputChange("shippingCountry", value)
                        }
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
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium">State</Label>
                      <Select
                        value={formData.shippingState}
                        onValueChange={(value) =>
                          handleInputChange("shippingState", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state
                                .split(" ")
                                .map(
                                  (s) => s.charAt(0).toUpperCase() + s.slice(1)
                                )
                                .join(" ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex flex-col space-y-1 w-1/2">
                      <Label className="text-sm font-medium">
                        Address Line 1
                      </Label>
                      <Textarea
                        placeholder="Street Address, Building Name"
                        rows={2}
                        value={formData.shippingAddressLine1}
                        onChange={(e) =>
                          handleInputChange("shippingAddressLine1", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col space-y-1 w-1/2">
                      <Label className="text-sm font-medium">
                        Address Line 2
                      </Label>
                      <Textarea
                        placeholder="Locality, Area"
                        rows={2}
                        value={formData.shippingAddressLine2}
                        onChange={(e) =>
                          handleInputChange("shippingAddressLine2", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <Label className="text-sm font-medium">City</Label>
                      <Select
                        value={formData.shippingCity}
                        onValueChange={(value) =>
                          handleInputChange("shippingCity", value)
                        }
                        disabled={!formData.shippingState}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          {getShippingCities().map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
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
                          value={formData.shippingContactNo}
                          onChange={(e) =>
                            handleInputChange("shippingContactNo", e.target.value)
                          }
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
                          value={formData.shippingEmail}
                          onChange={(e) =>
                            handleInputChange("shippingEmail", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Alternate Phone Number */}
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
                          value={formData.shippingAlternateContactNo}
                          onChange={(e) =>
                            handleInputChange(
                              "shippingAlternateContactNo",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
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
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerForm;