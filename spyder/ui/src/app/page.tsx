"use client"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer, BarChart3 } from "lucide-react"
import Numeric from "../components/custom/numeric"
import BatteryChart from "../components/custom/battery-chart"
import { ThemeToggle } from "../components/custom/theme-toggle"
import { DataWrapper, useDataContext } from "./data-wrapper"
import RedbackLogoDarkMode from "../../public/logo-darkmode.svg"
import RedbackLogoLightMode from "../../public/logo-lightmode.svg"

/**
 * Main content component that consumes data from DataContext.
 * Separated from Page to allow for clean data/UI separation.
 */
function PageContent(): JSX.Element {
  const { theme } = useTheme()
  const { temperature, connectionStatus, historicalData } = useDataContext()
  const [showChart, setShowChart] = useState<boolean>(true)
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 h-20 flex items-center gap-5 border-b">
        <Image
          src={theme === "dark" ? RedbackLogoDarkMode : RedbackLogoLightMode}
          className="h-12 w-auto"
          alt="Redback Racing Logo"
        />
        <h1 className="text-foreground text-xl font-semibold">DAQ Technical Assessment</h1>
        
        <div className="ml-auto flex items-center gap-3">
          <Badge variant={connectionStatus === "Connected" ? "success" : "destructive"}>
            {connectionStatus}
          </Badge>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-grow p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Current Temperature Card */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl font-light flex items-center gap-2">
                  <Thermometer className="h-6 w-6" />
                  Live Battery Temperature
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Numeric temp={temperature} />
              </CardContent>
            </Card>
          </div>

          {/* Chart Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              {showChart ? 'Hide Chart' : 'Show Chart'}
            </button>
          </div>

          {/* Historical Data Chart */}
          {showChart && historicalData.length > 0 && (
            <div className="w-full">
              <BatteryChart 
                data={historicalData} 
                maxDataPoints={50}
              />
            </div>
          )}

          {/* Info Message when no data */}
          {showChart && historicalData.length === 0 && (
            <Card className="w-full">
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  Waiting for temperature data to display chart...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Data Statistics */}
          {historicalData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Data Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{historicalData.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Min Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.min(...historicalData.map(d => Number(d.battery_temperature)))}°C
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Max Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.max(...historicalData.map(d => Number(d.battery_temperature)))}°C
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

/**
 * Page component that displays DAQ technical assessment.
 * Now wrapped with DataWrapper for clean separation of concerns.
 *
 * @returns {JSX.Element} The rendered page component wrapped with data context.
 */
export default function Page(): JSX.Element {
  return (
    <DataWrapper>
      <PageContent />
    </DataWrapper>
  )
}