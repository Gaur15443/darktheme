import { useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import io, { Socket } from 'socket.io-client';
import Config from 'react-native-config';
import { updateAstrologersStatus } from '../../store/apps/astrologersListing';
import { RootState } from '../../store';
import { updateSearchAstrologersStatus } from '../../store/apps/astrologersSearch';
import type { AstrologyStatusPayload } from './index.d';
import { updateProfileLiveStatus } from '../../store/apps/astroProfile';

export default function useLiveAstrologers(callback?: (data: AstrologyStatusPayload) => void): React.MutableRefObject<Socket | null> {
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.userInfo._id);
    const socketRef = useRef<Socket | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (!userId) return undefined;

            const socket: Socket = io(Config.ASTRO_SOCKET, {
                transports: ['websocket'],
            });

            socketRef.current = socket;

            const handleAstrologersUpdate = (data: AstrologyStatusPayload) => {
                dispatch(updateAstrologersStatus(data));
                dispatch(updateSearchAstrologersStatus(data));
                dispatch(updateProfileLiveStatus(data));

                if (typeof callback === 'function') {
                    callback(data);
                }
            };

            socket.on('astrologyStatusUpdated', handleAstrologersUpdate);
            // Uncomment for testing
            // socket.on('connect_error', (err: Error) =>
            //     console.error('LiveAstrologers socket error:', err),
            // );
            // socket.on('disconnect', (reason: Socket.DisconnectReason) =>
            //     console.log('LiveAstrologers socket disconnected:', reason),
            // );

            return () => {
                socket.off('astrologyStatusUpdated', handleAstrologersUpdate);
                socket.disconnect();
            };
        }, [userId, dispatch]),
    );

    return socketRef;
}