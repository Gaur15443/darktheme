import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Modal, Portal} from 'react-native-paper';
import GlobalHeader from '../GlobalHeader';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import newTheme from '../../../common/NewTheme';
import {Text} from 'react-native-paper';
import Axios from '../../../plugin/Axios';
import {LocationPinkIcon, CalendarPinkIcon} from '../../../images';
import Toast from 'react-native-toast-message';
import Animated, {FadeInUp, FadeInRight} from 'react-native-reanimated';
import {StoryEditIcon, StoryDeleteIcon} from '../../../images';
import {colors} from '../../../common/NewTheme';
import Confirm from '../../Confirm';

function ViewNotes() {
  const navigation = useNavigation();
  const route = useRoute();
  const [showOptions, setShowOptions] = useState(false);
  const [noteDetails, setNoteDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {id: userId, note: noteId, userPermission} = route.params || {};

  useFocusEffect(
  useCallback(() => {
    const fetchNoteDetails = async () => {
      try {
        setLoading(true);
        const response = await Axios.get(`/get-note-by-id/${noteId}`);
        if (response.data?.data) {
          setNoteDetails(response.data.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchNoteDetails();
  }, [userId, noteId]) // 👈 runs every time screen comes into focus
);

  const openOptions = () => setShowOptions(true);
  const closeOptions = () => setShowOptions(false);

  const handleDeleteNote = async () => {
    setShowOptions(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await Axios.delete(`/delete-note/${noteId}`);
      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Note deleted successfully',
        });
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error deleting note',
      });
    }
  };

  const handleEditClick = () => {
    setShowOptions(false);
    navigation.navigate('AddNote', {id: userId, note: noteId, isEdit: true});
  };

  return (
    <TouchableOpacity
      style={{flex: 1}}
      activeOpacity={1}
      onPress={closeOptions}>
      <GlobalHeader
        accessibilityLabel="goBackfromViewNotes"
        onBack={() => navigation.goBack()}
        heading={'Note'}
        backgroundColor={newTheme.colors.backgroundCreamy}
        onPressAction={userPermission ? openOptions : ''}
        fontSize={20}
      />

      <ScrollView style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={newTheme.colors.primary} />
        ) : noteDetails ? (
          <View style={styles.noteContainer}>
            {/* Title */}
            <Text style={styles.title}>{noteDetails.title}</Text>

            {/* Date */}
            {noteDetails.noteCreatedDate && (
            <View style={styles.row}>
              <CalendarPinkIcon stroke={'#035997'} />
              <Text style={styles.date}>
                {new Date(noteDetails.noteCreatedDate).toLocaleDateString()}
              </Text>
            </View>
            )}

            {/* Location */}
            {noteDetails.location ? (
              <View style={styles.row}>
                <LocationPinkIcon stroke={'#035997'} />
                <Text style={styles.location}>{noteDetails.location}</Text>
              </View>
            ) : null}

            {/* Description */}
            <Text style={styles.description}>{noteDetails.note}</Text>
          </View>
        ) : (
          <Text style={styles.noData}>No note details found.</Text>
        )}
      </ScrollView>

      {showOptions && (
        <View style={styles.optionsContainer}>
          <Portal>
            <Modal
              visible={showOptions}
              onDismiss={closeOptions}
              style={styles.ModalStyles}
              contentContainerStyle={{
                backgroundColor: '#fff',
                paddingRight: 10,
                borderRadius: 6,
                overflow: 'hidden',
              }}>
              <TouchableOpacity testID="editStory" onPress={handleEditClick}>
                <Animated.View
                  entering={FadeInRight?.duration(300)?.damping(20)}
                  style={[styles.ButtonOne]}>
                  <StoryEditIcon stroke={colors.primaryOrange} />
                  <Text style={styles.ButtonText}>Edit</Text>
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity testID="deleteStory" onPress={handleDeleteNote}>
                <Animated.View
                  entering={FadeInRight?.duration(300)?.damping(20)}
                  style={styles.ButtonTwo}>
                  <StoryDeleteIcon
                    accessibilityLabel={'StoryDeleteIcon'}
                    stroke={colors.primaryOrange}
                  />
                  <Text style={styles.ButtonText} accessibilityLabel={'Delete'}>
                    Delete
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </Modal>
          </Portal>
        </View>
      )}

      {/* Delete confirmation modal */}
         {showDeleteConfirm && (
                <Confirm
                  continueCtaText="Delete"
                  discardCtaText="Cancel"
                  title="Are you sure you want to delete this note?"
                  subTitle=""
                  onBackgroundClick={() => setShowDeleteConfirm(false)}
                  onDiscard={() => {
                    setShowDeleteConfirm(false);
                  }}
                  onContinue={() => {
                    confirmDelete();
                  }}
                  onCrossClick={() => {
                    setShowDeleteConfirm(false);
                  }}
                />
              )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  noteContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#035997',
    marginLeft: 6,
  },
  location: {
    fontSize: 16,
    color: '#035997',
    marginLeft: 6,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  optionsContainer: {
    position: 'absolute',
  },
  optionBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  ModalStyles: {
    gap: 5,
    alignItems: 'flex-end',
    paddingRight: 6,
    paddingTop: 42,
    justifyContent: 'flex-start',
  },
  ButtonOne: {
    flexDirection: 'row',
    paddingRight: 50,
    paddingVertical: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    gap: 10,
    paddingStart: 10,
  },
  ButtonTwo: {
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    paddingVertical: 5,
    paddingVertical: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingStart: 10,
  },
  ButtonText: {fontSize: 18, color: 'black', fontWeight: '600'},
});

export default ViewNotes;
