"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { format } from "date-fns"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-[#040B18] border border-white/10 rounded-xl shadow-2xl text-white", className)}
      formatters={{
        formatCaption: (date, options) => format(date, "MMM yyyy", options).toUpperCase()
      }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 relative",
        month: "space-y-4 w-full",
        month_caption: "flex justify-center pt-2 relative items-center mb-6 h-10",
        caption_label: "text-lg tracking-[0.2em] uppercase font-medium",
        nav: "flex items-center",
        button_previous: "h-10 w-10 bg-transparent p-0 opacity-100 hover:opacity-100 absolute left-0 top-1 z-20 border-2 border-transparent hover:border-[#ADC8FF]/50 hover:bg-[#ADC8FF]/10 transition-all flex items-center justify-center rounded-none text-[#ADC8FF]",
        button_next: "h-10 w-10 bg-transparent p-0 opacity-100 hover:opacity-100 absolute right-0 top-1 z-20 border-2 border-transparent hover:border-[#ADC8FF]/50 hover:bg-[#ADC8FF]/10 transition-all flex items-center justify-center rounded-none text-[#ADC8FF]",
        month_grid: "w-full border-collapse",
        weekdays: "flex justify-between mb-4",
        weekday: "text-white/40 w-12 font-normal text-[0.7rem] text-center uppercase tracking-widest",
        week: "flex w-full mt-0 justify-between",
        day: "w-12 h-12 p-0 relative flex items-center justify-center", // The td cell
        day_button: "h-12 w-12 p-0 font-normal transition-all text-sm w-full h-full flex items-center justify-center m-0 rounded-none hover:bg-[#ADC8FF]/10 hover:border-[#ADC8FF] border border-transparent text-white/80",
        range_start: "day-range-start !bg-[#ADC8FF] !text-[#0B1326] !rounded-none shadow-md",
        range_end: "day-range-end !bg-[#ADC8FF] !text-[#0B1326] !rounded-none shadow-md",
        selected: "!bg-[#ADC8FF] !text-[#0B1326] font-bold hover:!bg-[#ADC8FF]/90",
        today: "border-b-2 border-[#ADC8FF] text-[#ADC8FF] font-bold",
        outside: "day-outside text-white/20 opacity-30 aria-selected:bg-[#ADC8FF]/10",
        disabled: "text-white/20 opacity-30 cursor-not-allowed",
        range_middle: "aria-selected:!bg-[#ADC8FF]/20 aria-selected:!text-white",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className="h-5 w-5" />
          }
          return <ChevronRight className="h-5 w-5" />
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
