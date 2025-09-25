import PropTypes from 'prop-types';
import { useEffect, createContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import authConfig from '../configs';

import {
  setSocket,
  setAllStoriesSocket,
  setCreateStorySocket,
  setInviteSocketSocket,
  setRedDot,
  setRedDotAfterInvite,
  setRedDotAfterLikeComment,
  setRedDotAllStories,
} from '../store/apps/redDot';
import { pollsUpdatedData } from '../store/apps/pollsUpdatedData';
import { updateAstrologersStatus } from '../store/apps/astrologersListing';
import Config from 'react-native-config';

const defaultProvider = {
  allStories: null,
  createStorySocket: null,
  polls: null,
};

const SocketContext = createContext(defaultProvider);

export default function SocketProvider({ children }) {
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state?.userInfo);
  const userId = useSelector(state => state?.userInfo?._id);

  const socket = useRef(null);
  const createStorySocket = useRef(null);
  const inviteSocket = useRef(null);
  const allStories = useRef(null);
  const polls = useRef(null);
  const liveAst = useRef(null);
  const liveAstrologers = useRef(null);

  const testevent = data => {
    dispatch(setRedDot(data));
  };

  const storyevent = data => {
    dispatch(setRedDotAfterLikeComment(data));
  };

  const inviteevent = data => {
    dispatch(setRedDotAfterInvite(data));
  };

  const allstoriesevent = data => {
    dispatch(setRedDotAllStories(data));
  };
  const pollsEvent = data => {
    dispatch(pollsUpdatedData(data));
  };
  // const liveAstrologersEvent = data => {
  //   dispatch(updateAstrologersStatus(data));
  // };

  useEffect(() => {
    socket.current = io(`${authConfig?.appBaseUrl}/readNotification`, {
      transports: ['websocket'],
    });
    createStorySocket.current = io(
      `${authConfig?.appBaseUrl}/readNotifications_after_creation`,
      { transports: ['websocket'] },
    );
    inviteSocket.current = io(
      `${authConfig?.appBaseUrl}/readNotifications_after_invite`,
      { transports: ['websocket'] },
    );
    allStories.current = io(
      `${authConfig?.appBaseUrl}/refresh_story_after_creation`,
      { transports: ['websocket'] },
    );
    polls.current = io(`${authConfig?.appBaseUrl}/user_poll_after_submission`, {
      transports: ['websocket'],
    });

    // liveAstrologers.current = io(
    //   Config.ASTRO_SOCKET,
    //   { transports: ['websocket'] },
    // );

    // liveAstrologers.current.on('connect_error', (error) => {
    //   console.error('Socket connection error:', error);
    // });

    // liveAstrologers.current.on('disconnect', (reason) => {
    //   console.log('Socket disconnected:', reason);
    // });

    const notificationData = {
      userId,
    };

    socket?.current.emit('read_notification_event', notificationData);
    socket?.current.on('redDot', testevent);
    createStorySocket?.current.on(
      'read_notification_event-red-dot',
      storyevent,
    );
    inviteSocket?.current.on('read_invite_notification_red_dot', inviteevent);
    allStories?.current.on('refresh', allstoriesevent);
    polls?.current.on('poll_results', pollsEvent);
    // liveAstrologers.current?.on?.('astrologyStatusUpdated', liveAstrologersEvent);
    return () => {
      socket?.current?.off('redDot', testevent);
      createStorySocket?.current.off(
        'read_notification_event-red-dot',
        storyevent,
      );
      inviteSocket?.current?.off(
        'read_invite_notification_red_dot',
        inviteevent,
      );
      allStories?.current?.off(
        'refresh_story_after_creation_event',
        allstoriesevent,
      );
      polls?.current?.off('user_poll_after_submission_event', pollsEvent);
      // liveAstrologers.current?.off?.('astrologyStatusUpdated', liveAstrologersEvent);
    };
  }, [userInfo]);

  const values = {
    allStories: allStories?.current,
    polls: polls?.current,
    createStorySocket: createStorySocket?.current,
    // liveAstrologers: liveAstrologers?.current,
  };

  return (
    <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
  );
}

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { SocketContext, SocketProvider };
