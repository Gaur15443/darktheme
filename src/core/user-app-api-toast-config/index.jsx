import axios from 'axios';
import PropTypes from 'prop-types';
import config from 'react-native-config';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getToastMessages } from '../../store/apps/getToastMessages';

export default function UserAppApiToastConfig({ children }) {
    const dispatch = useDispatch();
    const toastMessages = useSelector(
        state => state.getToastMessages.toastMessages,
    );
    useEffect(() => {
        if (
            !toastMessages ||
            Object.keys(toastMessages).length === 0
        ) {
            axios.get(config.TOAST_MESSAGES, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }).then(res => {
                dispatch(getToastMessages(res.data));
            });
        }
    }, [toastMessages, dispatch]);
    return <>{children}</>;
}

UserAppApiToastConfig.propTypes = {
    children: PropTypes.node.isRequired,
};
