import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { VideoThumbnail } from '../../../core';
import { GlobalHeader } from '../../../components';
import newTheme from '../../../common/NewTheme';
import Spinner from '../../../common/Spinner';
import { Text, List } from 'react-native-paper';
import { fetchArticles } from '../../../store/apps/Faq';
import { useDispatch, useSelector } from 'react-redux';
import ErrorBoundary from '../../../common/ErrorBoundary';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import DropdownAnimation from '../../../common/DropdownAnimation';

function SubcategoryScreen({ route, navigation }) {
  const { subcategory, categoryTitle, subcategoryId } = route?.params;
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState(null);
  const [webViewHeights, setWebViewHeights] = useState({});
  const scrollViewRef = useRef(null);
  const webViewRefs = useRef({});
  const isMounted = useRef(true);
  const dispatch = useDispatch();
  const articles = useSelector(state => state?.Faq?.articles[subcategoryId] || []);
  const { top } = useSafeAreaInsets();
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    return () => {
      isMounted.current = false;
      webViewRefs.current = {};
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if(articles.length === 0){
      setLoading(true);
      try {
        await dispatch(fetchArticles(subcategoryId)).unwrap();
      } catch (error) {
        if (isMounted.current) {
          Toast.show({
            type: 'error',
            text1: 'Error loading articles',
            text2: error?.message || 'Please try again',
          });
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
        }
      }
    };
    fetchData();
  }, [subcategoryId, dispatch]);

  const createWebViewContent = useCallback((description) => {
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

  const handleWebViewMessage = useCallback((articleId, event) => {
    try {
      const height = parseInt(event.nativeEvent.data, 10);
      if (!isNaN(height)) {
        setWebViewHeights(prev => ({
          ...prev,
          [articleId]: height + 32,
        }));
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Height calculation error', text2: String(error) });
    }
  }, []);

  const renderMedia = useCallback((article) => {
    const mediaUrl = article?.mediaId?.[0]?.mediaUrl;
    if (!mediaUrl) return null;

    if (article?.mediaId?.[0]?.urlType === 'Video') {
      return (
        <VideoThumbnail
          thumbnailUrl={article?.mediaId?.[0]?.thumbnailUrl}
          src={mediaUrl}
          preventPlay={false}
          imuwMediaStyle={styles.videoContainer}
          imuwThumbStyle={styles.videoThumbnail}
        />
      );
    }

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedMediaUrl(mediaUrl);
          setIsImageModalVisible(true);
        }}>
        <Image
          source={{ uri: mediaUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  }, []);

  const ImageViewerModal = useCallback(() => (
    <Modal
      visible={isImageModalVisible}
      transparent={true}
      onRequestClose={() => setIsImageModalVisible(false)}>
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => setIsImageModalVisible(false)}>
          <Text style={styles.modalCloseText}>✕</Text>
        </TouchableOpacity>
        <Image
          source={{ uri: selectedMediaUrl }}
          style={styles.modalImage}
          resizeMode="contain"
        />
      </View>
    </Modal>
  ), [isImageModalVisible, selectedMediaUrl]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={[styles.container,{paddingBottom:bottom}]}>
        <GlobalHeader
          accessibilityLabel="goBackfromFaq"
          onBack={() => navigation.goBack()}
          heading={categoryTitle}
          backgroundColor={newTheme.colors.backgroundCreamy}
          fontSize={20}
        />
        <Text variant="headlineMedium" style={styles.title}>
          {subcategory}
        </Text>
        <View style={styles.underline} />
        <ScrollView
          style={styles.scrollView}
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}>
          {articles?.map((article, index) => (
            <View key={article._id || index} style={styles.articleItem}>
              <List.Accordion
                rippleColor="#0000001A"
                style={styles.articleTitleContainer}
                onPress={() => setExpandedArticle(expandedArticle === index ? null : index)}
                expanded={expandedArticle === index}
                right={() => <DropdownAnimation play={expandedArticle === index} />}
                title={article.title}
                titleStyle={styles.articleTitle}
                titleNumberOfLines={0}
                titleEllipsizeMode="tail">
                {article?.mediaId?.[0]?.mediaUrl && (
                  <View style={styles.mediaContainer}>
                    {renderMedia(article)}
                  </View>
                )}
                <View style={styles.webViewWrapper}>
                  <WebView
                    ref={ref => (webViewRefs.current[article._id] = ref)}
                    source={{ html: createWebViewContent(article?.description) }}
                    style={[
                      styles.webView,
                      {
                        height: webViewHeights[article._id] || 50,
                        opacity: webViewHeights[article._id] ? 1 : 0,
                      },
                    ]}
                    onMessage={(event) => handleWebViewMessage(article._id, event)}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                  />
                </View>
              </List.Accordion>
            </View>
          ))}
        </ScrollView>
        <ImageViewerModal />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newTheme.colors.backgroundCreamy,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: newTheme.colors.backgroundCreamy,
  },
  title: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: newTheme.colors.primaryOrange,
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingLeft: 20,
  },
  underline: {
    height: 3,
    width: 50,
    backgroundColor: newTheme.colors.primaryOrange,
    borderRadius: 10,
    marginTop: -4,
    marginLeft: 20,
    marginBottom: 10,
  },
  scrollView: {
        flex: 1,
        paddingHorizontal: 20,
        maxHeight: 800,
        width: '100%',
      },
      articleItem: {
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        // width: '100%',
        marginTop: 10,
      },
      articleTitleContainer: {
        paddingRight: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        // marginLeft: -10,
        marginTop: -16,
        // width: '100%',
      },
      articleTitle: {
        fontSize: 17,
        fontWeight: Platform.OS === 'ios' ? '500' : '600',
        color: newTheme.colors.blackText,
        maxWidth: '100%',
        textAlign: 'left',
        marginLeft: -15,
      },
      icon: {
        // marginLeft: 10,
      },
      mediaContainer: {
        width: '100%',
        borderRadius: 12,
        aspectRatio: 27 / 15.2,
        overflow: 'hidden',
        marginBottom: 6,
        marginTop: -2,
      },
      image: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
        marginTop: 8,
        borderRadius: 12,
      },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    borderRadius: 12,
    width: '100%',
    height: '100%',
    marginTop: 10,
  },
  webViewWrapper: {
    marginBottom: 15,
    marginLeft: 2,
    overflow: 'hidden',
    borderRadius: 8,
  },
  webView: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SubcategoryScreen;