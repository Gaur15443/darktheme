import axios from 'axios';
import PropTypes from 'prop-types';
import config from 'react-native-config';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setUserManagementToastsConfig} from '../../store/apps/userManagementToastsSlice';
import {getConsultationToasts} from '../../store/apps/agora';

export default function UserManagementToastsConfig({children}) {
  const dispatch = useDispatch();
  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );
  const consultationToasts = useSelector(
    state => state.agoraCallSlice.consultationToasts,
  );

  async function getConsultationToastsFromS3() {
    try {
      console.log(
        'consultationToasts?.consultation?.battery?.text1?.length',
        consultationToasts?.consultation?.battery?.text1?.length,
      );
      if (!consultationToasts?.consultation?.battery?.text1?.length) {
        const data = await dispatch(getConsultationToasts()).unwrap();
        console.log('consultation on ono', data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getConsultationToastsFromS3();
    if (
      !userManagementToastsConfig &&
      !Object.keys(userManagementToastsConfig || {})?.length
    ) {
      axios
        .get(config.TOAST_MESSAGES_USER_MGT, {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        })
        .then(res => {
          dispatch(setUserManagementToastsConfig(res.data));
        });
    }
  }, []);
  return <>{children}</>;
}

UserManagementToastsConfig.propTypes = {
  children: PropTypes.node.isRequired,
};
