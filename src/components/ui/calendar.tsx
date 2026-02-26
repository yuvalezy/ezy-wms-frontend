import * as React from "react"
import {ChevronLeft, ChevronRight} from "lucide-react"
import {cn} from "@/utils/css-utils"
import {Button} from "@/components/ui/button"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  mode?: "single" | "range"
  className?: string
  disabled?: (date: Date) => boolean
  showYearMonthSelector?: boolean
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function Calendar({
  selected,
  onSelect,
  mode = "single",
  className,
  disabled,
  showYearMonthSelector = true,
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(() => selected || new Date())
  
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  
  // Generate year range (current year ± 10 years)
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }
  
  const handleMonthChange = (month: string) => {
    const monthIndex = MONTHS.indexOf(month)
    setCurrentDate(new Date(currentYear, monthIndex, 1))
  }
  
  const handleYearChange = (year: string) => {
    setCurrentDate(new Date(parseInt(year), currentMonth, 1))
  }
  
  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day)
    if (disabled && disabled(newDate)) return
    onSelect?.(newDate)
  }
  
  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  // Get days from previous month to fill the grid
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()
  const leadingDays = firstDayOfMonth
  
  // Calculate total cells needed (always 42 for 6 rows)
  const totalCells = 42
  const remainingCells = totalCells - leadingDays - daysInMonth
  
  const isSelected = (day: number) => {
    if (!selected) return false
    return selected.getDate() === day && 
           selected.getMonth() === currentMonth && 
           selected.getFullYear() === currentYear
  }
  
  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear
  }
  
  const isDisabled = (day: number, isCurrentMonth = true) => {
    if (!disabled) return false
    const date = isCurrentMonth 
      ? new Date(currentYear, currentMonth, day)
      : new Date(currentYear, currentMonth - 1, day)
    return disabled(date)
  }
  
  return (
    <div className={cn("p-3", className)} {...props}>
      {/* Header with navigation */}
      <div className="flex justify-center items-center relative mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="absolute left-0 h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {showYearMonthSelector ? (
          <div className="flex items-center gap-2">
            <Select value={MONTHS[currentMonth]} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-auto border-none bg-transparent hover:bg-accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-auto border-none bg-transparent hover:bg-accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <h2 className="text-sm font-medium">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="absolute right-0 h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="h-8 w-8 text-center text-xs font-medium text-muted-foreground flex items-center justify-center"
          >
            {day}
          </div>
        ))}
        
        {/* Previous month trailing days */}
        {Array.from({ length: leadingDays }, (_, i) => {
          const day = prevMonthDays - leadingDays + i + 1
          return (
            <Button
              key={`prev-${day}`}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground opacity-50"
              onClick={() => {
                setCurrentDate(new Date(currentYear, currentMonth - 1, day))
                handleDateSelect(day)
              }}
              disabled={isDisabled(day, false)}
            >
              {day}
            </Button>
          )
        })}
        
        {/* Current month days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const selected = isSelected(day)
          const today = isToday(day)
          const disabled = isDisabled(day)
          
          return (
            <Button
              key={day}
              variant={selected ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                today && !selected && "bg-accent text-accent-foreground",
                selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleDateSelect(day)}
              disabled={disabled}
            >
              {day}
            </Button>
          )
        })}
        
        {/* Next month leading days */}
        {Array.from({ length: remainingCells }, (_, i) => {
          const day = i + 1
          return (
            <Button
              key={`next-${day}`}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground opacity-50"
              onClick={() => {
                setCurrentDate(new Date(currentYear, currentMonth + 1, day))
                handleDateSelect(day)
              }}
              disabled={isDisabled(day, false)}
            >
              {day}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }
