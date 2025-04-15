import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../providers/Socket'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const {socket}=useSocket()
  // socket.emit("join-room",{roomId:"1",emailId:"abhi@gmail.com"})
  const [email,setEmail]=useState()
  const [roomId,setRoomId]=useState()

  const navigate=useNavigate()

  const handleRoomJoined=useCallback(({roomId})=>{
    console.log('Room Joined',roomId);
    navigate(`/room/${roomId}`)
  },[navigate])

  useEffect(()=>{
  socket.on('joined-room',handleRoomJoined)
  return ()=>{
    socket.off('joined-room',handleRoomJoined)
  }
  },[socket,handleRoomJoined])


  const handleJoinRoom=()=>{
  socket.emit("join-room",{emailId:email,roomId})
  }
  return (
    <div className='homepage-container'>
      <div className='input-container'>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder='enter your email' />
        <input value={roomId} onChange={e=>setRoomId(e.target.value)} type="text" placeholder='enter room code' />
        <button onClick={handleJoinRoom}>enter room</button>
      </div>
    </div>
  )
}

export default Home
