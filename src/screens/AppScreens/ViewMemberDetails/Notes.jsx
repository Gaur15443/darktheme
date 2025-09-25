/* eslint-disable react/self-closing-comp */
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Text} from 'react-native-paper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Animated, {FadeInDown} from 'react-native-reanimated';
import EmptyMemory from '../../../images/Icons/EmptyMemory';
import {CustomButton} from '../../../core';

import Confirm from '../../../components/Confirm';
import {useDispatch, useSelector} from 'react-redux';

import {
  Modal,
  Portal,
  ActivityIndicator,
  Card,
  useTheme,
} from 'react-native-paper';
import Spinner from '../../../common/Spinner';
import ErrorBoundary from '../../../common/ErrorBoundary';
const {width, height} = Dimensions.get('window');
import {PlusIcon} from '../../../images';
import NotesListIcon from '../../../images/Icons/NotesListIcon';
import Axios from '../../../plugin/Axios';
import { clone } from 'lodash';

const Notes = props => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [isModalVisible, setModalVisible] = useState(false);
  const [previousIndex, setIndex] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);

  const userId = props.id;
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );
  const userPermission = props.permission;
  const userId1 = useSelector(state => state?.userInfo._id);
  const treeId = props.treeId;

  useFocusEffect(
  useCallback(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        let cloneOwner = null;
        if(basicInfo?.isClone){
          cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)?.linkId?.[0];
        }
        if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
          cloneOwner = basicInfo?._id;
        }
        const response = await Axios.get(`/get-notes/${userId}${cloneOwner ? `?clinkowner=${cloneOwner}` : ''}`);
        const notesArray = response.data?.data || response.data || [];
        const validNotes = notesArray.filter(item =>
          item && typeof item === 'object' && (item._id || item.id)
        );
        setFilteredItems(validNotes);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to fetch notes',
        });
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [userId])
);

  const showState = !filteredItems || filteredItems.length === 0;


  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh notes data
    if(basicInfo?.isClone){
         cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)?.linkId?.[0];
      }
      if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
        cloneOwner = basicInfo?._id;
      }
      const response = await Axios.get(`/get-notes/${userId}${cloneOwner ? `?clinkowner=${cloneOwner}` : ''}`);
      
      // Extract the actual notes array from the response
      const notesArray = response.data?.data || response.data || [];
      
      // Filter out any null/undefined items
      const validNotes = notesArray.filter(item => 
        item && typeof item === 'object' && (item._id || item.id)
      );
      
      setFilteredItems(validNotes);
      
      // Also refresh memories if needed
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message || 'Failed to refresh data',
      });
      setFilteredItems([]); // Set empty array on error
    } finally {
      setRefreshing(false);
    }
  };

  const gap = 10;
  const containerStyle = {
    height: '100%',
  };

  const GotoAddNotes = () => {
    navigation.navigate('AddNote', {id: userId, treeId: treeId});
  };

  const GotoViewNotes = async (index, note) => {
    try {
      // Add validation for note object
      if (!note || (!note._id && !note.id)) {
        Toast.show({
          type: 'error',
          text1: 'Invalid note data',
        });
        return;
      }
      
      navigation.navigate('ViewNotes', {
        id: userId,
        note: note?._id || note?.id,
        userPermission,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message || 'Navigation failed',
      });
    }
  };

  const toggleModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const loadMoreData = async () => {
    try {
      const pageNo = currentPage + 1;
      setCurrentPage(pageNo);
      const targetUserId = userId;

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message || 'Failed to load more data',
      });
    }
  };

  // Safe key extractor with fallbacks
  const keyExtractor = (item, index) => {
    if (!item) return `empty-${index}`;
    return item._id || item.id || `note-${index}`;
  };

  const renderItem = ({item, index}) => {
    // Add safety check for item
    if (!item) {
      return null;
    }

    return (
      <ErrorBoundary>
        <Animated.View
          style={{
            width: '100%',
            paddingHorizontal: 5,
            marginTop: !userPermission ? 20 : 0,
          }}
          entering={FadeInDown.delay(index * 100)
            .damping(20)
            .duration(500)
            .springify()}>
          <TouchableOpacity
            onPress={() => GotoViewNotes(index, item)}
            key={keyExtractor(item, index)}
            testID="viewSingleNote"
            accessibilityLabel="viewSingleNote">
            <View style={[styles.card]}>
              <View style={styles.noteHeader}>
                <NotesListIcon />
                <Text numberOfLines={1} style={styles.noteTitle}>
                  {item.title || 'Untitled Note'}
                </Text>
              </View>
              <Text numberOfLines={1} style={styles.noteDescription}>
                {item.note || 'No description available'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ErrorBoundary>
    );
  };

  if (showState) {
    return (
      <ErrorBoundary>
        {userPermission && (
          <TouchableOpacity
            testID="addNoteBtn"
            accessibilityLabel="addNoteBtn"
            onPress={GotoAddNotes}
            style={styles.addNoteButton}>
            <PlusIcon size={20} color="#FFFFFF" />
            <Text style={styles.addNoteButtonText}>
              Add a Note
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconContainer}>
            <EmptyMemory />
          </View>
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyStateText}>
              Start adding Notes!
            </Text>
          </View>
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <View style={{flex: 1, paddingBottom: 20}}>
        {userPermission && (
          <View style={{ marginBottom: 10}}>
           <TouchableOpacity
            testID="addNoteBtn"
            accessibilityLabel="addNoteBtn"
            onPress={GotoAddNotes}
            style={styles.addNoteButton}>
            <PlusIcon size={20} color="#FFFFFF" />
            <Text style={styles.addNoteButtonText}>
              Add a Note
            </Text>
          </TouchableOpacity>
          </View>
        )}
        {loading ? (
          <Spinner />
        ) : filteredItems.length > 0 ? (
          <View style={{flex: 1, marginTop: -30}}>
            <FlatList
              accessibilityLabel={'flatList-NotesData'}
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={{paddingBottom: 20}}
              onEndReached={loadMoreData}
              onEndReachedThreshold={0.1}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.colors.primary]}
                  tintColor={theme.colors.primary}
                />
              }
            />
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
              <EmptyMemory />
            </View>
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyStateText}>
                Start adding Notes!
              </Text>
            </View>
          </View>
        )}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    zIndex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 5,
    left: 30,
    zIndex: 10,
    width: '70%',
    height: 'auto',
    overflow: 'hidden',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    bottom: 3,
    left: 3,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  noteDescription: {
    color: '#666',
    marginTop: 4,
    paddingLeft: 30,
    fontSize: 14,
    lineHeight: 18,
  },
  card: {
    width: '100%',
    height: 60,
    position: 'relative',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#ABABAB',
    paddingVertical: 10,
    marginTop: 10,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#E77237',
    borderRadius: 8,
    marginBottom: 20,
  },
  addNoteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
    marginLeft: 6,
  },
  emptyStateContainer: {
    paddingTop: 55,
  },
  emptyIconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTextContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  emptyStateText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'black',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40%',
  },
});

export default Notes;