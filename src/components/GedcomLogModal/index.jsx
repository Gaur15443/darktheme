import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import LogsInfoIcon from '../../images/Icons/LogsInfoIcon';
import WarningIcon from '../../images/Icons/WarningIcon';
import {resetGedcomlogs} from '../../store/apps/tree';
import {useDispatch, useSelector} from 'react-redux';
import NewTheme from '../../common/NewTheme';

const GedcomLogsModal = ({
  gedLogsDialogOpen,
  setGedLogsDialogOpen,
  gedcomLogs,
}) => {
  const dispatch = useDispatch();

  const handleGedcomLogsInfo = async () => {
    try {
      setGedLogsDialogOpen(false);
      dispatch(resetGedcomlogs());
    } catch (__error) {}
  };
  return (
    <Modal
      visible={gedLogsDialogOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={handleGedcomLogsInfo}>
      <TouchableOpacity
        testID="closeGedcomLogModalOutside"
        style={{flex: 1}}
        activeOpacity={1}
        onPress={handleGedcomLogsInfo}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle]}>Import Issues Found</Text>
              <FlatList
                data={gedcomLogs?.gedcom_log}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <View style={styles.listItem}>
                    <View style={styles.listItemIcon}>
                      {item.LOG === 'Info' ? <LogsInfoIcon /> : <WarningIcon />}
                    </View>
                    <Text style={styles.listItemText}>{item.Name}</Text>
                  </View>
                )}
              />
              <TouchableOpacity
                testID="closeGedcomLogModal"
                style={styles.closeButton}
                onPress={handleGedcomLogsInfo}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    padding: 20,
    height: '60%',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: 'black',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  listItemIcon: {
    marginRight: 10,
  },
  listItemText: {
    flex: 1,
    fontSize: 18,
    color: 'black',
  },
  closeButton: {
    backgroundColor: NewTheme.colors.primaryOrange,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GedcomLogsModal;
