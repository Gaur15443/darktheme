import {
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';
import React, {useState, useEffect} from 'react';
import {useTheme, Text} from 'react-native-paper';
import {
  LifestoryTabContent,
  InfoTabContent,
  MemoryTabContent,
  ProfileHeader,
} from '../../../components';
import {GlobalStyle} from '../../../core';

const AccountLanding = () => {
  const ios = Platform.OS == 'ios';
  const {top} = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState('Lifestory');

  const theme = useTheme();
  useEffect(() => {
    setSelectedTab('Lifestory');
  }, []);

  const renderContent = () => {
    switch (selectedTab) {
      case 'Lifestory':
        return <LifestoryTabContent />;
      case 'BasicInfo':
        return <InfoTabContent />;
      case 'Memories':
        return <MemoryTabContent />;
      default:
        return null;
    }
  };
  return (
    <>
      <ProfileHeader isTop={ios ? top : top + 5} />
      <SafeAreaView>
        <GlobalStyle>
          <View>
            <View style={styles.tabs}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'space-around',
                    gap: 8,
                    paddingVertical: 15,
                    width: '100%',

                    alignSelf: 'center',
                  }}>
                  <View
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 1,
                      },
                      shadowOpacity: 0.22,
                      shadowRadius: 2.22,
                      elevation: 3,
                      borderRadius: 6,
                    }}>
                    <TouchableOpacity
                      onPress={() => setSelectedTab('Lifestory')}
                      activeOpacity={1}
                      testID="lifestoryTab">
                      <View
                        style={{
                          borderRadius: 6,
                          overflow: 'hidden',
                        }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            textAlignVertical: 'center',
                            color:
                              selectedTab === 'Lifestory'
                                ? theme.colors.primary
                                : theme.colors.blackHalti,
                            backgroundColor:
                              selectedTab === 'Lifestory'
                                ? theme.colors.selectedTabBackground
                                : theme.colors.unSelectedTabBackgr,
                            paddingVertical: 8,
                            borderRadius: 6,
                          }}
                          accessibilityLabel="Lifestory-Tab">
                          Lifestory
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 1,
                      },
                      shadowOpacity: 0.22,
                      shadowRadius: 2.22,
                      elevation: 3,
                      borderRadius: 6,
                    }}>
                    <TouchableOpacity
                      onPress={() => setSelectedTab('BasicInfo')}
                      activeOpacity={1}
                      testID="basicInoTab">
                      <View
                        style={{
                          borderRadius: 6,
                          overflow: 'hidden',
                        }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            textAlignVertical: 'center',
                            color:
                              selectedTab === 'BasicInfo'
                                ? theme.colors.primary
                                : theme.colors.blackHalti,
                            backgroundColor:
                              selectedTab === 'BasicInfo'
                                ? theme.colors.selectedTabBackground
                                : theme.colors.unSelectedTabBackgr,
                            paddingVertical: 8,
                            borderRadius: 6,
                          }}
                          accessibilityLabel="Info-Tab">
                          Info
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Tab 2 */}
                  <View
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 1,
                      },
                      shadowOpacity: 0.22,
                      shadowRadius: 2.22,
                      elevation: 3,
                      borderRadius: 6,
                    }}>
                    <TouchableOpacity
                      onPress={() => setSelectedTab('Memories')}
                      activeOpacity={1}
                      testID="memoriesTab">
                      <View
                        style={{
                          borderRadius: 6,
                          overflow: 'hidden',
                        }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            textAlignVertical: 'center',
                            color:
                              selectedTab === 'Memories'
                                ? theme.colors.primary
                                : theme.colors.blackHalti,
                            backgroundColor:
                              selectedTab === 'Memories'
                                ? theme.colors.selectedTabBackground
                                : theme.colors.unSelectedTabBackgr,
                            paddingVertical: 8,
                            borderRadius: 6,
                          }}
                          accessibilityLabel="Memories-Tab">
                          Memories
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {renderContent()}
              </View>
            </View>
          </View>
        </GlobalStyle>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  tabs: {},
  profileProgress: {
    width: '100%',
    marginTop: 15,
  },

  progressBar: {
    height: 30,
    borderRadius: 5,
    width: '100%',
  },
  progressText: {
    position: 'absolute',
    left: '50%',

    top: '50%',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',

    width: '100%',
    paddingTop: 0,
    paddingBottom: 30,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  headerText: {fontSize: 20, marginLeft: 16, fontWeight: 'bold'},
});

export default AccountLanding;
