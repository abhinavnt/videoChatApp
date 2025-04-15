import { useState } from 'react'
import { Route,Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import { SocketProvider } from './providers/Socket'
import Room from './pages/Room'
import { PeerProvider } from './providers/Peer'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <SocketProvider>
            
          <PeerProvider>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/room/:roomId' element={<Room/>}/>
      </Routes>
          </PeerProvider>
        </SocketProvider>
    </>
  )
}

export default App
