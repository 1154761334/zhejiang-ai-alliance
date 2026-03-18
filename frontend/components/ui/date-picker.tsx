"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value?: string | Date
  onChange?: (date: string | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({ value, onChange, placeholder = "选择日期", className, disabled }: DatePickerProps) {
  // Sync internal date state with incoming value
  const date = React.useMemo(() => {
    if (!value) return undefined
    return typeof value === 'string' ? new Date(value) : value
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    if (onChange) {
      if (selectedDate) {
        // Format to YYYY-MM-DD for consistency with backend and native inputs
        onChange(format(selectedDate, "yyyy-MM-dd"))
      } else {
        onChange(undefined)
      }
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy-MM-dd") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
        />
      </PopoverContent>
    </Popover>
  )
}
