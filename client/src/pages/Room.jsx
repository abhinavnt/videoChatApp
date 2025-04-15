import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../providers/Socket'
import { usePeer } from '../providers/Peer'
import ReactPlayer from 'react-player'

const Room = () => {
    const { socket } = useSocket()
    const { peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream } = usePeer()

    const [myStream, setMystream] = useState(null)
    const [remoteEmailId, setRemoteEmailId] = useState()

    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data
        console.log('new user joined room', emailId)
        const offer = await createOffer()
        socket.emit('call-user', { emailId, offer })
        setRemoteEmailId(emailId)
        if (myStream) {
            sendStream(myStream) // Automatically send stream to new user
        }
    }, [createOffer, socket, myStream, sendStream])

    const handleIncommingCall = useCallback(async (data) => {
        const { from, offer } = data
        console.log("incomming call from", from, offer)
        const ans = await createAnswer(offer)
        socket.emit('call-accepted', { emailId: from, ans })
        setRemoteEmailId(from)
        if (myStream) {
            sendStream(myStream) // Automatically send stream upon answering
        }
    }, [createAnswer, socket, myStream, sendStream])

    const handleCallAccepted = useCallback(async (data) => {
        const { ans } = data
        console.log('call got accepted', ans)
        await setRemoteAns(ans)
        if (myStream) {
            sendStream(myStream) // Ensure stream is sent after call is accepted
        }
    }, [setRemoteAns, myStream, sendStream])

    const getUserMediaStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        setMystream(stream)
        sendStream(stream) // Automatically send stream when obtained
    }, [sendStream])

    const handleNegotiation = useCallback(async () => {
        if (peer.signalingState === 'stable') {
            const localOffer = await peer.createOffer()
            await peer.setLocalDescription(localOffer)
            socket.emit('call-user', { emailId: remoteEmailId, offer: localOffer })
            if (myStream) {
                sendStream(myStream) // Send stream during negotiation
            }
        }
    }, [peer, socket, remoteEmailId, myStream, sendStream])

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined)
        socket.on('incomming-call', handleIncommingCall)
        socket.on('call-accepted', handleCallAccepted)

        return () => {
            socket.off('user-joined', handleNewUserJoined)
            socket.off('incomming-call', handleIncommingCall)
            socket.off('call-accepted', handleCallAccepted)
        }
    }, [socket, handleNewUserJoined, handleIncommingCall, handleCallAccepted])

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiation)
        return () => {
            peer.removeEventListener('negotiationneeded', handleNegotiation)
        }
    }, [peer, handleNegotiation])

    useEffect(() => {
        getUserMediaStream()
    }, [getUserMediaStream])

    return (
        <div className='room-page-container'>
            <h1>Room Page</h1>
            <h4>You are connected to {remoteEmailId}</h4>
            <ReactPlayer url={myStream} playing muted />
            <br />
            <ReactPlayer url={remoteStream} playing />
        </div>
    )
}

export default Room