import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Button,
    Grid,
    Avatar,
    Chip,
    CircularProgress,
} from '@mui/material';
import {
    Videocam,
    VideocamOff,
    Mic,
    MicOff,
    ScreenShare,
    StopScreenShare,
    CallEnd,
    Chat,
    People,
    Settings,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../../hooks/redux';

const VideoCall: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAppSelector((state) => state.auth);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_WS_URL, {
            auth: {
                token: localStorage.getItem('accessToken'),
                lessonId: id,
            },
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to WebSocket');
        });

        newSocket.on('participant-joined', (participant) => {
            setParticipants(prev => [...prev, participant]);
        });

        newSocket.on('participant-left', (participantId) => {
            setParticipants(prev => prev.filter(p => p.id !== participantId));
            setRemoteStreams(prev => {
                const newStreams = new Map(prev);
                newStreams.delete(participantId);
                return newStreams;
            });
        });

        newSocket.on('offer', async ({ from, offer }) => {
            // Handle WebRTC offer
        });

        newSocket.on('answer', ({ from, answer }) => {
            // Handle WebRTC answer
        });

        newSocket.on('ice-candidate', ({ from, candidate }) => {
            // Handle ICE candidate
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [id]);

    useEffect(() => {
        const initLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                setLocalStream(stream);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };

        initLocalStream();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setVideoEnabled(videoTrack.enabled);
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setAudioEnabled(audioTrack.enabled);
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!screenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                });

                // Replace video track with screen share
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = peerConnection?.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }

                setScreenSharing(true);

                videoTrack.onended = () => {
                    toggleScreenShare();
                };
            } else {
                // Switch back to camera
                const cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                const cameraTrack = cameraStream.getVideoTracks()[0];

                const sender = peerConnection?.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(cameraTrack);
                }

                setScreenSharing(false);
            }
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    };

    const handleEndCall = () => {
        if (socket) {
            socket.emit('end-call');
            socket.disconnect();
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        window.location.href = `/lessons/${id}`;
    };

    if (!isConnected) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Подключение к уроку...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', bgcolor: 'grey.900', color: 'white' }}>
            <Grid container sx={{ height: '100%' }}>
                {/* Основное видео */}
                <Grid item xs={9} sx={{ position: 'relative' }}>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />

                    {/* Информация о текущем говорящем */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 20,
                            left: 20,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            p: 1,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Avatar>
                            {participants[0]?.name?.[0] || 'U'}
                        </Avatar>
                        <Typography>
                            {participants[0]?.name || 'Участник'}
                        </Typography>
                        <Chip
                            label="Говорит"
                            color="primary"
                            size="small"
                            sx={{ color: 'white' }}
                        />
                    </Box>
                </Grid>

                {/* Боковая панель */}
                <Grid item xs={3} sx={{ bgcolor: 'grey.800', p: 2 }}>
                    {/* Список участников */}
                    <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                            <People sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Участники ({participants.length + 1})
                        </Typography>

                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {/* Локальный пользователь */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: 'grey.700',
                                    mb: 1,
                                }}
                            >
                                <Avatar>
                                    {user?.firstName?.[0] || 'U'}
                                </Avatar>
                                <Typography sx={{ flexGrow: 1 }}>
                                    {user?.firstName} {user?.lastName} (Вы)
                                </Typography>
                                {!audioEnabled && <MicOff fontSize="small" />}
                                {!videoEnabled && <VideocamOff fontSize="small" />}
                            </Box>

                            {/* Удаленные участники */}
                            {participants.map((participant) => (
                                <Box
                                    key={participant.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: 'grey.700',
                                        mb: 1,
                                    }}
                                >
                                    <Avatar>
                                        {participant.name?.[0] || 'U'}
                                    </Avatar>
                                    <Typography sx={{ flexGrow: 1 }}>
                                        {participant.name}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Элементы управления */}
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            <Settings sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Управление
                        </Typography>

                        <Grid container spacing={1} justifyContent="center">
                            <Grid item>
                                <IconButton
                                    sx={{ bgcolor: videoEnabled ? 'grey.700' : 'error.main' }}
                                    onClick={toggleVideo}
                                >
                                    {videoEnabled ? <Videocam /> : <VideocamOff />}
                                </IconButton>
                            </Grid>

                            <Grid item>
                                <IconButton
                                    sx={{ bgcolor: audioEnabled ? 'grey.700' : 'error.main' }}
                                    onClick={toggleAudio}
                                >
                                    {audioEnabled ? <Mic /> : <MicOff />}
                                </IconButton>
                            </Grid>

                            <Grid item>
                                <IconButton
                                    sx={{ bgcolor: screenSharing ? 'primary.main' : 'grey.700' }}
                                    onClick={toggleScreenShare}
                                >
                                    {screenSharing ? <StopScreenShare /> : <ScreenShare />}
                                </IconButton>
                            </Grid>

                            <Grid item>
                                <IconButton sx={{ bgcolor: 'grey.700' }}>
                                    <Chat />
                                </IconButton>
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="error"
                                    startIcon={<CallEnd />}
                                    onClick={handleEndCall}
                                >
                                    Завершить урок
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                {/* Маленькое локальное видео */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                        width: 200,
                        height: 150,
                        bgcolor: 'black',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '2px solid',
                        borderColor: videoEnabled ? 'primary.main' : 'error.main',
                    }}
                >
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            p: 0.5,
                            textAlign: 'center',
                        }}
                    >
                        Вы {!videoEnabled && '(Камера выкл.)'}
                    </Typography>
                </Box>
            </Grid>
        </Box>
    );
};

export default VideoCall;