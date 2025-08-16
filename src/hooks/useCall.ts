"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface Call {
  id?: string;
  callerId: string;
  receiverId: string;
  status: 'initiated' | 'ongoing' | 'ended' | 'missed';
  startTime: string;
  endTime?: string;
  duration?: number;
}

interface UseCallProps {
  userId: string;
}

interface UseCallReturn {
  currentCall: Call | null;
  isCallActive: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  initiateCall: (receiverId: string) => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  error: string | null;
  clearError: () => void;
}

export function useCall({ userId }: UseCallProps): UseCallReturn {
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize WebRTC peer connection
  const initializePeerConnection = useCallback(() => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real implementation, send this candidate to the remote peer
        console.log('ICE candidate:', event.candidate);
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, []);

  // Get user media (camera and microphone)
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: true,
      });

      setLocalStream(stream);
      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera/microphone';
      setError(errorMessage);
      throw err;
    }
  }, [isVideoEnabled]);

  // Initiate a call
  const initiateCall = useCallback(async (receiverId: string) => {
    if (!userId || !receiverId) {
      setError('Missing user IDs for call initiation');
      return;
    }

    setError(null);

    try {
      // Create call record in database
      const response = await fetch('/api/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callerId: userId,
          receiverId,
          status: 'initiated',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      const data = await response.json();
      if (data.success) {
        setCurrentCall(data.call);
        setIsCallActive(true);

        // Initialize WebRTC
        const peerConnection = initializePeerConnection();
        const stream = await getUserMedia();

        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // In a real implementation, send offer to remote peer via signaling server
        console.log('Call offer created:', offer);

        // Update call status to ongoing
        await updateCallStatus(data.call.id, 'ongoing');
      } else {
        throw new Error(data.error || 'Failed to initiate call');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate call';
      setError(errorMessage);
      console.error('Error initiating call:', err);
    }
  }, [userId, initializePeerConnection, getUserMedia]);

  // End the current call
  const endCall = useCallback(async () => {
    if (!currentCall) return;

    setError(null);

    try {
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Update call status in database
      await updateCallStatus(currentCall.id!, 'ended', new Date().toISOString());

      setCurrentCall(null);
      setIsCallActive(false);
      setRemoteStream(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end call';
      setError(errorMessage);
      console.error('Error ending call:', err);
    }
  }, [currentCall, localStream]);

  // Update call status
  const updateCallStatus = useCallback(async (callId: string, status: Call['status'], endTime?: string) => {
    try {
      const response = await fetch('/api/call', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callId,
          status,
          endTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update call status');
      }

      const data = await response.json();
      if (data.success) {
        setCurrentCall(data.call);
      }
    } catch (err) {
      console.error('Error updating call status:', err);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [localStream]);

  return {
    currentCall,
    isCallActive,
    isMuted,
    isVideoEnabled,
    localStream,
    remoteStream,
    initiateCall,
    endCall,
    toggleMute,
    toggleVideo,
    error,
    clearError,
  };
}

export default useCall;
