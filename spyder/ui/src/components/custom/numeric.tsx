import { cn } from "@/lib/utils";
import { useDataContext } from  "../../app/data-wrapper"

interface TemperatureProps {
  temp?: any; // Made optional since we can get it from context
}

const SAFE_MIN = 20;
const SAFE_MAX = 80;
const WARNING_MIN = 25; // lower end of yellow
const WARNING_MAX = 75; // upper end of yellow

/**
 * Get battery status emoji based on temperature value
 * @param temp - The temperature value
 * @returns The appropriate emoji for the temperature range
 */
function getBatteryStatusEmoji(temp: number): string {
  if (isNaN(temp)) return "❓"; // Unknown status for invalid temps
  
  // Unsafe range (too low or too high)
  if (temp > SAFE_MAX) {
    return "🔥"; // Unsafe/dangerous
  }

  if (temp < SAFE_MIN) {
    return "❄️";
  }
  
  // Warning range (approaching unsafe zones)
  if (
    (temp >= SAFE_MIN && temp < WARNING_MIN) ||
    (temp > WARNING_MAX && temp <= SAFE_MAX)
  ) {
    return "⚠️"; // Warning
  }
  
  // Safe range
  return "😎"; // Safe/optimal
}

/**
 * Numeric component that displays the temperature value with battery status emoji.
 * Can receive temperature as prop or get it from DataContext.
 *
 * @param {number} props.temp - Optional temperature value (falls back to context if not provided).
 * @returns {JSX.Element} The rendered Numeric component.
 */
function Numeric({ temp }: TemperatureProps) {
  const { temperature: contextTemp } = useDataContext();
  
  // Use prop temp if provided, otherwise use context temp
  const currentTemp = temp !== undefined ? temp : contextTemp;
  
  const numericTemp =
    typeof currentTemp === "number" ? currentTemp : parseFloat((currentTemp as string).trim());
  
  // Always format to 3 decimal places
  const formattedTemp = isNaN(numericTemp) ? "NaN" : numericTemp.toFixed(3);
  
  // Get the appropriate emoji
  const statusEmoji = getBatteryStatusEmoji(numericTemp);
  
  // Pick the correct colour class
  let colorClass = "text-safe";
  if (!isNaN(numericTemp)) {
    if (numericTemp < SAFE_MIN || numericTemp > SAFE_MAX) {
      colorClass = "text-danger";
    } else if (
      (numericTemp >= SAFE_MIN && numericTemp < WARNING_MIN) ||
      (numericTemp > WARNING_MAX && numericTemp <= SAFE_MAX)
    ) {
      colorClass = "text-warning";
    } else {
      colorClass = "text-safe";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className={cn("text-4xl font-bold", colorClass)}>
        {formattedTemp}°C
      </div>
      <div className="text-3xl" title={`Battery status: ${statusEmoji === "😎" ? "Safe" : statusEmoji === "⚠️" ? "Warning" : "Unsafe"}`}>
        {statusEmoji}
      </div>
    </div>
  );
}

export default Numeric;