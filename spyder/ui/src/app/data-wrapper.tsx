"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"

const WS_URL = "ws://localhost:8080"

interface VehicleData {
  battery_temperature: number
  timestamp: number
}

interface DataContextType {
  temperature: any
  connectionStatus: string
  historicalData: VehicleData[]
  isConnected: boolean
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined)

interface DataWrapperProps {
  children: ReactNode
}

/**
 * DataWrapper component that provides WebSocket data through React Context.
 * Handles WebSocket connection, data storage, and provides data to child components.
 */
export function DataWrapper({ children }: DataWrapperProps) {
  const [temperature, setTemperature] = useState<any>(0)
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
  const [historicalData, setHistoricalData] = useState<VehicleData[]>([])
  
  const { lastJsonMessage, readyState }: { lastJsonMessage: VehicleData | null; readyState: ReadyState } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  /**
   * Effect hook to handle WebSocket connection state changes.
   */
  useEffect(() => {
    switch (readyState) {
      case ReadyState.OPEN:
        console.log("Connected to streaming service")
        setConnectionStatus("Connected")
        break
      case ReadyState.CLOSED:
        console.log("Disconnected from streaming service")
        setConnectionStatus("Disconnected")
        break
      case ReadyState.CONNECTING:
        setConnectionStatus("Connecting")
        break
      default:
        setConnectionStatus("Disconnected")
        break
    }
  }, [readyState])

  /**
   * Effect hook to handle incoming WebSocket messages.
   * Stores both current temperature and historical data for charting.
   */
  useEffect(() => {
    console.log("Received: ", lastJsonMessage)
    if (lastJsonMessage === null) {
      return
    }
    
    // Update current temperature
    setTemperature(lastJsonMessage.battery_temperature)
    
    // Add to historical data (keep last 100 data points for performance)
    setHistoricalData(prevData => {
      const newData = [...prevData, lastJsonMessage]
      // Keep only the last 100 readings to prevent memory issues
      return newData.slice(-100)
    })
  }, [lastJsonMessage])

  const contextValue: DataContextType = {
    temperature,
    connectionStatus,
    historicalData,
    isConnected: readyState === ReadyState.OPEN,
  }

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}

/**
 * Custom hook to use the data context.
 * Throws an error if used outside of DataWrapper.
 */
export function useDataContext(): DataContextType {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataWrapper')
  }
  return context
}

export default DataWrapper