import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import moment from 'moment';
import {GlobalHeader} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import newTheme from '../../../common/NewTheme';
import Spinner from '../../../common/Spinner';
import {VideoThumbnail} from '../../../core';
import Axios from '../../../plugin/Axios';
import ErrorBoundary from '../../../common/ErrorBoundary';

import {WebView} from 'react-native-webview';
import { fetchNewsDetail, selectNewsDetailById } from '../../../store/apps/news';
import { useDispatch, useSelector } from 'react-redux';


const NewsDetailScreen = ({route}) => {
  const {newsItem} = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [webViewHeight, setWebViewHeight] = useState(null);
  const webViewRef = useRef(null);

  const newsDetail = useSelector((state) => selectNewsDetailById(state, newsItem._id));

  useEffect(() => {
    if (!newsDetail) {
      setLoading(true);
      dispatch(fetchNewsDetail(newsItem._id)).finally(() => setLoading(false));
    }
  }, [dispatch, newsItem._id, newsDetail]);

  const navigation = useNavigation();
  const theme = useTheme();
  const {top} = useSafeAreaInsets();
  const dispatch = useDispatch();

  const handleBack = () => {
    navigation.goBack();
  };

  const cleanHtml = html => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&nbsp;/gi, ' ')
      .replace(/<[^>]+>/g, '');
  };

  const createWebViewContent = useCallback(description => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        </head>
        <body>
          <div id="content">
            ${description}
          </div>
          <script>
            function updateHeight() {
              const height = document.getElementById('content').offsetHeight;
              window.ReactNativeWebView.postMessage(height.toString());
            }
            updateHeight();
            // Handle dynamic content changes
            const observer = new MutationObserver(updateHeight);
            observer.observe(document.body, { 
              childList: true, 
              subtree: true, 
              attributes: true 
            });
            // Handle image loads
            document.querySelectorAll('img').forEach(img => {
              img.onload = updateHeight;
            });
          </script>
        </body>
      </html>
    `;
  }, []);

  const handleWebViewMessage = useCallback(event => {
    try {
      const height = parseInt(event.nativeEvent.data, 10);
      if (!isNaN(height)) {
        setWebViewHeight(height + 32); 
      }
    } catch (error) {
      console.error('WebView height calculation error:', error);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Spinner size="large" style={styles.loader} />
      </View>
    );
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!newsDetail) {
    return <Text style={styles.error}>No data available</Text>;
  }

  const mediaUrl =
    newsDetail.mediaId && newsDetail.mediaId[0]
      ? newsDetail.mediaId[0].mediaUrl
      : null;
  const isVideo =
    newsDetail.mediaId && newsDetail.mediaId[0]
      ? newsDetail.mediaId[0].urlType
      : null;

  const renderMedia = () => {
    const mediaUrlThumb = newsDetail.mediaId[0].thumbnailUrl;
    if (!mediaUrl || !mediaUrlThumb) {
      return null;
    }
    if (isVideo === 'Video') {
      return (
        <VideoThumbnail
          thumbnailUrl={mediaUrlThumb}
          src={mediaUrl}
          preventPlay={false}
          imuwMediaStyle={{width: '100%', height: '100%'}}
          imuwThumbStyle={{
            borderRadius: 6,
            width: '100%',
            height: '100%',
          }}
          customPress={() => setIsVideoPlaying(true)}
        />
      );
    } else {
      return (
        <TouchableOpacity onPress={() => setIsImageModalVisible(true)}>
          <Image source={{uri: mediaUrl}} style={styles.image} />
        </TouchableOpacity>
      );
    }
  };

  return (
    <ErrorBoundary>
      <View style={[styles.container]} accessibilityLabel="news-detail-page">
        <GlobalHeader
          accessibilityLabel="newsBack"
          onBack={handleBack}
          heading={'News'}
          backgroundColor={newTheme.colors.backgroundCreamy}
          fontSize={24}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{newsDetail.title || 'No Title'}</Text>
            <Text style={styles.date}>
              {newsDetail.createdAt
                ? moment(newsDetail.createdAt).format('Do MMMM YYYY')
                : 'DD MMMM YYYY'}
            </Text>
            {mediaUrl && (
              <View style={styles.mediaContainer}>{renderMedia()}</View>
            )}
            <View style={{marginTop: 15}}>
              <WebView
                originWhitelist={['*']}
                source={{html: createWebViewContent(newsDetail?.description)}}
                style={[styles.webView, {height: webViewHeight || 50}]}
                onMessage={handleWebViewMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={isImageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsImageModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableOpacity
              style={[
                styles.modalCloseButton,
                {
                  top:
                    Platform.OS === 'ios'
                      ? top + 10
                      : top + 10,
                },
              ]}
              onPress={() => {
                setIsImageModalVisible(false);
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <Image source={{uri: mediaUrl}} style={styles.fullScreenImage} />
          </View>
        </Modal>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: newTheme.colors.backgroundCreamy,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: newTheme.colors.darkText,
    marginTop: 12,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#2892FF',
    fontWeight: '500',
    marginBottom: 6,
  },
  mediaContainer: {
    width: '100%',
    borderRadius: 12,
    aspectRatio: 27 / 15.2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  fullScreenImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -50}, {translateY: -50}],
    width: 100,
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  webView: {
    width: '100%',
    backgroundColor: 'transparent',
    marginBottom: 15,
  },
});

export default NewsDetailScreen;
