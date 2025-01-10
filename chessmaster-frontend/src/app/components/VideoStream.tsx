"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  FC,
} from "react";
import Peer from "peerjs";
import VideoPlaceHolder from "./VideoPlaceHolder";

interface VideoStreamProps {
  myUniqueId: string;
  myName: string;
}
const VideoStream: FC<VideoStreamProps> = forwardRef(
  (
    { myUniqueId }: VideoStreamProps,
    ref: React.Ref<{ handleCall: (idToCall: string) => void }>
  ) => {
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const callingVideoRef = useRef<HTMLVideoElement>(null);
    const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
    // const [myUniqueId, setMyUniqueId] = useState<string>("");
    const [idToCall, setIdToCall] = useState("");
    // const generateRandomString = () => Math.random().toString(36).substring(2);

    useImperativeHandle(ref, () => ({
      handleCall,
    }));

    // OutBound call
    const handleCall = (idToCall: string) => {
      console.log("calling", idToCall);
      if (myVideoRef.current && myVideoRef.current.srcObject) {
        const stream = myVideoRef.current.srcObject as MediaStream; // Reuse the existing stream
        const call = peerInstance?.call(idToCall, stream); // Initiate the call with the existing stream
        console.log("call", call);
        if (call) {
          call.on("stream", (userVideoStream) => {
            if (callingVideoRef.current) {
              console.log("stream", userVideoStream);
              callingVideoRef.current.srcObject = userVideoStream; // Display the remote stream
            }
          });
        }
      } else {
        console.error("No stream found on myVideoRef.");
      }
    };

    const handleAudioToggle = (enabled: boolean) => {
      const stream = myVideoRef.current?.srcObject as MediaStream;
      if (stream) {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = enabled; // Enable or disable audio
          console.log(`Audio ${enabled ? "enabled" : "disabled"}`);
        }
      }
    };

    const handleVideoToggle = (enabled: boolean) => {
      const stream = myVideoRef.current?.srcObject as MediaStream;
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = enabled; // Enable or disable video
        }
        console.log(`Video ${enabled ? "enabled" : "disabled"}`);
      }
    };

    useEffect(() => {
      if (myUniqueId) {
        let peer: Peer;
        if (typeof window !== "undefined") {
          // console.log("peerjs");
          console.log("myUniqueId", myUniqueId);

          peer = new Peer(myUniqueId, {
            host: `${window.location.hostname}`,
            //host: "localhost",
            //host: "3.19.65.120",
            port: 4001,
            path: "/peer",
            secure: true,
          });
          setPeerInstance(peer);
          //inbound call stream
          navigator.mediaDevices
            .getUserMedia({
              video: true,
              audio: true,
            })
            .then((stream) => {
              if (myVideoRef.current) {
                myVideoRef.current.srcObject = stream;
              }
              peer.on("call", (call) => {
                call.answer(stream);
                call.on("stream", (userVideoStream) => {
                  if (callingVideoRef.current) {
                    callingVideoRef.current.srcObject = userVideoStream;
                  }
                });
              });
            });
        }
        return () => {
          if (peer) {
            peer.destroy();
          }
        };
      }
    }, []);

    return (
      <div className="">
        <VideoPlaceHolder
          ref={callingVideoRef}
          isMe={false}
          onAudioToggle={handleAudioToggle}
          onVideoToggle={handleVideoToggle}
        />
        <VideoPlaceHolder
          ref={myVideoRef}
          isMe={true}
          onAudioToggle={handleAudioToggle}
          onVideoToggle={handleVideoToggle}
        />
      </div>
    );
  }
);

export default VideoStream;
