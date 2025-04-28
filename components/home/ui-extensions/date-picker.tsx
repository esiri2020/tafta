import {useState, useEffect} from 'react';
import {format} from 'date-fns';
import {CalendarIcon, ChevronLeftIcon, ChevronRightIcon} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label: string;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  label,
  placeholder = 'Select date',
  minYear = 1940,
  maxYear = new Date().getFullYear() - 15,
  disabled = false,
  className,
}: DatePickerProps) {
  const [month, setMonth] = useState<number>(
    date?.getMonth() || new Date().getMonth(),
  );
  const [year, setYear] = useState<number>(date?.getFullYear() || maxYear - 20);
  const [selectedDay, setSelectedDay] = useState<number | null>(
    date?.getDate() || null,
  );

  // Update internal state when date prop changes
  useEffect(() => {
    if (date) {
      setMonth(date.getMonth());
      setYear(date.getFullYear());
      setSelectedDay(date.getDate());
    }
  }, [date]);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate array of month names
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Generate array of years
  const years = Array.from(
    {length: maxYear - minYear + 1},
    (_, i) => maxYear - i,
  );

  // Handle month change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(parseInt(e.target.value));
  };

  // Handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(parseInt(e.target.value));
  };

  // Handle day selection
  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    const newDate = new Date(year, month, day);
    onDateChange(newDate);
  };

  // Navigate to previous month
  const prevMonth = () => {
    if (month === 0) {
      if (year > minYear) {
        setMonth(11);
        setYear(year - 1);
      }
    } else {
      setMonth(month - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (month === 11) {
      if (year < maxYear) {
        setMonth(0);
        setYear(year + 1);
      }
    } else {
      setMonth(month + 1);
    }
  };

  // Generate calendar days
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className='h-9 w-9'></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        day === selectedDay &&
        date?.getMonth() === month &&
        date?.getFullYear() === year;
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      // Check if date is disabled
      const currentDate = new Date(year, month, day);
      const isDisabled =
        currentDate > new Date() ||
        currentDate >
          new Date(new Date().setFullYear(new Date().getFullYear() - 15));

      days.push(
        <Button
          key={day}
          type='button'
          onClick={() => !isDisabled && handleDaySelect(day)}
          variant={isSelected ? 'default' : 'ghost'}
          className={cn(
            'h-9 w-9 p-0 font-normal',
            isSelected &&
              'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            isToday && !isSelected && 'border border-primary',
            isDisabled &&
              'text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent',
          )}
          disabled={isDisabled}>
          {day}
        </Button>,
      );
    }

    return days;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}>
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, 'MMMM d, yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <div className='p-3'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex-1'>
              <select
                value={month}
                onChange={handleMonthChange}
                className='w-full border-0 bg-transparent text-sm font-medium focus:ring-0 focus:outline-none'
                aria-label='Select month'>
                {months.map((monthName, index) => (
                  <option key={monthName} value={index}>
                    {monthName}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex-1'>
              <select
                value={year}
                onChange={handleYearChange}
                className='w-full border-0 bg-transparent text-sm font-medium focus:ring-0 focus:outline-none'
                aria-label='Select year'>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex items-center justify-between mb-2'>
            <Button
              variant='ghost'
              className='h-7 w-7 p-0'
              onClick={prevMonth}
              disabled={year === minYear && month === 0}>
              <ChevronLeftIcon className='h-4 w-4' />
              <span className='sr-only'>Previous month</span>
            </Button>
            <div className='text-sm font-medium'>
              {months[month]} {year}
            </div>
            <Button
              variant='ghost'
              className='h-7 w-7 p-0'
              onClick={nextMonth}
              disabled={year === maxYear && month === 11}>
              <ChevronRightIcon className='h-4 w-4' />
              <span className='sr-only'>Next month</span>
            </Button>
          </div>

          <div className='grid grid-cols-7 gap-1 text-center text-xs font-medium'>
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          <div className='grid grid-cols-7 gap-1 mt-1'>
            {renderCalendarDays()}
          </div>

          {date && (
            <div className='mt-3 text-xs text-muted-foreground'>
              Selected:{' '}
              <span className='font-medium'>
                {format(date, 'MMMM d, yyyy')}
              </span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
