import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ItemsPerPage = ({ value, onChange, disabled = false }) => {
  return (
    <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded-lg border border-gray-100 shadow-sm w-fit">
      <Label className="text-sm font-semibold text-gray-700 ml-1">Mostrar</Label>
      <Select
        value={value?.toString()}
        onValueChange={(val) => onChange(Number(val))}
        disabled={disabled}
      >
        <SelectTrigger className="w-[75px] h-9 bg-white border-gray-300 focus:ring-blue-500">
          <SelectValue placeholder={value} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
      <Label className="text-sm font-medium text-gray-600 mr-1">registros por página</Label>
    </div>
  );
};

export default ItemsPerPage;
