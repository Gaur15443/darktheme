import React from 'react';
import {View, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {GlobalStyle} from '../../../../core';
import {useNavigation} from '@react-navigation/native';
import {StoriesHeader} from '../../../../components';
import {useTheme, Text} from 'react-native-paper';
import EmptyGroupsIcon from './../../../../images/Icons/EmptyGroupsIcon';
import {pluralize} from './../../../../utils/format';
import {colors} from '../../../../common/NewTheme';
import GroupsIcon from './../../../../images/Icons/GroupsIcon/index';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function ManageGroups() {
  const styles = createStyles();
  const theme = useTheme();
  const navigator = useNavigation();
  const subGroups = useSelector(
    state => state?.memberDirectory?.membersAllSubGroups,
  );
  return (
    <>
      <StoriesHeader
        backgroundColor={theme.colors.background}
        from={'manageGroup'}
        showLogo={false}
      />
      <SafeAreaView>
        <GlobalStyle>
          <ScrollView style={styles.scrollView}>
            {subGroups.length <= 0 ? (
              <View style={styles.emptyStateWrapper}>
                <EmptyGroupsIcon />
                <Text variant="bold" style={[styles.emptyStateText]}>
                  You don't have any groups
                </Text>
                <Text
                  style={[
                    styles.emptyStateText,
                    {
                      fontWeight: 600,
                    },
                  ]}>
                  Create a customised group to share your posts with specific
                  family members!
                </Text>
              </View>
            ) : (
              <>
                {subGroups.map((groups, index) => (
                  <TouchableOpacity
                    testID="goToEditGroups"
                    onPress={() =>
                      navigator.navigate('EditGroup', {GroupId: groups})
                    }
                    style={styles.groupButton}
                    key={index}>
                    <View
                      style={{
                        justifyContent: 'center',
                        padding: 4,
                      }}>
                      <GroupsIcon />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flex: 1,
                      }}>
                      <View>
                        <Text style={styles.groupName}>{groups.groupName}</Text>
                        <Text style={styles.memberCount}>
                          {pluralize(groups.count, 'Member')}
                        </Text>
                      </View>
                      <Icon
                        name="arrow-forward-ios"
                        size={30}
                        color={colors.primaryOrange}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </GlobalStyle>
      </SafeAreaView>
    </>
  );
}

function createStyles() {
  return StyleSheet.create({
    scrollView: {marginTop: 20, height: '100%'},
    emptyStateWrapper: {
      display: 'flex',
      alignItems: 'center',
    },
    emptyStateText: {
      marginHorizontal: 30,
      marginBottom: 10,
      textAlign: 'center',
      fontSize: 22,
    },
    groupButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: 'white',
      width: '98%',
      height: 100,
      alignSelf: 'center',
      marginBottom: 10,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.primaryOrange,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
      overflow: 'hidden',
    },
    groupName: {
      color: colors.primaryOrange,
      fontWeight: 600,
      fontSize: 20,
    },
    memberCount: {
      color: colors.secondaryLightBlue,
      fontWeight: 600,
      fontSize: 15,
      marginTop: 5,
    },
  });
}
