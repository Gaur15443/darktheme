import React, {memo, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import InviteModal from '../invite-popup';
import {useNavigation} from '@react-navigation/native';
import {resetTreeItem, setTreeItemFromPrivateTree} from '../../store/apps/tree';
import _ from 'lodash';
import {EyeOpen, InviteProfile} from '../../images';
import NewTheme from '../../common/NewTheme';
import ErrorBoundary from '../../common/ErrorBoundary';

const Secondtime = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const inviteContent = "You're invited to our event!";
  const handleShowModal = () => {
    setInviteLoading(true);
    setShowModal(true);
    setInviteLoading(false);
  };
  const handleCloseModal = () => setShowModal(false);
  const getTreeList = useSelector(
    state => state?.Tree?.AllFamilyTrees?.treeList,
  );
  const navigation = useNavigation();
  const [loading, setLoading] = useState(
    new Array(sortedTreeList?.length).fill(false),
  );
  const [inviteloading, setInviteLoading] = useState(false);

  const GotoTree = async (tree, index) => {
    const updatedLoadingStates = [...loading];
    updatedLoadingStates[index] = true;
    setLoading(updatedLoadingStates);
    await dispatch(resetTreeItem());
    await dispatch(setTreeItemFromPrivateTree(tree));

    navigation.navigate('TreeScreen', {
      family: tree?.tree?.name,
      currentTreeDetails: tree,
    });
    updatedLoadingStates[index] = false;
    setLoading(updatedLoadingStates);
  };

  if (!getTreeList) {
    return null; // or display a loading indicator or other appropriate UI
  }

  const sortedTreeList = [...getTreeList].sort((a, b) => {
    if (a.user.role === 'owner') {
      return -1;
    } else if (b.user.role === 'owner') {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <ErrorBoundary>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sortedTreeList?.map((tree, treeIndex) => (
          <View key={treeIndex} style={styles.cardWrapper}>
            <Card style={styles.card}>
              <View
                style={{
                  // paddingBottom: 6,
                  borderRadius: 8,
                  paddingHorizontal: 18,
                  height: 'auto',
                  backgroundColor: NewTheme.colors.whiteText,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: NewTheme.colors.blackText,
                    marginTop: 8,
                    textTransform: 'capitalize',
                  }}>
                  {(() => {
                    let name = tree?.tree?.name || '';
                    if (!name.toLowerCase().includes('family')) {
                      name += ' Family';
                    }
                    if (name.length > 15) {
                      return name.slice(0, 15) + '...';
                    }
                    return name;
                  })()}
                </Text>
                <Text
                  style={{
                    color: NewTheme.colors.secondaryLightBlue,
                    fontWeight: '700',
                    fontSize: 15,
                    opacity: 0.8,
                    textTransform: 'capitalize',
                  }}>
                  {tree?.user?.role
                    ? tree?.user?.role.toLowerCase() === 'user'
                      ? 'Member'
                      : tree?.user?.role
                    : tree?.user.role}
                </Text>

                <View
                  style={{flexDirection: 'row', justifyContent: '', gap: 12}}>
                  <View style={{marginTop: 10, marginBottom: 12}}>
                    <TouchableOpacity
                      accessibilityLabel="viewtree"
                      onPress={() => GotoTree(tree, treeIndex)}
                      disabled={loading[treeIndex]}
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        backgroundColor: '#FFDBC9',
                      }}>
                      {loading[treeIndex] ? (
                        <ActivityIndicator
                          size="small"
                          color={NewTheme.colors.primaryOrange}
                        />
                      ) : (
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Image source={EyeOpen} />
                          <Text
                            style={{
                              color: NewTheme.colors.primaryOrange,
                              fontWeight: '600',
                              textAlign: 'center',
                              fontSize: 16,
                            }}>
                            View{' '}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                  {tree?.user?.role === 'owner' && (
                    <View style={{marginTop: 10, marginBottom: 12}}>
                      <TouchableOpacity
                        accessibilityLabel="invitebtn"
                        onPress={handleShowModal}
                        disabled={inviteloading}
                        style={{
                          padding: 10,
                          borderRadius: 10,
                          backgroundColor: '#FFDBC9',
                        }}>
                        {inviteloading ? (
                          <ActivityIndicator
                            size="small"
                            color=" NewTheme.colors.blackText"
                          />
                        ) : (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <InviteProfile />
                            <Text
                              style={{
                                color: NewTheme.colors.primaryOrange,
                                fontWeight: '600',
                                textAlign: 'center',
                                fontSize: 16,
                              }}>
                              Invite{' '}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          </View>
        ))}
      </ScrollView>
      <InviteModal
        visible={showModal}
        onClose={handleCloseModal}
        content={inviteContent}
        inviteEvent={'invite_tree_member'}
      />
    </ErrorBoundary>
  );
};
const styles = StyleSheet.create({
  card: {
    width: 250,
    marginRight: 10,
    borderBottomEndRadius: 8,

    borderRadius: 8,
  },
  cardWrapper: {
    marginLeft: 1,
    marginRight: 12,
    paddingHorizontal: 3,
    paddingBottom: 5,
    paddingTop: 4,
    borderRadius: 8,
    width: 250,
  },
});
export default memo(Secondtime);
