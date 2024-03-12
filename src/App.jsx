import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import SwapPage from "./pages/SwapPage";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import Root from "./root";
import { WagmiProvider } from "wagmi";
import { config } from "../config";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' 

function App() {
  
  const router = createBrowserRouter([
    { path: "/", element: <Root/>, children:[ { path: "swap", element: <SwapPage /> },] },
   
    
  ]);
  const queryClient = new QueryClient() 
  return (
    <>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
    <MoralisProvider initializeOnMount={false}>
    <NotificationProvider>
      <RouterProvider router={router} />
        </NotificationProvider>
        </MoralisProvider>
        </QueryClientProvider>
        </WagmiProvider> 
    </>
  );
}

export default App;
