import React, { useCallback, useEffect, useMemo, useState } from "react";

const PeerContext=React.createContext(null)

export const usePeer=()=>React.useContext(PeerContext)

export const PeerProvider=(props)=>{

  const [remoteStream,setRemoteStream]=useState(null)


    const peer=useMemo(()=>new RTCPeerConnection({
        iceServers:[
            {
                urls:[
                    "stun:stun.l.google.com:19302",
                    "stun:global.stun.twilio.com:3478"
                ]
            }
        ]
    }),[])


    const createOffer= async()=>{
        const offer=await peer.createOffer()
        await peer.setLocalDescription(offer)
        return offer
    }

    const createAnswer=async(offer)=>{
        await peer.setRemoteDescription(offer)
        const answer=await peer.createAnswer()
        await peer.setLocalDescription(answer)
        return answer
    }

    const setRemoteAns = async (ans) => {
        if (peer.signalingState !== 'stable') {
            await peer.setRemoteDescription(ans);
        } else {
            console.warn('Peer connection is in stable state, skipping setRemoteDescription');
        }
    };

    const sendStream = async (stream) => {
        if (!stream) return; // Guard clause if stream is null
        const tracks = stream.getTracks();
        for (const track of tracks) {
            const senders = peer.getSenders();
            const sender = senders.find(s => s.track === track);
            if (!sender) {
                peer.addTrack(track, stream);
            }
        }
    };

    const handleTrackEvent=useCallback((ev)=>{
        const streams=ev.streams;
        setRemoteStream(streams[0])
    },[])

  
    useEffect(()=>{
        peer.addEventListener("track",handleTrackEvent)

       
 
        return ()=>{
            peer.removeEventListener("track",handleTrackEvent)
          
        }

    },[peer,handleTrackEvent])

    return (
      <PeerContext.Provider value={{peer,createOffer,createAnswer,setRemoteAns,sendStream,remoteStream}}>
        {props.children}
      </PeerContext.Provider>
    )
}