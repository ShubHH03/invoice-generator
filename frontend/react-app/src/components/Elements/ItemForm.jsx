import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

const ItemForm = ({ open, onOpenChange, onSave }) => {
  const [formData, setFormData] = useState();
  const [itemType, setItemType] = useState("goods");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data:", formData);

    const result = await window.electron.addItems(formData);
    if (result.success) {
      console.log("Item saved:", result);
      onOpenChange(false);
    } else {
      console.error("Failed to save item:", result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          {/* Item Type */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">Item Type</Label>
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="itemType"
                  value="goods"
                  checked={itemType === "goods"}
                  onChange={() => {
                    setItemType("goods");
                    handleInputChange("itemType", "goods");
                  }}
                />

                <span>Goods</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="itemType"
                  value="service"
                  checked={itemType === "service"}
                  onChange={() => {
                    setItemType("service");
                    handleInputChange("itemType", "service");
                  }}
                />
                <span>Service</span>
              </label>
            </div>
          </div>

          {/* Item Name */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">Item Name</Label>
            </div>
            <Input
              // value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter item name"
            />
          </div>

          {/* HSN/SAC Code - ADDED THIS SECTION */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">
                {itemType === "goods" ? "HSN Code" : "SAC Code"}
              </Label>
            </div>
            <Input
              // value={formData.hsnSacCode}
              onChange={(e) => handleInputChange("hsnSacCode", e.target.value)}
              placeholder={`Enter ${itemType === "goods" ? "HSN" : "SAC"} code`}
            />
          </div>

          {/* Unit */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">Unit Type</Label>
            </div>
            <Input
              // value={formData.unit}
              onChange={(e) => handleInputChange("unit", e.target.value)}
              placeholder="e.g. Box, Hour, Day"
            />
          </div>

          {/* Selling Price */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">Selling Price</Label>
            </div>
            <div className="flex">
              <div className="bg-gray-100 border border-r-0 rounded-l px-3 flex items-center text-gray-500">
                INR
              </div>
              <Input
                className="rounded-l-none"
                // value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
              <Label className="text-sm font-medium">Description</Label>
            </div>
            <Textarea
              // value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter item description"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button variant="default" type="submit" onClick={handleSubmit}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemForm;
