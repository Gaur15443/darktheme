import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Dialog} from 'react-native-paper';
import {CloseIcon} from '../../images/Icons/ModalIcon';
import {useDispatch, useSelector} from 'react-redux';
import {getYoutubeVideo} from '../../store/apps/home';
import NewTheme from '../../common/NewTheme';
import ErrorBoundary from '../../common/ErrorBoundary';

const Help = ({isVisible, onClose}) => {
  const [visible, setVisible] = useState(isVisible);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const youtubeVideos = useSelector(state => state?.home?.VideoUrl);

  useEffect(() => {
    try {
      setVisible(isVisible);
      if (isVisible) {
        setLoading(true);
        dispatch(getYoutubeVideo()).finally(() => setLoading(false));
      }
    } catch (error) {
      /** */
    }
  }, [isVisible, dispatch]);

  const hideDialog = () => {
    setVisible(false);
    onClose();
  };

  const handlePress = url => {
    if (url) {
      Linking.openURL(url).catch(err =>
        console.error('Failed to open URL:', err),
      );
    }
  };

  return (
    <ErrorBoundary>
      <Dialog
        visible={visible}
        onDismiss={hideDialog}
        style={{
          backgroundColor: NewTheme.colors.whiteText,
          borderRadius: 12,
          height: '80%',
        }}>
        <View style={styles.closeWrapper}>
          <TouchableOpacity
            accessibilityLabel="popUpclose"
            onPress={onClose}
            style={{
              backgroundColor: 'lightgray',
              marginRight: -5,
              borderRadius: 5,
            }}>
            <CloseIcon />
          </TouchableOpacity>
        </View>
        <Dialog.Title style={styles.title}>How to guide</Dialog.Title>
        {loading ? ( // Show loader while loading
          <ActivityIndicator
            size="large"
            color="#2892FF"
            style={styles.loader}
          />
        ) : youtubeVideos.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View>
              {youtubeVideos.map((item, index) => (
                <View key={index} style={styles.container}>
                  <View style={styles.col5}>
                    <TouchableOpacity
                      activeOpacity={1}
                      accessibilityLabel="handleLink1"
                      onPress={() => handlePress(item.redirectUrl)}>
                      <Image
                        source={{uri: item.thumbnailImage}}
                        style={{height: 130, width: 80}}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.col7}>
                    <TouchableOpacity
                      activeOpacity={1}
                      accessibilityLabel="handleLinkInviteMember"
                      onPress={() => handlePress(item.redirectUrl)}>
                      <Text
                        style={{
                          color: NewTheme.colors.blackText,
                          fontWeight: '700',
                        }}>
                        {item.contentTitle}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>No videos available.</Text>
        )}
      </Dialog>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
  },
  col5: {
    flex: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  col7: {
    flex: 7,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
  },
  image: {
    height: 150,
    width: '100%',
    borderRadius: 12,
    boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.2509803922)',
  },
  card: {
    padding: 6,
  },
  closeWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: -20,
    padding: 10,
    marginRight: -10,
    color: NewTheme.colors.blackText,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: NewTheme.colors.blackText,
  },
});

export default Help;
