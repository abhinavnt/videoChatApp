
import React, { use, useCallback, useEffect, useState } from 'react'
import { useSocket } from '../providers/Socket'
import { usePeer } from '../providers/Peer'
import ReactPlayer from 'react-player'

const Room = () => {
    const {socket}=useSocket()
    const {peer,createOffer,createAnswer,setRemoteAns,sendStream,remoteStream}=usePeer()

    const [myStream,setMystream]=useState(null)
    const [remoteEmailId,setRemoteEmailId]=useState()
  
    const handleNewUserJoined=useCallback(async(data)=>{
        const {emailId}=data
        console.log('new user joined room',emailId);
        const offer=await createOffer()
        socket.emit('call-user',{emailId,offer})
        setRemoteEmailId(emailId)
        
    },[createOffer,socket])

    const handleIncommingCall=useCallback(async(data)=>{
         const {from,offer}=data
         console.log("incomming calling from",from,offer);
         const ans=await createAnswer(offer)
         socket.emit('call-accepted',{emailId:from,ans})
         setRemoteEmailId(from)
    },[createAnswer,socket])


    const handleCallAccepted=useCallback(async(data)=>{
        const {ans}=data
        console.log('call got accpted',ans);
        
        await setRemoteAns(ans)
        sendStream(myStream)

    },[setRemoteAns,myStream,sendStream])


    const getUserMediaStream=useCallback(async()=>{
        const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:true})
        
        setMystream(stream)
    },[])

      const handleNegeosiation= useCallback(()=>{
        const localOffer=peer.createOffer()
            socket.emit('call-user',{emailId:remoteEmailId,offer:localOffer})
             
        },[])

    useEffect(()=>{
       socket.on('user-joined',handleNewUserJoined)
       socket.on('incomming-call',handleIncommingCall)
       socket.on('call-accepted',handleCallAccepted)
       
    //    return ()=>{
    //     socket.off('user-joined',handleNewUserJoined)
    //     socket.off('incomming-call',handleIncommingCall)
    //     socket.off('call-accepted',handleCallAccepted)
    //    }
    },[socket,handleNewUserJoined,handleIncommingCall,handleCallAccepted])

    useEffect(()=>{
        peer.addEventListener('negotiationneeded',handleNegeosiation)

        return ()=> {

            peer.removeEventListener('negotiationneeded',handleNegeosiation)
        } 
    },[])


    useEffect(()=>{
        getUserMediaStream()
    },[getUserMediaStream])


  return (
    <div className='room-page-container'>
      <h1>room page</h1>
      <h4>you are connected to {remoteEmailId}</h4>
      <button onClick={e=>sendStream(myStream)}>Send my video</button>
      <ReactPlayer url={myStream} playing />
      <ReactPlayer url={remoteStream} playing/>
    </div>
  )
}

export default Room
