import React, {memo} from 'react';
import CreatePost from '../../../images/Icons/CreatePost';
import AllPosts from '../../../images/Icons/AllPosts';
import MyPosts from '../../../images/Icons/MyPostsIcon';
import Saved from '../../../images/Icons/SavedIcon';
import Drafts from '../../../images/Icons/DraftsIcon';
import {Platform, SafeAreaView, StyleSheet, TouchableOpacity, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {Divider, Drawer, Text, TouchableRipple} from 'react-native-paper';
import {useTheme} from 'react-native-paper';

const filterItems = [
  {
    label: 'Create Post',
    icon: CreatePost,
    id: 'createPost',
    style: {borderRadius: 0, fontWeight: 600},
  },
  {
    label: 'All Posts',
    icon: AllPosts,
    id: 'allPosts',
    style: {borderRadius: 0, fontWeight: 600},
  },
  {
    label: 'My Posts',
    icon: MyPosts,
    id: 'myPosts',
    style: {borderRadius: 0, fontWeight: 600},
  },
  {
    label: 'Saved',
    icon: Saved,
    id: 'saved',
    style: {borderRadius: 0, fontWeight: 600},
  },
  {
    label: 'Drafts',
    icon: Drafts,
    id: 'drafts',
    style: {borderRadius: 0, fontWeight: 600},
  },
];
function DrawerFilters({onSelect = () => {}}) {
  const styles = useCreateStyles();
  return (
    <>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          // backgroundColor: NewTheme.colors.secondaryLightBlue,
          // paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 8 : 12,
          zIndex: 1000,
        }}></View>
      {filterItems?.map((item, index) => (
        <>
          {item?.id === 'createPost' ? (
            <TouchableRipple
              onPress={() => onSelect(item?.id)}
              style={[
                styles.drawerItem,
                {
                  borderRadius: 0,
                  marginTop: 5,
                  marginHorizontal: 12,
                  width: '93%',
                },
              ]}>
              <View style={styles.createPostRow}>
                {/* Custom icon position */}
                <View style={styles.iconWrapper}>
                  {item.icon && item.icon()}
                </View>

                {/* Custom label position */}
                <Text style={styles.createPostLabel}>{item.label}</Text>
              </View>
            </TouchableRipple>
          ) : (
            <Drawer.Item
              label={item.label}
              icon={item.icon}
              onPress={() => onSelect(item?.id)}
              style={[styles.drawerItem, {borderRadius: 0, marginTop: 5}]}
            theme={{fonts: {labelLarge: {
                    fontWeight: '700',
                    fontSize: 17,
                    color: 'black',
                  },
                },
              }}
            />
          )}

          <Divider style={{marginHorizontal: 12}} />
        </>
      ))}
    </>
  );
}
function useCreateStyles() {
  const theme = useTheme();
  return StyleSheet.create({
    header: {
      marginLeft: 12,
      paddingBottom: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    logo: {
      height: 40,
      width: 90,
    },
    plusFilterStyle: {
      flexDirection: 'row',
      paddingRight: 5,
      alignItems: 'center',
    },
    filterButton: {
      backgroundColor: '#FFDBC9',
      padding: 5,
      borderRadius: 5,
      marginRight: 15,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    plusButton: {
      backgroundColor: theme.colors.primary,
      padding: 8,
      marginRight: 5,
      borderRadius: 50,
    },
    imageContainer: {
      width: 150,
      justifyContent: 'center',
      height: '100%',
      padding: 10,
      marginRight: 'auto',
      marginLeft: 0,
    },
    subTitleText: {
      fontWeight: '500',
      fontSize: 15,
    },
    modalStyles: {
      flex: 1,
      alignItems: 'flex-end',
      paddingRight: 8,
      justifyContent: 'flex-start',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9000,
      position: 'relative',
    },
    container: {
      flex: 1,
      zIndex: 1,
    },
    contentContainer: {
      position: 'absolute',
      top: 30,
      right: 4 + -10,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      borderRadius: 50,
    },
    iconContainer: {
      // ANIMATED_WIDTH - (border width)
      width: 58,
      height: 58,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 29,
    },
    icon: {
      width: 26,
      height: 26,
    },
    text: {
      color: '#000',
      fontWeight: '600',
    },
    animatedHeading: {
      fontSize: 20,
      fontWeight: '700',
    },
    text: {
      fontSize: 22,
      fontWeight: '700',
      color: 'black',
      marginTop: -10,
    },
    drawerContainer: {
      position: 'absolute',
      top: 100,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1,
    },
    drawerOverlay: {
      position: 'absolute',
      right: 0,
      top: 0.2,
      width: '80%',
      height: '100%',
      backgroundColor: '#FFF8F0',
      zIndex: 2,
    },
    createPostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 18,
      paddingVertical: 10,
    },
    iconWrapper: {
      marginRight: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    createPostLabel: {
      fontWeight: '700',
      fontSize: 17,
      color: 'black',
    },
  });
}

export default memo(DrawerFilters);
